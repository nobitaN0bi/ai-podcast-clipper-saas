
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { existsSync } from 'fs';

const execAsync = promisify(exec);
const LOCAL_STORAGE = process.env.LOCAL_STORAGE_PATH || './local_storage';

interface PreviewRequest {
    assetPath: string;
    assetType: 'video' | 'audio' | 'image';
}

export async function POST(req: Request) {
    try {
        const body = await req.json() as PreviewRequest;
        const { assetPath, assetType } = body;

        if (!assetPath || !existsSync(assetPath)) {
            return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
        }

        const assetId = randomUUID();
        const previewDir = path.join(LOCAL_STORAGE, 'previews', assetId);
        await mkdir(previewDir, { recursive: true });

        const result = {
            thumbnailPath: '',
            previewPath: '',
        };

        if (assetType === 'video') {
            const thumbnailPath = path.join(previewDir, 'thumb.jpg');
            const gifPath = path.join(previewDir, 'preview.gif');

            // Generate Thumbnail (at 1s or 50% if possible, sticking to 1s for simplicity/speed)
            await execAsync(`ffmpeg -y -i "${assetPath}" -ss 00:00:01 -vframes 1 "${thumbnailPath}"`);

            // Generate GIF (3s loop, 10fps, scaled width 320)
            // -ss 0 = start at beginning
            // -t 3 = 3 seconds duration
            await execAsync(`ffmpeg -y -i "${assetPath}" -ss 00:00:00 -t 3 -vf "fps=10,scale=320:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" "${gifPath}"`);

            result.thumbnailPath = thumbnailPath;
            result.previewPath = gifPath;
        } else if (assetType === 'image') {
            // Just copy/resize for thumbnail
            // For now, simpler implementation: just use the image itself or a resized version
            // Skipping for this MVP step as video is priority
        }

        return NextResponse.json({
            success: true,
            ...result
        });

    } catch (error) {
        console.error("Preview generation failed:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
