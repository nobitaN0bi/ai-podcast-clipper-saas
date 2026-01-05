"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ModeToggle } from "~/components/mode-toggle";
import {
    ShoppingBag,
    Film,
    Download,
    RefreshCw,
    Play,
    Filter,
    Search,
    Sparkles,
    Music,
    Wand2,
    Type,
    Star,
    TrendingUp,
    ChevronRight,
    Heart,
    Upload,
    ExternalLink,
} from "lucide-react";
import { cn } from "~/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

interface MarketplaceAsset {
    id: string;
    title: string;
    creator: string;
    category: string;
    price: number;
    isFree: boolean;
    thumbnailUrl?: string;
    downloads: number;
    rating: number;
    tags: string[];
}

// ============================================================================
// MOCK DATA
// ============================================================================

const CATEGORIES = [
    { id: "all", name: "All Assets", icon: ShoppingBag },
    { id: "effects", name: "Effects & Filters", icon: Wand2 },
    { id: "transitions", name: "Transitions", icon: Sparkles },
    { id: "templates", name: "Templates", icon: Film },
    { id: "audio", name: "Audio & Music", icon: Music },
    { id: "text", name: "Text Styles", icon: Type },
];

const MOCK_ASSETS: MarketplaceAsset[] = [
    { id: "1", title: "Viral Caption Pack", creator: "StudioX", category: "text", price: 0, isFree: true, downloads: 12453, rating: 4.8, tags: ["captions", "viral", "tiktok"] },
    { id: "2", title: "Cinematic LUT Bundle", creator: "ColorGrade Pro", category: "effects", price: 29.99, isFree: false, downloads: 8234, rating: 4.9, tags: ["lut", "cinematic", "color"] },
    { id: "3", title: "Glitch Transitions", creator: "VFX Master", category: "transitions", price: 14.99, isFree: false, downloads: 5621, rating: 4.7, tags: ["glitch", "transition", "effects"] },
    { id: "4", title: "Lo-Fi Music Pack", creator: "BeatMaker", category: "audio", price: 19.99, isFree: false, downloads: 3892, rating: 4.6, tags: ["lofi", "music", "background"] },
    { id: "5", title: "YouTube Shorts Kit", creator: "ContentCrew", category: "templates", price: 0, isFree: true, downloads: 21034, rating: 4.5, tags: ["youtube", "shorts", "template"] },
    { id: "6", title: "Retro VHS Effect", creator: "VintageVibes", category: "effects", price: 9.99, isFree: false, downloads: 4521, rating: 4.8, tags: ["retro", "vhs", "vintage"] },
    { id: "7", title: "Smooth Zoom Transitions", creator: "TransitionPro", category: "transitions", price: 0, isFree: true, downloads: 15678, rating: 4.4, tags: ["zoom", "smooth", "transition"] },
    { id: "8", title: "Podcast Intro Pack", creator: "AudioStudio", category: "templates", price: 24.99, isFree: false, downloads: 2341, rating: 4.7, tags: ["podcast", "intro", "template"] },
];

// ============================================================================
// COMPONENTS
// ============================================================================

function AssetCard({ asset }: { asset: MarketplaceAsset }) {
    return (
        <div className="group relative bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
            {/* Thumbnail */}
            <div className="aspect-video bg-muted relative">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="size-12 rounded-full bg-background/50 flex items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity">
                        <Play className="size-6 text-foreground ml-0.5" />
                    </div>
                </div>

                {/* Price Badge */}
                <div className="absolute bottom-2 left-2">
                    {asset.isFree ? (
                        <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded">FREE</span>
                    ) : (
                        <span className="bg-background text-foreground text-xs font-bold px-2 py-0.5 rounded">${asset.price}</span>
                    )}
                </div>

                {/* Favorite Button */}
                <button className="absolute top-2 right-2 size-8 bg-black/50 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20">
                    <Heart className="size-4 text-white" />
                </button>
            </div>

            {/* Info */}
            <div className="p-3">
                <h3 className="font-medium text-foreground truncate">{asset.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">by {asset.creator}</p>

                <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="size-3 text-yellow-500 fill-yellow-500" />
                        <span>{asset.rating}</span>
                        <span className="mx-1">•</span>
                        <Download className="size-3" />
                        <span>{(asset.downloads / 1000).toFixed(1)}k</span>
                    </div>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-primary hover:text-primary hover:bg-primary/10 p-0 px-2"
                        asChild
                    >
                        <Link href="https://polar.sh" target="_blank" rel="noopener noreferrer">
                            Get
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

function CategoryItem({ category, isActive, onClick }: {
    category: typeof CATEGORIES[0];
    isActive: boolean;
    onClick: () => void;
}) {
    const Icon = category.icon;
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all relative overflow-hidden",
                isActive
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
        >
            {/* Active Indicator */}
            {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent pointer-events-none" />
            )}
            <Icon className={cn("size-4 relative z-10", isActive && "drop-shadow-sm")} />
            <span className="relative z-10 font-medium">{category.name}</span>
            {isActive && (
                <div className="absolute right-2 size-2 bg-white rounded-full shadow-sm" />
            )}
        </button>
    );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function MarketplacePage() {
    const [activeCategory, setActiveCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredAssets = MOCK_ASSETS.filter((asset) => {
        if (activeCategory !== "all" && asset.category !== activeCategory) return false;
        if (searchQuery && !asset.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="min-h-screen bg-background text-foreground font-sans flex transition-colors duration-300">
            {/* Sidebar */}
            <aside className="w-64 border-r border-border flex flex-col p-4 bg-card/50">
                {/* Logo */}
                <div className="flex items-center gap-2 px-3 py-2 mb-6">
                    <ShoppingBag className="size-5 text-primary" />
                    <span className="font-bold text-lg">Marketplace</span>
                </div>

                {/* Categories */}
                <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold px-3 mb-2">
                        Categories
                    </p>
                    {CATEGORIES.map((cat) => (
                        <CategoryItem
                            key={cat.id}
                            category={cat}
                            isActive={activeCategory === cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                        />
                    ))}
                </div>

                {/* Trending Tags */}
                <div className="mt-8">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold px-3 mb-3">
                        Trending Tags
                    </p>
                    <div className="flex flex-wrap gap-2 px-3">
                        {["viral", "tiktok", "cinematic", "retro", "lofi"].map((tag) => (
                            <span
                                key={tag}
                                className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded hover:bg-secondary/80 cursor-pointer"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Upload CTA */}
                <div className="mt-auto pt-6">
                    <Link href="/marketplace/upload">
                        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                            <Upload className="size-4 mr-2" />
                            Upload & Sell
                        </Button>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-1">Discover Assets</h1>
                        <p className="text-muted-foreground">Premium effects, templates, and audio for your videos</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <ModeToggle />
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                placeholder="Search assets..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-64 pl-10 bg-background border-input focus:border-primary"
                            />
                        </div>
                        <Button variant="outline" size="icon" className="border-border hover:bg-accent hover:text-accent-foreground">
                            <RefreshCw className="size-4" />
                        </Button>
                    </div>
                </div>

                {/* AI Suggestions Banner */}
                <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/20 rounded-lg p-4 mb-8 flex items-center gap-4">
                    <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Sparkles className="size-5 text-primary" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-foreground">AI-Powered Suggestions</h3>
                        <p className="text-sm text-muted-foreground">Based on your editing style, we recommend cinematic transitions and lo-fi audio.</p>
                    </div>
                    <Button variant="outline" size="sm" className="border-primary/50 text-primary hover:bg-primary/10">
                        View Suggestions <ChevronRight className="size-4 ml-1" />
                    </Button>
                </div>

                {/* Results Count */}
                <div className="flex items-center justify-between mb-6">
                    <p className="text-muted-foreground text-sm">
                        Showing <span className="text-foreground font-medium">{filteredAssets.length}</span> assets
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Sort by:</span>
                        <select className="bg-background border border-input text-sm px-3 py-1.5 rounded focus:border-primary outline-none">
                            <option>Most Popular</option>
                            <option>Newest</option>
                            <option>Price: Low to High</option>
                            <option>Price: High to Low</option>
                            <option>Rating</option>
                        </select>
                    </div>
                </div>

                {/* Asset Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredAssets.map((asset) => (
                        <AssetCard key={asset.id} asset={asset} />
                    ))}
                </div>

                {/* Empty State */}
                {filteredAssets.length === 0 && (
                    <div className="text-center py-16">
                        <div className="size-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                            <Search className="size-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-2">No assets found</h3>
                        <p className="text-muted-foreground">Try adjusting your search or filters</p>
                    </div>
                )}

                {/* Load More */}
                {filteredAssets.length > 0 && (
                    <div className="flex justify-center mt-8">
                        <Button variant="outline" className="border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                            Load More Assets
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
}
