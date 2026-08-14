// Individual diarized transcript segment row with speaker badge, timestamp, and audio seek sync
'use client';

import React from 'react';
import { MessageSquare, Scissors, Play } from 'lucide-react';
import type { TranscriptSegment } from '@/types';
import { formatTime, getInitials } from '@/lib/utils';

interface TranscriptLineProps {
	segment: TranscriptSegment;
	isActive: boolean;
	searchQuery?: string;
	isCurrentSearchMatch?: boolean;
	onSeek: (time: number) => void;
	onAddComment: (segmentId: number) => void;
	onCreateSoundbite: (segment: TranscriptSegment) => void;
}

// Render diarized transcript segment with search highlighting and hover action triggers
export function TranscriptLine({
	segment,
	isActive,
	searchQuery,
	isCurrentSearchMatch,
	onSeek,
	onAddComment,
	onCreateSoundbite,
}: TranscriptLineProps) {
	const speakerName = segment.speaker_label || 'Speaker';
	const speakerColor = segment.speaker_color || '#6366F1';

	// Highlight matches in content
	const renderContent = () => {
		if (!searchQuery || !searchQuery.trim()) {
			return segment.content;
		}

		const query = searchQuery.trim();
		const regex = new RegExp(
			`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
			'gi',
		);
		const parts = segment.content.split(regex);

		return parts.map((part, i) => {
			if (part.toLowerCase() === query.toLowerCase()) {
				return (
					<mark
						key={i}
						className={
							isCurrentSearchMatch
								? 'search-highlight search-highlight-active'
								: 'search-highlight'
						}
					>
						{part}
					</mark>
				);
			}
			return part;
		});
	};

	return (
		<div
			id={`segment-${segment.id}`}
			onClick={() => onSeek(segment.start_time)}
			className={`group relative flex items-start gap-3.5 rounded-xl p-3.5 transition-all duration-150 cursor-pointer ${
				isActive ? 'transcript-active shadow-xs' : 'hover:bg-[var(--bg-card)]'
			}`}
		>
			{/* Speaker Avatar */}
			<div
				className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-xs"
				style={{ backgroundColor: speakerColor }}
			>
				{getInitials(speakerName)}
			</div>

			{/* Segment Body */}
			<div className="flex-1 min-w-0">
				{/* Speaker name and timestamp */}
				<div className="flex items-center gap-2">
					<span className="text-xs font-semibold text-[var(--text-primary)]">
						{speakerName}
					</span>
					<span className="text-[11px] font-mono text-[var(--text-muted)]">
						{formatTime(segment.start_time)}
					</span>
					{isActive && (
						<span className="flex items-center gap-1 rounded-full bg-[var(--brand-primary)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--brand-primary)]">
							<Play className="h-2.5 w-2.5 fill-current" />
							Playing
						</span>
					)}
				</div>

				{/* Spoken Text */}
				<p className="mt-1 text-sm text-[var(--text-secondary)] leading-relaxed">
					{renderContent()}
				</p>
			</div>

			{/* Hover Action Bar */}
			<div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-1 shadow-xs transition-opacity shrink-0">
				<button
					onClick={(e) => {
						e.stopPropagation();
						onAddComment(segment.id);
					}}
					className="rounded p-1 text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)] transition-colors"
					title="Comment on segment"
				>
					<MessageSquare className="h-3.5 w-3.5" />
				</button>
				<button
					onClick={(e) => {
						e.stopPropagation();
						onCreateSoundbite(segment);
					}}
					className="rounded p-1 text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)] transition-colors"
					title="Create soundbite clip"
				>
					<Scissors className="h-3.5 w-3.5" />
				</button>
			</div>
		</div>
	);
}
