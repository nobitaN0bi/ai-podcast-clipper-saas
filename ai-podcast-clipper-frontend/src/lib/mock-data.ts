/**
 * Mock Data for Offline Development
 * Sample videos, effects, and marketplace assets for testing without network
 */

// =============================================================================
// SAMPLE PROJECTS
// =============================================================================

export const SAMPLE_PROJECTS = [
    {
        id: 'sample-1',
        name: 'Sample Podcast Episode',
        videoPath: '/samples/podcast-sample.mp4',
        duration: 120,
        aspectRatio: '16:9' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'sample-2',
        name: 'Interview Clip',
        videoPath: '/samples/interview-sample.mp4',
        duration: 45,
        aspectRatio: '9:16' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
];

// =============================================================================
// SAMPLE EFFECTS
// =============================================================================

export const SAMPLE_EFFECTS = [
    {
        id: 'effect-brightness',
        name: 'Brightness',
        category: 'color',
        ffmpegFilter: 'eq=brightness=0.1',
        parameters: { value: { min: -1, max: 1, default: 0 } },
    },
    {
        id: 'effect-contrast',
        name: 'Contrast',
        category: 'color',
        ffmpegFilter: 'eq=contrast=1.2',
        parameters: { value: { min: 0, max: 3, default: 1 } },
    },
    {
        id: 'effect-saturation',
        name: 'Saturation',
        category: 'color',
        ffmpegFilter: 'eq=saturation=1.5',
        parameters: { value: { min: 0, max: 3, default: 1 } },
    },
    {
        id: 'effect-blur',
        name: 'Blur',
        category: 'stylize',
        ffmpegFilter: 'boxblur=5:1',
        parameters: { radius: { min: 1, max: 20, default: 5 } },
    },
    {
        id: 'effect-sharpen',
        name: 'Sharpen',
        category: 'stylize',
        ffmpegFilter: 'unsharp=5:5:1.0:5:5:0.0',
        parameters: {},
    },
    {
        id: 'effect-vignette',
        name: 'Vignette',
        category: 'stylize',
        ffmpegFilter: 'vignette=PI/4',
        parameters: { angle: { min: 0, max: 1.57, default: 0.79 } },
    },
    {
        id: 'effect-grayscale',
        name: 'Grayscale',
        category: 'color',
        ffmpegFilter: 'colorchannelmixer=.3:.4:.3:0:.3:.4:.3:0:.3:.4:.3',
        parameters: {},
    },
    {
        id: 'effect-sepia',
        name: 'Sepia',
        category: 'color',
        ffmpegFilter: 'colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131',
        parameters: {},
    },
    {
        id: 'effect-invert',
        name: 'Invert Colors',
        category: 'color',
        ffmpegFilter: 'negate',
        parameters: {},
    },
    {
        id: 'effect-speed-up',
        name: 'Speed Up (2x)',
        category: 'time',
        ffmpegFilter: 'setpts=0.5*PTS',
        parameters: {},
    },
    {
        id: 'effect-slow-mo',
        name: 'Slow Motion (0.5x)',
        category: 'time',
        ffmpegFilter: 'setpts=2*PTS',
        parameters: {},
    },
    {
        id: 'effect-reverse',
        name: 'Reverse',
        category: 'time',
        ffmpegFilter: 'reverse',
        parameters: {},
    },
];

// =============================================================================
// SAMPLE TRANSITIONS
// =============================================================================

export const SAMPLE_TRANSITIONS = [
    {
        id: 'transition-fade',
        name: 'Fade',
        duration: 1,
        ffmpegFilter: 'fade=t=out:st=END:d=1,fade=t=in:st=0:d=1',
    },
    {
        id: 'transition-dissolve',
        name: 'Dissolve',
        duration: 0.5,
        ffmpegFilter: 'xfade=transition=dissolve:duration=0.5',
    },
    {
        id: 'transition-wipe-left',
        name: 'Wipe Left',
        duration: 0.5,
        ffmpegFilter: 'xfade=transition=wipeleft:duration=0.5',
    },
    {
        id: 'transition-wipe-right',
        name: 'Wipe Right',
        duration: 0.5,
        ffmpegFilter: 'xfade=transition=wiperight:duration=0.5',
    },
    {
        id: 'transition-slide-left',
        name: 'Slide Left',
        duration: 0.5,
        ffmpegFilter: 'xfade=transition=slideleft:duration=0.5',
    },
    {
        id: 'transition-zoom',
        name: 'Zoom',
        duration: 0.5,
        ffmpegFilter: 'xfade=transition=zoomin:duration=0.5',
    },
];

// =============================================================================
// SAMPLE MARKETPLACE ASSETS
// =============================================================================

export const SAMPLE_MARKETPLACE_ASSETS = [
    {
        id: 'asset-1',
        title: 'Viral Caption Pack',
        creator: 'LocalDev',
        category: 'text',
        price: 0,
        isFree: true,
        downloads: 0,
        rating: 5.0,
        tags: ['captions', 'viral'],
        local: true,
    },
    {
        id: 'asset-2',
        title: 'Basic Color LUTs',
        creator: 'LocalDev',
        category: 'effects',
        price: 0,
        isFree: true,
        downloads: 0,
        rating: 5.0,
        tags: ['lut', 'color'],
        local: true,
    },
    {
        id: 'asset-3',
        title: 'Simple Transitions',
        creator: 'LocalDev',
        category: 'transitions',
        price: 0,
        isFree: true,
        downloads: 0,
        rating: 5.0,
        tags: ['transition', 'basic'],
        local: true,
    },
];

// =============================================================================
// SAMPLE CAPTIONS (for testing without Whisper)
// =============================================================================

export const SAMPLE_CAPTIONS = [
    { start: 0, end: 3, text: "Welcome to this podcast episode." },
    { start: 3, end: 6, text: "Today we're discussing something exciting." },
    { start: 6, end: 10, text: "Let's dive right into it." },
    { start: 10, end: 15, text: "First, I want to talk about the main topic." },
    { start: 15, end: 20, text: "This is really important for everyone." },
    { start: 20, end: 25, text: "The key takeaway here is simple." },
    { start: 25, end: 30, text: "Make sure you understand this concept." },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getEffectsByCategory(category: string) {
    return SAMPLE_EFFECTS.filter(e => e.category === category);
}

export function getEffectById(id: string) {
    return SAMPLE_EFFECTS.find(e => e.id === id);
}

export function getTransitionById(id: string) {
    return SAMPLE_TRANSITIONS.find(t => t.id === id);
}

export function buildFFMPEGFilterString(effectIds: string[]): string {
    const effects = effectIds
        .map(id => getEffectById(id))
        .filter(Boolean)
        .map(e => e!.ffmpegFilter);

    return effects.join(',');
}
