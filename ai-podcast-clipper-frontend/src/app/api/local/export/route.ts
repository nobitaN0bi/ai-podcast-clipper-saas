
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { jobQueue, type Job } from '~/lib/job-queue';
import { exec } from 'child_process';
import { promisify } from 'util';
import { mkdir } from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);
const LOCAL_STORAGE = process.env.LOCAL_STORAGE_PATH || './local_storage';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { inputPath, outputName, ...options } = body;

        if (!inputPath) {
            return NextResponse.json({ error: 'inputPath is required' }, { status: 400 });
        }

        const jobId = randomUUID();
        const job: Job = {
            id: jobId,
            status: 'pending',
            progress: 0,
            createdAt: new Date().toISOString(),
            request: body
        };

        await jobQueue.addJob(job);

        // Start processing in "background" (no await)
        processExport(jobId, body).catch(err => {
            console.error(`Job ${jobId} failed:`, err);
            jobQueue.updateJob(jobId, { status: 'failed', error: err.message });
        });

        return NextResponse.json({
            success: true,
            jobId,
            message: 'Export started'
        });

    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

async function processExport(jobId: string, request: any) {
    await jobQueue.updateJob(jobId, { status: 'processing', progress: 10 });

    const outputPath = path.join(LOCAL_STORAGE, 'exports', request.outputName || `export_${jobId}.mp4`);
    await mkdir(path.dirname(outputPath), { recursive: true });

    // Construct FFMPEG command (Simplified for now - reusing logic similar to process route)
    // In production, this would parse the complex timeline JSON

    // Simulate complex processing time for demo or simple trim
    const cmd = `ffmpeg -y -i "${request.inputPath}" -c:v libx264 -preset ultrafast "${outputPath}"`;

    // For demo purposes, we'll simulate progress updates
    const progressInterval = setInterval(() => {
        jobQueue.getJob(jobId).then(job => {
            if (job && job.status === 'processing' && job.progress < 90) {
                jobQueue.updateJob(jobId, { progress: job.progress + 10 });
            }
        });
    }, 500);

    try {
        await execAsync(cmd);
        clearInterval(progressInterval);

        await jobQueue.updateJob(jobId, {
            status: 'completed',
            progress: 100,
            result: {
                outputPath,
                filename: path.basename(outputPath),
                duration: 0 // TODO: Get actual duration
            }
        });
    } catch (err) {
        clearInterval(progressInterval);
        throw err;
    }
}
