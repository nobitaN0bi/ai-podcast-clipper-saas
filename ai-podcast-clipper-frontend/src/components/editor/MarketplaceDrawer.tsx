"use client";

import { useState, useEffect } from "react";
import { useEditorStore } from "~/stores/editor-store";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import {
    Search,
    Sparkles,
    X,
    Play,
    Download,
    Star,
    ChevronRight,
    ShoppingBag,
    Wand2,
    Music,
    Film,
    Type,
    Loader2,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface MarketplaceQuickAsset {
    id: string;
    title: string;
    type: "effect" | "transition" | "audio" | "template" | "text";
    creator: string;
    price: number;
    isFree: boolean;
    rating: number;
    aiRecommended?: boolean;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const QUICK_ASSETS: MarketplaceQuickAsset[] = [
    { id: "1", title: "Viral Caption Style", type: "text", creator: "StudioX", price: 0, isFree: true, rating: 4.8, aiRecommended: true },
    { id: "2", title: "Smooth Zoom Transition", type: "transition", creator: "TransitionPro", price: 0, isFree: true, rating: 4.7, aiRecommended: true },
    { id: "3", title: "Cinematic LUT", type: "effect", creator: "ColorGrade", price: 9.99, isFree: false, rating: 4.9, aiRecommended: true },
    { id: "4", title: "Lo-Fi Beat", type: "audio", creator: "BeatMaker", price: 4.99, isFree: false, rating: 4.6 },
    { id: "5", title: "Glitch Effect", type: "effect", creator: "VFX Master", price: 0, isFree: true, rating: 4.5 },
    { id: "6", title: "Podcast Intro", type: "template", creator: "TemplateHub", price: 14.99, isFree: false, rating: 4.4 },
];

const TYPE_ICONS = {
    effect: Wand2,
    transition: Sparkles,
    audio: Music,
    template: Film,
    text: Type,
};

// ============================================================================
// COMPONENTS
// ============================================================================

function QuickAssetCard({ asset, onApply }: { asset: MarketplaceQuickAsset; onApply: () => void }) {
    const Icon = TYPE_ICONS[asset.type];

    return (
        <div className="flex items-center gap-3 p-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-colors group">
            {/* Icon */}
            <div className={cn(
                "size-10 rounded-lg flex items-center justify-center shrink-0",
                asset.aiRecommended ? "bg-purple-500/20" : "bg-zinc-700"
            )}>
                <Icon className={cn("size-5", asset.aiRecommended ? "text-purple-400" : "text-zinc-400")} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-white truncate">{asset.title}</h4>
                    {asset.aiRecommended && (
                        <Sparkles className="size-3 text-purple-400 shrink-0" />
                    )}
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span>{asset.creator}</span>
                    <span>•</span>
                    <Star className="size-3 text-yellow-500 fill-yellow-500" />
                    <span>{asset.rating}</span>
                </div>
            </div>

            {/* Price & Action */}
            <div className="flex items-center gap-2 shrink-0">
                {asset.isFree ? (
                    <span className="text-xs text-green-400 font-medium">FREE</span>
                ) : (
                    <span className="text-xs text-zinc-400">${asset.price}</span>
                )}
                <Button
                    size="sm"
                    variant="ghost"
                    className="size-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={onApply}
                >
                    <Download className="size-4" />
                </Button>
            </div>
        </div>
    );
}

// ============================================================================
// MAIN DRAWER
// ============================================================================

interface MarketplaceDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function MarketplaceDrawer({ isOpen, onClose }: MarketplaceDrawerProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
    const [aiSuggestions, setAiSuggestions] = useState<MarketplaceQuickAsset[]>([]);

    const { project } = useEditorStore();

    // Simulate loading AI suggestions
    useEffect(() => {
        if (isOpen) {
            setIsLoadingSuggestions(true);
            const timer = setTimeout(() => {
                setAiSuggestions(QUICK_ASSETS.filter((a) => a.aiRecommended));
                setIsLoadingSuggestions(false);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const filteredAssets = QUICK_ASSETS.filter((asset) => {
        if (activeFilter && asset.type !== activeFilter) return false;
        if (searchQuery && !asset.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const handleApplyAsset = (asset: MarketplaceQuickAsset) => {
        // TODO: Actually apply the asset to the timeline
        console.log("Applying asset:", asset);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed right-0 top-0 bottom-0 w-96 bg-zinc-900 border-l border-zinc-800 z-50 flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 h-14 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                    <ShoppingBag className="size-5 text-purple-400" />
                    <span className="font-semibold">Marketplace</span>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded transition-colors">
                    <X className="size-4 text-zinc-400" />
                </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-zinc-800">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                    <Input
                        placeholder="Search assets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-zinc-800 border-zinc-700 focus:border-purple-500"
                    />
                </div>

                {/* Filters */}
                <div className="flex gap-2 mt-3 flex-wrap">
                    {Object.entries(TYPE_ICONS).map(([type, Icon]) => (
                        <button
                            key={type}
                            onClick={() => setActiveFilter(activeFilter === type ? null : type)}
                            className={cn(
                                "flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors",
                                activeFilter === type
                                    ? "bg-purple-500/20 text-purple-400"
                                    : "bg-zinc-800 text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            <Icon className="size-3" />
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* AI Suggestions */}
            <div className="p-4 border-b border-zinc-800">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Sparkles className="size-4 text-purple-400" />
                        <span className="text-sm font-medium">AI Suggestions</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 text-xs text-zinc-500 hover:text-white">
                        Refresh
                    </Button>
                </div>

                {isLoadingSuggestions ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="size-6 text-purple-400 animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-2">
                        {aiSuggestions.map((asset) => (
                            <QuickAssetCard
                                key={asset.id}
                                asset={asset}
                                onApply={() => handleApplyAsset(asset)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* All Assets */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">All Assets</span>
                    <span className="text-xs text-zinc-500">{filteredAssets.length} results</span>
                </div>

                <div className="space-y-2">
                    {filteredAssets.map((asset) => (
                        <QuickAssetCard
                            key={asset.id}
                            asset={asset}
                            onApply={() => handleApplyAsset(asset)}
                        />
                    ))}
                </div>

                {filteredAssets.length === 0 && (
                    <div className="text-center py-8 text-zinc-500 text-sm">
                        No assets found
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-800">
                <Button variant="outline" className="w-full border-zinc-700 text-zinc-400 hover:bg-zinc-800">
                    Browse Full Marketplace <ChevronRight className="size-4 ml-1" />
                </Button>
            </div>
        </div>
    );
}

export default MarketplaceDrawer;
