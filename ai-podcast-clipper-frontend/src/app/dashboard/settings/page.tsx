"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { useTheme } from "next-themes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Settings as SettingsIcon, User, Bell, Key, Palette } from "lucide-react";
import { Switch } from "~/components/ui/switch";

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4 pb-6 border-b border-border">
                <div className="size-12 rounded-full bg-primary flex items-center justify-center">
                    <SettingsIcon className="size-6 text-primary-foreground" />
                </div>
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        Manage your account settings and preferences.
                    </p>
                </div>
            </div>

            <div className="grid gap-6">
                {/* Profile Settings */}
                <Card className="rounded-none border border-border shadow-sm">
                    <CardHeader className="border-b border-border bg-muted/50">
                        <div className="flex items-center gap-3">
                            <User className="size-5" />
                            <div>
                                <CardTitle>Profile Settings</CardTitle>
                                <CardDescription>Update your personal information</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    placeholder="John Doe"
                                    className="rounded-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="john@example.com"
                                    className="rounded-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Input
                                id="bio"
                                placeholder="Tell us about yourself"
                                className="rounded-none"
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90">
                                Save Changes
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Appearance Settings */}
                <Card className="rounded-none border border-border shadow-sm">
                    <CardHeader className="border-b border-border bg-muted/50">
                        <div className="flex items-center gap-3">
                            <Palette className="size-5" />
                            <div>
                                <CardTitle>Appearance</CardTitle>
                                <CardDescription>Customize how the app looks</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="theme">Theme</Label>
                            <Select value={theme} onValueChange={setTheme}>
                                <SelectTrigger id="theme" className="rounded-none">
                                    <SelectValue placeholder="Select theme" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">Light</SelectItem>
                                    <SelectItem value="dark">Dark</SelectItem>
                                    <SelectItem value="system">System</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-sm text-muted-foreground">
                                Choose your preferred color scheme
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Notification Settings */}
                <Card className="rounded-none border border-border shadow-sm">
                    <CardHeader className="border-b border-border bg-muted/50">
                        <div className="flex items-center gap-3">
                            <Bell className="size-5" />
                            <div>
                                <CardTitle>Notifications</CardTitle>
                                <CardDescription>Manage your notification preferences</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Email Notifications</Label>
                                <p className="text-sm text-muted-foreground">
                                    Receive email updates about your clips
                                </p>
                            </div>
                            <Switch />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Processing Alerts</Label>
                                <p className="text-sm text-muted-foreground">
                                    Get notified when video processing completes
                                </p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Weekly Summary</Label>
                                <p className="text-sm text-muted-foreground">
                                    Receive weekly analytics summary
                                </p>
                            </div>
                            <Switch />
                        </div>
                    </CardContent>
                </Card>

                {/* API Keys */}
                <Card className="rounded-none border border-border shadow-sm">
                    <CardHeader className="border-b border-border bg-muted/50">
                        <div className="flex items-center gap-3">
                            <Key className="size-5" />
                            <div>
                                <CardTitle>API Keys</CardTitle>
                                <CardDescription>Manage your API access</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="api-key">API Key</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="api-key"
                                    value="sk_test_••••••••••••••••"
                                    readOnly
                                    className="rounded-none font-mono"
                                />
                                <Button variant="outline" className="rounded-none">
                                    Copy
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Use this key to access the API
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="rounded-none">
                                Generate New Key
                            </Button>
                            <Button variant="destructive" className="rounded-none">
                                Revoke Key
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="rounded-none border border-destructive shadow-sm">
                    <CardHeader className="border-b border-destructive bg-red-50 dark:bg-red-950/20">
                        <CardTitle className="text-destructive">Danger Zone</CardTitle>
                        <CardDescription>Irreversible and destructive actions</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Delete Account</p>
                                <p className="text-sm text-muted-foreground">
                                    Permanently delete your account and all data
                                </p>
                            </div>
                            <Button variant="destructive" className="rounded-none">
                                Delete Account
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
