"use client";

import { Button } from "~/components/ui/button";
import { FadeIn } from "~/components/animations/fade-in";
import { ArrowRight, FileText, Mail, Twitter, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "~/lib/utils";

const examples = [
    {
        id: "blog",
        title: "SEO Blog Post",
        icon: FileText,
        desc: "2,000 word article with H2s, H3s, and keywords.",
        preview: (
            <div className="bg-card p-6 rounded-lg shadow-sm border border-border flex flex-col gap-4 h-full">
                <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
                <div className="space-y-2">
                    <div className="h-8 w-3/4 bg-foreground rounded" />
                    <div className="h-8 w-1/2 bg-foreground rounded" />
                </div>
                <div className="space-y-2 pt-4 border-t border-border">
                    <div className="h-3 w-full bg-muted rounded" />
                    <div className="h-3 w-full bg-muted rounded" />
                    <div className="h-3 w-2/3 bg-muted rounded" />
                </div>
                <div className="mt-auto pt-2 flex items-center gap-2 text-xs text-green-600 font-bold">
                    <span className="bg-green-100 px-2 py-1 rounded">SEO Score: 98</span>
                    <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded">Reading Time: 8m</span>
                </div>
            </div>
        )
    },
    {
        id: "thread",
        title: "Viral Thread",
        icon: Twitter,
        desc: "10-tweet thread summarizing key insights.",
        preview: (
            <div className="bg-foreground p-6 rounded-lg shadow-sm border border-border flex flex-col gap-4 h-full text-background">
                <div className="flex items-center gap-3">
                    <div className="size-10 bg-muted/20 rounded-full" />
                    <div className="h-4 w-24 bg-muted/20 rounded" />
                </div>
                <div className="space-y-2">
                    <div className="h-4 w-full bg-muted/20 rounded" />
                    <div className="h-4 w-full bg-muted/20 rounded" />
                    <div className="h-4 w-2/3 bg-muted/20 rounded" />
                </div>
                <div className="mt-auto border border-border/20 rounded p-3 bg-muted/10">
                    <div className="h-20 w-full bg-muted/20 rounded flex items-center justify-center text-xs text-muted-foreground">
                        Attached Video Clip
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "newsletter",
        title: "Newsletter",
        icon: Mail,
        desc: "Ready-to-send HTML email for your list.",
        preview: (
            <div className="bg-secondary/20 p-6 rounded-lg shadow-sm border border-border flex flex-col gap-4 h-full font-serif text-foreground">
                <div className="text-center border-b border-border pb-4 mb-2">
                    <div className="h-6 w-32 bg-muted mx-auto rounded" />
                </div>
                <div className="space-y-3">
                    <div className="h-4 w-full bg-muted/50 rounded" />
                    <div className="h-4 w-full bg-muted/50 rounded" />
                    <div className="h-24 w-full bg-background border border-border rounded p-2 italic text-muted-foreground text-xs">
                        "This week's podcast was mind-blowing. We discussed..."
                    </div>
                </div>
                <div className="mt-auto w-full bg-primary text-primary-foreground py-2 rounded text-center text-xs">
                    Read Online
                </div>
            </div>
        )
    }
];

export function ContentShowcase() {
    const [activeTab, setActiveTab] = useState("blog");

    return (
        <section className="py-24 bg-background">
            <FadeIn>
                <div className="container mx-auto max-w-6xl px-6">
                    <div className="flex flex-col md:flex-row items-center gap-16">

                        {/* Left: Text & Tabs */}
                        <div className="flex-1 w-full md:w-1/2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary/20 bg-primary/5 text-primary text-xs font-bold uppercase tracking-wider mb-6">
                                <FileText className="size-3" /> Content Engine
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">One Upload.<br />Every Format.</h2>
                            <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
                                Our LLM doesn't just summarzie. It writes like a human copywriter, adapting tone and structure for each platform.
                            </p>

                            <div className="space-y-2">
                                {examples.map((ex) => (
                                    <button
                                        key={ex.id}
                                        onClick={() => setActiveTab(ex.id)}
                                        className={cn(
                                            "w-full flex items-center justify-between p-6 text-left border transition-all duration-200",
                                            activeTab === ex.id
                                                ? "bg-primary text-primary-foreground border-primary shadow-lg translate-x-2"
                                                : "bg-card text-foreground border-border hover:border-primary/30 hover:bg-muted/50"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <ex.icon className={cn("size-6", activeTab === ex.id ? "text-yellow-400" : "text-gray-400")} />
                                            <div>
                                                <div className="font-bold text-lg">{ex.title}</div>
                                                <div className={cn("text-sm", activeTab === ex.id ? "text-primary-foreground/80" : "text-muted-foreground")}>
                                                    {ex.desc}
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight className={cn("size-5 transition-transform", activeTab === ex.id ? "rotate-0 text-white" : "text-transparent -translate-x-4")} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Right: Preview Area */}
                        <div className="flex-1 w-full md:w-1/2">
                            <div className="relative aspect-[4/5] bg-muted/50 p-8 rounded-3xl border border-border">
                                {/* Window Controls */}
                                <div className="absolute top-4 left-0 right-0 px-8 flex gap-2">
                                    <div className="size-3 rounded-full bg-red-400" />
                                    <div className="size-3 rounded-full bg-yellow-400" />
                                    <div className="size-3 rounded-full bg-green-400" />
                                </div>

                                {/* Content Area */}
                                <div className="mt-8 bg-card h-full w-full rounded-xl shadow-2xl overflow-hidden border border-border relative">
                                    <div className="absolute inset-0 p-8">
                                        {examples.find(e => e.id === activeTab)?.preview}
                                    </div>
                                </div>

                                {/* Decorative elements */}
                                <div className="absolute -right-4 -bottom-4 size-24 bg-yellow-400 rounded-full blur-2xl opacity-20" />
                                <div className="absolute -left-4 -top-4 size-32 bg-purple-400 rounded-full blur-3xl opacity-20" />
                            </div>
                        </div>

                    </div>
                </div>
            </FadeIn>
        </section>
    );
}
