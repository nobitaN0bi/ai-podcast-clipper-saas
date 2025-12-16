/**
 * Local Video Upload API
 * Handles file uploads to local filesystem (no S3 needed)
 */

import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

const LOCAL_STORAGE = process.env.LOCAL_STORAGE_PATH || './local_storage';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Generate unique filename
        const fileId = randomUUID();
        const ext = path.extname(file.name) || '.mp4';
        const filename = `${fileId}${ext}`;
        const uploadDir = path.join(LOCAL_STORAGE, 'uploads');
        const filePath = path.join(uploadDir, filename);

        // Ensure directory exists
        await mkdir(uploadDir, { recursive: true });

        // Write file
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        return NextResponse.json({
            success: true,
            id: fileId,
            filename: file.name,
            path: filePath,
            size: buffer.length,
            offline: true
        });
    } catch (error) {
        console.error('[LocalUpload] Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Upload failed' },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        status: 'ok',
        endpoint: '/api/local/upload',
        method: 'POST',
        accepts: 'multipart/form-data',
        offline: true
    });
}
