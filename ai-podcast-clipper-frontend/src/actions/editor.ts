"use server";

import { env } from "~/env";
import { inngest } from "~/inngest/client";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export type EditorProject = {
    id: string;
    filename: string;
    s3Key: string;
    createdAt: Date;
    status: string;
    // In a real app, we might store duration, resolution etc.
};

export async function getProjects(): Promise<{ success: boolean; projects?: EditorProject[]; error?: string }> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        const projects = await db.uploadedFile.findMany({
            where: {
                userId: session.user.id,
                // Optional: filter by status if we only want processed videos
                status: "processed",
            },
            select: {
                id: true,
                displayName: true,
                s3Key: true,
                createdAt: true,
                status: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        const mappedProjects = projects.map(p => ({
            ...p,
            filename: p.displayName ?? p.s3Key ?? "Untitled Project"
        }));

        return { success: true, projects: mappedProjects };
    } catch (error) {
        console.error("Failed to fetch projects:", error);
        return { success: false, error: "Failed to fetch projects" };
    }
}

export type ExportConfig = {
    projectId: string;
    trimStart: number;
    trimEnd: number;
    aspectRatio: "9:16" | "16:9" | "1:1";
    burnCaptions?: boolean;
    // Add more config as needed (captions, etc.)
};

export async function exportVideo(config: ExportConfig) {
    console.log("🚀 [Server Action] Triggering Export for:", config.projectId);

    // Validate Auth
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    // Trigger Inngest
    await inngest.send({
        name: "render-video",
        data: {
            userId: session.user.id,
            ...config
        }
    });

    return { success: true, message: "Export started" };
}
