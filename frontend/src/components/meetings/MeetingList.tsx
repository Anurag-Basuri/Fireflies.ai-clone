// Component rendering meeting cards in a responsive grid with pagination
'use client';

import React from 'react';
import {
	LayoutGrid,
	List,
	ChevronLeft,
	ChevronRight,
	Plus,
} from 'lucide-react';
import type { MeetingListItem } from '@/types';
import { MeetingCard } from './MeetingCard';
import { MeetingCardSkeleton } from '../common/LoadingSkeleton';
import { EmptyState } from '../common/EmptyState';

interface MeetingListProps {
	meetings: MeetingListItem[];
	isLoading: boolean;
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
	onPageChange: (newPage: number) => void;
	onDelete: (id: number) => void;
	onCreateClick: () => void;
}

// Render responsive meeting list/grid with skeleton states and pagination controls
export function MeetingList({
	meetings,
	isLoading,
	total,
	page,
	pageSize,
	totalPages,
	onPageChange,
	onDelete,
	onCreateClick,
}: MeetingListProps) {
	const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

	return (
		<div className="space-y-4">
			{/* Top control bar: count and view mode toggle */}
			<div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
				<span className="font-medium">
					Showing{' '}
					<span className="font-semibold text-[var(--text-primary)]">
						{meetings.length}
					</span>{' '}
					of{' '}
					<span className="font-semibold text-[var(--text-primary)]">
						{total}
					</span>{' '}
					meetings
				</span>

				<div className="flex items-center gap-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-1">
					<button
						onClick={() => setViewMode('grid')}
						className={`rounded-lg p-1.5 transition-colors ${
							viewMode === 'grid'
								? 'bg-[var(--brand-primary)] text-white'
								: 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
						}`}
						title="Grid View"
					>
						<LayoutGrid className="h-3.5 w-3.5" />
					</button>
					<button
						onClick={() => setViewMode('list')}
						className={`rounded-lg p-1.5 transition-colors ${
							viewMode === 'list'
								? 'bg-[var(--brand-primary)] text-white'
								: 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
						}`}
						title="List View"
					>
						<List className="h-3.5 w-3.5" />
					</button>
				</div>
			</div>

			{/* Loading skeletons state */}
			{isLoading ? (
				<div
					className={
						viewMode === 'grid'
							? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
							: 'space-y-3'
					}
				>
					{Array.from({ length: 6 }).map((_, i) => (
						<MeetingCardSkeleton key={i} />
					))}
				</div>
			) : meetings.length === 0 ? (
				/* Empty state */
				<EmptyState
					title="No meetings found"
					description="No meetings match your current search and filter parameters. Try clearing your filters or create a new meeting."
					action={
						<button
							onClick={onCreateClick}
							className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-[var(--brand-primary-dark)] transition-colors"
						>
							<Plus className="h-4 w-4" />
							Create Meeting
						</button>
					}
				/>
			) : (
				/* Meeting Cards Grid / List */
				<div
					className={
						viewMode === 'grid'
							? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
							: 'grid grid-cols-1 gap-3'
					}
				>
					{meetings.map((meeting) => (
						<MeetingCard
							key={meeting.id}
							meeting={meeting}
							onDelete={onDelete}
						/>
					))}
				</div>
			)}

			{/* Pagination footer */}
			{totalPages > 1 && (
				<div className="flex items-center justify-between border-t border-[var(--border-color)]/60 pt-4">
					<p className="text-xs text-[var(--text-muted)]">
						Page{' '}
						<span className="font-semibold text-[var(--text-primary)]">
							{page}
						</span>{' '}
						of{' '}
						<span className="font-semibold text-[var(--text-primary)]">
							{totalPages}
						</span>
					</p>

					<div className="flex items-center gap-2">
						<button
							onClick={() => onPageChange(page - 1)}
							disabled={page <= 1}
							className="flex items-center gap-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-40 transition-colors"
						>
							<ChevronLeft className="h-3.5 w-3.5" />
							Previous
						</button>
						<button
							onClick={() => onPageChange(page + 1)}
							disabled={page >= totalPages}
							className="flex items-center gap-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-40 transition-colors"
						>
							Next
							<ChevronRight className="h-3.5 w-3.5" />
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
