import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
    ArrowRight,
    Check,
    DollarSign,
    Download,
    Film,
    Music,
    Sparkles,
    Star,
    TrendingUp,
    Type,
    Upload,
    Users,
    Zap,
    ShoppingBag
} from "lucide-react";

export const metadata = {
    title: "Content Marketplace - Buy & Sell Creative Assets",
    description: "License B-roll, templates, audio, and effects. Sell your creative assets to 50,000+ creators and earn passive income.",
};

export default function MarketplaceLandingPage() {
    return (
        <main className="min-h-screen bg-background text-foreground font-sans">

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-yellow-500/10 to-background">
                <div className="container mx-auto max-w-5xl">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 border border-yellow-500/50 bg-yellow-500/10 text-yellow-500 text-xs font-bold uppercase tracking-wider mb-6">
                            <Zap className="size-3" /> Creator Economy
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]">
                            The Content <br />
                            <span className="bg-yellow-500 text-black px-2">Marketplace.</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
                            Buy premium assets to enhance your content. Or sell your own creations
                            and earn passive income from 50,000+ creators worldwide.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button asChild size="lg" className="h-14 px-8 bg-primary text-primary-foreground hover:opacity-90 rounded-none">
                                <Link href="/marketplace">Browse Assets <ArrowRight className="ml-2 size-5" /></Link>
                            </Button>
                            <Button asChild size="lg" variant="outline" className="h-14 px-8 border-2 border-primary hover:bg-primary hover:text-primary-foreground rounded-none">
                                <Link href="/signup">Start Selling <Upload className="ml-2 size-5" /></Link>
                            </Button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 border-t border-border/50">
                        {[
                            { value: "50K+", label: "Active Creators" },
                            { value: "$2M+", label: "Paid to Sellers" },
                            { value: "15K+", label: "Assets Listed" },
                            { value: "4.8★", label: "Avg Rating" },
                        ].map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                                <div className="text-sm text-muted-foreground">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="py-24 px-6">
                <div className="container mx-auto max-w-6xl">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
                        Browse by Category
                    </h2>
                    <p className="text-gray-500 text-center mb-16 max-w-xl mx-auto">
                        Find the perfect assets to enhance your content
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { icon: Film, name: "B-Roll & Stock", count: "3,200+ assets", color: "bg-blue-500/10 border-blue-500/20 hover:border-blue-500/40" },
                            { icon: Type, name: "Caption Styles", count: "850+ templates", color: "bg-purple-500/10 border-purple-500/20 hover:border-purple-500/40" },
                            { icon: Music, name: "Audio & Music", count: "2,100+ tracks", color: "bg-green-500/10 border-green-500/20 hover:border-green-500/40" },
                            { icon: Sparkles, name: "Transitions", count: "620+ effects", color: "bg-orange-500/10 border-orange-500/20 hover:border-orange-500/40" },
                        ].map((cat, i) => (
                            <Link
                                key={i}
                                href="/marketplace"
                                className={`p-8 border-2 ${cat.color} transition-all hover:shadow-lg text-center group bg-card`}
                            >
                                <div className="size-16 mx-auto bg-background border border-border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <cat.icon className="size-8 text-foreground" />
                                </div>
                                <h3 className="text-lg font-bold mb-1">{cat.name}</h3>
                                <p className="text-sm text-muted-foreground">{cat.count}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* For Sellers */}
            <section className="py-24 px-6 bg-foreground text-background">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 border border-yellow-400 bg-yellow-400/10 text-yellow-400 text-xs font-bold uppercase tracking-wider mb-6">
                                <DollarSign className="size-3" /> For Sellers
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                                Turn Your Content Into Passive Income
                            </h2>
                            <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
                                Upload your B-roll, templates, audio, and effects. Set your price, and we handle the rest.
                                Instant payouts via Stripe.
                            </p>
                            <ul className="space-y-4 mb-10">
                                {[
                                    "Keep 80% of every sale",
                                    "Set your own prices",
                                    "Instant Stripe payouts",
                                    "Analytics dashboard",
                                    "No exclusivity required"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-lg">
                                        <Check className="size-5 text-yellow-400" /> {item}
                                    </li>
                                ))}
                            </ul>
                            <Button asChild size="lg" className="h-14 px-8 bg-yellow-400 text-black hover:bg-yellow-300 rounded-none font-bold">
                                <Link href="/signup">Start Selling Today <ArrowRight className="ml-2 size-5" /></Link>
                            </Button>
                        </div>

                        {/* Earnings Visualization */}
                        <div className="relative">
                            <div className="bg-card border border-border p-8 rounded-lg shadow-2xl">
                                <div className="flex items-center justify-between mb-6">
                                    <span className="text-sm text-muted-foreground">Your Earnings</span>
                                    <span className="text-sm text-green-500 flex items-center gap-1">
                                        <TrendingUp className="size-4" /> +24% this month
                                    </span>
                                </div>
                                <div className="text-5xl font-bold mb-2 text-foreground">$4,382</div>
                                <div className="text-sm text-muted-foreground mb-8">This Month</div>

                                <div className="space-y-4">
                                    {[
                                        { name: "Cinematic LUT Pack", sales: 142, revenue: "$1,420" },
                                        { name: "Podcast Intro Template", sales: 89, revenue: "$890" },
                                        { name: "Lofi Background Music", sales: 201, revenue: "$603" },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between py-3 border-t border-border">
                                            <div>
                                                <div className="font-medium text-foreground">{item.name}</div>
                                                <div className="text-sm text-muted-foreground">{item.sales} sales</div>
                                            </div>
                                            <div className="text-green-500 font-bold">{item.revenue}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* For Buyers */}
            <section className="py-24 px-6 bg-muted/30">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Why Creators Love Our Marketplace
                        </h2>
                        <p className="text-muted-foreground max-w-xl mx-auto">
                            Premium assets at fair prices, instant downloads, and lifetime access.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Star,
                                title: "Curated Quality",
                                desc: "Every asset is reviewed by our team to ensure professional quality."
                            },
                            {
                                icon: Download,
                                title: "Instant Access",
                                desc: "Download immediately after purchase. No waiting, no hassle."
                            },
                            {
                                icon: Users,
                                title: "Commercial License",
                                desc: "Use in unlimited projects, commercial or personal. Forever."
                            }
                        ].map((feature, i) => (
                            <div key={i} className="bg-card p-8 border border-border hover:border-primary/20 transition-colors">
                                <div className="size-12 bg-yellow-400 text-black flex items-center justify-center mb-6">
                                    <feature.icon className="size-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-32 px-6 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-center">
                <div className="container mx-auto max-w-2xl">
                    <ShoppingBag className="size-16 mx-auto mb-8 text-black" />
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                        Ready to Explore?
                    </h2>
                    <p className="text-black/80 text-lg mb-10 font-medium">
                        Browse 15,000+ assets or start selling your own creations today.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button asChild size="lg" className="h-14 px-8 bg-black text-white hover:bg-gray-800 rounded-none">
                            <Link href="/marketplace">Browse Marketplace <ArrowRight className="ml-2 size-5" /></Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="h-14 px-8 border-2 border-black hover:bg-black hover:text-white rounded-none">
                            <Link href="/signup">Become a Seller</Link>
                        </Button>
                    </div>
                </div>
            </section>

        </main>
    );
}
