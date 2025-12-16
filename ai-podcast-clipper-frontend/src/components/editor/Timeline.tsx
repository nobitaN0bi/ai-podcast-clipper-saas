"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useEditorStore, type Track, type Clip } from "~/stores/editor-store";
import { cn } from "~/lib/utils";
import { Plus, Volume2, VolumeX, Lock, Unlock, Trash2, Film, Music } from "lucide-react";

// ============================================================================
// CONSTANTS
// ============================================================================

const TRACK_HEADER_WIDTH = 120;
const MIN_ZOOM = 10;
const MAX_ZOOM = 200;

// ============================================================================
// TIMELINE RULER
// ============================================================================

function TimelineRuler({ duration, zoom, scrollX }: { duration: number; zoom: number; scrollX: number }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        // Clear
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(0, 0, rect.width, rect.height);

        // Draw tick marks
        const secondsPerMajorTick = zoom < 30 ? 10 : zoom < 60 ? 5 : 1;
        const startSecond = Math.floor(scrollX / zoom);
        const endSecond = Math.ceil((scrollX + rect.width) / zoom);

        for (let sec = startSecond; sec <= endSecond; sec++) {
            const x = sec * zoom - scrollX;
            if (x < 0) continue;

            const isMajor = sec % secondsPerMajorTick === 0;

            ctx.beginPath();
            ctx.strokeStyle = isMajor ? "#666" : "#333";
            ctx.moveTo(x, isMajor ? 0 : 16);
            ctx.lineTo(x, 24);
            ctx.stroke();

            if (isMajor) {
                ctx.fillStyle = "#888";
                ctx.font = "10px Inter, sans-serif";
                const timeStr = formatTime(sec);
                ctx.fillText(timeStr, x + 4, 12);
            }
        }
    }, [duration, zoom, scrollX]);

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-6 bg-zinc-900"
            style={{ marginLeft: TRACK_HEADER_WIDTH }}
        />
    );
}

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// ============================================================================
// TRACK HEADER
// ============================================================================

function TrackHeader({ track, onToggleMute, onToggleLock, onRemove }: {
    track: Track;
    onToggleMute: () => void;
    onToggleLock: () => void;
    onRemove: () => void;
}) {
    return (
        <div
            className="flex items-center gap-2 px-2 border-b border-zinc-800 bg-zinc-900 shrink-0"
            style={{ width: TRACK_HEADER_WIDTH, height: track.height }}
        >
            {track.type === "video" ? (
                <Film className="size-4 text-blue-400" />
            ) : (
                <Music className="size-4 text-green-400" />
            )}
            <span className="text-xs text-zinc-400 truncate flex-1">{track.name}</span>
            <button onClick={onToggleMute} className="p-1 hover:bg-zinc-800 rounded">
                {track.muted ? <VolumeX className="size-3 text-red-400" /> : <Volume2 className="size-3 text-zinc-400" />}
            </button>
            <button onClick={onToggleLock} className="p-1 hover:bg-zinc-800 rounded">
                {track.locked ? <Lock className="size-3 text-yellow-400" /> : <Unlock className="size-3 text-zinc-500" />}
            </button>
        </div>
    );
}

// ============================================================================
// CLIP COMPONENT
// ============================================================================

function ClipItem({ clip, zoom, isSelected, onClick }: {
    clip: Clip;
    zoom: number;
    isSelected: boolean;
    onClick: () => void;
}) {
    const width = clip.duration * zoom;
    const left = clip.startTime * zoom;

    return (
        <div
            onClick={onClick}
            className={cn(
                "absolute top-1 bottom-1 rounded cursor-pointer transition-colors flex items-center px-2 overflow-hidden",
                clip.type === "video" ? "bg-blue-600/80" : "bg-green-600/80",
                isSelected && "ring-2 ring-white ring-offset-1 ring-offset-zinc-900"
            )}
            style={{ left, width: Math.max(width, 4) }}
        >
            <span className="text-xs text-white truncate font-medium">{clip.name}</span>
        </div>
    );
}

// ============================================================================
// TRACK ROW
// ============================================================================

function TrackRow({ track, zoom, selectedClipId, onSelectClip }: {
    track: Track;
    zoom: number;
    selectedClipId: string | null;
    onSelectClip: (clipId: string) => void;
}) {
    return (
        <div
            className="relative border-b border-zinc-800 bg-zinc-950"
            style={{ height: track.height }}
        >
            {track.clips.map((clip: Clip) => (
                <ClipItem
                    key={clip.id}
                    clip={clip}
                    zoom={zoom}
                    isSelected={selectedClipId === clip.id}
                    onClick={() => onSelectClip(clip.id)}
                />
            ))}
        </div>
    );
}

// ============================================================================
// PLAYHEAD
// ============================================================================

function Playhead({ currentTime, zoom, scrollX, height }: {
    currentTime: number;
    zoom: number;
    scrollX: number;
    height: number;
}) {
    const x = currentTime * zoom - scrollX + TRACK_HEADER_WIDTH;

    if (typeof window !== 'undefined' && (x < TRACK_HEADER_WIDTH || x > window.innerWidth)) return null;

    return (
        <div
            className="absolute top-0 w-0.5 bg-red-500 z-20 pointer-events-none"
            style={{ left: x, height }}
        >
            <div className="w-3 h-3 bg-red-500 -ml-[5px] rounded-b-sm" />
        </div>
    );
}

// ============================================================================
// MAIN TIMELINE COMPONENT
// ============================================================================

export function Timeline() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerHeight, setContainerHeight] = useState(200);
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [importType, setImportType] = useState<"video" | "audio">("video");

    const {
        project,
        currentTime,
        zoom,
        scrollX,
        selectedClipId,
        duration,
        selectClip,
        setZoom,
        setScrollX,
        addTrack,
        removeTrack,
        toggleTrackMute,
        toggleTrackLock,
        addClip,
    } = useEditorStore();

    // Resize observer
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setContainerHeight(entry.contentRect.height);
            }
        });

        observer.observe(container);
        return () => observer.disconnect();
    }, []);

    // Handle scroll
    const handleWheel = useCallback((e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            // Zoom
            e.preventDefault();
            const delta = e.deltaY > 0 ? -5 : 5;
            setZoom(zoom + delta);
        } else {
            // Pan
            setScrollX(scrollX + e.deltaX);
        }
    }, [zoom, scrollX, setZoom, setScrollX]);

    const handleOpenImport = (type: "video" | "audio") => {
        setImportType(type);
        setImportDialogOpen(true);
    };

    const handleImportMedia = (url: string, name: string) => {
        // Add a new track of the appropriate type
        addTrack(importType);

        // Use setTimeout to ensure the track is added before finding it
        setTimeout(() => {
            const currentTracks = useEditorStore.getState().project?.tracks ?? [];
            const targetTrack = currentTracks.find(t => t.type === importType);

            if (targetTrack) {
                addClip(targetTrack.id, {
                    type: importType,
                    startTime: 0,
                    duration: 30,
                    sourceStart: 0,
                    sourceEnd: 30,
                    name: name,
                    src: url,
                });
            }

            import('sonner').then(({ toast }) => {
                toast.success(`${importType === 'video' ? 'Video' : 'Audio'} added to timeline`);
            });
        }, 50);

        setImportDialogOpen(false);
    };

    const tracks = project?.tracks ?? [];
    const totalTrackHeight = tracks.reduce((sum: number, t: Track) => sum + t.height, 0);

    return (
        <div
            ref={containerRef}
            className="flex flex-col bg-zinc-950 border-t border-zinc-800 overflow-hidden"
            onWheel={handleWheel}
        >
            {/* Toolbar */}
            <div className="h-8 flex items-center px-2 gap-2 bg-zinc-900 border-b border-zinc-800">
                <button
                    onClick={() => handleOpenImport("video")}
                    className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white px-2 py-1 rounded hover:bg-zinc-800"
                >
                    <Plus className="size-3" /> Video Track
                </button>
                <button
                    onClick={() => handleOpenImport("audio")}
                    className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white px-2 py-1 rounded hover:bg-zinc-800"
                >
                    <Plus className="size-3" /> Audio Track
                </button>
                <div className="flex-1" />
                <span className="text-xs text-zinc-500">Zoom: {zoom}px/s</span>
            </div>

            {/* Import Media Dialog */}
            {importDialogOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center" onClick={() => setImportDialogOpen(false)}>
                    <div className="bg-zinc-900 rounded-xl border border-zinc-700 p-6 w-[480px] max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                {importType === "video" ? <Film className="size-5" /> : <Music className="size-5" />}
                                Import {importType === "video" ? "Video" : "Audio"}
                            </h2>
                            <button onClick={() => setImportDialogOpen(false)} className="text-zinc-400 hover:text-white text-xl">×</button>
                        </div>

                        {/* Sample Media */}
                        <div className="mb-4">
                            <p className="text-xs text-zinc-500 mb-2">Sample Media</p>
                            <div className="grid grid-cols-2 gap-2">
                                {importType === "video" ? (
                                    <>
                                        <button
                                            onClick={() => handleImportMedia("/samples/podcast-sample.mp4", "Podcast Sample")}
                                            className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-left transition-colors"
                                        >
                                            <div className="text-sm font-medium text-white">Podcast Sample</div>
                                            <div className="text-xs text-zinc-500">30s sample clip</div>
                                        </button>
                                        <button
                                            onClick={() => handleImportMedia("/samples/interview-sample.mp4", "Interview Sample")}
                                            className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-left transition-colors"
                                        >
                                            <div className="text-sm font-medium text-white">Interview Sample</div>
                                            <div className="text-xs text-zinc-500">Demo interview</div>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => handleImportMedia("/samples/background-music.mp3", "Background Music")}
                                            className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-left transition-colors"
                                        >
                                            <div className="text-sm font-medium text-white">Background Music</div>
                                            <div className="text-xs text-zinc-500">Ambient track</div>
                                        </button>
                                        <button
                                            onClick={() => handleImportMedia("/samples/intro-sound.mp3", "Intro Sound")}
                                            className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-left transition-colors"
                                        >
                                            <div className="text-sm font-medium text-white">Intro Sound</div>
                                            <div className="text-xs text-zinc-500">Sound effect</div>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-3 my-4">
                            <div className="flex-1 h-px bg-zinc-700" />
                            <span className="text-xs text-zinc-500">or</span>
                            <div className="flex-1 h-px bg-zinc-700" />
                        </div>

                        {/* Upload */}
                        <div className="mb-4">
                            <label className="block p-6 border-2 border-dashed border-zinc-700 rounded-lg text-center hover:border-zinc-500 hover:bg-zinc-800/50 cursor-pointer transition-colors">
                                <input
                                    type="file"
                                    accept={importType === "video" ? "video/*" : "audio/*"}
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            handleImportMedia(URL.createObjectURL(file), file.name);
                                        }
                                    }}
                                />
                                <div className="text-sm text-zinc-400">
                                    Click to upload {importType}
                                </div>
                                <div className="text-xs text-zinc-600 mt-1">
                                    {importType === "video" ? "MP4, WebM, MOV" : "MP3, WAV, AAC"}
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {/* Ruler */}
            <TimelineRuler duration={duration} zoom={zoom} scrollX={scrollX} />

            {/* Tracks Area */}
            <div className="flex-1 relative overflow-hidden">
                {/* Track Headers */}
                <div className="absolute left-0 top-0 bottom-0 z-10 bg-zinc-900 overflow-y-auto" style={{ width: TRACK_HEADER_WIDTH }}>
                    {tracks.map((track: Track) => (
                        <TrackHeader
                            key={track.id}
                            track={track}
                            onToggleMute={() => toggleTrackMute(track.id)}
                            onToggleLock={() => toggleTrackLock(track.id)}
                            onRemove={() => removeTrack(track.id)}
                        />
                    ))}
                </div>

                {/* Track Content */}
                <div
                    className="absolute top-0 bottom-0 right-0 overflow-auto"
                    style={{ left: TRACK_HEADER_WIDTH }}
                >
                    <div style={{ width: Math.max(duration * zoom, 1000), minHeight: totalTrackHeight }}>
                        {tracks.map((track: Track) => (
                            <TrackRow
                                key={track.id}
                                track={track}
                                zoom={zoom}
                                selectedClipId={selectedClipId}
                                onSelectClip={selectClip}
                            />
                        ))}
                    </div>
                </div>

                {/* Playhead */}
                <Playhead
                    currentTime={currentTime}
                    zoom={zoom}
                    scrollX={scrollX}
                    height={totalTrackHeight + 24}
                />
            </div>
        </div>
    );
}

export default Timeline;
