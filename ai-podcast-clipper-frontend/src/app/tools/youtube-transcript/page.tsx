
import { ArrowRight, FileText, Youtube, Share2, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { FadeIn } from "~/components/animations/fade-in";
import type { Metadata } from "next";
import { ModeToggle } from "~/components/mode-toggle";

export const metadata: Metadata = {
    title: "Free YouTube Transcript Generator",
    description: "Extract accurate transcripts from any YouTube video. Get timestamps, speaker identification, and downloadable text files.",
};
export default function YoutubeTranscriptPage() {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground flex flex-col">

            {/* Separate Header for SEO Tools if needed, otherwise reuse main nav (simplified here) */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="size-8 bg-primary flex items-center justify-center">
                            <FileText className="size-4 text-primary-foreground" />
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
                            <Youtube className="size-3" /> Free YouTube Tool
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]">
                            YouTube to Text. <br />
                            <span className="bg-primary text-primary-foreground px-2">Instant Transcript.</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
                            Extract accurate text, captions, and timestamps from any YouTube video.
                            Perfect for repurposing content into blogs, tweets, and newsletters.
                        </p>

                        {/* Functional Input Area */}
                        <div className="flex w-full max-w-lg mx-auto items-center border border-border p-1 pl-4 h-14 hover:border-primary transition-colors bg-card mb-8 shadow-sm">
                            <Input
                                type="text"
                                placeholder="Paste YouTube Link (e.g. youtube.com/watch?v=...)"
                                className="border-0 p-0 h-full focus-visible:ring-0 text-base bg-transparent"
                            />
                            <Button className="h-full rounded-none bg-primary text-primary-foreground px-8 hover:bg-primary/90 font-bold">
                                Transcribe
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">No credit card required • Unlimited for videos under 10min</p>
                    </section>
                </FadeIn>

                {/* The "Doodle" Logic Section */}
                <section className="container mx-auto max-w-5xl py-24 border-t border-border">
                    <FadeIn delay={0.2}>
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
                            <p className="text-muted-foreground">A simple pipeline to turn video into value.</p>
                        </div>
                    </FadeIn>

                    {/* CSS Doodle/Schematic */}
                    <div className="relative max-w-4xl mx-auto py-12 px-4 md:px-0">
                        {/* Connecting Line */}
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -z-10 hidden md:block" />

                        <div className="grid md:grid-cols-3 gap-12">
                            {/* Step 1 */}
                            <FadeIn delay={0.3} className="bg-card border border-border p-8 relative">
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-card px-4 py-1 text-xs font-bold uppercase border border-border">Step 01</div>
                                <div className="size-16 bg-muted rounded-full mx-auto mb-6 flex items-center justify-center border border-dashed border-border">
                                    <Youtube className="size-8" />
                                </div>
                                <h3 className="text-xl font-bold text-center mb-2">Input URL</h3>
                                <p className="text-center text-muted-foreground text-sm">Paste your link. We handle requests to YouTube's API securely.</p>
                            </FadeIn>

                            {/* Step 2 */}
                            <FadeIn delay={0.4} className="bg-card border border-primary p-8 relative">
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 text-xs font-bold uppercase border border-primary">Step 02</div>
                                <div className="size-16 bg-primary rounded-full mx-auto mb-6 flex items-center justify-center">
                                    <Sparkles className="size-8 text-primary-foreground animate-pulse" />
                                </div>
                                <h3 className="text-xl font-bold text-center mb-2">AI Extraction</h3>
                                <p className="text-center text-muted-foreground text-sm">WhisperX engine converts audio to text with 99.8% accuracy.</p>
                            </FadeIn>

                            {/* Step 3 */}
                            <FadeIn delay={0.5} className="bg-card border border-border p-8 relative">
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-card px-4 py-1 text-xs font-bold uppercase border border-border">Step 03</div>
                                <div className="size-16 bg-muted rounded-full mx-auto mb-6 flex items-center justify-center border border-dashed border-border">
                                    <FileText className="size-8" />
                                </div>
                                <h3 className="text-xl font-bold text-center mb-2">Download</h3>
                                <p className="text-center text-muted-foreground text-sm">Get .STR, .TXT, or .VTT files instantly. Repurpose away.</p>
                            </FadeIn>
                        </div>
                    </div>
                </section>

                {/* Feature Grid with "Hand-Drawn" styling hints */}
                <section className="bg-muted py-24 border-y border-border">
                    <div className="container mx-auto max-w-6xl px-6">
                        <FadeIn>
                            <h2 className="text-3xl font-bold mb-16 text-center">Why use ClipFlow Transcriber?</h2>
                        </FadeIn>

                        <div className="grid md:grid-cols-2 gap-8">
                            {[
                                { title: "Speaker Identification", desc: "We don't just give you text. We tell you WHO said it. Essential for podcasts." },
                                { title: "Time-Coded Stamps", desc: "Jump to specific moments. Edits become 10x faster." },
                                { title: "SEO Optimization", desc: "Turn transcripts into blog posts. Rank for keywords spoken in your video." },
                                { title: "Multi-Language", desc: "Support for 50+ languages including English, Spanish, French, and German." }
                            ].map((feature, i) => (
                                <FadeIn key={i} delay={0.2 + (i * 0.1)} className="flex gap-6 p-8 bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
                                    <div className="size-2 bg-foreground mt-2 shrink-0" /> {/* "Dot" style list item */}
                                    <div>
                                        <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                        <p className="text-muted-foreground">{feature.desc}</p>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="container mx-auto max-w-4xl text-center py-24">
                    <h2 className="text-3xl font-bold mb-6">Start Repurposing Today</h2>
                    <p className="text-muted-foreground text-lg mb-10 mx-auto max-w-xl">Don't let your content sit idle. Turn one video into infinite assets.</p>
                    <Button size="lg" className="h-16 px-10 text-xl bg-primary text-primary-foreground hover:bg-primary/90 rounded-none w-full md:w-auto">
                        Generate Transcript Now <ArrowRight className="ml-2 size-5" />
                    </Button>
                </section>
            </main>

            <footer className="py-12 px-6 border-t border-border text-sm text-muted-foreground bg-background">
                <div className="container mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center gap-2 mb-4 md:mb-0">
                        <FileText className="size-4 text-foreground" />
                        <span className="font-bold text-foreground">ClipFlow Tools</span>
                    </div>

                    <div className="flex flex-wrap gap-8 justify-center md:justify-end">
                        <Link href="/tools/youtube-transcript" className="font-bold text-foreground">Transcript Generator</Link>
                        <Link href="/tools/b-roll-generator" className="hover:text-foreground">B-Roll Finder</Link>
                        <Link href="/tools/video-downloader" className="hover:text-foreground">Video Downloader</Link>
                    </div>

                    <div className="mt-8 md:mt-0 w-full md:w-auto text-center md:text-right">
                        © {new Date().getFullYear()} ClipFlow Inc.
                    </div>
                </div>
            </footer>
        </div>
    );
}
