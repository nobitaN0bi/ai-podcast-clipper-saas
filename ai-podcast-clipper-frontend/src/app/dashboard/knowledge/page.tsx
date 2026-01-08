"use client";

import { useState, useCallback } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { toast } from "sonner";
import {
    Search,
    Upload,
    Image,
    Music,
    Type,
    Palette,
    FolderOpen,
    Trash2,
    MoreVertical,
    Plus,
    FileVideo,
    Download,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

type AssetCategory = "brand" | "audio" | "captions" | "overlays";

interface Asset {
    id: string;
    name: string;
    category: AssetCategory;
    type: string;
    size: number;
    url: string;
    thumbnailUrl?: string;
    createdAt: Date;
}

// ============================================================================
// MOCK DATA (In production, this would come from DB/API)
// ============================================================================

const MOCK_ASSETS: Asset[] = [
    {
        id: "1",
        name: "Logo Light.png",
        category: "brand",
        type: "image/png",
        size: 24500,
        url: "/assets/logo-light.png",
        thumbnailUrl: "/assets/logo-light.png",
        createdAt: new Date(),
    },
    {
        id: "2",
        name: "Intro Music.mp3",
        category: "audio",
        type: "audio/mpeg",
        size: 1250000,
        url: "/assets/intro.mp3",
        createdAt: new Date(),
    },
];

// ============================================================================
// CATEGORY CARDS
// ============================================================================

const CATEGORIES: { id: AssetCategory; name: string; icon: React.ElementType; description: string; accept: string }[] = [
    { id: "brand", name: "Brand Assets", icon: Image, description: "Logos, watermarks, profile images", accept: "image/*" },
    { id: "audio", name: "Audio Library", icon: Music, description: "Intros, outros, background music", accept: "audio/*" },
    { id: "captions", name: "Caption Styles", icon: Type, description: "Pre-made caption templates", accept: ".json" },
    { id: "overlays", name: "Overlays", icon: Palette, description: "Graphics, lower thirds, end screens", accept: "image/*,video/*" },
];

function CategoryCard({
    category,
    count,
    isSelected,
    onClick,
}: {
    category: typeof CATEGORIES[0];
    count: number;
    isSelected: boolean;
    onClick: () => void;
}) {
    const Icon = category.icon;

    return (
        <button
            onClick={onClick}
            className={cn(
                "rounded-xl border p-6 flex flex-col items-center text-center gap-4 transition-all",
                isSelected
                    ? "bg-primary/10 border-primary text-primary shadow-lg scale-[1.02]"
                    : "bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground"
            )}
        >
            <div className={cn(
                "p-4 rounded-full transition-colors",
                isSelected ? "bg-primary/20" : "bg-muted"
            )}>
                <Icon className={cn("size-8", isSelected ? "text-primary" : "text-muted-foreground")} />
            </div>
            <div>
                <h3 className="font-semibold">{category.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    {count} {count === 1 ? "asset" : "assets"}
                </p>
            </div>
        </button>
    );
}

// ============================================================================
// ASSET ITEM
// ============================================================================

function AssetItem({ asset, onDelete }: { asset: Asset; onDelete: (id: string) => void }) {
    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const getIcon = () => {
        if (asset.type.startsWith("image")) return Image;
        if (asset.type.startsWith("audio")) return Music;
        if (asset.type.startsWith("video")) return FileVideo;
        return FolderOpen;
    };

    const Icon = getIcon();

    return (
        <div className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border hover:bg-accent/50 transition-colors group">
            {/* Thumbnail or Icon */}
            <div className="size-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                {asset.thumbnailUrl ? (
                    <img src={asset.thumbnailUrl} alt={asset.name} className="size-full object-cover" />
                ) : (
                    <Icon className="size-6 text-muted-foreground" />
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{asset.name}</p>
                <p className="text-sm text-muted-foreground">{formatSize(asset.size)}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" asChild>
                    <a href={asset.url} download>
                        <Download className="size-4" />
                    </a>
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(asset.id)}
                    className="text-destructive hover:text-destructive"
                >
                    <Trash2 className="size-4" />
                </Button>
            </div>
        </div>
    );
}

// ============================================================================
// UPLOAD ZONE
// ============================================================================

function UploadZone({
    category,
    onUpload,
}: {
    category: typeof CATEGORIES[0];
    onUpload: (files: FileList) => void;
}) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files.length > 0) {
            onUpload(e.dataTransfer.files);
        }
    }, [onUpload]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onUpload(e.target.files);
        }
    }, [onUpload]);

    return (
        <div
            className={cn(
                "relative rounded-xl border-2 border-dashed p-8 text-center transition-all",
                isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground"
            )}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
        >
            <input
                type="file"
                accept={category.accept}
                multiple
                onChange={handleChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Upload className={cn("size-10 mx-auto mb-4", isDragging ? "text-primary" : "text-muted-foreground")} />
            <p className="font-medium text-foreground">Drop files here or click to upload</p>
            <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
        </div>
    );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function AssetsLibraryPage() {
    const [selectedCategory, setSelectedCategory] = useState<AssetCategory>("brand");
    const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredAssets = assets.filter(
        (a) => a.category === selectedCategory &&
            a.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getCategoryCount = (category: AssetCategory) =>
        assets.filter((a) => a.category === category).length;

    const handleUpload = (files: FileList) => {
        // In production, upload to S3 and save to DB
        const newAssets: Asset[] = Array.from(files).map((file, i) => ({
            id: `new-${Date.now()}-${i}`,
            name: file.name,
            category: selectedCategory,
            type: file.type,
            size: file.size,
            url: URL.createObjectURL(file),
            thumbnailUrl: file.type.startsWith("image") ? URL.createObjectURL(file) : undefined,
            createdAt: new Date(),
        }));

        setAssets((prev) => [...prev, ...newAssets]);
        toast.success(`Uploaded ${files.length} ${files.length === 1 ? "file" : "files"}`);
    };

    const handleDelete = (id: string) => {
        setAssets((prev) => prev.filter((a) => a.id !== id));
        toast.success("Asset deleted");
    };

    const selectedCategoryData = CATEGORIES.find((c) => c.id === selectedCategory)!;

    return (
        <div className="flex flex-col h-full space-y-8 p-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Assets Library</h2>
                    <p className="text-muted-foreground">
                        Manage brand assets, audio, and templates for your clips.
                    </p>
                </div>
            </div>

            {/* Category Grid */}
            <div className="grid gap-4 md:grid-cols-4">
                {CATEGORIES.map((category) => (
                    <CategoryCard
                        key={category.id}
                        category={category}
                        count={getCategoryCount(category.id)}
                        isSelected={selectedCategory === category.id}
                        onClick={() => setSelectedCategory(category.id)}
                    />
                ))}
            </div>

            {/* Search & Upload */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 flex-1 bg-card rounded-lg border border-border px-4 py-2">
                    <Search className="size-5 text-muted-foreground" />
                    <Input
                        placeholder={`Search ${selectedCategoryData.name.toLowerCase()}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border-none shadow-none focus-visible:ring-0 p-0 h-auto"
                    />
                </div>
            </div>

            {/* Upload Zone */}
            <UploadZone category={selectedCategoryData} onUpload={handleUpload} />

            {/* Asset List */}
            <div className="space-y-3">
                <h3 className="font-semibold text-lg">
                    {selectedCategoryData.name} ({filteredAssets.length})
                </h3>

                {filteredAssets.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border/50 bg-muted/20 p-12 text-center text-muted-foreground">
                        <FolderOpen className="size-12 mx-auto mb-4 opacity-50" />
                        <p>No assets in this category yet.</p>
                        <p className="text-sm mt-1">Upload files above to get started.</p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {filteredAssets.map((asset) => (
                            <AssetItem key={asset.id} asset={asset} onDelete={handleDelete} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
