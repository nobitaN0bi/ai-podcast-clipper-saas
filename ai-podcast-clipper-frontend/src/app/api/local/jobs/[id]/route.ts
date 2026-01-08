
import { NextResponse } from 'next/server';
import { jobQueue } from '~/lib/job-queue';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const job = await jobQueue.getJob(id);

    if (!job) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json(job);
}
