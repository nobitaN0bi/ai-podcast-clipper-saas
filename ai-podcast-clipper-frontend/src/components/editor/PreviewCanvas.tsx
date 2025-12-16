"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { useEditorStore } from "~/stores/editor-store";
import { cn } from "~/lib/utils";
import { Play, Pause, Maximize2, Minimize2, Upload, Film } from "lucide-react";

// ============================================================================
// PREVIEW CANVAS
// ============================================================================

export function PreviewCanvas() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [videoError, setVideoError] = useState<string | null>(null);

    const {
        isPlaying,
        currentTime,
        aspectRatio,
        project,
        togglePlayback,
        seek,
        setDuration,
    } = useEditorStore();

    // Get the active video source from clips
    const activeVideoSrc = useMemo(() => {
        if (!project) return null;

        // Find the first video clip with an s3Key or src
        for (const track of project.tracks) {
            if (track.type === "video") {
                for (const clip of track.clips) {
                    const clipWithSrc = clip as any;
                    if (clipWithSrc.s3Key) {
                        // Return S3 presigned URL would go here
                        // For now return a relative path or public URL
                        return `/api/stream/${encodeURIComponent(clipWithSrc.s3Key)}`;
                    }
                    if (clipWithSrc.src) {
                        return clipWithSrc.src;
                    }
                }
            }
        }
        return null;
    }, [project]);

    const hasClips = useMemo(() => {
        if (!project) return false;
        return project.tracks.some(t => t.clips.length > 0);
    }, [project]);

    // Sync playback state
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !activeVideoSrc) return;

        if (isPlaying) {
            video.play().catch((err) => {
                console.error("Video play error:", err);
                setVideoError("Failed to play video");
            });
        } else {
            video.pause();
        }
    }, [isPlaying, activeVideoSrc]);

    // Sync seek
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !activeVideoSrc) return;
        if (Math.abs(video.currentTime - currentTime) > 0.1) {
            video.currentTime = currentTime;
        }
    }, [currentTime, activeVideoSrc]);

    // Update store on time update
    const handleTimeUpdate = () => {
        if (videoRef.current && isPlaying) {
            seek(videoRef.current.currentTime);
        }
    };

    // Get video duration
    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
            setVideoError(null);
        }
    };

    // Handle video error
    const handleVideoError = () => {
        setVideoError("Failed to load video");
    };

    // Toggle fullscreen
    const toggleFullscreen = () => {
        if (!containerRef.current) return;

        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Aspect ratio styles
    const aspectClasses = {
        "9:16": "aspect-[9/16] max-h-[85%]",
        "16:9": "aspect-video max-w-[85%]",
        "1:1": "aspect-square max-h-[80%]",
    };

    return (
        <div
            ref={containerRef}
            className="flex-1 bg-zinc-950 flex items-center justify-center relative overflow-hidden"
        >
            {/* Aspect ratio indicator */}
            <div className="absolute top-4 left-4 text-xs font-mono text-zinc-600">
                CANVAS: {aspectRatio}
            </div>

            {/* Preview Frame */}
            <div
                className={cn(
                    "bg-black shadow-2xl overflow-hidden relative border-2 border-zinc-800 rounded-lg",
                    aspectClasses[aspectRatio]
                )}
            >
                {/* Video Element when we have a source */}
                {activeVideoSrc && (
                    <video
                        ref={videoRef}
                        src={activeVideoSrc}
                        className="absolute inset-0 w-full h-full object-contain bg-black"
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onError={handleVideoError}
                        playsInline
                        muted={false}
                    />
                )}

                {/* Placeholder when no video */}
                {!activeVideoSrc && project && (
                    <div className="absolute inset-0 bg-zinc-900 flex flex-col items-center justify-center gap-4">
                        {hasClips ? (
                            <>
                                <Film className="size-12 text-zinc-600" />
                                <div className="text-center">
                                    <span className="text-zinc-400 font-medium block mb-1">
                                        {project.tracks.flatMap(t => t.clips).length} clips in timeline
                                    </span>
                                    <span className="text-zinc-600 text-sm">
                                        Add a video source to preview
                                    </span>
                                </div>
                            </>
                        ) : (
                            <>
                                <Upload className="size-12 text-zinc-600" />
                                <div className="text-center">
                                    <span className="text-zinc-400 font-medium block mb-1">
                                        {project.name}
                                    </span>
                                    <span className="text-zinc-600 text-sm">
                                        Import media from My Clips to start editing
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* No project state */}
                {!project && (
                    <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
                        <span className="text-zinc-600 text-lg">No Project Loaded</span>
                    </div>
                )}

                {/* Video Error Overlay */}
                {videoError && (
                    <div className="absolute inset-0 bg-red-950/80 flex items-center justify-center">
                        <span className="text-red-400 text-sm">{videoError}</span>
                    </div>
                )}

                {/* Play Button Overlay - only show when we have video */}
                {activeVideoSrc && !videoError && (
                    <button
                        onClick={togglePlayback}
                        className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors group"
                    >
                        <div className="size-16 rounded-full bg-white/10 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            {isPlaying ? (
                                <Pause className="size-8 text-white" />
                            ) : (
                                <Play className="size-8 text-white ml-1" />
                            )}
                        </div>
                    </button>
                )}
            </div>

            {/* Fullscreen Toggle */}
            <button
                onClick={toggleFullscreen}
                className="absolute top-4 right-4 p-2 bg-zinc-800/50 hover:bg-zinc-700 rounded transition-colors"
            >
                {isFullscreen ? (
                    <Minimize2 className="size-4 text-white" />
                ) : (
                    <Maximize2 className="size-4 text-white" />
                )}
            </button>

            {/* Current Time */}
            <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded font-mono text-sm text-white">
                {formatTimecode(currentTime)}
            </div>
        </div>
    );
}

function formatTimecode(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const f = Math.floor((seconds % 1) * 30); // 30fps

    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}:${f.toString().padStart(2, "0")}`;
}

export default PreviewCanvas;
