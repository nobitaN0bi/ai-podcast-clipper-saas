import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { ArrowRight, Check, Play, Scissors, Share2, Wand2 } from "lucide-react";
import { ModeToggle } from "~/components/mode-toggle";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground overflow-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/20 blur-[120px] animate-pulse delay-1000" />
      </div>

      {/* Navbar */}
      <header className="relative z-10 container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Scissors className="size-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Podcast<span className="text-primary">Clipper</span></span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
          <Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          <Link href="#faq" className="hover:text-foreground transition-colors">FAQ</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">Login</Link>
          <Button asChild size="sm" className="rounded-full">
            <Link href="/dashboard">Get Started <ArrowRight className="ml-2 size-4" /></Link>
          </Button>
          <ModeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 py-24 md:py-32 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-primary mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          v2.0 is now live
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          Turn Long Podcasts into <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient">Viral Short Clips</span>
        </h1>

        <p className="text-xl text-muted-foreground max-w-2xl mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          Stop editing manually. Our AI identifies the most engaging moments, adds captions, and reformats for TikTok, Reels, and Shorts in seconds.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <div className="flex-1 flex gap-2">
            <Input placeholder="Paste RSS Feed or YouTube URL" className="h-12 bg-white/5 border-white/10 backdrop-blur-md" />
            <Button size="lg" className="h-12 px-8 shadow-lg shadow-primary/25">
              Clip It
            </Button>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400">
          No credit card required &bull; 5 free clips included
        </p>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 container mx-auto px-4 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300">
            <CardHeader>
              <div className="size-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 text-primary">
                <Wand2 className="size-6" />
              </div>
              <CardTitle>AI Curation</CardTitle>
              <CardDescription>Automatically finds the viral hooks in your hour-long episodes.</CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300">
            <CardHeader>
              <div className="size-12 rounded-lg bg-secondary/20 flex items-center justify-center mb-4 text-secondary-foreground">
                <Play className="size-6" />
              </div>
              <CardTitle>Auto-Captions</CardTitle>
              <CardDescription>99% accurate transcriptions with animated karaoke-style captions.</CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300">
            <CardHeader>
              <div className="size-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4 text-accent">
                <Share2 className="size-6" />
              </div>
              <CardTitle>Multi-Platform</CardTitle>
              <CardDescription>Export vertical video optimized for TikTok, Instagram Reels, and Shorts.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Trust Section */}
      <section className="relative z-10 container mx-auto px-4 py-16 border-t border-white/5">
        <p className="text-center text-sm font-medium text-muted-foreground mb-8">TRUSTED BY TOP PODCASTERS</p>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          {/* Placeholders for logos */}
          <div className="text-xl font-bold">Spotify</div>
          <div className="text-xl font-bold">Apple Podcasts</div>
          <div className="text-xl font-bold">YouTube</div>
          <div className="text-xl font-bold">SoundCloud</div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-4 py-24">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/10 p-12 md:p-24 text-center">
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(to_bottom,transparent,black)]" />
          <div className="relative z-10 flex flex-col items-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to go viral?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mb-10">
              Join 10,000+ creators who are growing their audience with AI Podcast Clipper.
            </p>
            <Button size="lg" className="h-14 px-10 text-lg rounded-full shadow-xl shadow-primary/30" asChild>
              <Link href="/dashboard">Start Clipping for Free</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 container mx-auto px-4 py-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded bg-primary flex items-center justify-center">
            <Scissors className="size-3 text-white" />
          </div>
          <span className="font-semibold text-foreground">PodcastClipper</span>
        </div>
        <div className="flex gap-6">
          <Link href="#" className="hover:text-foreground">Privacy</Link>
          <Link href="#" className="hover:text-foreground">Terms</Link>
          <Link href="#" className="hover:text-foreground">Twitter</Link>
        </div>
        <div>
          &copy; 2024 AI Podcast Clipper. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
