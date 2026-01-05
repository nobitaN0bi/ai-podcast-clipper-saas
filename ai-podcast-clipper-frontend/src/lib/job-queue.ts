
import { writeFile, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Job {
    id: string;
    status: JobStatus;
    progress: number; // 0-100
    createdAt: string;
    result?: {
        outputPath: string;
        filename: string;
        duration: number;
    };
    error?: string;
    request: any; // Store original request for context
}

const STORAGE_PATH = process.env.LOCAL_STORAGE_PATH || './local_storage';
const JOBS_FILE = path.join(STORAGE_PATH, 'jobs.json');

class JobQueueManager {
    private jobs: Map<string, Job> = new Map();
    private initialized = false;

    private async init() {
        if (this.initialized) return;
        try {
            if (existsSync(JOBS_FILE)) {
                const data = await readFile(JOBS_FILE, 'utf-8');
                const loadedJobs = JSON.parse(data);
                if (Array.isArray(loadedJobs)) {
                    loadedJobs.forEach(job => this.jobs.set(job.id, job));
                }
            }
        } catch (error) {
            console.error('Failed to load jobs:', error);
        }
        this.initialized = true;
    }

    private async persist() {
        try {
            const jobsArray = Array.from(this.jobs.values());
            await writeFile(JOBS_FILE, JSON.stringify(jobsArray, null, 2));
        } catch (error) {
            console.error('Failed to save jobs:', error);
        }
    }

    async addJob(job: Job) {
        await this.init();
        this.jobs.set(job.id, job);
        await this.persist();
    }

    async updateJob(id: string, updates: Partial<Job>) {
        await this.init();
        const job = this.jobs.get(id);
        if (job) {
            Object.assign(job, updates);
            this.jobs.set(id, job);
            await this.persist();
        }
    }

    async getJob(id: string): Promise<Job | undefined> {
        await this.init();
        return this.jobs.get(id);
    }

    async getAll(): Promise<Job[]> {
        await this.init();
        return Array.from(this.jobs.values()).sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
}

export const jobQueue = new JobQueueManager();
