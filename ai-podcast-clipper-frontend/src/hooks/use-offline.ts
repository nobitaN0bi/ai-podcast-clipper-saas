/**
 * Offline-First Hooks for Video Editor
 * Provides local-first functionality with optional cloud sync
 */

import { useState, useCallback, useEffect } from 'react';

// =============================================================================
// TYPES
// =============================================================================

export interface LocalProject {
    id: string;
    name: string;
    videoPath: string;
    thumbnailPath?: string;
    duration: number;
    aspectRatio: '9:16' | '16:9' | '1:1';
    createdAt: string;
    updatedAt: string;
}

export interface ProcessOptions {
    trimStart?: number;
    trimEnd?: number;
    aspectRatio?: '9:16' | '16:9' | '1:1';
    resolution?: '4k' | '1080p' | '720p';
    outputName?: string;
}

export interface ProcessResult {
    success: boolean;
    outputPath?: string;
    duration?: number;
    error?: string;
}

// =============================================================================
// LOCAL STORAGE HOOKS
// =============================================================================

/**
 * Hook to manage local projects
 */
export function useLocalProjects() {
    const [projects, setProjects] = useState<LocalProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/local/projects');
            const data = await res.json();
            if (data.success) {
                setProjects(data.projects);
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Failed to fetch projects');
        } finally {
            setLoading(false);
        }
    }, []);

    const createProject = useCallback(async (project: Partial<LocalProject>) => {
        try {
            const res = await fetch('/api/local/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(project),
            });
            const data = await res.json();
            if (data.success) {
                setProjects((prev) => [...prev, data.project]);
                return data.project;
            }
            throw new Error(data.error);
        } catch (err) {
            throw err;
        }
    }, []);

    const deleteProject = useCallback(async (id: string) => {
        try {
            const res = await fetch(`/api/local/projects?id=${id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (data.success) {
                setProjects((prev) => prev.filter((p) => p.id !== id));
                return true;
            }
            throw new Error(data.error);
        } catch (err) {
            throw err;
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    return {
        projects,
        loading,
        error,
        fetchProjects,
        createProject,
        deleteProject,
    };
}

/**
 * Hook to upload video locally
 */
export function useLocalUpload() {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const upload = useCallback(async (file: File) => {
        setUploading(true);
        setProgress(0);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/local/upload', {
                method: 'POST',
                body: formData,
            });

            setProgress(100);
            const data = await res.json();

            if (data.success) {
                return data;
            }
            throw new Error(data.error);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
            throw err;
        } finally {
            setUploading(false);
        }
    }, []);

    return { upload, uploading, progress, error };
}

/**
 * Hook to process video locally with FFMPEG
 */
export function useLocalProcess() {
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const process = useCallback(async (
        inputPath: string,
        options: ProcessOptions = {}
    ): Promise<ProcessResult> => {
        setProcessing(true);
        setProgress(0);
        setError(null);

        try {
            // Simulate progress (FFMPEG doesn't report progress easily via API)
            const progressInterval = setInterval(() => {
                setProgress((prev) => Math.min(prev + 10, 90));
            }, 500);

            const res = await fetch('/api/local/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    inputPath,
                    ...options,
                }),
            });

            clearInterval(progressInterval);
            setProgress(100);

            const data = await res.json();

            if (data.status === 'success') {
                return {
                    success: true,
                    outputPath: data.outputPath,
                    duration: data.duration,
                };
            }

            throw new Error(data.error || 'Processing failed');
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Processing failed';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setProcessing(false);
        }
    }, []);

    return { process, processing, progress, error };
}

/**
 * Hook to check FFMPEG availability
 */
export function useFFMPEGStatus() {
    const [available, setAvailable] = useState<boolean | null>(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        async function check() {
            try {
                const res = await fetch('/api/local/process');
                const data = await res.json();
                setAvailable(data.ffmpegInstalled);
            } catch {
                setAvailable(false);
            } finally {
                setChecking(false);
            }
        }
        check();
    }, []);

    return { available, checking };
}

/**
 * Hook to manage local export jobs
 */
export function useLocalExport() {
    const [exporting, setExporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);

    const startExport = useCallback(async (
        inputPath: string,
        options: ProcessOptions = {}
    ) => {
        setExporting(true);
        setProgress(0);
        setError(null);
        setResult(null);

        try {
            // Start Export Job
            const res = await fetch('/api/local/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    inputPath,
                    ...options,
                }),
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.error);

            const jobId = data.jobId;

            // Poll for status
            const poll = setInterval(async () => {
                try {
                    const statusRes = await fetch(`/api/local/jobs/${jobId}`);
                    const job = await statusRes.json();

                    if (job.status === 'completed') {
                        clearInterval(poll);
                        setExporting(false);
                        setProgress(100);
                        setResult(job.result);
                    } else if (job.status === 'failed') {
                        clearInterval(poll);
                        setExporting(false);
                        setError(job.error || 'Export failed');
                    } else if (job.status === 'processing') {
                        setProgress(job.progress);
                    }
                } catch (err) {
                    console.error("Polling error", err);
                }
            }, 1000);

        } catch (err) {
            setExporting(false);
            setError(err instanceof Error ? err.message : 'Failed to start export');
        }
    }, []);

    return { startExport, exporting, progress, result, error };
}

// =============================================================================
// OFFLINE STATUS
// =============================================================================

/**
 * Hook to detect online/offline status
 */
export function useOnlineStatus() {
    const [isOnline, setIsOnline] = useState(
        typeof navigator !== 'undefined' ? navigator.onLine : true
    );

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return isOnline;
}
