// Zustand store for media player state - shared between MediaPlayer and TranscriptPanel
import { create } from 'zustand';

interface PlayerState {
	currentTime: number;
	duration: number;
	isPlaying: boolean;
	playbackRate: number;
	activeSegmentId: number | null;
	setCurrentTime: (time: number) => void;
	setDuration: (duration: number) => void;
	setIsPlaying: (playing: boolean) => void;
	setPlaybackRate: (rate: number) => void;
	setActiveSegmentId: (id: number | null) => void;
	seekTo: (time: number) => void;
	seekRequest: number | null;
	clearSeekRequest: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
	currentTime: 0,
	duration: 0,
	isPlaying: false,
	playbackRate: 1,
	activeSegmentId: null,
	seekRequest: null,

	setCurrentTime: (time: number) => set({ currentTime: time }),

	setDuration: (duration: number) => set({ duration }),

	setIsPlaying: (playing: boolean) => set({ isPlaying: playing }),

	setPlaybackRate: (rate: number) => set({ playbackRate: rate }),

	setActiveSegmentId: (id: number | null) => set({ activeSegmentId: id }),

	// Trigger a seek request that the MediaPlayer component will consume
	seekTo: (time: number) => set({ seekRequest: time, currentTime: time }),

	clearSeekRequest: () => set({ seekRequest: null }),
}));
