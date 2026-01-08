"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scissors, ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";

import { ModeToggle } from "~/components/mode-toggle";

export function Navbar() {
    const pathname = usePathname();
    const isHome = pathname === "/";

    const getLink = (hash: string) => {
        return isHome ? hash : `/${hash}`;
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md transition-colors">
            <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="size-8 bg-black dark:bg-white flex items-center justify-center transition-transform group-hover:rotate-12">
                        <Scissors className="size-4 text-white dark:text-black" />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-foreground">ClipFlow</span>
                </Link>

                <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
                    <Link href={getLink("#features")} className="text-muted-foreground hover:text-foreground transition-colors">Features</Link>
                    <Link href={getLink("#how-it-works")} className="text-muted-foreground hover:text-foreground transition-colors">How it Works</Link>
                    <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
                    <Link href="/marketplace" className="text-muted-foreground hover:text-foreground transition-colors">Marketplace</Link>
                    <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
                </nav>

                <div className="flex items-center gap-4">
                    <Link href="/login" className="text-sm font-medium hover:text-primary/80 transition-colors">Log in</Link>
                    <ModeToggle />
                    <Button asChild className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90">
                        <Link href="/signup">Get Started <ArrowRight className="ml-2 size-4" /></Link>
                    </Button>
                </div>
            </div>
        </header>
    );
}
