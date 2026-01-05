import { VideoEditorMarvel } from "~/components/editor";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";

export const metadata = {
    title: "Try Video Editor - AI Podcast Clipper",
    description: "Try our professional video editor for free. No signup required.",
};

export default function TryEditorPage() {
    return (
        <div className="min-h-screen bg-zinc-950">
            {/* Promo Banner */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 py-2 px-4 text-center text-white text-sm">
                <div className="flex items-center justify-center gap-2">
                    <Sparkles className="size-4" />
                    <span>You{"'"}re using the free preview. Some features are limited.</span>
                    <Link href="/signup">
                        <Button size="sm" variant="secondary" className="h-7 text-xs">
                            Sign Up Free <ArrowRight className="size-3 ml-1" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Editor (Full Height Minus Banner) */}
            <div className="h-[calc(100vh-40px)]">
                <VideoEditorMarvel />
            </div>
        </div>
    );
}
