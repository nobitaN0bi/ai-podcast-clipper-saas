
import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { z } from "zod";

const createScheduleSchema = z.object({
    clipId: z.string().optional(),
    scheduledFor: z.string().datetime(), // ISO String
    platform: z.enum(["youtube", "tiktok", "instagram", "linkedin"]),
    caption: z.string().optional(),
    tags: z.string().optional(),
});

export async function POST(request: Request) {
    const session = await auth();
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const json = await request.json();
        const body = createScheduleSchema.parse(json);

        // If platform is youtube, check if connected
        let socialProfileId = null;
        if (body.platform === "youtube") {
            const profile = await db.socialProfile.findUnique({
                where: {
                    userId_platform: {
                        userId: session.user.id,
                        platform: "youtube"
                    }
                }
            });
            if (profile) socialProfileId = profile.id;
        }

        const post = await db.scheduledPost.create({
            data: {
                userId: session.user.id,
                clipId: body.clipId,
                scheduledFor: new Date(body.scheduledFor),
                platform: body.platform,
                status: "scheduled",
                caption: body.caption,
                tags: body.tags || "",
                socialProfileId: socialProfileId
            },
        });

        return NextResponse.json({ success: true, post });

    } catch (error) {
        console.error("Schedule Creation Error:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Invalid Data", details: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to schedule post" }, { status: 500 });
    }
}
