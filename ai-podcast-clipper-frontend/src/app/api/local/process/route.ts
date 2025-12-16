/**
 * Local Video Processing API
 * Runs FFMPEG locally for basic video operations without cloud dependencies
 */

import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, mkdir, unlink, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const execAsync = promisify(exec);

// Local storage directory
const LOCAL_STORAGE = process.env.LOCAL_STORAGE_PATH || './local_storage';
const TEMP_DIR = '/tmp/video_processing';

interface ProcessRequest {
    inputPath: string;
    outputName?: string;
    trimStart?: number;
    trimEnd?: number;
    aspectRatio?: '9:16' | '16:9' | '1:1';
    resolution?: '4k' | '1080p' | '720p';
}

interface ProcessResult {
    success: boolean;
    outputPath?: string;
    duration?: number;
    error?: string;
}

/**
 * Check if FFMPEG is installed
 */
async function checkFFMPEG(): Promise<boolean> {
    try {
        await execAsync('ffmpeg -version');
        return true;
    } catch {
        return false;
    }
}

/**
 * Get video duration using ffprobe
 */
async function getVideoDuration(inputPath: string): Promise<number> {
    try {
        const { stdout } = await execAsync(
            `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${inputPath}"`
        );
        return parseFloat(stdout.trim());
    } catch {
        return 0;
    }
}

/**
 * Build FFMPEG filter string for aspect ratio
 */
function getAspectRatioFilter(aspectRatio: string): string {
    switch (aspectRatio) {
        case '9:16':
            return 'crop=ih*(9/16):ih';
        case '1:1':
            return 'crop=ih:ih';
        case '16:9':
        default:
            return 'scale=1920:1080';
    }
}

/**
 * Build FFMPEG resolution settings
 */
function getResolutionSettings(resolution: string): string {
    switch (resolution) {
        case '4k':
            return '-vf scale=3840:2160 -b:v 35M';
        case '1080p':
            return '-vf scale=1920:1080 -b:v 12M';
        case '720p':
        default:
            return '-vf scale=1280:720 -b:v 5M';
    }
}

/**
 * Process video locally with FFMPEG
 */
async function processVideoLocal(request: ProcessRequest): Promise<ProcessResult> {
    const runId = randomUUID();
    const workDir = path.join(TEMP_DIR, runId);

    try {
        // Ensure directories exist
        await mkdir(workDir, { recursive: true });
        await mkdir(LOCAL_STORAGE, { recursive: true });

        const outputName = request.outputName || `output_${runId}.mp4`;
        const outputPath = path.join(LOCAL_STORAGE, 'exports', outputName);
        await mkdir(path.dirname(outputPath), { recursive: true });

        // Build FFMPEG command
        const filters: string[] = [];
        const options: string[] = ['-y']; // Overwrite output

        // Trimming
        if (request.trimStart !== undefined) {
            options.push(`-ss ${request.trimStart}`);
        }
        if (request.trimEnd !== undefined) {
            options.push(`-to ${request.trimEnd}`);
        }

        // Aspect ratio
        if (request.aspectRatio) {
            filters.push(getAspectRatioFilter(request.aspectRatio));
        }

        // Build filter string
        const filterStr = filters.length > 0 ? `-vf "${filters.join(',')}"` : '';

        // Resolution settings
        const resolutionStr = request.resolution
            ? getResolutionSettings(request.resolution)
            : '';

        // Construct command
        const cmd = [
            'ffmpeg',
            ...options,
            `-i "${request.inputPath}"`,
            filterStr,
            resolutionStr,
            '-c:v libx264 -preset fast -crf 23',
            '-c:a aac -b:a 128k',
            `"${outputPath}"`
        ].filter(Boolean).join(' ');

        console.log(`[LocalProcess] Running: ${cmd}`);

        await execAsync(cmd, { maxBuffer: 50 * 1024 * 1024 }); // 50MB buffer

        const duration = await getVideoDuration(outputPath);

        return {
            success: true,
            outputPath,
            duration
        };
    } catch (error) {
        console.error('[LocalProcess] Error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

// =============================================================================
// API ROUTES
// =============================================================================

export async function POST(req: Request) {
    // Check FFMPEG
    const hasFFMPEG = await checkFFMPEG();
    if (!hasFFMPEG) {
        return NextResponse.json(
            { error: 'FFMPEG not installed. Please install: sudo apt install ffmpeg' },
            { status: 500 }
        );
    }

    try {
        const body = await req.json() as ProcessRequest;

        if (!body.inputPath) {
            return NextResponse.json(
                { error: 'inputPath is required' },
                { status: 400 }
            );
        }

        // Check if input file exists
        if (!existsSync(body.inputPath)) {
            return NextResponse.json(
                { error: `Input file not found: ${body.inputPath}` },
                { status: 404 }
            );
        }

        const result = await processVideoLocal(body);

        if (result.success) {
            return NextResponse.json({
                status: 'success',
                outputPath: result.outputPath,
                duration: result.duration,
                offline: true
            });
        } else {
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            );
        }
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

export async function GET() {
    const hasFFMPEG = await checkFFMPEG();

    return NextResponse.json({
        status: 'ok',
        offline: true,
        ffmpegInstalled: hasFFMPEG,
        storageDir: LOCAL_STORAGE
    });
}
