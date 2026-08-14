// Card representation of a meeting in the meetings library grid/list
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

// Render individual meeting card with metadata, participant avatar stack, and actions
export function MeetingCard({ meeting, onDelete }: MeetingCardProps) {
	const [menuOpen, setMenuOpen] = useState(false);

	// Visible participants vs overflow count
	const maxAvatars = 3;
	const visibleParticipants = meeting.participants.slice(0, maxAvatars);
	const overflowCount = meeting.participants.length - maxAvatars;

	return (
		<div className="group relative flex flex-col justify-between rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-xs transition-all duration-200 hover:border-[var(--brand-primary)]/40 hover:shadow-md">
			<div>
				{/* Top row: status and action menu */}
				<div className="flex items-start justify-between gap-3">
					<div className="flex flex-wrap items-center gap-2">
						{meeting.status === 'processing' ? (
							<span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
								<Loader2 className="h-3 w-3 animate-spin" />
								Processing AI
							</span>
						) : (
							<span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
								<Sparkles className="h-3 w-3" />
								Ready
							</span>
						)}

						{/* Tags */}
						{meeting.tags.slice(0, 2).map((tag) => (
							<span
								key={tag.id}
								className="rounded-full bg-[var(--bg-tertiary)] px-2.5 py-0.5 text-xs font-medium text-[var(--text-secondary)]"
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
							className="rounded-lg p-1 text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
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
								<div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] py-1.5 shadow-xl">
									<Link
										href={`/meetings/${meeting.id}`}
										className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
										onClick={() => setMenuOpen(false)}
									>
										<ExternalLink className="h-3.5 w-3.5" />
										Open Meeting
									</Link>
									<a
										href={getExportUrl(meeting.id, 'md')}
										download
										className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
										onClick={() => setMenuOpen(false)}
									>
										<Download className="h-3.5 w-3.5" />
										Export Markdown
									</a>
									<button
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											setMenuOpen(false);
											onDelete(meeting.id);
										}}
										className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-500/10 dark:text-red-400"
									>
										<Trash2 className="h-3.5 w-3.5" />
										Delete Meeting
									</button>
								</div>
							</>
						)}
					</div>
				</div>

				{/* Meeting Title Link */}
				<Link href={`/meetings/${meeting.id}`} className="mt-3 block">
					<h3 className="text-base font-semibold text-[var(--text-primary)] line-clamp-2 group-hover:text-[var(--brand-primary)] transition-colors">
						{meeting.title}
					</h3>
				</Link>

				{/* Metadata row: Date & Duration */}
				<div className="mt-3 flex items-center gap-4 text-xs text-[var(--text-secondary)]">
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

			{/* Bottom row: Participants avatar stack */}
			<div className="mt-6 flex items-center justify-between border-t border-[var(--border-color)]/60 pt-4">
				<div className="flex items-center">
					<div className="flex -space-x-2 overflow-hidden">
						{visibleParticipants.map((participant) => {
							const bgColor = stringToColor(participant.name);
							return (
								<div
									key={participant.id}
									title={`${participant.name}${participant.role ? ` (${participant.role})` : ''}`}
									className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--bg-card)] text-[10px] font-bold text-white shadow-xs"
									style={{ backgroundColor: bgColor }}
								>
									{getInitials(participant.name)}
								</div>
							);
						})}
						{overflowCount > 0 && (
							<div
								className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--bg-card)] bg-[var(--bg-tertiary)] text-[10px] font-medium text-[var(--text-secondary)]"
								title={`${overflowCount} more participant${overflowCount > 1 ? 's' : ''}`}
							>
								+{overflowCount}
							</div>
						)}
					</div>
					<span className="ml-3 text-xs text-[var(--text-muted)] truncate max-w-[120px]">
						{meeting.participants.length > 0
							? meeting.participants.map((p) => p.name).join(', ')
							: 'No participants'}
					</span>
				</div>

				<Link
					href={`/meetings/${meeting.id}`}
					className="text-xs font-medium text-[var(--brand-primary)] opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
				>
					View →
				</Link>
			</div>
		</div>
	);
}
