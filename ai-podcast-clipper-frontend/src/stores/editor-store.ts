import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools, persist } from 'zustand/middleware';

// ============================================================================
// TYPES
// ============================================================================

export interface Clip {
    id: string;
    trackId: string;
    name: string;
    startTime: number;      // Position on timeline (seconds)
    duration: number;       // Length of clip (seconds)
    sourceStart: number;    // In-point in source (seconds)
    sourceEnd: number;      // Out-point in source (seconds)
    type: 'video' | 'audio' | 'text' | 'effect';
    s3Key?: string;
    src?: string;           // Direct video URL for local/imported media
    thumbnailUrl?: string;
    color?: string;
    effects?: Effect[];     // Applied effects on this clip
}

export interface Track {
    id: string;
    name: string;
    type: 'video' | 'audio';
    muted: boolean;
    locked: boolean;
    height: number;
    clips: Clip[];
}

export interface Effect {
    id: string;
    name: string;
    type: 'filter' | 'transition' | 'text' | 'audio';
    parameters: Record<string, number | string | boolean>;
}

export interface EditorProject {
    id: string;
    name: string;
    duration: number;
    aspectRatio: '9:16' | '16:9' | '1:1';
    tracks: Track[];
    createdAt: Date;
    updatedAt: Date;
}

// ============================================================================
// STATE INTERFACE
// ============================================================================

interface EditorState {
    // Project
    project: EditorProject | null;
    isDirty: boolean;

    // Playback
    isPlaying: boolean;
    currentTime: number;
    duration: number;

    // Selection
    selectedClipId: string | null;
    selectedTrackId: string | null;

    // View
    zoom: number; // pixels per second
    scrollX: number;
    aspectRatio: '9:16' | '16:9' | '1:1';

    // Tool
    activeTool: 'select' | 'razor' | 'text' | 'hand';

    // Export
    isExporting: boolean;
    exportProgress: number;
}

interface EditorActions {
    // Project
    loadProject: (project: EditorProject) => void;
    createNewProject: (name: string) => void;
    setAspectRatio: (ratio: '9:16' | '16:9' | '1:1') => void;

    // Playback
    play: () => void;
    pause: () => void;
    togglePlayback: () => void;
    seek: (time: number) => void;
    setDuration: (duration: number) => void;

    // Timeline
    addTrack: (type: 'video' | 'audio') => void;
    removeTrack: (trackId: string) => void;
    toggleTrackMute: (trackId: string) => void;
    toggleTrackLock: (trackId: string) => void;
    addClip: (trackId: string, clip: Omit<Clip, 'id' | 'trackId'>) => void;
    removeClip: (clipId: string) => void;
    moveClip: (clipId: string, newStartTime: number, newTrackId?: string) => void;
    trimClip: (clipId: string, newStart: number, newEnd: number) => void;
    splitClip: (clipId: string, splitTime: number) => void;
    applyEffect: (clipId: string, effect: Effect) => void;
    removeEffect: (clipId: string, effectId: string) => void;

    // Selection
    selectClip: (clipId: string | null) => void;
    selectTrack: (trackId: string | null) => void;

    // View
    setZoom: (zoom: number) => void;
    setScrollX: (scrollX: number) => void;
    setActiveTool: (tool: 'select' | 'razor' | 'text' | 'hand') => void;

    // Export
    startExport: () => void;
    updateExportProgress: (progress: number) => void;
    finishExport: () => void;
}

// ============================================================================
// STORE
// ============================================================================

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useEditorStore = create<EditorState & EditorActions>()(
    devtools(
        immer((set, get) => ({
            // Initial State
            project: null,
            isDirty: false,
            isPlaying: false,
            currentTime: 0,
            duration: 0,
            selectedClipId: null,
            selectedTrackId: null,
            zoom: 50, // 50px per second
            scrollX: 0,
            aspectRatio: '9:16',
            activeTool: 'select',
            isExporting: false,
            exportProgress: 0,

            // ========== PROJECT ==========
            loadProject: (project) => set((state) => {
                state.project = project;
                state.duration = project.duration;
                state.aspectRatio = project.aspectRatio;
                state.isDirty = false;
            }),

            createNewProject: (name) => set((state) => {
                state.project = {
                    id: generateId(),
                    name,
                    duration: 0,
                    aspectRatio: '9:16',
                    tracks: [
                        { id: 'video-1', name: 'Video 1', type: 'video', muted: false, locked: false, height: 60, clips: [] },
                        { id: 'audio-1', name: 'Audio 1', type: 'audio', muted: false, locked: false, height: 40, clips: [] },
                    ],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                state.isDirty = true;
            }),

            setAspectRatio: (ratio) => set((state) => {
                state.aspectRatio = ratio;
                if (state.project) {
                    state.project.aspectRatio = ratio;
                    state.isDirty = true;
                }
            }),

            // ========== PLAYBACK ==========
            play: () => set({ isPlaying: true }),
            pause: () => set({ isPlaying: false }),
            togglePlayback: () => set((state) => ({ isPlaying: !state.isPlaying })),
            seek: (time) => set({ currentTime: Math.max(0, time) }),
            setDuration: (duration) => set({ duration }),

            // ========== TIMELINE ==========
            addTrack: (type) => set((state) => {
                if (!state.project) return;
                const count = state.project.tracks.filter(t => t.type === type).length + 1;
                state.project.tracks.push({
                    id: generateId(),
                    name: `${type === 'video' ? 'Video' : 'Audio'} ${count}`,
                    type,
                    muted: false,
                    locked: false,
                    height: type === 'video' ? 60 : 40,
                    clips: [],
                });
                state.isDirty = true;
            }),

            removeTrack: (trackId) => set((state) => {
                if (!state.project) return;
                state.project.tracks = state.project.tracks.filter(t => t.id !== trackId);
                state.isDirty = true;
            }),

            toggleTrackMute: (trackId) => set((state) => {
                if (!state.project) return;
                const track = state.project.tracks.find(t => t.id === trackId);
                if (track) {
                    track.muted = !track.muted;
                    state.isDirty = true;
                }
            }),

            toggleTrackLock: (trackId) => set((state) => {
                if (!state.project) return;
                const track = state.project.tracks.find(t => t.id === trackId);
                if (track) {
                    track.locked = !track.locked;
                    state.isDirty = true;
                }
            }),

            addClip: (trackId, clip) => set((state) => {
                if (!state.project) return;
                const track = state.project.tracks.find(t => t.id === trackId);
                if (!track) return;

                const newClip: Clip = {
                    ...clip,
                    id: generateId(),
                    trackId,
                };
                track.clips.push(newClip);

                // Update project duration if needed
                const clipEnd = newClip.startTime + newClip.duration;
                if (clipEnd > state.project.duration) {
                    state.project.duration = clipEnd;
                    state.duration = clipEnd;
                }
                state.isDirty = true;
            }),

            removeClip: (clipId) => set((state) => {
                if (!state.project) return;
                for (const track of state.project.tracks) {
                    track.clips = track.clips.filter(c => c.id !== clipId);
                }
                if (state.selectedClipId === clipId) {
                    state.selectedClipId = null;
                }
                state.isDirty = true;
            }),

            moveClip: (clipId, newStartTime, newTrackId) => set((state) => {
                if (!state.project) return;

                let clip: Clip | undefined;
                let sourceTrack: Track | undefined;

                for (const track of state.project.tracks) {
                    const found = track.clips.find(c => c.id === clipId);
                    if (found) {
                        clip = found;
                        sourceTrack = track;
                        break;
                    }
                }

                if (!clip || !sourceTrack) return;

                // Move to different track
                if (newTrackId && newTrackId !== sourceTrack.id) {
                    const targetTrack = state.project.tracks.find(t => t.id === newTrackId);
                    if (!targetTrack) return;

                    sourceTrack.clips = sourceTrack.clips.filter(c => c.id !== clipId);
                    clip.trackId = newTrackId;
                    clip.startTime = Math.max(0, newStartTime);
                    targetTrack.clips.push(clip);
                } else {
                    clip.startTime = Math.max(0, newStartTime);
                }

                state.isDirty = true;
            }),

            trimClip: (clipId, newSourceStart, newSourceEnd) => set((state) => {
                if (!state.project) return;
                for (const track of state.project.tracks) {
                    const clip = track.clips.find(c => c.id === clipId);
                    if (clip) {
                        clip.sourceStart = newSourceStart;
                        clip.sourceEnd = newSourceEnd;
                        clip.duration = newSourceEnd - newSourceStart;
                        break;
                    }
                }
                state.isDirty = true;
            }),

            splitClip: (clipId, splitTime) => set((state) => {
                if (!state.project) return;
                for (const track of state.project.tracks) {
                    const clipIndex = track.clips.findIndex(c => c.id === clipId);
                    if (clipIndex === -1) continue;

                    const clip = track.clips[clipIndex];
                    if (!clip) continue;

                    const clipStart = clip.startTime;
                    const clipEnd = clip.startTime + clip.duration;

                    // Check if split point is within clip
                    if (splitTime <= clipStart || splitTime >= clipEnd) continue;

                    const splitDuration = splitTime - clipStart;
                    const remainingDuration = clip.duration - splitDuration;

                    // Create second half
                    const secondClip: Clip = {
                        ...clip,
                        id: generateId(),
                        startTime: splitTime,
                        duration: remainingDuration,
                        sourceStart: clip.sourceStart + splitDuration,
                    };

                    // Trim first half
                    clip.duration = splitDuration;
                    clip.sourceEnd = clip.sourceStart + splitDuration;

                    // Insert second clip after first
                    track.clips.splice(clipIndex + 1, 0, secondClip);
                    break;
                }
                state.isDirty = true;
            }),

            applyEffect: (clipId, effect) => set((state) => {
                if (!state.project) return;
                for (const track of state.project.tracks) {
                    const clip = track.clips.find(c => c.id === clipId);
                    if (clip) {
                        if (!clip.effects) {
                            clip.effects = [];
                        }
                        // Check if effect type already exists and update, or add new
                        const existingIndex = clip.effects.findIndex(e => e.id === effect.id);
                        if (existingIndex !== -1) {
                            clip.effects[existingIndex] = effect;
                        } else {
                            clip.effects.push(effect);
                        }
                        state.isDirty = true;
                        break;
                    }
                }
            }),

            removeEffect: (clipId, effectId) => set((state) => {
                if (!state.project) return;
                for (const track of state.project.tracks) {
                    const clip = track.clips.find(c => c.id === clipId);
                    if (clip && clip.effects) {
                        clip.effects = clip.effects.filter(e => e.id !== effectId);
                        state.isDirty = true;
                        break;
                    }
                }
            }),

            // ========== SELECTION ==========
            selectClip: (clipId) => set({ selectedClipId: clipId }),
            selectTrack: (trackId) => set({ selectedTrackId: trackId }),

            // ========== VIEW ==========
            setZoom: (zoom) => set({ zoom: Math.max(10, Math.min(200, zoom)) }),
            setScrollX: (scrollX) => set({ scrollX: Math.max(0, scrollX) }),
            setActiveTool: (tool) => set({ activeTool: tool }),

            // ========== EXPORT ==========
            startExport: () => set({ isExporting: true, exportProgress: 0 }),
            updateExportProgress: (progress) => set({ exportProgress: progress }),
            finishExport: () => set({ isExporting: false, exportProgress: 100 }),
        })),
        { name: 'editor-store' }
    )
);

// ============================================================================
// SELECTORS
// ============================================================================

export const selectAllClips = (state: EditorState): Clip[] => {
    if (!state.project) return [];
    return state.project.tracks.flatMap(t => t.clips);
};

export const selectClipById = (state: EditorState, clipId: string): Clip | undefined => {
    return selectAllClips(state).find(c => c.id === clipId);
};

export const selectTrackById = (state: EditorState, trackId: string): Track | undefined => {
    return state.project?.tracks.find(t => t.id === trackId);
};

export const selectVideoTracks = (state: EditorState): Track[] => {
    return state.project?.tracks.filter(t => t.type === 'video') ?? [];
};

export const selectAudioTracks = (state: EditorState): Track[] => {
    return state.project?.tracks.filter(t => t.type === 'audio') ?? [];
};
