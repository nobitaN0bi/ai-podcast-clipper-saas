"use client";

import { cn } from "~/lib/utils";
import { FadeIn } from "~/components/animations/fade-in";
import { Star } from "lucide-react";

import { reviews, type Review } from "~/lib/marketing-data";
import { useState } from "react";

export function WallOfLove() {
    return (
        <section className="py-24 bg-gradient-to-b from-background to-muted/30 overflow-hidden">
            <FadeIn>
                <div className="container mx-auto max-w-5xl text-center mb-16 px-6">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Wall of Love</h2>
                    <p className="text-xl text-muted-foreground">Join 10,000+ creators who trust ClipFlow.</p>
                </div>
            </FadeIn>

            <div className="relative flex w-full flex-col items-center justify-center overflow-hidden gap-8">
                {/* Marquee Gradient Masks */}
                <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-background to-transparent" />
                <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-background to-transparent" />

                {/* Marquee Track 1 (Right to Left + Waver) */}
                <div className="group flex w-full overflow-hidden whitespace-nowrap py-4 [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)] animate-waver">
                    <div className="animate-marquee-infinite flex w-max gap-8 px-4 group-hover:[animation-play-state:paused] min-w-full">
                        {[...reviews, ...reviews].map((review, i) => (
                            <ReviewCard key={i} review={review} />
                        ))}
                    </div>
                </div>

                {/* Marquee Track 2 (Right to Left + Delayed Waver) */}
                <div className="group flex w-full overflow-hidden whitespace-nowrap py-4 [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)] animate-waver-delayed">
                    <div className="animate-marquee-infinite flex w-max gap-8 px-4 group-hover:[animation-play-state:paused] min-w-full">
                        {[...reviews].slice(3).concat([...reviews].slice(0, 3)).concat([...reviews].slice(3).concat([...reviews].slice(0, 3))).map((review, i) => (
                            <ReviewCard key={i} review={review} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function ReviewCard({ review }: { review: Review }) {
    const [clicked, setClicked] = useState(false);

    return (
        <div
            onClick={() => {
                setClicked(true);
                setTimeout(() => setClicked(false), 300);
            }}
            className={cn(
                "relative w-[350px] md:w-[450px] shrink-0 rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 cursor-pointer overflow-hidden",
                "hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 hover:rotate-1",
                clicked && "scale-95 ring-2 ring-primary/10"
            )}
        >
            {/* Click Ripple Effect */}
            {clicked && (
                <div className="absolute inset-0 bg-primary/5 animate-pulse rounded-xl" />
            )}

            <div className="flex gap-1 mb-4 text-yellow-400">
                {[...Array(review.stars)].map((_, i) => (
                    <Star key={i} className="size-4 fill-current" />
                ))}
            </div>
            <p className="mb-6 text-muted-foreground leading-relaxed text-sm text-wrap text-balance">"{review.content}"</p>
            <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs ring-2 ring-background shadow-sm">
                    {review.avatar}
                </div>
                <div>
                    <div className="font-bold text-sm text-foreground">{review.name}</div>
                    <div className="text-xs text-muted-foreground font-medium">{review.role}</div>
                </div>
            </div>
        </div>
    );
}

