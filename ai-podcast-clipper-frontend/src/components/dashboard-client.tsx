"use client";

import Dropzone, { type DropzoneState } from "shadcn-dropzone";
import type { Clip } from "@prisma/client";
import Link from "next/link";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Loader2, UploadCloud, Video, LayoutDashboard, Settings, LogOut, Scissors } from "lucide-react";
import { useState } from "react";
import { generateUploadUrl } from "~/actions/s3";
import { toast } from "sonner";
import { processVideo } from "~/actions/generation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { useRouter } from "next/navigation";
import { ClipDisplay } from "./clip-display";
import { signOut } from "next-auth/react";
import { ModeToggle } from "./mode-toggle";

export function DashboardClient({
  uploadedFiles,
  clips,
}: {
  uploadedFiles: {
    id: string;
    s3Key: string;
    filename: string;
    status: string;
    clipsCount: number;
    createdAt: Date;
  }[];
  clips: Clip[];
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const handleRefresh = async () => {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 600);
  };

  const handleDrop = (acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    const file = files[0]!;
    setUploading(true);

    try {
      const { success, signedUrl, uploadedFileId } = await generateUploadUrl({
        filename: file.name,
        contentType: file.type,
      });

      if (!success) throw new Error("Failed to get upload URL");

      const uploadResponse = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok)
        throw new Error(`Upload filed with status: ${uploadResponse.status}`);

      await processVideo(uploadedFileId);

      setFiles([]);

      toast.success("Video uploaded successfully", {
        description:
          "Your video has been scheduled for processing. Check the status below.",
        duration: 5000,
      });
    } catch (error) {
      toast.error("Upload failed", {
        description:
          "There was a problem uploading your video. Please try again.",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-white/10 bg-sidebar p-6 md:flex">
        <div className="flex items-center gap-2 mb-8">
          <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Scissors className="size-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Podcast<span className="text-primary">Clipper</span></span>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <Button variant="ghost" className="justify-start gap-2" asChild>
            <Link href="/dashboard"><LayoutDashboard className="size-4" /> Dashboard</Link>
          </Button>
          <Button variant="ghost" className="justify-start gap-2" asChild>
            <Link href="/dashboard/my-clips"><Video className="size-4" /> My Clips</Link>
          </Button>
          <Button variant="ghost" className="justify-start gap-2" asChild>
            <Link href="/dashboard/settings"><Settings className="size-4" /> Settings</Link>
          </Button>
        </nav>

        <div className="mt-auto flex flex-col gap-2">
          <div className="px-4">
            <ModeToggle />
          </div>
          <Button variant="ghost" className="justify-start gap-2 text-muted-foreground hover:text-destructive w-full" onClick={() => signOut()}>
            <LogOut className="size-4" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Manage your uploads and generated clips.
              </p>
            </div>
            <Link href="/dashboard/billing">
              <Button className="shadow-lg shadow-primary/20">Buy Credits</Button>
            </Link>
          </div>

          <Tabs defaultValue="upload" className="space-y-6">
            <TabsList className="bg-white/5 border border-white/10 p-1">
              <TabsTrigger value="upload" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Upload</TabsTrigger>
              <TabsTrigger value="my-clips" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">My Clips</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6">
              <Card className="border-dashed border-2 border-white/10 bg-white/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Upload Podcast</CardTitle>
                  <CardDescription>
                    Drag and drop your MP4 file here to start clipping.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Dropzone
                    onDrop={handleDrop}
                    accept={{ "video/mp4": [".mp4"] }}
                    maxSize={500 * 1024 * 1024}
                    disabled={uploading}
                    maxFiles={1}
                  >
                    {(dropzone: DropzoneState) => (
                      <div className="flex flex-col items-center justify-center space-y-4 rounded-xl border border-dashed border-white/20 bg-black/20 p-10 text-center transition-colors hover:bg-black/30 hover:border-primary/50">
                        <div className="size-16 rounded-full bg-white/5 flex items-center justify-center">
                          <UploadCloud className="text-primary h-8 w-8" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium text-lg">Drag and drop your file</p>
                          <p className="text-muted-foreground text-sm">
                            or click to browse (MP4 up to 500MB)
                          </p>
                        </div>
                        <Button
                          className="cursor-pointer mt-4"
                          variant="outline"
                          disabled={uploading}
                        >
                          Select File
                        </Button>
                      </div>
                    )}
                  </Dropzone>

                  <div className="mt-6 flex items-center justify-between">
                    <div>
                      {files.length > 0 && (
                        <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-2">
                          <Video className="size-4 text-primary" />
                          <div className="text-sm">
                            <p className="font-medium">{files[0]?.name}</p>
                            <p className="text-xs text-muted-foreground">{(files[0]?.size ?? 0 / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <Button
                      disabled={files.length === 0 || uploading}
                      onClick={handleUpload}
                      size="lg"
                      className="shadow-lg shadow-primary/20"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        "Generate Clips"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {uploadedFiles.length > 0 && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Recent Uploads</CardTitle>
                      <CardDescription>Track the status of your processed videos.</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRefresh}
                      disabled={refreshing}
                    >
                      {refreshing && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Refresh
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border border-white/10">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-white/5 border-white/10">
                            <TableHead>File</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Clips</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {uploadedFiles.map((item) => (
                            <TableRow key={item.id} className="hover:bg-white/5 border-white/10">
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <Video className="size-4 text-muted-foreground" />
                                  {item.filename}
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                {item.status === "queued" && <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Queued</Badge>}
                                {item.status === "processing" && <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Processing</Badge>}
                                {item.status === "processed" && <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">Processed</Badge>}
                                {item.status === "failed" && <Badge variant="destructive">Failed</Badge>}
                              </TableCell>
                              <TableCell className="text-right">
                                {item.clipsCount > 0 ? (
                                  <Badge variant="outline" className="border-primary/20 text-primary">{item.clipsCount} clips</Badge>
                                ) : (
                                  <span className="text-muted-foreground text-sm">-</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="my-clips">
              <Card>
                <CardHeader>
                  <CardTitle>My Clips</CardTitle>
                  <CardDescription>
                    Your library of AI-generated viral clips.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ClipDisplay clips={clips} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
