"use client";

import { useEffect } from "react";
import { useEditorStore } from "~/stores/editor-store";
import { useLocalExport } from "~/hooks/use-offline";
import { Timeline } from "~/components/editor/Timeline";
import { PreviewCanvas } from "~/components/editor/PreviewCanvas";
import { EffectsPanel } from "~/components/editor/EffectsPanel";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import Link from "next/link";
import {
    ArrowLeft,
    Download,
    Share2,
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Scissors,
    MousePointer2,
    Hand,
    Type,
    Undo2,
    Redo2,
    ZoomIn,
    ZoomOut,
} from "lucide-react";
import { toast } from "sonner";
import { exportVideo } from "~/actions/editor";

// ============================================================================
// TOOLBAR
// ============================================================================

// ============================================================================
// TOOLBAR
// ============================================================================

function Toolbar() {
    const {
        activeTool,
        setActiveTool,
        zoom,
        setZoom,
        isPlaying,
        togglePlayback,
        currentTime,
        duration,
        seek,
    } = useEditorStore();

    const tools = [
        { id: "select" as const, icon: MousePointer2, label: "Select (V)" },
        { id: "razor" as const, icon: Scissors, label: "Razor (C)" },
        { id: "text" as const, icon: Type, label: "Text (T)" },
        { id: "hand" as const, icon: Hand, label: "Hand (H)" },
    ];

    return (
        <div className="h-12 bg-card border-b border-border flex items-center px-4 gap-2">
            {/* Playback Controls */}
            <div className="flex items-center gap-1 mr-4">
                <button
                    onClick={() => seek(0)}
                    className="p-2 hover:bg-accent hover:text-accent-foreground rounded transition-colors"
                >
                    <SkipBack className="size-4 text-muted-foreground" />
                </button>
                <button
                    onClick={togglePlayback}
                    className="p-2 bg-primary/10 hover:bg-primary/20 rounded transition-colors"
                >
                    {isPlaying ? (
                        <Pause className="size-4 text-primary" />
                    ) : (
                        <Play className="size-4 text-primary ml-0.5" />
                    )}
                </button>
                <button
                    onClick={() => seek(duration)}
                    className="p-2 hover:bg-accent hover:text-accent-foreground rounded transition-colors"
                >
                    <SkipForward className="size-4 text-muted-foreground" />
                </button>
            </div>

            {/* Timecode */}
            <div className="font-mono text-sm text-muted-foreground min-w-[100px]">
                {formatTimecode(currentTime)} / {formatTimecode(duration)}
            </div>

            <div className="h-6 w-px bg-border mx-2" />

            {/* Tools */}
            {tools.map((tool) => {
                const Icon = tool.icon;
                return (
                    <button
                        key={tool.id}
                        onClick={() => setActiveTool(tool.id)}
                        title={tool.label}
                        className={cn(
                            "p-2 rounded transition-colors",
                            activeTool === tool.id
                                ? "bg-primary/20 text-primary"
                                : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                        )}
                    >
                        <Icon className="size-4" />
                    </button>
                );
            })}

            <div className="h-6 w-px bg-border mx-2" />

            {/* Undo/Redo */}
            <button className="p-2 hover:bg-accent hover:text-accent-foreground rounded transition-colors text-muted-foreground">
                <Undo2 className="size-4" />
            </button>
            <button className="p-2 hover:bg-accent hover:text-accent-foreground rounded transition-colors text-muted-foreground">
                <Redo2 className="size-4" />
            </button>

            <div className="flex-1" />

            {/* Zoom */}
            <div className="flex items-center gap-1">
                <button
                    onClick={() => setZoom(zoom - 10)}
                    className="p-2 hover:bg-accent hover:text-accent-foreground rounded transition-colors text-muted-foreground"
                >
                    <ZoomOut className="size-4" />
                </button>
                <span className="text-xs text-muted-foreground w-12 text-center">{zoom}%</span>
                <button
                    onClick={() => setZoom(zoom + 10)}
                    className="p-2 hover:bg-accent hover:text-accent-foreground rounded transition-colors text-muted-foreground"
                >
                    <ZoomIn className="size-4" />
                </button>
            </div>
        </div>
    );
}

function formatTimecode(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const f = Math.floor((seconds % 1) * 30);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}:${f.toString().padStart(2, "0")}`;
}

// ============================================================================
// HEADER
// ============================================================================

function EditorHeader({ projectName }: { projectName: string }) {
    const { isExporting: storeExporting, startExport: setStoreExporting, finishExport: setStoreFinished, aspectRatio, project } = useEditorStore();
    const { startExport, exporting, progress, result, error } = useLocalExport();

    // Sync local hook state with global store for UI
    useEffect(() => {
        if (exporting && !storeExporting) setStoreExporting();
        if (!exporting && storeExporting) setStoreFinished();
    }, [exporting, storeExporting, setStoreExporting, setStoreFinished]);

    useEffect(() => {
        if (result) {
            toast.success("Export Complete!", {
                description: `Saved to ${result.filename}`,
                action: {
                    label: "Download",
                    onClick: () => window.open(`/api/local/download?path=${encodeURIComponent(result.outputPath)}`)
                }
            });
        }
        if (error) {
            toast.error("Export Failed", { description: error });
            setStoreFinished();
        }
    }, [result, error, setStoreFinished]);

    const handleExport = async () => {
        if (!project) return;

        // In a real app, we'd find the actual video file path from the project
        // For this demo, we use a sample path or the first track's clip
        const firstClip = project.tracks[0]?.clips[0] as any;
        const sampleInput = firstClip?.src || "/samples/podcast-sample.mp4";

        startExport(sampleInput, {
            outputName: `${project.name.replace(/\s+/g, '_')}_final.mp4`,
            aspectRatio: project.aspectRatio as any,
            resolution: '4k'
        });

        toast.info("Starting Export Job...");
    };

    return (
        <header className="h-14 bg-background border-b border-border flex items-center px-4 justify-between">
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="size-4" />
                    <span className="text-sm">Back</span>
                </Link>
                <div className="h-5 w-px bg-border" />
                <h1 className="text-foreground font-semibold">{projectName}</h1>
                <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded">
                    {aspectRatio}
                </span>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="border-border text-muted-foreground hover:text-foreground"
                >
                    <Share2 className="size-4 mr-2" />
                    Share
                </Button>
                <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={handleExport}
                    disabled={exporting}
                >
                    <Download className={cn("size-4 mr-2", exporting && "animate-pulse")} />
                    {exporting ? `Exporting ${Math.round(progress)}%` : "Export 4K"}
                </Button>
            </div>
        </header>
    );
}

// ============================================================================
// MAIN EDITOR
// ============================================================================

export function VideoEditorMarvel() {
    const { project, createNewProject } = useEditorStore();

    // Initialize with a demo project if none exists
    useEffect(() => {
        if (!project) {
            createNewProject("Untitled Project");
        }
    }, [project, createNewProject]);

    return (
        <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
            {/* Header */}
            <EditorHeader projectName={project?.name ?? "Loading..."} />

            {/* Toolbar */}
            <Toolbar />

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Preview */}
                <PreviewCanvas />

                {/* Effects Panel */}
                <EffectsPanel />
            </div>

            {/* Timeline */}
            <div className="h-64">
                <Timeline />
            </div>
        </div>
    );
}

export default VideoEditorMarvel;
