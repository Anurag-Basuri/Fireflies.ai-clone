// Audio player docked at the top of the transcript column with speed, seek, and bidirectional sync
'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
	Play,
	Pause,
	RotateCcw,
	RotateCw,
	Volume2,
	VolumeX,
	Gauge,
} from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { formatTime } from '@/lib/utils';

interface MediaPlayerProps {
	mediaUrl?: string | null;
	title: string;
}

// Render media player with audio element sync, speed controls, and seekbar
export function MediaPlayer({ mediaUrl, title }: MediaPlayerProps) {
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const [volume, setVolume] = useState(1);
	const [isMuted, setIsMuted] = useState(false);
	const [showSpeedMenu, setShowSpeedMenu] = useState(false);

	const {
		currentTime,
		duration,
		isPlaying,
		playbackRate,
		seekRequest,
		setCurrentTime,
		setDuration,
		setIsPlaying,
		setPlaybackRate,
		clearSeekRequest,
	} = usePlayerStore();

	const audioSrc = mediaUrl || '/media/sample-meeting.mp3';

	// Handle seek requests from transcript or outline
	useEffect(() => {
		if (seekRequest !== null && audioRef.current) {
			audioRef.current.currentTime = seekRequest;
			audioRef.current.play().catch(() => {});
			setIsPlaying(true);
			clearSeekRequest();
		}
	}, [seekRequest, clearSeekRequest, setIsPlaying]);

	// Sync playback rate
	useEffect(() => {
		if (audioRef.current) {
			audioRef.current.playbackRate = playbackRate;
		}
	}, [playbackRate]);

	// Play/Pause toggle
	const togglePlay = () => {
		if (!audioRef.current) return;
		if (isPlaying) {
			audioRef.current.pause();
			setIsPlaying(false);
		} else {
			audioRef.current.play().catch(() => {});
			setIsPlaying(true);
		}
	};

	// Skip time
	const skipTime = (delta: number) => {
		if (!audioRef.current) return;
		const newTime = Math.max(
			0,
			Math.min(audioRef.current.currentTime + delta, duration),
		);
		audioRef.current.currentTime = newTime;
		setCurrentTime(newTime);
	};

	// Seek bar change
	const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newTime = parseFloat(e.target.value);
		if (audioRef.current) {
			audioRef.current.currentTime = newTime;
		}
		setCurrentTime(newTime);
	};

	// Volume change
	const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newVol = parseFloat(e.target.value);
		setVolume(newVol);
		if (audioRef.current) {
			audioRef.current.volume = newVol;
			setIsMuted(newVol === 0);
		}
	};

	// Mute toggle
	const toggleMute = () => {
		if (!audioRef.current) return;
		if (isMuted) {
			audioRef.current.volume = volume || 0.5;
			setIsMuted(false);
		} else {
			audioRef.current.volume = 0;
			setIsMuted(true);
		}
	};

	const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

	return (
		<div className="sticky top-0 z-20 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-sm backdrop-blur-md">
			<audio
				ref={audioRef}
				src={audioSrc}
				preload="metadata"
				onTimeUpdate={() => {
					if (audioRef.current) {
						setCurrentTime(audioRef.current.currentTime);
					}
				}}
				onLoadedMetadata={() => {
					if (audioRef.current) {
						setDuration(audioRef.current.duration);
					}
				}}
				onEnded={() => setIsPlaying(false)}
			/>

			{/* Seek bar and time display */}
			<div className="flex items-center gap-3">
				<span className="text-xs font-mono text-[var(--text-muted)] w-12 text-right">
					{formatTime(currentTime)}
				</span>
				<div className="relative flex-1 flex items-center">
					<input
						type="range"
						min={0}
						max={duration || 100}
						step={0.1}
						value={currentTime}
						onChange={handleSeekChange}
						className="w-full"
					/>
				</div>
				<span className="text-xs font-mono text-[var(--text-muted)] w-12">
					{formatTime(duration)}
				</span>
			</div>

			{/* Controls Row */}
			<div className="mt-3 flex items-center justify-between">
				{/* Left: Volume control */}
				<div className="flex items-center gap-2">
					<button
						onClick={toggleMute}
						className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
						title={isMuted ? 'Unmute' : 'Mute'}
					>
						{isMuted ? (
							<VolumeX className="h-4 w-4 text-red-500" />
						) : (
							<Volume2 className="h-4 w-4" />
						)}
					</button>
					<input
						type="range"
						min={0}
						max={1}
						step={0.05}
						value={isMuted ? 0 : volume}
						onChange={handleVolumeChange}
						className="w-16 hidden sm:block"
					/>
				</div>

				{/* Center: Play/Pause and Skip buttons */}
				<div className="flex items-center gap-3">
					<button
						onClick={() => skipTime(-5)}
						className="rounded-full p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
						title="Rewind 5 seconds"
					>
						<RotateCcw className="h-4 w-4" />
					</button>

					<button
						onClick={togglePlay}
						className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-primary)] text-white shadow-md hover:bg-[var(--brand-primary-dark)] hover:scale-105 active:scale-95 transition-all"
						title={isPlaying ? 'Pause' : 'Play'}
					>
						{isPlaying ? (
							<Pause className="h-5 w-5 fill-current" />
						) : (
							<Play className="h-5 w-5 fill-current ml-0.5" />
						)}
					</button>

					<button
						onClick={() => skipTime(5)}
						className="rounded-full p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
						title="Forward 5 seconds"
					>
						<RotateCw className="h-4 w-4" />
					</button>
				</div>

				{/* Right: Playback Speed selector */}
				<div className="relative">
					<button
						onClick={() => setShowSpeedMenu(!showSpeedMenu)}
						className="flex items-center gap-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
					>
						<Gauge className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
						<span>{playbackRate}x</span>
					</button>

					{showSpeedMenu && (
						<>
							<div
								className="fixed inset-0 z-30"
								onClick={() => setShowSpeedMenu(false)}
							/>
							<div className="absolute right-0 bottom-full mb-1 z-40 w-24 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] py-1 shadow-xl">
								{speedOptions.map((speed) => (
									<button
										key={speed}
										onClick={() => {
											setPlaybackRate(speed);
											setShowSpeedMenu(false);
										}}
										className={`flex w-full items-center justify-between px-3 py-1.5 text-xs ${
											playbackRate === speed
												? 'font-bold text-[var(--brand-primary)] bg-[var(--brand-primary)]/10'
												: 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
										}`}
									>
										<span>{speed}x</span>
										{playbackRate === speed && <span>✓</span>}
									</button>
								))}
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
