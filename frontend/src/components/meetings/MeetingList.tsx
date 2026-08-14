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
		<div className="flex flex-col gap-5">
			{/* Top control bar: count and view mode toggle */}
			<div className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
				<span>
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

				<div className="flex items-center gap-1 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] p-1 shadow-sm">
					<button
						onClick={() => setViewMode('grid')}
						className={`rounded-full p-2 transition-all ${
							viewMode === 'grid'
								? 'bg-[var(--brand-primary)] text-white shadow-sm'
								: 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
						}`}
						title="Grid View"
					>
						<LayoutGrid className="h-3.5 w-3.5" />
					</button>
					<button
						onClick={() => setViewMode('list')}
						className={`rounded-full p-2 transition-all ${
							viewMode === 'list'
								? 'bg-[var(--brand-primary)] text-white shadow-sm'
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
							? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'
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
							className="btn-primary"
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
							? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'
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
				<div className="flex items-center justify-between border-t border-[var(--border-color)] pt-5">
					<p className="text-sm text-[var(--text-muted)]">
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
							className="btn-secondary text-sm disabled:opacity-40"
						>
							<ChevronLeft className="h-4 w-4" />
							Previous
						</button>
						<button
							onClick={() => onPageChange(page + 1)}
							disabled={page >= totalPages}
							className="btn-secondary text-sm disabled:opacity-40"
						>
							Next
							<ChevronRight className="h-4 w-4" />
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
