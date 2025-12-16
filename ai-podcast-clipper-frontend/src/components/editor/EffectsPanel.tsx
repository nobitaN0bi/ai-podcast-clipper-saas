"use client";

import { useState } from "react";
import { useEditorStore } from "~/stores/editor-store";
import { cn } from "~/lib/utils";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
    Sparkles,
    Palette,
    Type,
    Volume2,
    Shuffle,
    Film,
    Wand2,
    Sun,
    Contrast,
    Droplets,
} from "lucide-react";

// ============================================================================
// EFFECT DEFINITIONS
// ============================================================================

interface EffectDef {
    id: string;
    name: string;
    icon: React.ElementType;
    category: "filter" | "transition" | "text" | "audio";
}

const FILTERS: EffectDef[] = [
    { id: "brightness", name: "Brightness", icon: Sun, category: "filter" },
    { id: "contrast", name: "Contrast", icon: Contrast, category: "filter" },
    { id: "saturation", name: "Saturation", icon: Droplets, category: "filter" },
    { id: "vintage", name: "Vintage", icon: Film, category: "filter" },
    { id: "noir", name: "Noir", icon: Sparkles, category: "filter" },
    { id: "cinematic", name: "Cinematic", icon: Wand2, category: "filter" },
];

const TRANSITIONS: EffectDef[] = [
    { id: "dissolve", name: "Dissolve", icon: Shuffle, category: "transition" },
    { id: "fade", name: "Fade", icon: Sparkles, category: "transition" },
    { id: "wipe", name: "Wipe", icon: Sparkles, category: "transition" },
    { id: "slide", name: "Slide", icon: Sparkles, category: "transition" },
];

const TEXT_STYLES: EffectDef[] = [
    { id: "lower-third", name: "Lower Third", icon: Type, category: "text" },
    { id: "kinetic", name: "Kinetic", icon: Sparkles, category: "text" },
    { id: "viral-caption", name: "Viral Caption", icon: Sparkles, category: "text" },
];

// ============================================================================
// COMPONENTS
// ============================================================================

function EffectCard({ effect, onApply, isApplied }: { effect: EffectDef; onApply: () => void; isApplied?: boolean }) {
    const Icon = effect.icon;

    return (
        <button
            onClick={onApply}
            className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-lg transition-colors group",
                isApplied
                    ? "bg-purple-600/30 border border-purple-500/50"
                    : "bg-zinc-800/50 hover:bg-zinc-700"
            )}
        >
            <div className={cn(
                "size-10 rounded-lg flex items-center justify-center transition-colors",
                isApplied ? "bg-purple-600" : "bg-zinc-700 group-hover:bg-zinc-600"
            )}>
                <Icon className={cn("size-5", isApplied ? "text-white" : "text-zinc-300 group-hover:text-white")} />
            </div>
            <span className={cn("text-xs", isApplied ? "text-purple-300" : "text-zinc-400 group-hover:text-white")}>
                {effect.name}
            </span>
        </button>
    );
}

function EffectSection({
    title,
    effects,
    onApplyEffect,
    appliedEffects
}: {
    title: string;
    effects: EffectDef[];
    onApplyEffect: (effectDef: EffectDef) => void;
    appliedEffects: string[];
}) {
    return (
        <div className="space-y-3">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{title}</h3>
            <div className="grid grid-cols-3 gap-2">
                {effects.map((effect) => (
                    <EffectCard
                        key={effect.id}
                        effect={effect}
                        onApply={() => onApplyEffect(effect)}
                        isApplied={appliedEffects.includes(effect.id)}
                    />
                ))}
            </div>
        </div>
    );
}

// ============================================================================
// MAIN PANEL
// ============================================================================

type Tab = "filters" | "transitions" | "text" | "audio";

export function EffectsPanel() {
    const [activeTab, setActiveTab] = useState<Tab>("filters");
    const { selectedClipId, applyEffect, project } = useEditorStore();

    // Get the selected clip's applied effects
    const selectedClip = project?.tracks
        .flatMap(t => t.clips)
        .find(c => c.id === selectedClipId);

    const appliedEffects = selectedClip?.effects?.map(e => e.id) ?? [];

    // Handler to apply effect to selected clip
    const handleApplyEffect = (effectDef: EffectDef) => {
        if (!selectedClipId) return;

        const effect = {
            id: effectDef.id,
            name: effectDef.name,
            type: effectDef.category,
            parameters: {} as Record<string, number | string | boolean>,
        };

        applyEffect(selectedClipId, effect);

        // Show success toast
        import('sonner').then(({ toast }) => {
            toast.success(`Applied ${effectDef.name}`, {
                description: `Effect added to clip`,
            });
        });
    };

    const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
        { id: "filters", label: "Filters", icon: Palette },
        { id: "transitions", label: "Transitions", icon: Shuffle },
        { id: "text", label: "Text", icon: Type },
        { id: "audio", label: "Audio", icon: Volume2 },
    ];

    return (
        <div className="w-72 bg-zinc-900 border-l border-zinc-800 flex flex-col">
            {/* Header */}
            <div className="h-12 flex items-center px-4 border-b border-zinc-800">
                <Sparkles className="size-4 text-purple-400 mr-2" />
                <span className="font-semibold text-sm text-white">Effects</span>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-zinc-800">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex-1 py-2 text-xs transition-colors flex items-center justify-center gap-1",
                                activeTab === tab.id
                                    ? "text-white border-b-2 border-purple-500"
                                    : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            <Icon className="size-3" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {!selectedClipId && (
                    <div className="text-center py-8 text-zinc-500 text-sm">
                        Select a clip to apply effects
                    </div>
                )}

                {selectedClipId && activeTab === "filters" && (
                    <EffectSection
                        title="Color Grading"
                        effects={FILTERS}
                        onApplyEffect={handleApplyEffect}
                        appliedEffects={appliedEffects}
                    />
                )}

                {selectedClipId && activeTab === "transitions" && (
                    <EffectSection
                        title="Transitions"
                        effects={TRANSITIONS}
                        onApplyEffect={handleApplyEffect}
                        appliedEffects={appliedEffects}
                    />
                )}

                {selectedClipId && activeTab === "text" && (
                    <EffectSection
                        title="Text Styles"
                        effects={TEXT_STYLES}
                        onApplyEffect={handleApplyEffect}
                        appliedEffects={appliedEffects}
                    />
                )}

                {selectedClipId && activeTab === "audio" && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs text-zinc-500">Volume</label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                defaultValue="100"
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-zinc-500">Fade In (s)</label>
                            <Input type="number" defaultValue="0" className="h-8 bg-zinc-800 border-zinc-700" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-zinc-500">Fade Out (s)</label>
                            <Input type="number" defaultValue="0" className="h-8 bg-zinc-800 border-zinc-700" />
                        </div>
                    </div>
                )}
            </div>

            {/* Apply Button */}
            {selectedClipId && (
                <div className="p-4 border-t border-zinc-800">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                        <Wand2 className="size-4 mr-2" />
                        Apply Effects
                    </Button>
                </div>
            )}
        </div>
    );
}

export default EffectsPanel;
