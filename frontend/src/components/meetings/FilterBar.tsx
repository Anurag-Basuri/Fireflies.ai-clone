// Streamlined filter and search bar for the meetings library
'use client';

import React from 'react';
import {
	Search,
	Calendar,
	Users,
	Tag as TagIcon,
	ArrowUpDown,
	X,
	SlidersHorizontal,
} from 'lucide-react';
import type { Tag } from '@/types';

interface FilterBarProps {
	searchQuery: string;
	onSearchChange: (value: string) => void;
	dateFrom: string;
	onDateFromChange: (value: string) => void;
	dateTo: string;
	onDateToChange: (value: string) => void;
	participantFilter: string;
	onParticipantFilterChange: (value: string) => void;
	tagFilter: string;
	onTagFilterChange: (value: string) => void;
	sortBy: string;
	onSortByChange: (value: string) => void;
	availableTags: Tag[];
	onResetFilters: () => void;
}

// Render search inputs, dropdown filters, and sorting controls
export function FilterBar({
	searchQuery,
	onSearchChange,
	dateFrom,
	onDateFromChange,
	dateTo,
	onDateToChange,
	participantFilter,
	onParticipantFilterChange,
	tagFilter,
	onTagFilterChange,
	sortBy,
	onSortByChange,
	availableTags,
	onResetFilters,
}: FilterBarProps) {
	const hasActiveFilters = Boolean(
		searchQuery ||
		dateFrom ||
		dateTo ||
		participantFilter ||
		tagFilter ||
		sortBy !== 'recent',
	);

	return (
		<div className="space-y-3">
			{/* Top row: search query and sort dropdown */}
			<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
				{/* Search meetings input */}
				<div className="relative flex-1">
					<Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
					<input
						type="text"
						placeholder="Search by title or topic..."
						value={searchQuery}
						onChange={(e) => onSearchChange(e.target.value)}
						className="w-full rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] py-2.5 pl-11 pr-10 text-sm text-[var(--text-primary)] outline-none transition-all focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/15 placeholder:text-[var(--text-muted)] shadow-sm"
					/>
					{searchQuery && (
						<button
							onClick={() => onSearchChange('')}
							className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
						>
							<X className="h-4 w-4" />
						</button>
					)}
				</div>

				{/* Sort dropdown */}
				<div className="flex items-center gap-2 shrink-0">
					<ArrowUpDown className="h-4 w-4 text-[var(--text-muted)]" />
					<select
						value={sortBy}
						onChange={(e) => onSortByChange(e.target.value)}
						className="rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] shadow-sm cursor-pointer"
					>
						<option value="recent">Most Recent</option>
						<option value="title">Alphabetical (A-Z)</option>
					</select>
				</div>
			</div>

			{/* Bottom row: Filter chips */}
			<div className="flex flex-wrap items-center gap-2 text-sm">
				<span className="flex items-center gap-1.5 font-medium text-[var(--text-muted)] mr-1">
					<SlidersHorizontal className="h-3.5 w-3.5" />
					Filters:
				</span>

				{/* Date From */}
				<div className="flex items-center gap-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-1.5 shadow-sm">
					<Calendar className="h-3.5 w-3.5 text-[var(--text-muted)]" />
					<span className="text-xs text-[var(--text-muted)]">From</span>
					<input
						type="date"
						value={dateFrom}
						onChange={(e) => onDateFromChange(e.target.value)}
						className="bg-transparent text-[var(--text-primary)] outline-none text-sm"
					/>
				</div>

				{/* Date To */}
				<div className="flex items-center gap-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-1.5 shadow-sm">
					<Calendar className="h-3.5 w-3.5 text-[var(--text-muted)]" />
					<span className="text-xs text-[var(--text-muted)]">To</span>
					<input
						type="date"
						value={dateTo}
						onChange={(e) => onDateToChange(e.target.value)}
						className="bg-transparent text-[var(--text-primary)] outline-none text-sm"
					/>
				</div>

				{/* Participant filter */}
				<div className="flex items-center gap-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-1.5 shadow-sm">
					<Users className="h-3.5 w-3.5 text-[var(--text-muted)]" />
					<input
						type="text"
						placeholder="Participant..."
						value={participantFilter}
						onChange={(e) => onParticipantFilterChange(e.target.value)}
						className="bg-transparent text-[var(--text-primary)] outline-none text-sm w-28 placeholder:text-[var(--text-muted)]"
					/>
				</div>

				{/* Tag filter */}
				{availableTags.length > 0 && (
					<div className="flex items-center gap-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-1.5 shadow-sm">
						<TagIcon className="h-3.5 w-3.5 text-[var(--text-muted)]" />
						<select
							value={tagFilter}
							onChange={(e) => onTagFilterChange(e.target.value)}
							className="bg-transparent text-[var(--text-primary)] outline-none text-sm cursor-pointer"
						>
							<option value="">All Tags</option>
							{availableTags.map((tag) => (
								<option key={tag.id} value={tag.name}>
									{tag.name}
								</option>
							))}
						</select>
					</div>
				)}

				{/* Reset button */}
				{hasActiveFilters && (
					<button
						onClick={onResetFilters}
						className="flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-500/10 transition-colors dark:text-red-400"
					>
						<X className="h-3.5 w-3.5" />
						Clear
					</button>
				)}
			</div>
		</div>
	);
}
