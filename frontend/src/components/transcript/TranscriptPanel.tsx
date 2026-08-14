// Transcript panel containing search, speaker filters, and scrollable transcript segments
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Users, FileText } from 'lucide-react';
import type { TranscriptSegment, Speaker } from '@/types';
import { usePlayerStore } from '@/store/playerStore';
import { TranscriptLine } from './TranscriptLine';
import { TranscriptSearchBar } from './TranscriptSearchBar';
import { TranscriptRowSkeleton } from '../common/LoadingSkeleton';
import { EmptyState } from '../common/EmptyState';

interface TranscriptPanelProps {
	segments: TranscriptSegment[];
	speakers: Speaker[];
	isLoading: boolean;
	onAddComment: (segmentId: number) => void;
	onCreateSoundbite: (segment: TranscriptSegment) => void;
}

// Render scrollable transcript with auto-scrolling to active segments as playback advances
export function TranscriptPanel({
	segments,
	speakers,
	isLoading,
	onAddComment,
	onCreateSoundbite,
}: TranscriptPanelProps) {
	const [searchQuery, setSearchQuery] = useState('');
	const [speakerFilter, setSpeakerFilter] = useState<string>('all');
	const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
	const containerRef = useRef<HTMLDivElement | null>(null);

	const { currentTime, seekTo } = usePlayerStore();

	// Find the currently active segment based on audio currentTime
	const activeSegment = segments.find(
		(s) => currentTime >= s.start_time && currentTime <= s.end_time,
	);

	// Filter segments by speaker
	const filteredSegments = segments.filter((s) => {
		if (speakerFilter === 'all') return true;
		return s.speaker_label === speakerFilter;
	});

	// Find all segments matching the search query
	const matchedSegments = filteredSegments.filter((s) => {
		if (!searchQuery.trim()) return false;
		return s.content.toLowerCase().includes(searchQuery.toLowerCase().trim());
	});

	// Reset match index when query changes
	useEffect(() => {
		setCurrentMatchIndex(0);
	}, [searchQuery]);

	// Auto-scroll to active segment
	useEffect(() => {
		if (activeSegment) {
			const element = document.getElementById(`segment-${activeSegment.id}`);
			if (element && containerRef.current) {
				const container = containerRef.current;
				const elementRect = element.getBoundingClientRect();
				const containerRect = container.getBoundingClientRect();

				if (
					elementRect.top < containerRect.top ||
					elementRect.bottom > containerRect.bottom
				) {
					element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
				}
			}
		}
	}, [activeSegment?.id]);

	// Jump to search match
	const jumpToMatch = (index: number) => {
		if (matchedSegments.length === 0) return;
		const match = matchedSegments[index];
		if (match) {
			const element = document.getElementById(`segment-${match.id}`);
			if (element) {
				element.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}
		}
	};

	const handleNextMatch = () => {
		if (matchedSegments.length === 0) return;
		const nextIndex = (currentMatchIndex + 1) % matchedSegments.length;
		setCurrentMatchIndex(nextIndex);
		jumpToMatch(nextIndex);
	};

	const handlePrevMatch = () => {
		if (matchedSegments.length === 0) return;
		const prevIndex =
			(currentMatchIndex - 1 + matchedSegments.length) % matchedSegments.length;
		setCurrentMatchIndex(prevIndex);
		jumpToMatch(prevIndex);
	};

	return (
		<div className="flex flex-col h-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm overflow-hidden">
			{/* Header with title */}
			<div className="flex flex-col gap-2.5 border-b border-[var(--border-color)] p-4 bg-[var(--bg-secondary)]/50">
				{/* Label */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<FileText className="h-4 w-4 text-[var(--brand-primary)]" />
						<h3 className="text-sm font-semibold text-[var(--text-primary)]">
							Transcript
						</h3>
						<span className="text-xs text-[var(--text-muted)] font-medium">
							{segments.length} segments
						</span>
					</div>

					{/* Speaker Filter Dropdown */}
					{speakers.length > 0 && (
						<div className="flex items-center gap-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-1.5 shadow-sm shrink-0">
							<Users className="h-3.5 w-3.5 text-[var(--text-muted)]" />
							<select
								value={speakerFilter}
								onChange={(e) => setSpeakerFilter(e.target.value)}
								className="bg-transparent text-sm text-[var(--text-primary)] outline-none cursor-pointer"
							>
								<option value="all">All Speakers ({speakers.length})</option>
								{speakers.map((sp) => (
									<option key={sp.id} value={sp.label}>
										{sp.label}
									</option>
								))}
							</select>
						</div>
					)}
				</div>

				{/* In-transcript search bar */}
				<TranscriptSearchBar
					query={searchQuery}
					onQueryChange={setSearchQuery}
					totalMatches={matchedSegments.length}
					currentMatchIndex={currentMatchIndex}
					onNextMatch={handleNextMatch}
					onPrevMatch={handlePrevMatch}
					onClear={() => setSearchQuery('')}
				/>
			</div>

			{/* Scrollable Segments List */}
			<div
				ref={containerRef}
				className="flex-1 overflow-y-auto p-3 space-y-0.5"
			>
				{isLoading ? (
					Array.from({ length: 8 }).map((_, i) => (
						<TranscriptRowSkeleton key={i} />
					))
				) : filteredSegments.length === 0 ? (
					<div className="py-12">
						<EmptyState
							title="No transcript segments found"
							description={
								searchQuery || speakerFilter !== 'all'
									? 'No segments match your active search or speaker filter.'
									: 'No transcript text is available for this meeting yet.'
							}
						/>
					</div>
				) : (
					filteredSegments.map((segment) => {
						const isActive = activeSegment?.id === segment.id;
						const isCurrentMatch =
							matchedSegments[currentMatchIndex]?.id === segment.id;

						return (
							<TranscriptLine
								key={segment.id}
								segment={segment}
								isActive={isActive}
								searchQuery={searchQuery}
								isCurrentSearchMatch={isCurrentMatch}
								onSeek={seekTo}
								onAddComment={onAddComment}
								onCreateSoundbite={onCreateSoundbite}
							/>
						);
					})
				)}
			</div>
		</div>
	);
}
