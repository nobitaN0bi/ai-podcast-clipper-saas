"use client";

import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Play, MoreHorizontal, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import Image from "next/image";
import { Badge } from "./badge";
import { Button } from "./button";

export interface ProjectCardProps {
    id: string;
    title: string;
    thumbnailUrl?: string;
    status: "queued" | "processing" | "processed" | "failed";
    createdAt: Date;
    clipsCount: number;
}

export function ProjectCard({
    title,
    thumbnailUrl,
    status,
    createdAt,
    clipsCount,
}: ProjectCardProps) {
    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="group relative flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm transition-all hover:border-primary/20 hover:shadow-lg"
        >
            {/* Thumbnail Area */}
            <div className="relative aspect-video w-full overflow-hidden bg-muted/30">
                {thumbnailUrl ? (
                    <Image
                        src={thumbnailUrl}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-secondary/50">
                        <Play className="size-12 opacity-10" />
                    </div>
                )}

                {/* Status indicator pill */}
                <div className="absolute right-3 top-3">
                    {status === "processed" && (
                        <Badge variant="secondary" className="bg-green-500/10 text-green-600 backdrop-blur-md border-green-500/20">
                            <CheckCircle2 className="mr-1 size-3" /> Ready
                        </Badge>
                    )}
                    {status === "processing" && (
                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 backdrop-blur-md border-blue-500/20 animate-pulse">
                            <Clock className="mr-1 size-3" /> Processing
                        </Badge>
                    )}
                    {status === "failed" && (
                        <Badge variant="destructive" className="backdrop-blur-md">
                            <AlertCircle className="mr-1 size-3" /> Failed
                        </Badge>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between">
                    <h3 className="line-clamp-1 font-semibold tracking-tight text-foreground">
                        {title}
                    </h3>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
                        <MoreHorizontal className="size-4" />
                    </Button>
                </div>

                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatDistanceToNow(createdAt, { addSuffix: true })}</span>
                    <span>•</span>
                    <span>{clipsCount} clips</span>
                </div>

                <div className="mt-4 flex items-center gap-2">
                    <Button size="sm" className="w-full bg-primary/5 hover:bg-primary/10 text-primary border-0 shadow-none">
                        View Project
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
