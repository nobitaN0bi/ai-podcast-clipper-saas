"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "~/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Youtube, Instagram, Linkedin, Send } from "lucide-react";
import { toast } from "sonner";

// Mock Schedule Data with specific platforms and status
const MOCK_POSTS = [
    { id: 1, title: "Hormozi: Leverage Strategy", date: 12, platform: "YouTube Shorts", status: "Scheduled", type: "youtube" },
    { id: 2, title: "AI Agent Future Clip", date: 12, platform: "TikTok", status: "Draft", type: "tiktok" },
    { id: 3, title: "SaaS Growth Hack", date: 14, platform: "Instagram Reels", status: "Posted", type: "instagram" },
    { id: 4, title: "Founder Journey Pt. 1", date: 18, platform: "LinkedIn Video", status: "Scheduled", type: "linkedin" },
];

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [posts, setPosts] = useState(MOCK_POSTS);
    const [scheduleOpen, setScheduleOpen] = useState(false);
    const [newPostTitle, setNewPostTitle] = useState("");
    const [newPostPlatform, setNewPostPlatform] = useState("youtube");
    const [newPostDate, setNewPostDate] = useState("");

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();

    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const handlePostAction = (id: number) => {
        toast.success("Post published successfully!");
    };

    const handleSchedulePost = () => {
        if (!newPostTitle || !newPostDate) {
            toast.error("Please fill in all fields");
            return;
        }
        const day = parseInt(newPostDate.split('-')[2] || "1");
        const platformNames: Record<string, string> = {
            youtube: "YouTube Shorts",
            tiktok: "TikTok",
            instagram: "Instagram Reels",
            linkedin: "LinkedIn Video"
        };
        const newPost = {
            id: Date.now(),
            title: newPostTitle,
            date: day,
            platform: platformNames[newPostPlatform] || "YouTube Shorts",
            status: "Scheduled",
            type: newPostPlatform
        };
        setPosts([...posts, newPost]);
        setScheduleOpen(false);
        setNewPostTitle("");
        setNewPostDate("");
        toast.success("Post scheduled successfully!");
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Content Calendar</h1>
                    <p className="text-muted-foreground mt-1">
                        Schedule and track your content across platforms.
                    </p>
                </div>
                <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                            <Plus className="mr-2 size-4" /> Schedule New Post
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Schedule New Post</DialogTitle>
                            <DialogDescription>
                                Add a new post to your content calendar.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={newPostTitle}
                                    onChange={(e) => setNewPostTitle(e.target.value)}
                                    placeholder="Enter post title"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Platform</Label>
                                <Select value={newPostPlatform} onValueChange={setNewPostPlatform}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="youtube">YouTube Shorts</SelectItem>
                                        <SelectItem value="tiktok">TikTok</SelectItem>
                                        <SelectItem value="instagram">Instagram Reels</SelectItem>
                                        <SelectItem value="linkedin">LinkedIn Video</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="date">Schedule Date</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={newPostDate}
                                    onChange={(e) => setNewPostDate(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setScheduleOpen(false)}>Cancel</Button>
                            <Button onClick={handleSchedulePost}>Schedule Post</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Calendar View */}
                <Card className="lg:col-span-3 border-white/10 bg-white/5 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <CalendarIcon className="size-5 text-primary" />
                            {monthName} {year}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={handlePrevMonth} className="size-8">
                                <ChevronLeft className="size-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={handleNextMonth} className="size-8">
                                <ChevronRight className="size-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="grid grid-cols-7 gap-px bg-white/10 text-center text-sm">
                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                                <div key={day} className="bg-background py-3 font-semibold text-muted-foreground">
                                    {day}
                                </div>
                            ))}

                            {/* Empty Days Placeholder */}
                            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                                <div key={`empty-${i}`} className="bg-background/50 h-32" />
                            ))}

                            {/* Days */}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const dayPosts = posts.filter(p => p.date === day);
                                const isToday = day === new Date().getDate() &&
                                    currentDate.getMonth() === new Date().getMonth();

                                return (
                                    <div key={day} className={`bg-background h-32 p-2 border-t border-r border-white/5 relative group transition-colors hover:bg-white/5 ${isToday ? 'bg-primary/5' : ''}`}>
                                        <span className={`absolute top-2 right-2 text-xs font-mono ${isToday ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                                            {day} {isToday && '•'}
                                        </span>

                                        <div className="mt-6 flex flex-col gap-1 overflow-y-auto max-h-[80px] no-scrollbar">
                                            {dayPosts.map(post => (
                                                <div key={post.id} className="p-1.5 rounded bg-white/5 border border-white/10 hover:border-primary/50 cursor-pointer transition-colors group/post">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <div className="flex items-center gap-1">
                                                            {post.type === 'youtube' && <Youtube className="size-3 text-red-500" />}
                                                            {post.type === 'tiktok' && <span className="size-3 flex items-center justify-center text-[8px] font-bold bg-black text-white rounded-full">T</span>}
                                                            {post.type === 'instagram' && <Instagram className="size-3 text-pink-500" />}
                                                            {post.type === 'linkedin' && <Linkedin className="size-3 text-blue-500" />}
                                                            <span className="text-[10px] font-medium truncate max-w-[60px]">{post.platform}</span>
                                                        </div>
                                                        <div className={`size-1.5 rounded-full ${post.status === 'Posted' ? 'bg-green-500' : post.status === 'Scheduled' ? 'bg-yellow-500' : 'bg-gray-500'}`} />
                                                    </div>
                                                    <div className="text-xs font-semibold truncate leading-tight group-hover/post:text-primary">{post.title}</div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Hover Add Button */}
                                        <button className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 p-1 bg-primary text-white rounded hover:bg-primary/90 transition-all">
                                            <Plus className="size-3" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Sidebar Info - Connected Platforms */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Connected Platforms</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <Youtube className="size-4 text-red-500" />
                                    <span>YouTube</span>
                                </div>
                                <span className="text-green-500 text-xs font-medium">Connected</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <Instagram className="size-4 text-pink-500" />
                                    <span>Instagram</span>
                                </div>
                                <Button variant="ghost" size="sm" className="h-6 text-xs text-primary hover:text-primary">Connect</Button>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="bg-black text-white rounded-full size-4 flex items-center justify-center text-[8px] font-bold">T</div>
                                    <span>TikTok</span>
                                </div>
                                <Button variant="ghost" size="sm" className="h-6 text-xs text-primary hover:text-primary">Connect</Button>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <Linkedin className="size-4 text-blue-600" />
                                    <span>LinkedIn</span>
                                </div>
                                <Button variant="ghost" size="sm" className="h-6 text-xs text-primary hover:text-primary">Connect</Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Track Video Link */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Track Video Link</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-xs text-muted-foreground">
                                Paste your published video URL to track engagement metrics.
                            </p>
                            <Input
                                placeholder="https://instagram.com/reel/..."
                                className="text-xs"
                            />
                            <Button size="sm" className="w-full" variant="outline">
                                Add to Dashboard
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Send className="size-4" /> Next Up
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-medium">Hormozi: Leverage Strategy</div>
                            <div className="text-xs text-muted-foreground mb-4">Scheduled for Today, 2:00 PM</div>
                            <Button size="sm" className="w-full" onClick={() => handlePostAction(1)}>
                                Publish Now
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
