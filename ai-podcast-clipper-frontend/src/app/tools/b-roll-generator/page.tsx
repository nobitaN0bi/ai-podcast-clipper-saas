
import { ArrowRight, Video, Search, Sparkles, Film } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { FadeIn } from "~/components/animations/fade-in";
import type { Metadata } from "next";
import { ModeToggle } from "~/components/mode-toggle";

export const metadata: Metadata = {
  title: "AI B-Roll Finder - Cinematic Stock Footage",
  description: "Find perfect royalty-free B-roll with AI. Describe your scene, get 4K footage instantly.",
};
export default function BRollFinderPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground flex flex-col">

      {/* SEO Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="size-8 bg-primary flex items-center justify-center">
              <Film className="size-4 text-primary-foreground" />
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
              <Video className="size-3" /> AI Video Search
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]">
              Find the Perfect <br />
              <span className="bg-primary text-primary-foreground px-2">Cinematic B-Roll.</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
              Stop engaging expensive stock footage sites. Describe your scene, and our AI finds
              royalty-free, 4K clips instantly.
            </p>

            {/* Functional Input Area */}
            <div className="flex w-full max-w-lg mx-auto items-center border border-border p-1 pl-4 h-14 hover:border-primary transition-colors bg-card mb-8 shadow-sm">
              <Input
                type="text"
                placeholder="Describe a scene (e.g. 'Coffee shop coding')..."
                className="border-0 p-0 h-full focus-visible:ring-0 text-base bg-transparent"
              />
              <Button className="h-full rounded-none bg-primary text-primary-foreground px-8 hover:bg-primary/90 font-bold">
                <Search className="mr-2 size-4" /> Find
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">100% Royalty Free • 4K Quality • Instant Download</p>
          </section>
        </FadeIn>

        {/* The "Doodle" Logic Section */}
        <section className="container mx-auto max-w-5xl py-24 border-t border-border">
          <FadeIn delay={0.2}>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">AI-Powered Visual Search</h2>
              <p className="text-muted-foreground">We don't just search keywords. We understand context.</p>
            </div>
          </FadeIn>

          {/* CSS Doodle/Schematic */}
          <div className="relative max-w-4xl mx-auto py-12 px-4 md:px-0">
            {/* Connecting Line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -z-10 hidden md:block" />

            <div className="grid md:grid-cols-3 gap-12">
              {/* Step 1 */}
              <FadeIn delay={0.3} className="bg-card border border-border p-8 relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-card px-4 py-1 text-xs font-bold uppercase border border-border">Input</div>
                <div className="h-20 bg-muted border border-border mb-4 p-2 text-xs font-mono text-muted-foreground">
                  "Show me a futuristic city with flying cars at sunset..."
                </div>
                <h3 className="text-xl font-bold text-center mb-2">Natural Language</h3>
                <p className="text-center text-muted-foreground text-sm">Type exactly what you need. No boolean operators required.</p>
              </FadeIn>

              {/* Step 2 */}
              <FadeIn delay={0.4} className="bg-card border border-primary p-8 relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 text-xs font-bold uppercase border border-primary">Process</div>
                <div className="size-20 bg-primary rounded-full mx-auto mb-6 flex items-center justify-center relative overflow-hidden">
                  {/* Abstract "Brain" lines */}
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:4px_4px]" />
                  <Sparkles className="size-8 text-primary-foreground animate-spin-slow" />
                </div>
                <h3 className="text-xl font-bold text-center mb-2">Semantic Match</h3>
                <p className="text-center text-muted-foreground text-sm">Our vector database matches your *intent* with millions of 4K clips.</p>
              </FadeIn>

              {/* Step 3 */}
              <FadeIn delay={0.5} className="bg-card border border-border p-8 relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-card px-4 py-1 text-xs font-bold uppercase border border-border">Result</div>
                <div className="h-20 bg-primary mb-4 flex items-center justify-center">
                  <Video className="text-primary-foreground size-8" />
                </div>
                <h3 className="text-xl font-bold text-center mb-2">Curated Grid</h3>
                <p className="text-center text-muted-foreground text-sm">Get the top 10 vivid, high-res matches instantly.</p>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="bg-muted py-24 border-y border-border">
          <div className="container mx-auto max-w-6xl px-6">
            <FadeIn>
              <h2 className="text-3xl font-bold mb-16 text-center">Why manually search Pexels?</h2>
            </FadeIn>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                { title: "Context Aware", desc: "Understands 'sad rain' vs 'happy rain' based on your prompt." },
                { title: "Style Matching", desc: "Filter by 'Cinematic', 'Drone', 'Handheld', or 'Studio' looks." },
                { title: "One-Click Import", desc: "Send directly to your ClipFlow project without downloading." },
                { title: "Commercial Rights", desc: "All footage is cleared for YouTube monetization." }
              ].map((feature, i) => (
                <FadeIn key={i} delay={0.2 + (i * 0.1)} className="flex gap-6 p-8 bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
                  <div className="size-2 bg-foreground mt-2 shrink-0" />
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
          <h2 className="text-3xl font-bold mb-6">Visuals that Pop</h2>
          <p className="text-muted-foreground text-lg mb-10 mx-auto max-w-xl">Upgrade your content production quality today.</p>
          <Button size="lg" className="h-16 px-10 text-xl bg-primary text-primary-foreground hover:bg-primary/90 rounded-none w-full md:w-auto">
            Find B-Roll <ArrowRight className="ml-2 size-5" />
          </Button>
        </section>
      </main>

      <footer className="py-12 px-6 border-t border-border text-sm text-muted-foreground bg-background">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Film className="size-4 text-foreground" />
            <span className="font-bold text-foreground">ClipFlow Tools</span>
          </div>

          <div className="flex flex-wrap gap-8 justify-center md:justify-end">
            <Link href="/tools/youtube-transcript" className="hover:text-foreground">Transcript Generator</Link>
            <Link href="/tools/b-roll-generator" className="font-bold text-foreground">B-Roll Finder</Link>
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
