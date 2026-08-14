// Skeleton loading placeholders for meeting cards, transcripts, and summaries
import React from 'react';

// Meeting card skeleton for library loading state
export function MeetingCardSkeleton() {
	return (
		<div className="flex flex-col justify-between rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-xs">
			<div>
				<div className="flex items-center justify-between gap-2">
					<div className="skeleton h-5 w-2/3 rounded-md" />
					<div className="skeleton h-5 w-16 rounded-full" />
				</div>
				<div className="mt-3 flex items-center gap-3">
					<div className="skeleton h-4 w-24 rounded-md" />
					<div className="skeleton h-4 w-16 rounded-md" />
				</div>
				<div className="mt-4 flex gap-1.5">
					<div className="skeleton h-5 w-14 rounded-md" />
					<div className="skeleton h-5 w-14 rounded-md" />
				</div>
			</div>
			<div className="mt-6 flex items-center justify-between border-t border-[var(--border-color)]/60 pt-4">
				<div className="flex -space-x-2">
					<div className="skeleton h-7 w-7 rounded-full" />
					<div className="skeleton h-7 w-7 rounded-full" />
					<div className="skeleton h-7 w-7 rounded-full" />
				</div>
				<div className="skeleton h-4 w-12 rounded-md" />
			</div>
		</div>
	);
}

// Transcript row skeleton
export function TranscriptRowSkeleton() {
	return (
		<div className="flex items-start gap-4 p-4 border-b border-[var(--border-color)]/40">
			<div className="skeleton h-9 w-9 shrink-0 rounded-full" />
			<div className="flex-1 space-y-2">
				<div className="flex items-center gap-2">
					<div className="skeleton h-4 w-28 rounded-md" />
					<div className="skeleton h-3 w-12 rounded-md" />
				</div>
				<div className="skeleton h-4 w-full rounded-md" />
				<div className="skeleton h-4 w-4/5 rounded-md" />
			</div>
		</div>
	);
}

// Summary panel loading skeleton
export function SummarySkeleton() {
	return (
		<div className="space-y-6 p-6">
			<div className="space-y-3">
				<div className="skeleton h-6 w-36 rounded-md" />
				<div className="skeleton h-4 w-full rounded-md" />
				<div className="skeleton h-4 w-5/6 rounded-md" />
				<div className="skeleton h-4 w-4/6 rounded-md" />
			</div>
			<div className="space-y-3">
				<div className="skeleton h-6 w-44 rounded-md" />
				<div className="skeleton h-4 w-full rounded-md" />
				<div className="skeleton h-4 w-11/12 rounded-md" />
				<div className="skeleton h-4 w-3/4 rounded-md" />
			</div>
		</div>
	);
}
