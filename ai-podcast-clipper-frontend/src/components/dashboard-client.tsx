"use client";

import { useState, useEffect } from "react";
import Dropzone, { type DropzoneState } from "shadcn-dropzone";
import type { Clip } from "@prisma/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Loader2,
  UploadCloud,
  Video,
  Plus,
  Sparkles,
  Search,
  Filter,
  WifiOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { generateUploadUrl } from "~/actions/s3";
import { processVideo } from "~/actions/generation";
import { config } from "~/lib/offline-config";
import { useLocalProcess, useLocalUpload } from "~/hooks/use-offline";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ProjectCard } from "./ui/project-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

export function DashboardClient({
  uploadedFiles,
  clips,
}: {
  uploadedFiles: any[];
  clips: any[];
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOffline, setIsOffline] = useState(false);

  const router = useRouter();

  // Offline hooks
  const { upload: localUpload } = useLocalUpload();
  const { process: localProcess } = useLocalProcess();

  useEffect(() => {
    setIsOffline(config.isOfflineMode);
  }, []);

  const handleDrop = (acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    const file = files[0]!;
    setUploading(true);
    setUploadProgress(0);

    try {
      if (isOffline) {
        // OFFLINE MODE UPLOAD
        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 10, 90));
        }, 300);

        const result = await localUpload(file);

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (result.success) {
          toast.success("File Saved Locally", {
            description: `Saved to ${result.path}`,
          });
          // Redirect to offline editor with this file
          // In a real app we'd pass the path, for now just go to editor
          setTimeout(() => router.push('/dashboard/editor'), 1000);
        }

      } else {
        // ONLINE MODE UPLOAD (S3)
        const { success, signedUrl, uploadedFileId } = await generateUploadUrl({
          filename: file.name,
          contentType: file.type,
        });

        if (!success) throw new Error("Failed to get upload URL");

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", signedUrl, true);
          xhr.setRequestHeader("Content-Type", file.type);

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const percentComplete = (e.loaded / e.total) * 100;
              setUploadProgress(percentComplete);
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`Upload failed with status: ${xhr.status}`));
            }
          };

          xhr.onerror = () => reject(new Error("Network Error"));
          xhr.send(file);
        });

        await processVideo(uploadedFileId);

        toast.success("Project Created", {
          description: "Your video is now processing. It will appear on your dashboard momentarily.",
          duration: 5000,
        });

        router.refresh();
      }

      setFiles([]);
      setUploadProgress(100);
      setIsUploadOpen(false); // Close modal on success

    } catch (error) {
      console.error("Upload Error:", error);
      toast.error("Upload failed", {
        description: "Please check your connection and try again.",
      });
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const filteredProjects = uploadedFiles.filter(f =>
    f.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header Section */}
      {/* Stats Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Same stats cards, simplified for brevity in verification */}
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Total Views</h3>
            <Video className="size-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">--</div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Clips Created</h3>
            <Sparkles className="size-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{clips?.length || 0}</div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Total Revenue</h3>
            <span className="text-muted-foreground text-xs">$</span>
          </div>
          <div className="text-2xl font-bold text-green-600">$0.00</div>
          <p className="text-xs text-muted-foreground mt-1">From all sources</p>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6 border-primary/20 bg-primary/5">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Marketplace Earnings</h3>
            <Sparkles className="size-4 text-primary" />
          </div>
          <div className="text-2xl font-bold">$0.00</div>
          <p className="text-xs text-muted-foreground mt-1">From template sales</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Recent Projects</h2>
          <p className="text-muted-foreground">
            {isOffline ? "Manage your local video projects." : "Track the status of your cloud projects."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isOffline && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-xs font-bold mr-2">
              <WifiOff className="size-3" />
              OFFLINE
            </div>
          )}
          <Link href="/dashboard/editor">
            <Button variant="outline" className="border-primary/20 hover:bg-primary/10 hover:border-primary">
              <Video className="mr-2 size-4" />
              Open Editor
            </Button>
          </Link>
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="mr-2 size-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl p-0 overflow-hidden border-none bg-background/90 backdrop-blur-xl text-foreground">
              <div className="p-6">
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-2xl font-bold">
                    {isOffline ? "Import Local Video" : "Upload Source Video"}
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    {isOffline
                      ? "Select a video from your computer to edit locally. No upload required."
                      : "Drag and drop your podcast episode or video file. AI analysis starts automatically."
                    }
                  </DialogDescription>
                </DialogHeader>

                <div className="relative">
                  {!uploading ? (
                    <Dropzone
                      onDrop={handleDrop}
                      accept={{ "video/mp4": [".mp4", ".mov"] }}
                      maxSize={2000 * 1024 * 1024} // 2GB
                      disabled={uploading}
                      maxFiles={1}
                    >
                      {(dropzone: DropzoneState) => (
                        <div className="group flex flex-col items-center justify-center space-y-4 rounded-xl border-2 border-dashed border-border bg-muted/50 p-12 text-center transition-all hover:bg-muted hover:border-primary cursor-pointer">
                          <div className="size-16 rounded-full bg-muted flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                            <UploadCloud className="text-muted-foreground h-8 w-8 group-hover:text-primary transition-colors" />
                          </div>

                          <div className="space-y-1">
                            {files.length > 0 ? (
                              <p className="font-medium text-lg text-foreground">{files[0]?.name}</p>
                            ) : (
                              <p className="font-medium text-lg text-muted-foreground">
                                {isOffline ? "Click to select video" : "Drag video file here"}
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground">MP4/MOV supported</p>
                          </div>
                        </div>
                      )}
                    </Dropzone>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-12 space-y-6">
                      <div className="relative size-24">
                        <Loader2 className="size-24 text-primary animate-spin" />
                      </div>
                      <p className="text-muted-foreground animate-pulse">
                        {isOffline ? "Importing to local workspace..." : "Uploading to secure storage..."}
                      </p>
                    </div>
                  )}

                  {files.length > 0 && !uploading && (
                    <div className="mt-6 flex justify-end">
                      <Button
                        onClick={handleUpload}
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                        size="lg"
                      >
                        {isOffline ? "Start Editing" : "Start Processing"} <Sparkles className="ml-2 size-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              title={project.filename}
              status={project.status as any}
              createdAt={project.createdAt}
              clipsCount={project.clipsCount}
              thumbnailUrl={undefined}
            />
          ))}
        </AnimatePresence>

        {filteredProjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full py-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-border/50 rounded-xl bg-muted/20"
          >
            <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Video className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No recent projects</h3>
            <p className="text-muted-foreground mt-1 mb-6 max-w-sm">
              {isOffline ? "Import a local video to start editing." : "Upload your first video to get started with AI-powered clipping."}
            </p>
            <Button onClick={() => setIsUploadOpen(true)}>
              {isOffline ? "Import Video" : "Create Project"}
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
