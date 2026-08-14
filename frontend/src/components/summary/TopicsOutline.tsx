// Chapter-style outline of key topics with clickable timestamps to jump playback
'use client';

import React from 'react';
import { Bookmark, Play } from 'lucide-react';
import type { KeyTopic } from '@/types';
import { formatTime } from '@/lib/utils';
import { usePlayerStore } from '@/store/playerStore';

interface TopicsOutlineProps {
	topics: KeyTopic[];
}

// Render chapter outline with interactive timestamp jump triggers
export function TopicsOutline({ topics }: TopicsOutlineProps) {
	const { seekTo, currentTime } = usePlayerStore();

	if (topics.length === 0) {
		return (
			<div className="rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)]/50 p-8 text-center text-sm text-[var(--text-muted)]">
				No key topics or chapter markers available for this meeting.
			</div>
		);
	}

	return (
		<div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-sm">
			<div className="flex items-center gap-2 mb-4">
				<Bookmark className="h-4 w-4 text-[var(--brand-primary)]" />
				<h4 className="text-sm font-semibold text-[var(--text-primary)]">
					Key Topics & Chapters ({topics.length})
				</h4>
			</div>

			<div className="space-y-2">
				{topics.map((topic, index) => {
					const hasTime =
						topic.start_time !== null && topic.start_time !== undefined;
					const isPast = hasTime && currentTime >= (topic.start_time || 0);

					return (
						<div
							key={topic.id || index}
							onClick={() => {
								if (hasTime) {
									seekTo(topic.start_time!);
								}
							}}
							className={`flex items-center justify-between rounded-xl border p-3 transition-all ${
								hasTime
									? 'cursor-pointer hover:border-[var(--brand-primary)]/50 hover:bg-[var(--bg-secondary)]'
									: ''
							} ${
								isPast
									? 'border-[var(--brand-primary)]/30 bg-[var(--brand-primary)]/5'
									: 'border-[var(--border-color)] bg-[var(--bg-card)]'
							}`}
						>
							<div className="flex items-center gap-3">
								<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--bg-secondary)] text-[11px] font-bold text-[var(--text-secondary)]">
									{index + 1}
								</span>
								<span className="text-sm font-medium text-[var(--text-primary)]">
									{topic.title}
								</span>
							</div>

							{hasTime && (
								<div className="flex items-center gap-1.5 rounded-full bg-[var(--bg-secondary)] px-3 py-1 text-xs font-mono text-[var(--brand-primary)] font-semibold shadow-sm">
									<Play className="h-2.5 w-2.5 fill-current" />
									<span>{formatTime(topic.start_time!)}</span>
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
