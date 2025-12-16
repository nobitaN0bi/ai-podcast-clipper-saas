/**
 * Configuration for Online/Offline Mode
 * Automatically detects offline status and routes requests accordingly
 */

// Environment configuration
export const config = {
    // Check if running in offline mode
    isOfflineMode: process.env.NEXT_PUBLIC_OFFLINE_MODE === 'true',

    // Local storage path
    localStoragePath: process.env.LOCAL_STORAGE_PATH || './local_storage',

    // API base URLs
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '',

    // Feature flags
    features: {
        // AI features require network
        aiTranscription: process.env.NEXT_PUBLIC_OFFLINE_MODE !== 'true',
        aiClipGeneration: process.env.NEXT_PUBLIC_OFFLINE_MODE !== 'true',
        aiSuggestions: process.env.NEXT_PUBLIC_OFFLINE_MODE !== 'true',

        // Basic video features work offline
        videoTrimming: true,
        videoExport: true,
        videoEffects: true,
        videoPreview: true,

        // Marketplace requires network
        marketplace: process.env.NEXT_PUBLIC_OFFLINE_MODE !== 'true',
    },
};

// API endpoints based on mode
export const endpoints = {
    // Video processing
    upload: config.isOfflineMode ? '/api/local/upload' : '/api/upload',
    process: config.isOfflineMode ? '/api/local/process' : '/api/process',
    projects: config.isOfflineMode ? '/api/local/projects' : '/api/projects',

    // Export
    export: config.isOfflineMode ? '/api/local/process' : '/api/export',

    // AI features (online only)
    transcribe: '/api/transcribe',
    generateClips: '/api/generate-clips',
    suggestions: '/api/rag/suggestions',
};

// Helper to check if a feature is available
export function isFeatureAvailable(feature: keyof typeof config.features): boolean {
    return config.features[feature];
}

// Helper to get the correct endpoint
export function getEndpoint(name: keyof typeof endpoints): string {
    return endpoints[name];
}

// Messages for offline mode
export const offlineMessages = {
    aiUnavailable: "AI features require an internet connection. You can still edit and export videos locally.",
    ffmpegRequired: "FFMPEG is required for local video processing. Install with: sudo apt install ffmpeg",
    uploadLocal: "Videos will be saved locally to your machine.",
    exportLocal: "Exports will be saved to ./local_storage/exports/",
};

export default config;
