import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  ArrowRight,
  Check,
  Play,
  Scissors,
  Video,
  Mic,
  FileText,
  Twitter,
  Linkedin,
  Share2,
  Zap,
  Mail,
  Upload,
  Sparkles,
  Wand2,
  LayoutDashboard,
  Calendar,
  FolderOpen,
  Film,
  Settings,
  CreditCard
} from "lucide-react";

import { FadeIn } from "~/components/animations/fade-in";
import { WallOfLove } from "~/components/home/wall-of-love";
import { ContentShowcase } from "~/components/home/content-showcase";
import { Navbar } from "~/components/layout/navbar";
import { Footer } from "~/components/layout/footer";

import { reviews } from "~/lib/marketing-data";
import { blogPosts } from "~/lib/blog-data";

// JSON-LD Structured Data for SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "ClipFlow",
  "applicationCategory": "MultimediaApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "description": "Free trial available"
  },
  "description": "AI-powered podcast clipper that transforms long-form videos into viral short clips with auto-detection, captions, and content repurposing.",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "ratingCount": "1250",
    "bestRating": "5"
  },
  "review": reviews.map(r => ({
    "@type": "Review",
    "author": { "@type": "Person", "name": r.name },
    "reviewBody": r.content,
    "reviewRating": { "@type": "Rating", "ratingValue": r.stars.toString() }
  })),
  "featureList": [
    "AI-powered clip detection",
    "Automatic captions",
    "Speaker tracking",
    "Vertical video reframing",
    "Audio enhancement",
    "Content repurposing",
    "Multi-platform publishing"
  ]
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="flex min-h-screen flex-col bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">

        {/* Navbar */}
        {/* Navbar */}
        <Navbar />

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6">
          <FadeIn>
            <div className="container mx-auto max-w-5xl text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 border border-border bg-muted/50 text-xs font-medium uppercase tracking-wider mb-8 rounded-full">
                <Sparkles className="size-3 text-primary" /> New: Generative B-Roll Engine
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]">
                Turn Long Podcasts into <br />
                <span className="bg-black text-white px-2">Viral Short Clips.</span>
              </h1>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed">
                The all-in-one AI clipper. We detect viral moments, reframe for vertical,
                enhance audio, and generate blogs & newsletters instantly.
              </p>

              <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-20">
                <div className="flex w-full max-w-sm items-center border border-input p-1 pl-4 h-12 hover:border-ring transition-colors bg-background">
                  <Input
                    type="text"
                    placeholder="Paste YouTube URL..."
                    className="border-0 p-0 h-full focus-visible:ring-0 text-base bg-transparent"
                  />
                  <Button className="h-full rounded-none bg-primary text-primary-foreground px-6 hover:bg-primary/90">
                    <Wand2 className="mr-2 size-4" /> Clip It
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">or</span>
                <Button variant="outline" className="h-12 border-input rounded-none hover:bg-secondary text-foreground">
                  Upload Video File
                </Button>
              </div>

              {/* Social Proof */}
              <div className="pt-10">
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-6">Trusted by 10,000+ Creators</p>
                <div className="flex flex-wrap justify-center gap-12 opacity-40 grayscale">
                  {/* Simple Text Logos as Placeholders */}
                  <span className="font-bold text-xl font-mono">NETFLIX</span>
                  <span className="font-bold text-xl font-serif">The New York Times</span>
                  <span className="font-bold text-xl italic">Spotify</span>
                  <span className="font-bold text-xl tracking-tighter">TED</span>
                  <span className="font-bold text-xl font-sans">Y Combinator</span>
                </div>
              </div>
            </div>
          </FadeIn>
        </section>

        {/* How It Works (Visual Steps) */}
        <section id="how-it-works" className="py-24 px-6 bg-secondary/30">
          <FadeIn delay={0.2}>
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4">From Long-Form to Viral in 3 Steps</h2>
                <p className="text-muted-foreground">Stop editing manually. Let our AI handle the heavy lifting.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    step: "01",
                    title: "Paste or Upload",
                    desc: "Drop a YouTube link or upload your raw video file. We support 4K up to 2 hours.",
                    icon: Video
                  },
                  {
                    step: "02",
                    title: "AI Analysis",
                    desc: "Our engine detects active speakers, scores viral moments, and generates captions.",
                    icon: Sparkles
                  },
                  {
                    step: "03",
                    title: "Publish & Repurpose",
                    desc: "Export vertical clips, download transcript blogs, and share directly to socials.",
                    icon: Share2
                  }
                ].map((item, i) => (
                  <div key={i} className="relative p-8 bg-card border border-border hover:border-primary/20 transition-all group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl group-hover:opacity-5 transition-opacity text-foreground/20 select-none">{item.step}</div>
                    <div className="size-12 bg-primary text-primary-foreground flex items-center justify-center mb-6">
                      <item.icon className="size-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </section>

        {/* Try Our AI Video Editor - Animated Preview Section */}
        <section className="py-32 px-6 bg-background text-foreground overflow-hidden relative">
          <FadeIn>
            <div className="container mx-auto max-w-6xl relative z-10 flex flex-col md:flex-row items-center gap-16">

              {/* Text Side */}
              <div className="flex-1 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary/20 bg-primary/5 text-primary text-xs font-bold uppercase tracking-wider mb-8">
                  <Sparkles className="size-3" /> Try It Free
                </div>
                <h2 className="text-5xl md:text-6xl font-bold mb-8 tracking-tight leading-[1.1]">
                  It feels like <br />
                  <span className="text-muted-foreground">magic.</span>
                </h2>
                <p className="text-xl text-muted-foreground max-w-lg mb-10 leading-relaxed">
                  Watch how our AI transforms a 1-hour podcast into 10 viral clips automatically. No credit card required.
                </p>
                <div className="flex gap-4">
                  <Button asChild size="lg" className="h-14 px-8 text-lg bg-primary text-primary-foreground hover:bg-primary/90 rounded-none font-bold">
                    <Link href="/signup">
                      Start Editing <ArrowRight className="ml-2 size-5" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg rounded-none border-border hover:bg-muted">
                    <Link href="#how-it-works">See How <ArrowRight className="ml-2 size-5" /></Link>
                  </Button>
                </div>
              </div>

              {/* Editor Preview Side */}
              <div className="flex-1 w-full max-w-xl">
                <div className="relative aspect-square md:aspect-[4/3] bg-background border border-border p-2 shadow-2xl skew-y-3 hover:skew-y-0 transition-transform duration-700 ease-out group">
                  <div className="absolute inset-0 bg-background border border-border opacity-50" />
                  <div className="relative h-full w-full bg-background flex flex-col overflow-hidden border border-border">
                    <div className="absolute inset-0 bg-background border border-border" />

                    {/* Fake Browser Top Bar */}
                    <div className="relative h-full w-full bg-background flex flex-col overflow-hidden border border-border">

                      {/* Editor Header */}
                      <div className="h-12 border-b border-border flex items-center px-4 justify-between bg-background">
                        <div className="flex gap-2">
                          <div className="size-3 rounded-full bg-muted-foreground/30" />
                          <div className="size-3 rounded-full bg-muted-foreground/30" />
                        </div>
                        <div className="text-xs font-mono text-muted-foreground">Project_Alpha.mp4</div>
                        <div className="text-xs font-bold bg-green-500/10 text-green-600 px-2 py-0.5 rounded border border-green-500/20">SAVED</div>
                      </div>

                      {/* Editor Body */}
                      <div className="flex-1 p-4 flex gap-4">
                        {/* Video Area */}
                        <div className="flex-1 bg-muted/50 relative overflow-hidden flex items-center justify-center group-hover:bg-muted/80 transition-colors">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="size-16 bg-background rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                              <Play className="size-6 text-foreground ml-1" />
                            </div>
                          </div>
                          {/* Overlay Caption */}
                          <div className="absolute bottom-6 bg-black/80 backdrop-blur text-white px-4 py-2 font-bold text-center text-sm shadow-xl rounded-full">
                            "The secret to growth is..."
                          </div>
                        </div>

                        {/* Sidebar */}
                        <div className="w-1/3 space-y-3 hidden sm:block">
                          <div className="h-2 bg-muted w-full rounded-full" />
                          <div className="h-2 bg-muted w-2/3 rounded-full" />

                          <div className="mt-8 space-y-2">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="p-3 border border-border bg-card shadow-sm hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-[10px] font-bold text-muted-foreground">CLIP {i}</span>
                                  <span className="text-[10px] font-bold text-green-500">9{8 - i}%</span>
                                </div>
                                <div className="h-1.5 bg-muted w-full rounded-full overflow-hidden">
                                  <div className="h-full bg-green-500 w-[90%]" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="h-16 border-t border-border bg-muted flex items-end px-4 pb-0 relative overflow-hidden">
                        <div className="absolute top-0 bottom-0 left-1/3 w-0.5 bg-red-500 z-10" />
                        <div className="flex items-end gap-0.5 w-full h-8 opacity-20">
                          {[...Array(30)].map((_, i) => (
                            <div key={i} className="flex-1 bg-foreground" style={{ height: `${20 + Math.random() * 80}%` }} />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Decorative Background BLob */}
                    <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-purple-100/50 to-yellow-100/50 blur-3xl rounded-full opacity-50" />
                  </div>
                </div>
              </div>

            </div>
          </FadeIn>
        </section>

        {/* Feature 1: The Marketplace */}
        <section className="py-32 px-6 bg-background overflow-hidden">
          <FadeIn>
            <div className="container mx-auto max-w-6xl">
              <div className="flex flex-col md:flex-row items-center gap-16">
                <div className="flex-1 order-2 md:order-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 border border-border bg-yellow-500/10 text-yellow-500 text-xs font-bold uppercase tracking-wider mb-6">
                    <Zap className="size-3" /> New
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">The Content Marketplace.</h2>
                  <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                    Don't just create. <span className="text-foreground font-medium">Sell.</span> License your viral clips, B-roll, and sound effects to a global network of creators.
                    Turn your unused footage into passive income.
                  </p>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3 font-medium">
                      <div className="size-6 bg-primary text-primary-foreground flex items-center justify-center rounded-full text-xs">1</div>
                      Set your own licensing rights
                    </li>
                    <li className="flex items-center gap-3 font-medium">
                      <div className="size-6 bg-primary text-primary-foreground flex items-center justify-center rounded-full text-xs">2</div>
                      Instant payouts via Stripe
                    </li>
                  </ul>
                  <Button asChild className="h-12 px-8 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 text-lg">
                    <Link href="/marketplace">Explore Marketplace <ArrowRight className="ml-2 size-5" /></Link>
                  </Button>
                </div>

                {/* Marketplace Schematic Art */}
                <div className="flex-1 order-1 md:order-2 w-full">
                  <div className="relative aspect-square md:aspect-[4/3] border border-border bg-muted/30 p-8 flex items-center justify-center relative shadow-2xl shadow-black/5">
                    <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-10">
                      {Array.from({ length: 36 }).map((_, i) => (
                        <div key={i} className="border-r border-b border-foreground" />
                      ))}
                    </div>
                    {/* Floating Cards */}
                    <div className="relative z-10 w-48 h-64 bg-card border border-border p-2 shadow-lg -rotate-6 transform translate-y-4 -translate-x-4">
                      <div className="w-full h-32 bg-muted border border-border mb-2 relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/50 font-bold text-4xl">$$$</div>
                      </div>
                      <div className="h-2 w-2/3 bg-muted mb-2" />
                      <div className="h-2 w-1/2 bg-muted" />
                      <div className="absolute top-2 right-2 bg-foreground text-background text-xs font-bold px-1">$29</div>
                    </div>
                    <div className="relative z-20 w-48 h-64 bg-card border border-border p-2 shadow-xl rotate-3 transform -translate-y-4 translate-x-4">
                      <div className="w-full h-32 bg-foreground flex items-center justify-center mb-2">
                        <Play className="text-background size-8" />
                      </div>
                      <div className="h-2 w-3/4 bg-muted mb-2" />
                      <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-bold px-1">POPULAR</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </section>

        {/* Feature 2: Clip Intelligence */}
        <section className="py-32 px-6 bg-muted/30 overflow-hidden">
          <FadeIn>
            <div className="container mx-auto max-w-6xl">
              <div className="flex flex-col md:flex-row items-center gap-16">
                {/* Art Left */}
                <div className="flex-1 w-full order-1">
                  <div className="relative aspect-video border border-white/10 rounded-2xl bg-card/50 backdrop-blur-xl p-8 flex items-center justify-center overflow-hidden shadow-2xl md:-rotate-1 hover:rotate-0 transition-transform duration-500">
                    {/* Grid Pattern */}
                    <div className="absolute inset-0 z-0 opacity-10"
                      style={{ backgroundImage: 'radial-gradient(circle, #888 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="w-64 h-80 border-2 border-yellow-400/80 shadow-[0_0_30px_rgba(250,204,21,0.2)] relative bg-black/20 backdrop-blur-sm rounded-lg overflow-hidden">
                        <div className="absolute top-4 left-4 bg-yellow-400 text-black text-[10px] font-bold px-2 py-1 shadow-lg uppercase tracking-wider">ACTIVE SPEAKER</div>
                        <div className="absolute top-4 right-4 p-2 space-y-1">
                          <div className="size-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                        </div>
                        {/* Simulated Face */}
                        <div className="absolute inset-x-8 top-16 bottom-8 bg-gradient-to-b from-white/10 to-transparent rounded-full opacity-30" />
                      </div>
                    </div>
                    {/* UI Overlay */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-white px-6 py-3 rounded-full flex gap-4 text-xs font-mono border border-white/10 shadow-xl z-20 whitespace-nowrap">
                      <span className="text-yellow-400 flex items-center gap-1"><Sparkles className="size-3" /> Viral_Score: 98</span>
                      <span className="text-gray-600">|</span>
                      <span className="text-gray-300">Framing: 9:16</span>
                    </div>
                  </div>
                </div>

                {/* Text Right */}
                <div className="flex-1 order-2">
                  <div className="size-12 border border-border flex items-center justify-center mb-6 bg-card">
                    <Video className="size-6" />
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Clip Intelligence.</h2>
                  <p className="text-xl text-gray-500 mb-8 leading-relaxed">
                    Our computer vision algorithms track faces, identify speakers, and reframe horizontal video into perfect vertical clips.
                  </p>
                  <ul className="grid grid-cols-2 gap-4">
                    <li className="flex items-center gap-2 text-sm font-medium"><Check className="size-4 text-green-600" /> Auto-Face Crop</li>
                    <li className="flex items-center gap-2 text-sm font-medium"><Check className="size-4 text-green-600" /> Karaoke Captions</li>
                    <li className="flex items-center gap-2 text-sm font-medium"><Check className="size-4 text-green-600" /> B-Roll Insert</li>
                    <li className="flex items-center gap-2 text-sm font-medium"><Check className="size-4 text-green-600" /> Silence Removal</li>
                  </ul>
                </div>
              </div>
            </div>
          </FadeIn>
        </section>

        {/* Feature 3: Audio Polish */}
        <section className="py-32 px-6 bg-background overflow-hidden">
          <FadeIn>
            <div className="container mx-auto max-w-6xl">
              <div className="flex flex-col md:flex-row items-center gap-16">
                <div className="flex-1 order-2 md:order-1">
                  <div className="size-12 border border-border flex items-center justify-center mb-6 bg-primary text-primary-foreground">
                    <Mic className="size-6" />
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Audio Polish.</h2>
                  <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                    Don't sound like a zoom call. We use proprietary audio enhancement to remove background noise, echo, and filler words like "um" and "ah".
                  </p>
                  <div className="p-4 bg-muted border-l-4 border-primary text-sm italic text-muted-foreground">
                    "The audio clarity is genuinely studio quality. I stopped using my expensive podcast editor."
                  </div>
                </div>

                {/* Audio Schematic */}
                {/* Audio Schematic */}
                <div className="flex-1 order-1 md:order-2 w-full">
                  <div className="relative aspect-video bg-black flex items-center justify-center p-8 overflow-hidden border border-gray-800">
                    {/* Grid Background */}
                    <div className="absolute inset-0 z-0 opacity-20"
                      style={{
                        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                      }}
                    />

                    {/* Central Mirrored Waveform */}
                    <div className="flex gap-1 items-center h-48 z-10 w-full justify-center">
                      {[...Array(20)].map((_, i) => (
                        <div key={i}
                          className="w-1.5 bg-gradient-to-t from-gray-500 via-white to-gray-500 rounded-full animate-pulse"
                          style={{
                            height: `${30 + Math.random() * 60}%`,
                            animationDuration: `${0.5 + Math.random() * 0.5}s`,
                            opacity: i < 5 || i > 15 ? 0.3 : 1
                          }}
                        />
                      ))}
                      {/* Active "Talking" Section */}
                      {[...Array(15)].map((_, i) => (
                        <div key={`active-${i}`}
                          className="w-1.5 bg-gradient-to-t from-green-500 via-green-300 to-green-500 rounded-full animate-bounce"
                          style={{
                            height: `${60 + Math.random() * 40}%`,
                            animationDuration: `${0.8 + Math.random() * 0.2}s`,
                            animationDelay: `${i * 0.05}s`
                          }}
                        />
                      ))}
                      {[...Array(20)].map((_, i) => (
                        <div key={`end-${i}`}
                          className="w-1.5 bg-gradient-to-t from-gray-500 via-white to-gray-500 rounded-full animate-pulse"
                          style={{
                            height: `${30 + Math.random() * 60}%`,
                            animationDuration: `${0.5 + Math.random() * 0.5}s`,
                            opacity: i < 5 || i > 15 ? 0.3 : 1
                          }}
                        />
                      ))}
                    </div>

                    {/* Scanning Line */}
                    <div className="absolute top-0 bottom-0 w-px bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.8)] z-20 animate-[marquee_3s_linear_infinite]" />

                    {/* Status Overlays */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <div className="px-2 py-1 bg-green-900/30 text-green-400 text-[10px] font-mono border border-green-500/20 backdrop-blur-sm">
                        V: ENHANCED
                      </div>
                      <div className="px-2 py-1 bg-gray-900/30 text-gray-400 text-[10px] font-mono border border-gray-700/20 backdrop-blur-sm">
                        NR: ACTIVE
                      </div>
                    </div>

                    <div className="absolute bottom-4 right-4 text-xs font-mono text-green-400 flex items-center gap-2">
                      <div className="size-1.5 bg-green-500 rounded-full animate-pulse" />
                      PROCESSING_AUDIO_STREAM...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </section>

        {/* Feature 4: Content Repurposing (Replaced with Interactive Exhibit) */}
        <ContentShowcase />

        {/* Feature 5: Brand Hub */}
        <section className="py-32 px-6 bg-background overflow-hidden">
          <FadeIn>
            <div className="container mx-auto max-w-6xl">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Your Brand. Consistent.</h2>
                <p className="text-xl text-gray-500">
                  Define your fonts, colors, and tone once. We apply them to every clip, every blog, and every subtitle automatically.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Color Swatches */}
                <div className="aspect-square bg-black p-6 flex flex-col justify-end text-white border border-black">
                  <span className="font-mono text-xs">#000000</span>
                  <span className="font-bold">Primary</span>
                </div>
                <div className="aspect-square bg-yellow-400 p-6 flex flex-col justify-end text-black border border-black">
                  <span className="font-mono text-xs">#FACC15</span>
                  <span className="font-bold">Accent</span>
                </div>
                <div className="aspect-square bg-card p-6 flex flex-col justify-center items-center border border-foreground text-center">
                  <span className="font-serif text-4xl mb-2 italic">Aa</span>
                  <span className="text-xs text-gray-500">Times New Roman</span>
                </div>
                <div className="aspect-square bg-gray-100 p-6 flex flex-col justify-center items-center border border-black text-center">
                  <span className="font-sans text-4xl mb-2 font-bold">Aa</span>
                  <span className="text-xs text-gray-500">Inter Tight</span>
                </div>
              </div>
            </div>
          </FadeIn>
        </section>

        {/* Before / After Comparison */}
        <section className="py-24 px-6 bg-muted/30">
          <FadeIn delay={0.4}>
            <div className="container mx-auto max-w-4xl text-center">
              <h2 className="text-3xl font-bold mb-12">Stop Wasting Time on Manual Edits</h2>

              <div className="grid md:grid-cols-2 gap-8 text-left">
                {/* Manual */}
                <div className="bg-card/50 backdrop-blur-sm p-8 border border-destructive/20 relative overflow-hidden rounded-2xl hover:bg-card transition-colors">
                  <div className="absolute top-0 right-0 bg-destructive/10 text-destructive text-[10px] font-bold px-3 py-1 uppercase tracking-wider rounded-bl-lg">The Old Way</div>
                  <h3 className="font-bold text-destructive mb-6 flex items-center gap-3 text-xl"><span className="flex items-center justify-center size-8 rounded-full bg-destructive/10 text-destructive text-lg">✕</span> Manual Editing</h3>
                  <ul className="space-y-4 text-muted-foreground/80">
                    <li className="flex items-center gap-3">
                      <div className="size-1.5 bg-destructive/40 rounded-full" /> 4+ Hours per episode
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="size-1.5 bg-destructive/40 rounded-full" /> Expensive Freelancers ($50/hr)
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="size-1.5 bg-destructive/40 rounded-full" /> Manually typing subtitles
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="size-1.5 bg-destructive/40 rounded-full" /> Struggling with premiere pro
                    </li>
                  </ul>
                </div>

                {/* ClipFlow */}
                <div className="bg-gradient-to-br from-background to-card p-8 border-2 border-primary/20 shadow-2xl shadow-primary/10 relative overflow-hidden rounded-2xl transform md:scale-105 z-10 group hover:border-primary/40 transition-all">
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 uppercase tracking-wider rounded-bl-lg">The New Way</div>
                  <h3 className="font-bold text-foreground mb-6 flex items-center gap-3 text-xl"><span className="flex items-center justify-center size-8 rounded-full bg-primary text-primary-foreground text-lg shadow-lg shadow-primary/20">✓</span> With ClipFlow</h3>
                  <ul className="space-y-4 font-medium text-foreground">
                    <li className="flex items-center gap-3">
                      <Check className="size-5 text-primary" /> Done in 10 minutes
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="size-5 text-primary" /> Flat monthly subscription
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="size-5 text-primary" /> 99% Accurate AI Captions
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="size-5 text-primary" /> One-click Viral Layouts
                    </li>
                  </ul>
                  {/* Decorative Glow */}
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/10 blur-3xl rounded-full group-hover:bg-primary/20 transition-all" />
                </div>
              </div>
            </div>
          </FadeIn>
        </section>

        {/* Testimonials - Wall of Love */}
        <WallOfLove />



        {/* Dashboard Features Section */}
        <section id="features" className="py-32 px-6 bg-gradient-to-b from-muted to-background">
          <FadeIn>
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 border border-border bg-card text-xs font-bold uppercase tracking-wider mb-6 rounded-full">
                  <LayoutDashboard className="size-3" /> Dashboard Features
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Your Creative Command Center</h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Everything you need to create, manage, and publish your content - all in one place.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    icon: LayoutDashboard,
                    title: "Dashboard",
                    desc: "Overview of all your projects, analytics, and recent activity at a glance.",
                    color: "bg-card dark:bg-card border-border hover:border-blue-500/50 dark:hover:border-blue-400/50"
                  },
                  {
                    icon: Wand2,
                    title: "AI Video Editor",
                    desc: "Transform long videos into viral clips with AI-powered editing tools.",
                    color: "bg-card dark:bg-card border-border hover:border-purple-500/50 dark:hover:border-purple-400/50"
                  },
                  {
                    icon: FolderOpen,
                    title: "Assets Library",
                    desc: "Store and organize your brand assets, logos, watermarks, and templates.",
                    color: "bg-card dark:bg-card border-border hover:border-green-500/50 dark:hover:border-green-400/50"
                  },
                  {
                    icon: Film,
                    title: "My Clips",
                    desc: "Browse, edit, and manage all your generated clips in one place.",
                    color: "bg-card dark:bg-card border-border hover:border-orange-500/50 dark:hover:border-orange-400/50"
                  },
                  {
                    icon: Calendar,
                    title: "Content Calendar",
                    desc: "Schedule and auto-publish clips to TikTok, Instagram, YouTube, and more.",
                    color: "bg-card dark:bg-card border-border hover:border-pink-500/50 dark:hover:border-pink-400/50"
                  },
                  {
                    icon: Settings,
                    title: "Settings & Billing",
                    desc: "Manage your account, team members, and subscription preferences.",
                    color: "bg-card dark:bg-card border-border hover:border-muted-foreground/50"
                  }
                ].map((feature, i) => (
                  <FadeIn key={i} delay={0.1 + (i * 0.1)}>
                    <div className={`p-8 border-2 ${feature.color} transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group`}>
                      <div className="size-14 bg-card border border-border flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                        <feature.icon className="size-7" />
                      </div>
                      <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                    </div>
                  </FadeIn>
                ))}
              </div>

              <div className="text-center mt-12">
                <Button asChild size="lg" className="h-14 px-10 bg-primary text-primary-foreground hover:bg-primary/90 rounded-none text-lg">
                  <Link href="/signup">Get Started Free <ArrowRight className="ml-2 size-5" /></Link>
                </Button>
                <p className="mt-4 text-sm text-muted-foreground">No credit card required • Free tier available</p>
              </div>
            </div>
          </FadeIn>
        </section>

        {/* CTA */}
        <section className="py-32 px-6 bg-zinc-950 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20" />
          <div className="container mx-auto max-w-2xl relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tighter">Ready to go viral?</h2>
            <p className="text-zinc-400 text-lg mb-10 leading-relaxed">
              Join 10,000+ creators repurposing content smarter, not harder.
              <br />
              <span className="text-white font-medium">Start earning from your clips today.</span>
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-14 px-8 text-lg bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-none w-full sm:w-auto font-bold tracking-tight transition-transform hover:scale-105">
                Get Started for Free <ArrowRight className="ml-2 size-5" />
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-zinc-800 text-white hover:bg-zinc-900 rounded-none w-full sm:w-auto font-medium">
                View Pricing
              </Button>
            </div>
            <p className="mt-8 text-sm text-zinc-500 font-mono uppercase tracking-widest">
              No credit card required • Cancel anytime
            </p>
          </div>
        </section>

        {/* Footer */}
        {/* Latest from the Blog (SEO) */}
        <section className="py-24 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold">Resources & Guides</h2>
              <Link href="/blog" className="hidden md:flex items-center gap-2 text-sm font-medium hover:text-gray-600">
                Read the Blog <ArrowRight className="size-4" />
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {blogPosts.slice(0, 3).map((post, i) => (
                <Link key={i} href={`/blog/${post.slug}`} className="group block">
                  <div className="aspect-video bg-muted mb-4 border border-border group-hover:border-primary/20 transition-colors overflow-hidden relative">
                    {/* Placeholder Image Effect */}
                    <div className="absolute inset-0 bg-muted-foreground/10 group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{post.category}</div>
                  <h3 className="text-xl font-bold leading-tight group-hover:underline decoration-1 underline-offset-4">{post.title}</h3>
                  <p className="text-sm text-gray-500 mt-2">{post.date}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>


        {/* Footer (SEO Optimized) */}
        {/* Footer (SEO Optimized) */}
        <Footer />

      </main >
    </>
  );
}
