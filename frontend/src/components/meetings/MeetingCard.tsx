// Card representation of a meeting in the meetings library grid/list with Fireflies styling
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
	Calendar,
	Clock,
	MoreVertical,
	Trash2,
	Download,
	ExternalLink,
	Sparkles,
	Loader2,
	Play,
} from 'lucide-react';
import type { MeetingListItem } from '@/types';
import {
	formatDate,
	formatDuration,
	getInitials,
	stringToColor,
} from '@/lib/utils';
import { getExportUrl } from '@/lib/api';

interface MeetingCardProps {
	meeting: MeetingListItem;
	onDelete: (id: number) => void;
}

// Render individual meeting card with metadata, participant avatar stack, and audio badge
export function MeetingCard({ meeting, onDelete }: MeetingCardProps) {
	const [menuOpen, setMenuOpen] = useState(false);

	// Visible participants vs overflow count
	const maxAvatars = 4;
	const visibleParticipants = meeting.participants.slice(0, maxAvatars);
	const overflowCount = meeting.participants.length - maxAvatars;

	return (
		<div className="group relative flex flex-col justify-between rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-sm transition-all duration-300 hover:border-[var(--brand-primary)]/40 hover:shadow-lg hover:shadow-[var(--brand-primary)]/5 hover:-translate-y-0.5">
			<div>
				{/* Top row: Status Badge and Action Menu */}
				<div className="flex items-start justify-between gap-3">
					<div className="flex flex-wrap items-center gap-1.5">
						{meeting.status === 'processing' ? (
							<span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
								<Loader2 className="h-3 w-3 animate-spin" />
								Processing
							</span>
						) : (
							<span className="inline-flex items-center gap-1 rounded-full bg-[var(--brand-primary)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--brand-primary)]">
								<Sparkles className="h-3 w-3" />
								AI Summary
							</span>
						)}

						{/* Tag chips */}
						{meeting.tags.slice(0, 2).map((tag) => (
							<span
								key={tag.id}
								className="rounded-full bg-[var(--bg-tertiary)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)]"
							>
								{tag.name}
							</span>
						))}
					</div>

					{/* 3-dots action menu */}
					<div className="relative">
						<button
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								setMenuOpen(!menuOpen);
							}}
							className="rounded-full p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors opacity-0 group-hover:opacity-100"
							aria-label="Actions"
						>
							<MoreVertical className="h-4 w-4" />
						</button>

						{menuOpen && (
							<>
								<div
									className="fixed inset-0 z-40"
									onClick={() => setMenuOpen(false)}
								/>
								<div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] py-1.5 shadow-xl animate-fade-in-up">
									<Link
										href={`/meetings/${meeting.id}`}
										className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
										onClick={() => setMenuOpen(false)}
									>
										<ExternalLink className="h-4 w-4 text-[var(--brand-primary)]" />
										Open Meeting
									</Link>
									<a
										href={getExportUrl(meeting.id, 'md')}
										download
										className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
										onClick={() => setMenuOpen(false)}
									>
										<Download className="h-4 w-4 text-blue-500" />
										Export Markdown
									</a>
									<button
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											setMenuOpen(false);
											onDelete(meeting.id);
										}}
										className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-red-600 hover:bg-red-500/10 dark:text-red-400"
									>
										<Trash2 className="h-4 w-4" />
										Delete Meeting
									</button>
								</div>
							</>
						)}
					</div>
				</div>

				{/* Meeting Title Link */}
				<Link
					href={`/meetings/${meeting.id}`}
					className="mt-3.5 block group/title"
				>
					<h3 className="text-[15px] font-semibold text-[var(--text-primary)] line-clamp-2 group-hover/title:text-[var(--brand-primary)] transition-colors leading-snug">
						{meeting.title}
					</h3>
				</Link>

				{/* Metadata row: Date, Duration */}
				<div className="mt-3 flex items-center gap-4 text-sm text-[var(--text-secondary)]">
					<div className="flex items-center gap-1.5">
						<Calendar className="h-3.5 w-3.5 text-[var(--text-muted)]" />
						<span>{formatDate(meeting.meeting_date)}</span>
					</div>
					<div className="flex items-center gap-1.5">
						<Clock className="h-3.5 w-3.5 text-[var(--text-muted)]" />
						<span>{formatDuration(meeting.duration_seconds)}</span>
					</div>
				</div>
			</div>

			{/* Bottom row: Participants avatar stack and Open CTA */}
			<div className="mt-5 flex items-center justify-between border-t border-[var(--border-color)] pt-4">
				<div className="flex items-center">
					<div className="flex -space-x-2 overflow-hidden">
						{visibleParticipants.map((participant) => {
							const bgColor = stringToColor(participant.name);
							return (
								<div
									key={participant.id}
									title={`${participant.name}${participant.role ? ` (${participant.role})` : ''}`}
									className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--bg-card)] text-[10px] font-bold text-white shadow-sm"
									style={{ backgroundColor: bgColor }}
								>
									{getInitials(participant.name)}
								</div>
							);
						})}
						{overflowCount > 0 && (
							<div
								className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--bg-card)] bg-[var(--bg-tertiary)] text-[10px] font-medium text-[var(--text-secondary)]"
								title={`${overflowCount} more`}
							>
								+{overflowCount}
							</div>
						)}
					</div>
					<span className="ml-2.5 text-xs text-[var(--text-muted)] truncate max-w-[120px]">
						{meeting.participants.length > 0
							? meeting.participants.map((p) => p.name).join(', ')
							: 'No participants'}
					</span>
				</div>

				{/* Play / Open Button — pill style */}
				<Link
					href={`/meetings/${meeting.id}`}
					className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold text-white transition-all shadow-sm"
					style={{
						background: 'var(--brand-gradient)',
						boxShadow: '0 2px 8px rgba(108, 76, 244, 0.25)',
					}}
				>
					<Play className="h-3 w-3 fill-current" />
					<span>Open</span>
				</Link>
			</div>
		</div>
	);
}
