// Meetings Library Dashboard page with search, filters, pagination, and create meeting modal
'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { fetchMeetings, fetchTags, deleteMeeting } from '@/lib/api';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { MeetingList } from '@/components/meetings/MeetingList';
import { FilterBar } from '@/components/meetings/FilterBar';
import { CreateMeetingModal } from '@/components/meetings/CreateMeetingModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

export default function MeetingsPage() {
	const queryClient = useQueryClient();

	// Search and filter state
	const [searchQuery, setSearchQuery] = useState('');
	const [dateFrom, setDateFrom] = useState('');
	const [dateTo, setDateTo] = useState('');
	const [participantFilter, setParticipantFilter] = useState('');
	const [tagFilter, setTagFilter] = useState('');
	const [sortBy, setSortBy] = useState('recent');
	const [page, setPage] = useState(1);
	const pageSize = 9;

	// Modal states
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [meetingToDelete, setMeetingToDelete] = useState<number | null>(null);

	// Debounce text searches
	const debouncedSearch = useDebounce(searchQuery, 300);
	const debouncedParticipant = useDebounce(participantFilter, 300);

	// Fetch meetings query
	const {
		data: meetingsData,
		isLoading,
		refetch,
	} = useQuery({
		queryKey: [
			'meetings',
			debouncedSearch,
			dateFrom,
			dateTo,
			debouncedParticipant,
			tagFilter,
			sortBy,
			page,
		],
		queryFn: () =>
			fetchMeetings({
				q: debouncedSearch || undefined,
				date_from: dateFrom || undefined,
				date_to: dateTo || undefined,
				participant: debouncedParticipant || undefined,
				tag: tagFilter || undefined,
				sort: sortBy,
				page,
				page_size: pageSize,
			}),
	});

	// Fetch tags query for filter dropdown
	const { data: tagsData = [] } = useQuery({
		queryKey: ['tags'],
		queryFn: fetchTags,
	});

	// Delete mutation
	const deleteMutation = useMutation({
		mutationFn: (id: number) => deleteMeeting(id),
		onSuccess: () => {
			toast.success('Meeting deleted successfully');
			queryClient.invalidateQueries({ queryKey: ['meetings'] });
			setMeetingToDelete(null);
		},
		onError: (err: any) => {
			toast.error(err.message || 'Failed to delete meeting');
		},
	});

	// Reset all filters
	const handleResetFilters = () => {
		setSearchQuery('');
		setDateFrom('');
		setDateTo('');
		setParticipantFilter('');
		setTagFilter('');
		setSortBy('recent');
		setPage(1);
	};

	const totalMeetings = meetingsData?.total || 0;

	return (
		<div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 flex flex-col gap-6 animate-fade-in-up">
			{/* Page Header */}
			<div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
						Meetings Library
					</h1>
					<p className="mt-1.5 text-sm text-[var(--text-secondary)]">
						{totalMeetings > 0 ? (
							<>
								<span className="font-semibold text-[var(--brand-primary)]">
									{totalMeetings}
								</span>{' '}
								meeting{totalMeetings !== 1 ? 's' : ''} with AI transcripts
								and summaries
							</>
						) : (
							'Browse past conversations, smart transcripts, AI summaries, and action items'
						)}
					</p>
				</div>

				{/* Create Meeting CTA — pill button with gradient */}
				<button
					type="button"
					onClick={() => setCreateModalOpen(true)}
					className="btn-primary text-sm"
				>
					<Plus className="h-4 w-4" />
					New Meeting
				</button>
			</div>

			{/* Search & Filter Bar */}
			<FilterBar
				searchQuery={searchQuery}
				onSearchChange={(val) => {
					setSearchQuery(val);
					setPage(1);
				}}
				dateFrom={dateFrom}
				onDateFromChange={(val) => {
					setDateFrom(val);
					setPage(1);
				}}
				dateTo={dateTo}
				onDateToChange={(val) => {
					setDateTo(val);
					setPage(1);
				}}
				participantFilter={participantFilter}
				onParticipantFilterChange={(val) => {
					setParticipantFilter(val);
					setPage(1);
				}}
				tagFilter={tagFilter}
				onTagFilterChange={(val) => {
					setTagFilter(val);
					setPage(1);
				}}
				sortBy={sortBy}
				onSortByChange={(val) => {
					setSortBy(val);
					setPage(1);
				}}
				availableTags={tagsData}
				onResetFilters={handleResetFilters}
			/>

			{/* Meetings List */}
			<MeetingList
				meetings={meetingsData?.items || []}
				isLoading={isLoading}
				total={meetingsData?.total || 0}
				page={meetingsData?.page || 1}
				pageSize={pageSize}
				totalPages={meetingsData?.total_pages || 1}
				onPageChange={setPage}
				onDelete={(id) => setMeetingToDelete(id)}
				onCreateClick={() => setCreateModalOpen(true)}
			/>

			{/* Create Meeting Modal */}
			<CreateMeetingModal
				isOpen={createModalOpen}
				onClose={() => setCreateModalOpen(false)}
				onSuccess={() => {
					queryClient.invalidateQueries({ queryKey: ['meetings'] });
				}}
			/>

			{/* Delete Confirmation Modal */}
			<ConfirmDialog
				isOpen={meetingToDelete !== null}
				title="Delete Meeting"
				description="Are you sure you want to delete this meeting? This will permanently remove its transcript, AI summary, and action items."
				confirmLabel="Delete Meeting"
				isDestructive
				isLoading={deleteMutation.isPending}
				onConfirm={() => {
					if (meetingToDelete !== null) {
						deleteMutation.mutate(meetingToDelete);
					}
				}}
				onCancel={() => setMeetingToDelete(null)}
			/>
		</div>
	);
}
