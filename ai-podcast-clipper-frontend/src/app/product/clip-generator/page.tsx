
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
    Play,
    SkipBack,
    SkipForward,
    Scissors,
    Type,
    Layout,
    Download,
    Share2,
    Settings,
    ChevronRight,
    User
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "AI Clip Generator - Editor Demo",
    description: "Experience the ClipFlow AI clip generator. Auto-detect viral moments, add captions, and export for social media.",
};

export default function ClipGeneratorPage() {
    return (
        <div className="min-h-screen bg-white text-black font-sans flex flex-col h-screen overflow-hidden">

            {/* App Header */}
            <header className="h-14 border-b border-black/10 flex items-center px-4 justify-between bg-white z-10">
                <div className="flex items-center gap-4">
                    <Link href="/" className="font-bold tracking-tight flex items-center gap-2">
                        <div className="size-6 bg-black flex items-center justify-center">
                            <Scissors className="size-3 text-white" />
                        </div>
                        ClipFlow
                    </Link>
                    <div className="h-4 w-px bg-black/10" />
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                        Projects <ChevronRight className="size-4" /> Episode 124 <ChevronRight className="size-4" /> <span className="text-black font-medium">Editor</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="h-8 rounded-none border-black/20 text-gray-600 hover:text-black hover:border-black">
                        <Share2 className="size-3 mr-2" /> Share
                    </Button>
                    <Button size="sm" className="h-8 rounded-none bg-black text-white hover:bg-gray-800">
                        <Download className="size-3 mr-2" /> Export 4K
                    </Button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">

                {/* Left Sidebar - Tools */}
                <aside className="w-16 border-r border-black/10 flex flex-col items-center py-4 bg-gray-50/50">
                    {[Scissors, Type, Layout, Settings].map((Icon, i) => (
                        <button key={i} className="size-10 mb-2 flex items-center justify-center hover:bg-gray-200 rounded-sm transition-colors text-gray-600 hover:text-black">
                            <Icon className="size-5" />
                        </button>
                    ))}
                </aside>

                {/* Main Content - Preview */}
                <main className="flex-1 bg-gray-100/50 p-8 flex items-center justify-center relative">
                    <div className="absolute top-4 left-4 text-xs font-mono text-gray-400">CANVAS: 1080x1920</div>

                    {/* Phone Frame */}
                    <div className="aspect-[9/16] h-[90%] bg-black shadow-2xl overflow-hidden relative border-[12px] border-black rounded-[2rem] md:rounded-none md:border-2 md:border-black/10">
                        <div className="absolute inset-x-0 top-1/4 bottom-1/4 bg-gray-800 flex items-center justify-center">
                            <span className="text-white/20 font-bold text-4xl">VIDEO</span>
                        </div>
                        {/* Simulated Captions */}
                        <div className="absolute bottom-32 left-8 right-8 text-center">
                            <span className="bg-yellow-400 px-2 py-1 text-black font-black text-2xl uppercase italic inline-block -rotate-2">Viral</span>
                            <span className="text-white font-black text-2xl uppercase ml-2">Content</span>
                        </div>
                    </div>
                </main>

                {/* Right Sidebar - Properties */}
                <aside className="w-80 border-l border-black/10 bg-white flex flex-col">
                    <div className="h-12 border-b border-black/10 flex items-center px-4 font-bold text-sm bg-gray-50">
                        Properties
                    </div>
                    <div className="p-4 space-y-6 overflow-y-auto flex-1">

                        <div className="space-y-3">
                            <label className="text-xs uppercase font-bold text-gray-400">Ratio</label>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="border border-black bg-black text-white text-xs py-2 px-3 text-center cursor-pointer">9:16</div>
                                <div className="border border-black/10 text-xs py-2 px-3 text-center cursor-pointer text-gray-500 hover:border-black hover:text-black">16:9</div>
                                <div className="border border-black/10 text-xs py-2 px-3 text-center cursor-pointer text-gray-500 hover:border-black hover:text-black">1:1</div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs uppercase font-bold text-gray-400">Captions</label>
                            <div className="flex gap-2">
                                <Input className="h-8 rounded-none text-xs" defaultValue="Montesserat Black" />
                                <div className="size-8 border border-black/10 bg-yellow-400" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs uppercase font-bold text-gray-400">Active Speaker</label>
                            <div className="flex items-center justify-between p-3 border border-black/10">
                                <div className="flex items-center gap-2">
                                    <User className="size-4" />
                                    <span className="text-sm font-medium">Auto-Face Crop</span>
                                </div>
                                <div className="w-8 h-4 bg-black rounded-full relative">
                                    <div className="absolute right-0.5 top-0.5 size-3 bg-white rounded-full" />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-purple-50 border border-purple-100 text-xs text-purple-900 leading-relaxed">
                            <strong>Viral Score: 92/100</strong><br />
                            This clip contains high-arousal keywords and fast pacing typically favored by the TikTok algorithm.
                        </div>

                    </div>
                </aside>
            </div>

            {/* Timeline Footer */}
            <footer className="h-48 border-t border-black/10 bg-white flex flex-col">
                <div className="h-10 border-b border-black/10 flex items-center px-4 justify-between bg-gray-50">
                    <div className="flex items-center gap-4">
                        <SkipBack className="size-4" />
                        <Play className="size-4 fill-black" />
                        <SkipForward className="size-4" />
                        <span className="text-xs font-mono ml-4">00:04:23:12</span>
                    </div>
                </div>
                <div className="flex-1 relative bg-gray-100 overflow-hidden">
                    {/* Timeline Tracks */}
                    <div className="absolute top-4 left-0 right-0 h-8 bg-blue-100 border-y border-blue-200" />
                    <div className="absolute top-14 left-0 right-0 h-8 bg-purple-100 border-y border-purple-200" />
                    <div className="absolute top-24 left-0 right-0 h-8 bg-yellow-50 border-y border-yellow-200" />

                    {/* Playhead */}
                    <div className="absolute top-0 bottom-0 left-1/2 w-px bg-red-500 z-10">
                        <div className="size-3 bg-red-500 -ml-1.5 rounded-b-sm" />
                    </div>
                </div>
            </footer>

        </div>
    );
}
