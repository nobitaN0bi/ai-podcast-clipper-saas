"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ModeToggle } from "~/components/mode-toggle";
import { Label } from "~/components/ui/label";
import {
    Upload,
    Image,
    Film,
    Music,
    Type,
    Wand2,
    DollarSign,
    Tag,
    FileText,
    ArrowLeft,
    Check,
    Sparkles,
    AlertCircle,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { toast } from "sonner";

// ============================================================================
// TYPES
// ============================================================================

type AssetType = "effect" | "transition" | "template" | "audio" | "text";

interface UploadFormData {
    title: string;
    description: string;
    type: AssetType;
    price: string;
    isFree: boolean;
    tags: string[];
    file: File | null;
    preview: File | null;
    previewGif: string | null;
}

// ============================================================================
// COMPONENTS
// ============================================================================

const ASSET_TYPES: { id: AssetType; name: string; icon: React.ElementType }[] = [
    { id: "effect", name: "Effect / Filter", icon: Wand2 },
    { id: "transition", name: "Transition", icon: Sparkles },
    { id: "template", name: "Template", icon: Film },
    { id: "audio", name: "Audio / Music", icon: Music },
    { id: "text", name: "Text Style", icon: Type },
];

function AssetTypeSelector({ selected, onSelect }: { selected: AssetType; onSelect: (type: AssetType) => void }) {
    return (
        <div className="grid grid-cols-5 gap-3">
            {ASSET_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = selected === type.id;
                return (
                    <button
                        key={type.id}
                        type="button"
                        onClick={() => onSelect(type.id)}
                        className={cn(
                            "flex flex-col items-center gap-2 p-4 rounded-lg border transition-all",
                            isSelected
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-card text-muted-foreground hover:border-input"
                        )}
                    >
                        <Icon className="size-6" />
                        <span className="text-xs text-center">{type.name}</span>
                    </button>
                );
            })}
        </div>
    );
}

function FileDropzone({
    label,
    accept,
    file,
    onFileSelect
}: {
    label: string;
    accept: string;
    file: File | null;
    onFileSelect: (file: File) => void;
}) {
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) onFileSelect(droppedFile);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) onFileSelect(selectedFile);
    };

    return (
        <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                file ? "border-primary bg-primary/5" : "border-input hover:border-ring"
            )}
        >
            {file ? (
                <div className="flex items-center justify-center gap-3">
                    <Check className="size-5 text-green-500" />
                    <span className="text-foreground">{file.name}</span>
                </div>
            ) : (
                <>
                    <Upload className="size-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-1">{label}</p>
                    <p className="text-xs text-muted-foreground">Drag & drop or click to browse</p>
                </>
            )}
            <input
                type="file"
                accept={accept}
                onChange={handleChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0 }}
            />
        </div>
    );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function UploadAssetPage() {
    const [formData, setFormData] = useState<UploadFormData>({
        title: "",
        description: "",
        type: "effect",
        price: "",
        isFree: false,
        tags: [],
        file: null,
        preview: null,
        previewGif: null,
    });
    const [tagInput, setTagInput] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

    const handleFileSelect = async (file: File) => {
        setFormData((prev) => ({ ...prev, file }));

        // Auto-generate preview if it's a video
        if (file.type.startsWith("video/")) {
            setIsGeneratingPreview(true);
            try {
                // First upload the file to local storage so the backend can access it
                const uploadData = new FormData();
                uploadData.append("file", file);
                const uploadRes = await fetch("/api/local/upload", {
                    method: "POST",
                    body: uploadData,
                });
                const { url, path: serverPath } = await uploadRes.json();

                if (serverPath) {
                    const previewRes = await fetch("/api/local/marketplace/preview", {
                        method: "POST",
                        body: JSON.stringify({
                            assetPath: serverPath,
                            assetType: "video",
                        }),
                        headers: { "Content-Type": "application/json" },
                    });
                    const { thumbnailPath, previewPath } = await previewRes.json();

                    if (thumbnailPath && previewPath) {
                        toast.success("Previews generated!");
                        // In a real app we'd load these blobs properly.
                        // For this local demo we just assume we can fetch them via a local-file-serving endpoint if we had one,
                        // or just rely on the user seeing the toast for verification.
                    }
                }
            } catch (err) {
                console.error(err);
                toast.error("Failed to generate preview");
            } finally {
                setIsGeneratingPreview(false);
            }
        }
    };

    const addTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData((prev) => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
            setTagInput("");
        }
    };

    const removeTag = (tag: string) => {
        setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.file) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsSubmitting(true);

        // Simulate upload
        await new Promise((resolve) => setTimeout(resolve, 2000));

        toast.success("Asset uploaded successfully! It will be reviewed shortly.");
        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="border-b border-border px-8 py-4">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <Link href="/marketplace" className="text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="size-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold">Upload Asset</h1>
                        <p className="text-sm text-muted-foreground">Share your creation with the community</p>
                    </div>
                    <div className="ml-auto">
                        <ModeToggle />
                    </div>
                </div>
            </header>

            {/* Form */}
            <main className="max-w-4xl mx-auto px-8 py-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Asset Type */}
                    <div className="space-y-3">
                        <Label className="text-foreground">Asset Type *</Label>
                        <AssetTypeSelector
                            selected={formData.type}
                            onSelect={(type) => setFormData((prev) => ({ ...prev, type }))}
                        />
                    </div>

                    {/* Title & Description */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-foreground">Title *</Label>
                            <Input
                                id="title"
                                placeholder="e.g., Cinematic Color Grading Pack"
                                value={formData.title}
                                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                                className="bg-background border-input focus:border-primary"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-foreground">Pricing</Label>
                            <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isFree}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, isFree: e.target.checked, price: "" }))}
                                        className="size-4 accent-primary"
                                    />
                                    <span className="text-sm text-muted-foreground">Free</span>
                                </label>
                                {!formData.isFree && (
                                    <div className="relative flex-1">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                        <Input
                                            type="number"
                                            placeholder="29.99"
                                            value={formData.price}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                                            className="pl-9 bg-background border-input focus:border-primary"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-foreground">Description</Label>
                        <textarea
                            id="description"
                            placeholder="Describe your asset, what it includes, and how to use it..."
                            value={formData.description}
                            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                            rows={4}
                            className="w-full px-3 py-2 bg-background border border-input rounded-md focus:border-primary focus:outline-none resize-none"
                        />
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                        <Label className="text-foreground">Tags</Label>
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Add a tag..."
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                                    className="pl-9 bg-background border-input focus:border-primary"
                                />
                            </div>
                            <Button type="button" onClick={addTag} variant="outline" className="border-border">
                                Add
                            </Button>
                        </div>
                        {formData.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {formData.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full flex items-center gap-2"
                                    >
                                        #{tag}
                                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-foreground">×</button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* File Upload */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-foreground">Asset File *</Label>
                            <div className="relative">
                                <FileDropzone
                                    label="Upload your asset file"
                                    accept=".zip,.mp4,.mp3,.json"
                                    file={formData.file}
                                    onFileSelect={handleFileSelect}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-foreground">Preview Image</Label>
                            <div className="relative">
                                <FileDropzone
                                    label="Upload a preview image"
                                    accept="image/*"
                                    file={formData.preview}
                                    onFileSelect={(file) => setFormData((prev) => ({ ...prev, preview: file }))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Guidelines */}
                    <div className="bg-card border border-border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="size-5 text-amber-500 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-foreground mb-1">Submission Guidelines</h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>• All assets will be reviewed before publishing (usually within 24 hours)</li>
                                    <li>• You retain ownership and receive 70% of all sales revenue</li>
                                    <li>• Make sure your asset is original and doesn{"'"}t violate any copyrights</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-3">
                        <Link href="/marketplace">
                            <Button type="button" variant="outline" className="border-border">
                                Cancel
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-primary hover:bg-primary/90 min-w-[160px]"
                        >
                            {isSubmitting ? "Uploading..." : "Submit for Review"}
                        </Button>
                    </div>
                </form>
            </main>
        </div>
    );
}
