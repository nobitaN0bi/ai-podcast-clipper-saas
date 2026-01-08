
import { Button } from "~/components/ui/button";
import { Check, X, ArrowRight, Zap, Scissors } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { ModeToggle } from "~/components/mode-toggle";

export const metadata: Metadata = {
    title: "Pricing - Simple, Transparent Plans",
    description: "Choose the perfect ClipFlow plan. Free tier for hobbyists, Pro for creators, Agency for teams.",
};
export default function PricingPage() {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground flex flex-col">

            {/* Navbar */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="size-8 bg-primary flex items-center justify-center">
                            <Scissors className="size-4 text-primary-foreground" />
                        </div>
                        <span className="text-lg font-bold tracking-tight">ClipFlow</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
                        <Link href="/#features" className="hover:text-muted-foreground transition-colors">Features</Link>
                        <Link href="/#how-it-works" className="hover:text-muted-foreground transition-colors">How it Works</Link>
                        <Link href="/marketplace" className="hover:text-muted-foreground transition-colors">Marketplace</Link>
                        <Link href="/pricing" className="text-foreground font-bold">Pricing</Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <ModeToggle />
                        <Link href="/login" className="text-sm font-medium hover:text-muted-foreground transition-colors">Log in</Link>
                        <Button asChild className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90">
                            <Link href="/signup">Get Started <ArrowRight className="ml-2 size-4" /></Link>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 pt-32 pb-20 px-6">
                <div className="container mx-auto max-w-6xl">

                    <div className="text-center mb-20">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Simple, Transparent Pricing.</h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            No hidden fees. No credit card required to start. Powered by <span className="font-bold text-foreground border-b border-foreground">Polar.sh</span> for developer-first billing.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-px bg-border border border-border shadow-sm max-w-5xl mx-auto">

                        {/* Hobby */}
                        <div className="bg-card p-10 hover:bg-muted transition-colors flex flex-col">
                            <div className="mb-8">
                                <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">Hobby</div>
                                <div className="text-5xl font-bold tracking-tighter mb-2">$0</div>
                                <div className="text-muted-foreground text-sm">Free forever</div>
                            </div>
                            <ul className="space-y-4 mb-8 flex-1 text-sm">
                                <li className="flex gap-3"><Check className="size-4 text-foreground shrink-0" /> 60 mins upload / month</li>
                                <li className="flex gap-3"><Check className="size-4 text-foreground shrink-0" /> 720p Export Quality</li>
                                <li className="flex gap-3"><Check className="size-4 text-foreground shrink-0" /> Basic AI Captions</li>
                                <li className="flex gap-3 text-muted-foreground"><X className="size-4 shrink-0" /> No AI B-Roll</li>
                                <li className="flex gap-3 text-muted-foreground"><X className="size-4 shrink-0" /> Watermarked Clips</li>
                            </ul>
                            <Button variant="outline" className="w-full rounded-none border-border hover:border-primary hover:bg-primary hover:text-primary-foreground h-12">
                                Start Free
                            </Button>
                        </div>

                        {/* Creator (Polar Main) */}
                        <div className="bg-card p-10 hover:bg-muted transition-colors flex flex-col relative z-10 ring-1 ring-primary">
                            <div className="absolute top-0 inset-x-0 h-1 bg-primary" />
                            <div className="mb-8">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="text-sm font-bold uppercase tracking-widest text-foreground">Pro Creator</div>
                                    <div className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 uppercase">Most Popular</div>
                                </div>
                                <div className="text-5xl font-bold tracking-tighter mb-2">$29</div>
                                <div className="text-muted-foreground text-sm">per month</div>
                            </div>
                            <ul className="space-y-4 mb-8 flex-1 text-sm font-medium">
                                <li className="flex gap-3"><Check className="size-4 text-foreground shrink-0" /> 10 Hours upload / month</li>
                                <li className="flex gap-3"><Check className="size-4 text-foreground shrink-0" /> 4K Export Quality</li>
                                <li className="flex gap-3"><Check className="size-4 text-foreground shrink-0" /> <span className="underline decoration-dotted">Viral AI Curation</span></li>
                                <li className="flex gap-3"><Check className="size-4 text-foreground shrink-0" /> Unlimited AI B-Roll</li>
                                <li className="flex gap-3"><Check className="size-4 text-foreground shrink-0" /> No Watermark</li>
                            </ul>
                            <Button asChild className="w-full rounded-none bg-primary text-primary-foreground hover:bg-primary/90 h-12 cursor-pointer">
                                <Link href={process.env.NEXT_PUBLIC_POLAR_CHECKOUT_LINK || "#"} target="_blank">
                                    Subscribe via Polar <Zap className="ml-2 size-4 fill-yellow-400 text-yellow-400" />
                                </Link>
                            </Button>
                        </div>

                        {/* Agency */}
                        <div className="bg-card p-10 hover:bg-muted transition-colors flex flex-col">
                            <div className="mb-8">
                                <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">Agency</div>
                                <div className="text-5xl font-bold tracking-tighter mb-2">$99</div>
                                <div className="text-muted-foreground text-sm">per month</div>
                            </div>
                            <ul className="space-y-4 mb-8 flex-1 text-sm">
                                <li className="flex gap-3"><Check className="size-4 text-foreground shrink-0" /> 50 Hours upload / month</li>
                                <li className="flex gap-3"><Check className="size-4 text-foreground shrink-0" /> Priority Processing Queue</li>
                                <li className="flex gap-3"><Check className="size-4 text-foreground shrink-0" /> Multi-Seat Dashboard (5 Users)</li>
                                <li className="flex gap-3"><Check className="size-4 text-foreground shrink-0" /> White-label Reports</li>
                                <li className="flex gap-3"><Check className="size-4 text-foreground shrink-0" /> API Access</li>
                            </ul>
                            <Button variant="outline" className="w-full rounded-none border-border hover:border-primary hover:bg-primary hover:text-primary-foreground h-12">
                                Contact Sales
                            </Button>
                        </div>

                    </div>

                    <div className="mt-20 border-t border-border pt-10 text-center">
                        <p className="text-sm text-muted-foreground mb-6">Trusted payment processing secured by</p>
                        <div className="flex justify-center items-center gap-4 opacity-50 grayscale">
                            {/* Polar Logo Placeholder */}
                            <Link href="https://polar.sh" target="_blank" className="flex items-center gap-2 font-bold text-lg hover:opacity-100 transition-opacity">
                                <div className="size-6 bg-foreground rounded-full" /> Polar.sh
                            </Link>
                        </div>
                    </div>

                </div>
            </main>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-border text-sm text-muted-foreground bg-muted/50">
                <div className="container mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center gap-2 mb-4 md:mb-0">
                        <Scissors className="size-4 text-foreground" />
                        <span className="font-bold text-foreground">ClipFlow</span>
                    </div>
                    <div className="mt-4 md:mt-0">
                        © 2024 ClipFlow Inc.
                    </div>
                </div>
            </footer>

        </div>
    );
}
