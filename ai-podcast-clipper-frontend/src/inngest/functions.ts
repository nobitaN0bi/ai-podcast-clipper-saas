import { env } from "~/env";
import { inngest } from "./client";
import { db } from "~/server/db";
import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";

export const processVideo = inngest.createFunction(
  {
    id: "process-video",
    retries: 1,
    concurrency: {
      limit: 1,
      key: "event.data.userId",
    },
  },
  { event: "process-video-events" },
  async ({ event, step }) => {
    const { uploadedFileId } = event.data as {
      uploadedFileId: string;
      userId: string;
    };

    try {
      const { userId, credits, s3Key } = await step.run(
        "check-credits",
        async () => {
          const uploadedFile = await db.uploadedFile.findUniqueOrThrow({
            where: {
              id: uploadedFileId,
            },
            select: {
              user: {
                select: {
                  id: true,
                  credits: true,
                },
              },
              s3Key: true,
            },
          });

          return {
            userId: uploadedFile.user.id,
            credits: uploadedFile.user.credits,
            s3Key: uploadedFile.s3Key,
          };
        },
      );

      if (credits > 0) {
        await step.run("set-status-processing", async () => {
          await db.uploadedFile.update({
            where: {
              id: uploadedFileId,
            },
            data: {
              status: "processing",
            },
          });
        });

        await step.fetch(env.PROCESS_VIDEO_ENDPOINT, {
          method: "POST",
          body: JSON.stringify({ s3_key: s3Key }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.PROCESS_VIDEO_ENDPOINT_AUTH}`,
          },
        });

        const { clipsFound } = await step.run(
          "create-clips-in-db",
          async () => {
            const folderPrefix = s3Key.split("/")[0]!;

            const allKeys = await listS3ObjectsByPrefix(folderPrefix);

            const clipKeys = allKeys.filter(
              (key): key is string =>
                key !== undefined && !key.endsWith("original.mp4"),
            );

            if (clipKeys.length > 0) {
              await db.clip.createMany({
                data: clipKeys.map((clipKey) => ({
                  s3Key: clipKey,
                  uploadedFileId,
                  userId,
                })),
              });
            }

            return { clipsFound: clipKeys.length };
          },
        );

        await step.run("deduct-credits", async () => {
          await db.user.update({
            where: {
              id: userId,
            },
            data: {
              credits: {
                decrement: Math.min(credits, clipsFound),
              },
            },
          });
        });

        await step.run("set-status-processed", async () => {
          await db.uploadedFile.update({
            where: {
              id: uploadedFileId,
            },
            data: {
              status: "processed",
            },
          });
        });
      } else {
        await step.run("set-status-no-credits", async () => {
          await db.uploadedFile.update({
            where: {
              id: uploadedFileId,
            },
            data: {
              status: "no credits",
            },
          });
        });
      }
    } catch (error: unknown) {
      await db.uploadedFile.update({
        where: {
          id: uploadedFileId,
        },
        data: {
          status: "failed",
        },
      });
    }
  },
);
export const renderVideo = inngest.createFunction(
  {
    id: "render-video",
    retries: 0, // No retries for expensive renders for now
  },
  { event: "render-video" },
  async ({ event, step }) => {
    const { userId, projectId, trimStart, trimEnd, aspectRatio, burnCaptions } = event.data;

    // 1. Get S3 Key
    const { s3Key } = await step.run("get-project-key", async () => {
      const file = await db.uploadedFile.findUniqueOrThrow({
        where: { id: projectId },
        select: { s3Key: true }
      });
      return { s3Key: file.s3Key };
    });

    // 2. Call Modal Endpoint
    const { renderKey } = await step.run("call-render-endpoint", async () => {
      const res = await fetch(`${env.PROCESS_VIDEO_ENDPOINT}/render_video`, {
        method: "POST",
        body: JSON.stringify({
          s3_key: s3Key,
          trim_start: trimStart,
          trim_end: trimEnd,
          aspect_ratio: aspectRatio,
          burn_captions: burnCaptions
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.PROCESS_VIDEO_ENDPOINT_AUTH}`,
        }
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Render failed: ${res.status} ${err}`);
      }

      const data = await res.json();
      return { renderKey: data.s3_key };
    });

    // 3. Save Result
    await step.run("save-rendered-clip", async () => {
      await db.clip.create({
        data: {
          userId,
          uploadedFileId: projectId,
          s3Key: renderKey,
          // Status? For now just exists.
        }
      });
    });

    return { success: true, s3Key: renderKey };
  }
);

async function listS3ObjectsByPrefix(prefix: string) {
  const s3Client = new S3Client({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const listCommand = new ListObjectsV2Command({
    Bucket: env.S3_BUCKET_NAME,
    Prefix: prefix,
  });

  const response = await s3Client.send(listCommand);
  return response.Contents?.map((item) => item.Key).filter(Boolean) ?? [];
}
