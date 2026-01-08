/**
 * Local Projects API
 * Manages video projects in local storage (IndexedDB-backed)
 */

import { NextResponse } from 'next/server';
import { readdir, stat, readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

const LOCAL_STORAGE = process.env.LOCAL_STORAGE_PATH || './local_storage';
const PROJECTS_FILE = path.join(LOCAL_STORAGE, 'projects.json');

interface LocalProject {
    id: string;
    name: string;
    videoPath: string;
    thumbnailPath?: string;
    duration: number;
    aspectRatio: '9:16' | '16:9' | '1:1';
    createdAt: string;
    updatedAt: string;
}

async function loadProjects(): Promise<LocalProject[]> {
    try {
        if (!existsSync(PROJECTS_FILE)) {
            return [];
        }
        const data = await readFile(PROJECTS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

async function saveProjects(projects: LocalProject[]): Promise<void> {
    await mkdir(LOCAL_STORAGE, { recursive: true });
    await writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2));
}

export async function GET() {
    try {
        const projects = await loadProjects();

        return NextResponse.json({
            success: true,
            projects,
            total: projects.length,
            offline: true
        });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to load projects' },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json() as Partial<LocalProject>;

        if (!body.name || !body.videoPath) {
            return NextResponse.json(
                { error: 'name and videoPath are required' },
                { status: 400 }
            );
        }

        const projects = await loadProjects();

        const newProject: LocalProject = {
            id: crypto.randomUUID(),
            name: body.name,
            videoPath: body.videoPath,
            thumbnailPath: body.thumbnailPath,
            duration: body.duration || 0,
            aspectRatio: body.aspectRatio || '16:9',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        projects.push(newProject);
        await saveProjects(projects);

        return NextResponse.json({
            success: true,
            project: newProject,
            offline: true
        });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create project' },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'id is required' },
                { status: 400 }
            );
        }

        const projects = await loadProjects();
        const filtered = projects.filter(p => p.id !== id);

        if (filtered.length === projects.length) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        await saveProjects(filtered);

        return NextResponse.json({
            success: true,
            deleted: id,
            offline: true
        });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to delete project' },
            { status: 500 }
        );
    }
}
