"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Scissors,
    Type,
    Layout,
    Download,
    Share2,
    Settings,
    ChevronRight,
    User,
    ArrowLeft,
    Film
} from "lucide-react";
import Link from "next/link";
import { type EditorProject, exportVideo } from "~/actions/editor";
import { toast } from "sonner";
import { cn } from "~/lib/utils";

// Mock Aspects
const ASPECT_RATIOS = [
    { label: "9:16", value: "9:16", width: 9, height: 16 },
    { label: "16:9", value: "16:9", width: 16, height: 9 },
    { label: "1:1", value: "1:1", width: 1, height: 1 },
];

export function VideoEditor({ projects }: { projects: EditorProject[] }) {
    // State
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(projects[0]?.id ?? null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(10); // Default placeholder
    const [aspectRatio, setAspectRatio] = useState<"9:16" | "16:9" | "1:1">("9:16");
    const [burnCaptions, setBurnCaptions] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Derived
    const currentProject = projects.find(p => p.id === selectedProjectId);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Handlers
    const togglePlay = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const handleExport = async () => {
        if (!selectedProjectId) return;
        setIsExporting(true);
        toast.info("Starting Export...");

        try {
            const res = await exportVideo({
                projectId: selectedProjectId,
                trimStart: 0, // TODO: Implement trim slider
                trimEnd: duration,
                aspectRatio: aspectRatio,
                burnCaptions: burnCaptions,
            });

            if (res.success) {
                toast.success("Export Queued! Check your dashboard shortly.");
            } else {
                toast.error("Export Failed: " + res.error);
            }
        } catch (e) {
            toast.error("An error occurred during export.");
        } finally {
            setIsExporting(false);
        }
    };

    // If no projects
    if (projects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-zinc-50">
                <Film className="size-12 text-zinc-300 mb-4" />
                <h2 className="text-xl font-semibold mb-2">No Projects Available</h2>
                <p className="text-muted-foreground mb-4">Upload a video in the dashboard to start editing.</p>
                <Link href="/dashboard">
                    <Button>Go to Dashboard</Button>
                </Link>
            </div>
        );
    }

    // Video URL Construction (Using API or direct S3 depending on auth/security - standard presigned url pattern assumed or public for demo)
    // For this implementation, we assume we need to fetch a signed URL or stream it. 
    // Simplified: Just showing UI logic. In production, we'd fetch a fresh signed URL.
    // Let's assume for now we don't have the signed URL in the list, so we might need to fetch it? 
    // Actually, `getProjects` returns `s3Key`. We need `getClipPlayUrl`-like logic.
    // We'll skip complex playback auth for this step and focus on UI state unless we have a public URL.

    return (
        <div className="min-h-screen bg-white text-black font-sans flex flex-col h-screen overflow-hidden">

            {/* App Header */}
            <header className="h-14 border-b border-black/10 flex items-center px-4 justify-between bg-white z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="flex items-center text-gray-500 hover:text-black transition-colors">
                        <ArrowLeft className="size-4 mr-1" /> Back
                    </Link>
                    <div className="h-4 w-px bg-black/10" />
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                        Dshbrd <ChevronRight className="size-4" />
                        <select
                            className="bg-transparent font-medium text-black outline-none cursor-pointer"
                            value={selectedProjectId || ""}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                        >
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.filename}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="h-8 rounded-none border-black/20 text-gray-600 hover:text-black hover:border-black">
                        <Share2 className="size-3 mr-2" /> Share
                    </Button>
                    <Button
                        size="sm"
                        className="h-8 rounded-none bg-black text-white hover:bg-gray-800"
                        onClick={handleExport}
                        disabled={isExporting}
                    >
                        <Download className={cn("size-3 mr-2", isExporting && "animate-bounce")} />
                        {isExporting ? "Exporting..." : "Export 4K"}
                    </Button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">

                {/* Left Sidebar - Tools */}
                <aside className="w-16 border-r border-black/10 flex flex-col items-center py-4 bg-gray-50/50 shrink-0">
                    {[Scissors, Type, Layout, Settings].map((Icon, i) => (
                        <button key={i} className="size-10 mb-2 flex items-center justify-center hover:bg-gray-200 rounded-sm transition-colors text-gray-600 hover:text-black">
                            <Icon className="size-5" />
                        </button>
                    ))}
                </aside>

                {/* Main Content - Preview */}
                <main className="flex-1 bg-gray-100/50 p-8 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute top-4 left-4 text-xs font-mono text-gray-400">CANVAS: {aspectRatio}</div>

                    {/* Phone Frame / Preview Area */}
                    <div
                        className={cn(
                            "bg-black shadow-2xl overflow-hidden relative border-[12px] border-black transition-all duration-300",
                            aspectRatio === "9:16" ? "aspect-[9/16] h-[90%] rounded-[2rem]" :
                                aspectRatio === "16:9" ? "aspect-video w-[90%] rounded-xl" :
                                    "aspect-square h-[80%] rounded-xl"
                        )}
                    >
                        {/* Video Element Placeholder - In real usage, fetch signed map */}
                        <div className="absolute inset-x-0 top-0 bottom-0 bg-gray-900 flex items-center justify-center">
                            {/* We would put <video> here. For now, valid visual placeholder */}
                            <span className="text-white/20 font-bold text-4xl">
                                {currentProject?.filename ?? "SELECT VIDEO"}
                            </span>

                            {/* Simulated Controls Overlay */}
                            {!isPlaying && (
                                <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/10 transition-colors group">
                                    <div className="size-16 rounded-full bg-white/10 backdrop-blur flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Play className="size-8 text-white fill-white ml-1" />
                                    </div>
                                </button>
                            )}
                        </div>

                        {/* Simulated Captions Layer */}
                        <div className="absolute bottom-32 left-8 right-8 text-center pointer-events-none">
                            <span className="bg-yellow-400 px-2 py-1 text-black font-black text-2xl uppercase italic inline-block -rotate-2">
                                SAMPLE CAPTION
                            </span>
                        </div>
                    </div>
                </main>

                {/* Right Sidebar - Properties */}
                <aside className="w-80 border-l border-black/10 bg-white flex flex-col shrink-0">
                    <div className="h-12 border-b border-black/10 flex items-center px-4 font-bold text-sm bg-gray-50 shrink-0">
                        Properties
                    </div>
                    <div className="p-4 space-y-6 overflow-y-auto flex-1">

                        <div className="space-y-3">
                            <label className="text-xs uppercase font-bold text-gray-400">Ratio</label>
                            <div className="grid grid-cols-3 gap-2">
                                {ASPECT_RATIOS.map((ratio) => (
                                    <div
                                        key={ratio.value}
                                        onClick={() => setAspectRatio(ratio.value as any)}
                                        className={cn(
                                            "border text-xs py-2 px-3 text-center cursor-pointer transition-colors",
                                            aspectRatio === ratio.value
                                                ? "border-black bg-black text-white"
                                                : "border-black/10 text-gray-500 hover:border-black hover:text-black"
                                        )}
                                    >
                                        {ratio.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs uppercase font-bold text-gray-400">Captions</label>
                            <div className="flex gap-2">
                                <Input className="h-8 rounded-none text-xs" defaultValue="Montesserat Black" />
                                <div className="size-8 border border-black/10 bg-yellow-400" />
                            </div>
                            <div className="flex items-center space-x-2 pt-2">
                                <Switch
                                    id="burn-captions"
                                    checked={burnCaptions}
                                    onCheckedChange={setBurnCaptions}
                                />
                                <Label htmlFor="burn-captions" className="text-xs font-medium">Burn Captions</Label>
                            </div>
                        </div>

                        <div className="p-4 bg-purple-50 border border-purple-100 text-xs text-purple-900 leading-relaxed">
                            <strong>Project ID:</strong><br />
                            <span className="font-mono">{selectedProjectId}</span>
                        </div>

                    </div>
                </aside>
            </div>

            {/* Timeline Footer */}
            <footer className="h-48 border-t border-black/10 bg-white flex flex-col shrink-0">
                <div className="h-10 border-b border-black/10 flex items-center px-4 justify-between bg-gray-50">
                    <div className="flex items-center gap-4">
                        <SkipBack className="size-4 cursor-pointer hover:text-blue-500" />
                        <button onClick={togglePlay}>
                            {isPlaying ? <Pause className="size-4 fill-black" /> : <Play className="size-4 fill-black" />}
                        </button>
                        <SkipForward className="size-4 cursor-pointer hover:text-blue-500" />
                        <span className="text-xs font-mono ml-4">
                            {new Date(currentTime * 1000).toISOString().substr(11, 8)}
                        </span>
                    </div>
                </div>
                <div className="flex-1 relative bg-gray-100 overflow-hidden">
                    {/* Timeline Tracks */}
                    <div className="absolute top-4 left-0 right-0 h-8 bg-blue-100 border-y border-blue-200 opacity-50" />
                    <div className="absolute top-14 left-0 right-0 h-8 bg-purple-100 border-y border-purple-200 opacity-50" />

                    {/* Playhead */}
                    <div className="absolute top-0 bottom-0 left-1/2 w-px bg-red-500 z-10">
                        <div className="size-3 bg-red-500 -ml-1.5 rounded-b-sm" />
                    </div>
                </div>
            </footer>

        </div>
    );
}
