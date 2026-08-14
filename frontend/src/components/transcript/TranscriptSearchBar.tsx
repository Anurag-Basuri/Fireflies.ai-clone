// In-transcript search bar with highlighted match navigation
'use client';

import React from 'react';
import { Search, ChevronUp, ChevronDown, X } from 'lucide-react';

interface TranscriptSearchBarProps {
	query: string;
	onQueryChange: (query: string) => void;
	totalMatches: number;
	currentMatchIndex: number;
	onNextMatch: () => void;
	onPrevMatch: () => void;
	onClear: () => void;
}

// Render in-transcript search input with match count and jump buttons
export function TranscriptSearchBar({
	query,
	onQueryChange,
	totalMatches,
	currentMatchIndex,
	onNextMatch,
	onPrevMatch,
	onClear,
}: TranscriptSearchBarProps) {
	return (
		<div className="flex items-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-1.5 shadow-xs">
			<Search className="h-4 w-4 text-[var(--text-muted)] shrink-0" />
			<input
				type="text"
				placeholder="Search in transcript..."
				value={query}
				onChange={(e) => onQueryChange(e.target.value)}
				className="flex-1 bg-transparent text-xs text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
			/>

			{query && (
				<div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
					<span className="font-mono text-[10px]">
						{totalMatches > 0
							? `${currentMatchIndex + 1}/${totalMatches}`
							: '0 results'}
					</span>

					<button
						onClick={onPrevMatch}
						disabled={totalMatches === 0}
						className="rounded p-1 hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] disabled:opacity-40 transition-colors"
						title="Previous Match"
					>
						<ChevronUp className="h-3.5 w-3.5" />
					</button>

					<button
						onClick={onNextMatch}
						disabled={totalMatches === 0}
						className="rounded p-1 hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] disabled:opacity-40 transition-colors"
						title="Next Match"
					>
						<ChevronDown className="h-3.5 w-3.5" />
					</button>

					<button
						onClick={onClear}
						className="rounded p-1 hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
						title="Clear Search"
					>
						<X className="h-3.5 w-3.5" />
					</button>
				</div>
			)}
		</div>
	);
}
