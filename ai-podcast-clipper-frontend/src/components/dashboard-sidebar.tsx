"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
    LayoutDashboard,
    Video,
    Calendar as CalendarIcon,
    Settings,
    LogOut,
    Sparkles,
    ChevronLeft,
    ChevronRight,
    FolderOpen
} from "lucide-react";
import { signOut } from "next-auth/react";
import { ModeToggle } from "./mode-toggle";
import { cn } from "~/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./ui/tooltip";

const SIDEBAR_ITEMS = [
    {
        label: "Dashboard",
        description: "Projects & Analytics",
        href: "/dashboard",
        icon: LayoutDashboard
    },
    {
        label: "Edit Video",
        description: "AI Clip Generator",
        href: "/dashboard/editor",
        icon: Sparkles
    },
    {
        label: "Assets Library",
        description: "Templates & Media",
        href: "/dashboard/knowledge",
        icon: FolderOpen
    },
    {
        label: "My Clips",
        description: "Generated Content",
        href: "/dashboard/my-clips",
        icon: Video
    },
    {
        label: "Calendar",
        description: "Schedule & Publish",
        href: "/dashboard/calendar",
        icon: CalendarIcon
    },
    {
        label: "Settings",
        description: "Account & Billing",
        href: "/dashboard/settings",
        icon: Settings
    },
];

export function DashboardSidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Persist collapse state in localStorage
    useEffect(() => {
        const saved = localStorage.getItem("sidebar-collapsed");
        if (saved !== null) {
            setIsCollapsed(JSON.parse(saved));
        }
    }, []);

    const toggleCollapse = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem("sidebar-collapsed", JSON.stringify(newState));
    };

    return (
        <TooltipProvider delayDuration={0}>
            <aside
                className={cn(
                    "fixed left-0 top-16 z-30 hidden h-[calc(100vh-4rem)] flex-col bg-white dark:bg-zinc-950 text-sidebar-foreground transition-all duration-300 ease-in-out md:flex border-r border-sidebar-border",
                    isCollapsed ? "w-16" : "w-64"
                )}
            >
                <div className="flex h-full flex-col gap-2 p-3">
                    {/* Header with Collapse Toggle */}
                    <div className="flex items-center justify-between mb-2 px-1 py-2">
                        <AnimatePresence mode="wait">
                            {!isCollapsed && (
                                <motion.p
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
                                >
                                    Menu
                                </motion.p>
                            )}
                        </AnimatePresence>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleCollapse}
                            className={cn(
                                "size-7 rounded-md hover:bg-accent",
                                isCollapsed && "mx-auto"
                            )}
                        >
                            {isCollapsed ? (
                                <ChevronRight className="size-4" />
                            ) : (
                                <ChevronLeft className="size-4" />
                            )}
                        </Button>
                    </div>

                    <nav className="flex flex-1 flex-col gap-1">
                        {SIDEBAR_ITEMS.map((item) => {
                            const isActive = pathname === item.href ||
                                (item.href !== "/dashboard" && pathname.startsWith(item.href));

                            const linkContent = (
                                <Link key={item.href} href={item.href} className="relative group block">
                                    <div
                                        className={cn(
                                            "relative flex items-center gap-3 rounded-md px-3 py-2.5 transition-all duration-200",
                                            isCollapsed && "justify-center px-2",
                                            isActive
                                                ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                                                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                                        )}
                                    >
                                        <item.icon
                                            className={cn(
                                                "size-5 shrink-0 transition-colors",
                                                isActive
                                                    ? "text-white dark:text-zinc-900"
                                                    : "text-muted-foreground group-hover:text-foreground"
                                            )}
                                        />
                                        <AnimatePresence mode="wait">
                                            {!isCollapsed && (
                                                <motion.div
                                                    initial={{ opacity: 0, width: 0 }}
                                                    animate={{ opacity: 1, width: "auto" }}
                                                    exit={{ opacity: 0, width: 0 }}
                                                    className="flex flex-col overflow-hidden"
                                                >
                                                    <span className={cn(
                                                        "text-sm font-medium whitespace-nowrap",
                                                        isActive && "font-semibold"
                                                    )}>
                                                        {item.label}
                                                    </span>
                                                    <span className={cn(
                                                        "text-[10px] whitespace-nowrap",
                                                        isActive
                                                            ? "text-white/70 dark:text-zinc-900/70"
                                                            : "text-muted-foreground opacity-70"
                                                    )}>
                                                        → {item.description}
                                                    </span>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </Link>
                            );

                            // Wrap in tooltip when collapsed
                            if (isCollapsed) {
                                return (
                                    <Tooltip key={item.href}>
                                        <TooltipTrigger asChild>
                                            {linkContent}
                                        </TooltipTrigger>
                                        <TooltipContent side="right" sideOffset={10}>
                                            <p className="font-medium">{item.label}</p>
                                            <p className="text-xs text-muted-foreground">→ {item.description}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                );
                            }

                            return linkContent;
                        })}
                    </nav>

                    <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-sidebar-border">
                        <div className={cn(
                            "flex items-center px-2 py-2",
                            isCollapsed ? "justify-center" : "justify-between"
                        )}>
                            {!isCollapsed && (
                                <span className="text-xs font-medium text-muted-foreground">Theme</span>
                            )}
                            <ModeToggle />
                        </div>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "gap-3 rounded-md h-10 text-muted-foreground hover:text-destructive hover:bg-red-50 dark:hover:bg-red-950/20 w-full",
                                        isCollapsed ? "justify-center px-2" : "justify-start"
                                    )}
                                    onClick={() => signOut()}
                                >
                                    <LogOut className="size-4 shrink-0" />
                                    {!isCollapsed && <span>Sign Out</span>}
                                </Button>
                            </TooltipTrigger>
                            {isCollapsed && (
                                <TooltipContent side="right" sideOffset={10}>
                                    <p className="font-medium">Sign Out</p>
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </div>
                </div>
            </aside>
        </TooltipProvider>
    );
}

