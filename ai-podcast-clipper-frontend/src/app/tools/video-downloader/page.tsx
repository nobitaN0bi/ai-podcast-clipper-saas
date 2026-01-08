
import { ArrowRight, Download, Video, Share2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { FadeIn } from "~/components/animations/fade-in";
import type { Metadata } from "next";
import { ModeToggle } from "~/components/mode-toggle";

export const metadata: Metadata = {
    title: "Free Video Downloader - YouTube, TikTok, Instagram",
    description: "Download 4K videos without watermarks. Supports YouTube, TikTok, and Instagram Reels. Free utility by ClipFlow.",
};
export default function VideoDownloaderPage() {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground flex flex-col">

            {/* SEO Header */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="size-8 bg-primary flex items-center justify-center">
                            <Download className="size-4 text-primary-foreground" />
                        </div>
                        <span className="text-lg font-bold tracking-tight">ClipFlow Tools</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
                        <Link href="/" className="hover:text-muted-foreground transition-colors">Home</Link>
                        <Link href="/pricing" className="hover:text-muted-foreground transition-colors">Pricing</Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <ModeToggle />
                        <Button asChild className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90">
                            <Link href="/signup">Get Started <ArrowRight className="ml-2 size-4" /></Link>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 pt-20 pb-20 px-6">
                <FadeIn>
                    <section className="container mx-auto max-w-4xl text-center py-20">
                        <div className="inline-flex items-center gap-2 px-3 py-1 border border-border bg-muted text-xs font-medium uppercase tracking-wider mb-8">
                            <Video className="size-3" /> Free Utility
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]">
                            Download 4K Video. <br />
                            <span className="bg-primary text-primary-foreground px-2">Without Watermarks.</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
                            Save high-quality video for your editing workflow. Supports YouTube, TikTok, and Instagram Reels.
                        </p>

                        {/* Functional Input Area */}
                        <div className="flex w-full max-w-lg mx-auto items-center border border-border p-1 pl-4 h-14 hover:border-primary transition-colors bg-card mb-8 shadow-sm">
                            <Input
                                type="text"
                                placeholder="Paste URL (YouTube/TikTok/Reels)..."
                                className="border-0 p-0 h-full focus-visible:ring-0 text-base bg-transparent"
                            />
                            <Button className="h-full rounded-none bg-primary text-primary-foreground px-8 hover:bg-primary/90 font-bold">
                                Download MP4
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">Personal use only • Respect creator copyright</p>
                    </section>
                </FadeIn>

                {/* Schematic Section */}
                <section className="container mx-auto max-w-5xl py-24 border-t border-border">
                    <FadeIn delay={0.2}>
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold mb-4">Universal Format Support</h2>
                            <p className="text-muted-foreground">One tool for all your sourcing needs.</p>
                        </div>
                    </FadeIn>

                    <div className="relative max-w-4xl mx-auto py-12 px-4 md:px-0">
                        <div className="grid md:grid-cols-3 gap-8 text-center">
                            {/* Capability 1 */}
                            <FadeIn delay={0.3} className="bg-muted border border-border p-8">
                                <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">Source</div>
                                <h3 className="text-4xl font-black mb-2">YT</h3>
                                <p className="text-sm">4K, 1080p, 60fps</p>
                            </FadeIn>

                            {/* Capability 2 */}
                            <FadeIn delay={0.4} className="bg-muted border border-border p-8">
                                <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">Source</div>
                                <h3 className="text-4xl font-black mb-2">IG</h3>
                                <p className="text-sm">Reels & Stories</p>
                            </FadeIn>

                            {/* Capability 3 */}
                            <FadeIn delay={0.5} className="bg-muted border border-border p-8">
                                <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">Source</div>
                                <h3 className="text-4xl font-black mb-2">TT</h3>
                                <p className="text-sm">Watermark Free</p>
                            </FadeIn>
                        </div>
                    </div>

                    <FadeIn delay={0.6} className="mt-16 bg-blue-50 border border-blue-200 p-6 flex flex-col md:flex-row items-center gap-4 text-sm text-blue-800 max-w-2xl mx-auto">
                        <AlertCircle className="size-5 shrink-0" />
                        <p><strong>Note for Creators:</strong> Looking to repurpose this content? Use our <strong>Clip Generator</strong> automatically extract viral hooks from these downloads.</p>
                        <Link href="/" className="font-bold underline whitespace-nowrap">Try Clip Generator →</Link>
                    </FadeIn>

                </section>

                <section className="container mx-auto max-w-4xl text-center py-24">
                    <h2 className="text-3xl font-bold mb-6">Need more than raw files?</h2>
                    <p className="text-muted-foreground text-lg mb-10 mx-auto max-w-xl">Our AI engine automatically edits, captions, and reframes this footage for you.</p>
                    <Button size="lg" className="h-16 px-10 text-xl bg-primary text-primary-foreground hover:bg-primary/90 rounded-none w-full md:w-auto">
                        Try Auto-Editing <ArrowRight className="ml-2 size-5" />
                    </Button>
                </section>
            </main>

            <footer className="py-12 px-6 border-t border-border text-sm text-muted-foreground bg-background">
                <div className="container mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center gap-2 mb-4 md:mb-0">
                        <Download className="size-4 text-foreground" />
                        <span className="font-bold text-foreground">ClipFlow Tools</span>
                    </div>

                    <div className="flex flex-wrap gap-8 justify-center md:justify-end">
                        <Link href="/tools/youtube-transcript" className="hover:text-foreground">Transcript Generator</Link>
                        <Link href="/tools/b-roll-generator" className="hover:text-foreground">B-Roll Finder</Link>
                        <Link href="/tools/video-downloader" className="font-bold text-foreground">Video Downloader</Link>
                    </div>

                    <div className="mt-8 md:mt-0 w-full md:w-auto text-center md:text-right">
                        © {new Date().getFullYear()} ClipFlow Inc.
                    </div>
                </div>
            </footer>
        </div>
    );
}
