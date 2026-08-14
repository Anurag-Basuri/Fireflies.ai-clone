// Individual diarized transcript segment row with speaker badge, timestamp, and audio seek sync
'use client';

import React from 'react';
import { MessageSquare, Scissors, Play, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
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
	const [copied, setCopied] = React.useState(false);
	const speakerName = segment.speaker_label || 'Speaker';
	const speakerColor = segment.speaker_color || '#6c4cf4';

	// Copy transcript line to clipboard
	const handleCopy = (e: React.MouseEvent) => {
		e.stopPropagation();
		navigator.clipboard.writeText(
			`[${formatTime(segment.start_time)}] ${speakerName}: ${segment.content}`,
		);
		setCopied(true);
		toast.success('Transcript quote copied');
		setTimeout(() => setCopied(false), 2000);
	};

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
				isActive
					? 'transcript-active shadow-sm'
					: 'hover:bg-[var(--bg-hover)]'
			}`}
		>
			{/* Speaker Avatar Badge */}
			<div
				className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm mt-0.5"
				style={{ backgroundColor: speakerColor }}
			>
				{getInitials(speakerName)}
			</div>

			{/* Segment Body */}
			<div className="flex-1 min-w-0">
				{/* Speaker name, timestamp, and active pill */}
				<div className="flex items-center gap-2">
					<span className="text-sm font-semibold text-[var(--text-primary)]">
						{speakerName}
					</span>
					<span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--bg-tertiary)] px-1.5 py-0.5 rounded-md tabular-nums">
						{formatTime(segment.start_time)}
					</span>
					{isActive && (
						<span className="flex items-center gap-1 rounded-full bg-[var(--brand-primary)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--brand-primary)]">
							<Play className="h-2.5 w-2.5 fill-current" />
							Now Playing
						</span>
					)}
				</div>

				{/* Spoken Text */}
				<p className="mt-1.5 text-sm text-[var(--text-secondary)] leading-relaxed">
					{renderContent()}
				</p>
			</div>

			{/* Hover Action Bar */}
			<div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-1 shadow-lg transition-all shrink-0">
				<button
					onClick={handleCopy}
					className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
					title="Copy quote"
				>
					{copied ? (
						<Check className="h-3.5 w-3.5 text-emerald-500" />
					) : (
						<Copy className="h-3.5 w-3.5" />
					)}
				</button>
				<button
					onClick={(e) => {
						e.stopPropagation();
						onAddComment(segment.id);
					}}
					className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--brand-primary)] transition-colors"
					title="Pin comment on segment"
				>
					<MessageSquare className="h-3.5 w-3.5" />
				</button>
				<button
					onClick={(e) => {
						e.stopPropagation();
						onCreateSoundbite(segment);
					}}
					className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-purple-500 transition-colors"
					title="Create soundbite clip"
				>
					<Scissors className="h-3.5 w-3.5" />
				</button>
			</div>
		</div>
	);
}
