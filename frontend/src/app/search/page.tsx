// Global Search page searching across meeting titles, topics, and spoken transcript segments
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Search, ArrowRight } from 'lucide-react';
import { globalSearch } from '@/lib/api';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { formatTime } from '@/lib/utils';
import { EmptyState } from '@/components/common/EmptyState';

function SearchContent() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const initialQuery = searchParams.get('q') || '';

	const [query, setQuery] = useState(initialQuery);
	const debouncedQuery = useDebounce(query, 300);

	// Update URL param when debounced query changes
	useEffect(() => {
		if (debouncedQuery.trim()) {
			router.replace(`/search?q=${encodeURIComponent(debouncedQuery.trim())}`);
		}
	}, [debouncedQuery, router]);

	// Fetch search results
	const { data, isLoading } = useQuery({
		queryKey: ['globalSearch', debouncedQuery],
		queryFn: () => globalSearch(debouncedQuery),
		enabled: Boolean(debouncedQuery.trim()),
	});

	const results = data?.results || [];

	// Highlight match query in snippet text
	const renderSnippet = (text: string) => {
		if (!debouncedQuery.trim()) return text;
		const q = debouncedQuery.trim();
		const regex = new RegExp(
			`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
			'gi',
		);
		const parts = text.split(regex);

		return parts.map((part, i) => {
			if (part.toLowerCase() === q.toLowerCase()) {
				return (
					<mark
						key={i}
						className="rounded-xs bg-amber-400/30 font-semibold text-[var(--brand-primary)] px-0.5"
					>
						{part}
					</mark>
				);
			}
			return part;
		});
	};

	return (
		<div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-200">
			{/* Header & Search Bar */}
			<div>
				<h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
					Global Search
				</h1>
				<p className="mt-1 text-xs text-[var(--text-secondary)]">
					Find conversations, spoken sentences, decisions, and topics across all
					past meetings
				</p>
			</div>

			{/* Search input field */}
			<div className="relative">
				<Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-muted)]" />
				<input
					type="text"
					placeholder="Search everything across all transcripts, topics, and titles..."
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					autoFocus
					className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] py-3.5 pl-12 pr-4 text-sm text-[var(--text-primary)] shadow-sm outline-none transition-colors focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20"
				/>
			</div>

			{/* Search Results Area */}
			<div className="space-y-3">
				{isLoading ? (
					<div className="space-y-3">
						{Array.from({ length: 4 }).map((_, i) => (
							<div
								key={i}
								className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-xs"
							>
								<div className="skeleton h-5 w-1/3 rounded-md mb-2" />
								<div className="skeleton h-4 w-full rounded-md" />
							</div>
						))}
					</div>
				) : !query.trim() ? (
					<EmptyState
						title="Type to search"
						description="Enter a keyword or phrase above to search all meeting titles and spoken transcript text."
					/>
				) : results.length === 0 ? (
					<EmptyState
						title={`No results for "${query}"`}
						description="We could not find any meetings or spoken segments matching your query. Try searching for different keywords."
					/>
				) : (
					<div>
						<p className="text-xs text-[var(--text-muted)] mb-3 font-medium">
							Found{' '}
							<span className="font-semibold text-[var(--text-primary)]">
								{results.length}
							</span>{' '}
							results for &ldquo;{query}&rdquo;
						</p>

						<div className="space-y-3">
							{results.map((result, idx) => (
								<Link
									key={idx}
									href={`/meetings/${result.meeting_id}`}
									className="group block rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-xs transition-all hover:border-[var(--brand-primary)]/50 hover:shadow-md"
								>
									<div className="flex items-start justify-between gap-4">
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2">
												<span
													className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
														result.match_type === 'title'
															? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
															: 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
													}`}
												>
													{result.match_type}
												</span>
												<h3 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors truncate">
													{result.meeting_title}
												</h3>
											</div>

											<p className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
												{renderSnippet(result.content)}
											</p>
										</div>

										<div className="flex items-center gap-2 shrink-0 text-xs text-[var(--text-muted)]">
											{result.start_time !== null &&
												result.start_time !== undefined && (
													<span className="font-mono text-[11px] bg-[var(--bg-secondary)] px-2 py-1 rounded-lg">
														{formatTime(result.start_time)}
													</span>
												)}
											<ArrowRight className="h-4 w-4 text-[var(--text-muted)] group-hover:text-[var(--brand-primary)] group-hover:translate-x-0.5 transition-all" />
										</div>
									</div>
								</Link>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

// Suspense-wrapped Search Page export
export default function SearchPage() {
	return (
		<Suspense
			fallback={
				<div className="p-8 text-center text-xs text-[var(--text-muted)]">
					Loading search...
				</div>
			}
		>
			<SearchContent />
		</Suspense>
	);
}
