"use server";

import { redirect } from "next/navigation";
import { ClipDisplay } from "~/components/clip-display";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export default async function MyClipsPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    let clips: any[] = [];

    try {
        const userData = await db.user.findUniqueOrThrow({
            where: { id: session.user.id },
            select: {
                clips: {
                    orderBy: {
                        createdAt: "desc",
                    },
                },
            },
        });
        clips = userData.clips;
    } catch (e) {
        console.log("Error fetching clips:", e);
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">My Clips</h1>
                <p className="text-muted-foreground">
                    Your library of AI-generated short clips.
                </p>
            </div>

            <div className="min-h-[500px]">
                <ClipDisplay clips={clips} />
            </div>
        </div>
    );
}
