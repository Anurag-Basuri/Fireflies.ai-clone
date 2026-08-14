// Filter and search bar for the meetings library
'use client';

import React from 'react';
import {
	Search,
	Filter,
	Calendar,
	Users,
	Tag as TagIcon,
	ArrowUpDown,
	X,
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
		<div className="flex flex-col gap-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-xs">
			{/* Top row: search query and sort dropdown */}
			<div className="flex flex-col sm:flex-row items-center justify-between gap-3">
				{/* Search meetings input */}
				<div className="relative w-full sm:flex-1">
					<Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
					<input
						type="text"
						placeholder="Search by title or topic..."
						value={searchQuery}
						onChange={(e) => onSearchChange(e.target.value)}
						className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20"
					/>
					{searchQuery && (
						<button
							onClick={() => onSearchChange('')}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
						>
							<X className="h-4 w-4" />
						</button>
					)}
				</div>

				{/* Sort dropdown */}
				<div className="flex w-full sm:w-auto items-center gap-2">
					<ArrowUpDown className="h-4 w-4 text-[var(--text-muted)] shrink-0" />
					<select
						value={sortBy}
						onChange={(e) => onSortByChange(e.target.value)}
						className="w-full sm:w-auto rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2.5 text-xs font-medium text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
					>
						<option value="recent">Most Recent First</option>
						<option value="title">Sort Alphabetically (A-Z)</option>
					</select>
				</div>
			</div>

			{/* Bottom row: Filter chips and date/tag/participant pickers */}
			<div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--border-color)]/60 text-xs">
				<span className="flex items-center gap-1 font-medium text-[var(--text-muted)]">
					<Filter className="h-3.5 w-3.5" />
					Filters:
				</span>

				{/* Date From */}
				<div className="flex items-center gap-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-2.5 py-1.5">
					<Calendar className="h-3.5 w-3.5 text-[var(--text-muted)]" />
					<span className="text-[var(--text-muted)]">From:</span>
					<input
						type="date"
						value={dateFrom}
						onChange={(e) => onDateFromChange(e.target.value)}
						className="bg-transparent text-[var(--text-primary)] outline-none text-xs"
					/>
				</div>

				{/* Date To */}
				<div className="flex items-center gap-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-2.5 py-1.5">
					<Calendar className="h-3.5 w-3.5 text-[var(--text-muted)]" />
					<span className="text-[var(--text-muted)]">To:</span>
					<input
						type="date"
						value={dateTo}
						onChange={(e) => onDateToChange(e.target.value)}
						className="bg-transparent text-[var(--text-primary)] outline-none text-xs"
					/>
				</div>

				{/* Participant filter */}
				<div className="flex items-center gap-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-2.5 py-1.5">
					<Users className="h-3.5 w-3.5 text-[var(--text-muted)]" />
					<input
						type="text"
						placeholder="Participant name..."
						value={participantFilter}
						onChange={(e) => onParticipantFilterChange(e.target.value)}
						className="bg-transparent text-[var(--text-primary)] outline-none text-xs w-28 placeholder:text-[var(--text-muted)]"
					/>
				</div>

				{/* Tag filter */}
				{availableTags.length > 0 && (
					<div className="flex items-center gap-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-2.5 py-1.5">
						<TagIcon className="h-3.5 w-3.5 text-[var(--text-muted)]" />
						<select
							value={tagFilter}
							onChange={(e) => onTagFilterChange(e.target.value)}
							className="bg-transparent text-[var(--text-primary)] outline-none text-xs"
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
						className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-500/10 transition-colors dark:text-red-400"
					>
						<X className="h-3.5 w-3.5" />
						Clear All
					</button>
				)}
			</div>
		</div>
	);
}
