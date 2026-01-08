"use server";

import { redirect } from "next/navigation";
import { DashboardClient } from "~/components/dashboard-client";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export default async function DashboardPage() {
  const session = await auth();

  // Mock data for public demo or empty state
  let formattedFiles: any[] = [];
  let clips: any[] = [];

  if (session?.user?.id) {
    try {
      const userData = await db.user.findUniqueOrThrow({
        where: { id: session.user.id },
        select: {
          uploadedFiles: {
            where: {
              // Show all files to debug "missing" uploads
              // uploaded: true, 
            },
            select: {
              id: true,
              s3Key: true,
              displayName: true,
              status: true,
              createdAt: true,
              _count: {
                select: {
                  clips: true,
                },
              },
            },
          },
          clips: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

      formattedFiles = userData.uploadedFiles.map((file) => ({
        id: file.id,
        s3Key: file.s3Key,
        filename: file.displayName ?? "Unknown filename",
        status: file.status,
        clipsCount: file._count.clips,
        createdAt: file.createdAt,
      }));
      clips = userData.clips;
    } catch (e) {
      // User might be created but no data yet
      console.log("No user data found or DB error", e);
    }
  } else {
    // Public Demo Mode Data
    formattedFiles = [
      { id: "demo-1", s3Key: "demo/podcast.mp4", filename: "Lex_Fridman_Ep_400.mp4", status: "processed", clipsCount: 12, createdAt: new Date() },
      { id: "demo-2", s3Key: "demo/interview.mp4", filename: "Indie_Hackers_Intervew.mp4", status: "processing", clipsCount: 0, createdAt: new Date() },
    ];
    clips = []; // Keep clips empty or mock if needed
  }

  return (
    <DashboardClient uploadedFiles={formattedFiles} clips={clips} />
  );
}
