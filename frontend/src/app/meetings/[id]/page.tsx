// Meeting detail page with interactive transcript, synced media player, AI summary, and action items
'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
	ChevronLeft,
	Calendar,
	Clock,
	Download,
	Trash2,
	Edit3,
	Check,
	X,
	Plus,
	Tag as TagIcon,
	Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import {
	fetchMeeting,
	fetchTranscript,
	updateMeeting,
	deleteMeeting,
	regenerateSummary,
	attachTag,
	detachTag,
	getExportUrl,
} from '@/lib/api';
import type { TranscriptSegment } from '@/types';
import { formatDate, formatDuration } from '@/lib/utils';
import { MediaPlayer } from '@/components/transcript/MediaPlayer';
import { TranscriptPanel } from '@/components/transcript/TranscriptPanel';
import { SummaryPanel } from '@/components/summary/SummaryPanel';
import { CommentModal } from '@/components/transcript/CommentModal';
import { SoundbiteModal } from '@/components/transcript/SoundbiteModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

export default function MeetingDetailPage() {
	const params = useParams();
	const router = useRouter();
	const queryClient = useQueryClient();
	const meetingId = parseInt(params.id as string, 10);

	// Inline editing state
	const [isEditingTitle, setIsEditingTitle] = useState(false);
	const [editTitleValue, setEditTitleValue] = useState('');
	const [newTagName, setNewTagName] = useState('');
	const [isAddingTag, setIsAddingTag] = useState(false);

	// Modal states
	const [commentModalOpen, setCommentModalOpen] = useState(false);
	const [selectedSegmentId, setSelectedSegmentId] = useState<number | null>(
		null,
	);
	const [soundbiteModalOpen, setSoundbiteModalOpen] = useState(false);
	const [selectedSegment, setSelectedSegment] =
		useState<TranscriptSegment | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false);
	const [exportMenuOpen, setExportMenuOpen] = useState(false);

	// Query meeting detail
	const {
		data: meeting,
		isLoading: meetingLoading,
		refetch: refetchMeeting,
	} = useQuery({
		queryKey: ['meeting', meetingId],
		queryFn: () => fetchMeeting(meetingId),
		enabled: !isNaN(meetingId),
	});

	// Query transcript segments
	const { data: transcript = [], isLoading: transcriptLoading } = useQuery({
		queryKey: ['transcript', meetingId],
		queryFn: () => fetchTranscript(meetingId),
		enabled: !isNaN(meetingId),
	});

	// Update title mutation
	const updateTitleMutation = useMutation({
		mutationFn: (newTitle: string) =>
			updateMeeting(meetingId, { title: newTitle }),
		onSuccess: () => {
			toast.success('Meeting title updated');
			setIsEditingTitle(false);
			queryClient.invalidateQueries({ queryKey: ['meeting', meetingId] });
		},
		onError: (err: any) => {
			toast.error(err.message || 'Failed to update title');
		},
	});

	// Delete meeting mutation
	const deleteMutation = useMutation({
		mutationFn: () => deleteMeeting(meetingId),
		onSuccess: () => {
			toast.success('Meeting deleted');
			router.push('/meetings');
		},
		onError: (err: any) => {
			toast.error(err.message || 'Failed to delete meeting');
		},
	});

	// Regenerate summary mutation
	const regenerateMutation = useMutation({
		mutationFn: () => regenerateSummary(meetingId),
		onSuccess: () => {
			toast.success('AI summary regenerated successfully');
			setRegenerateDialogOpen(false);
			queryClient.invalidateQueries({ queryKey: ['meeting', meetingId] });
		},
		onError: (err: any) => {
			toast.error(err.message || 'Failed to regenerate summary');
		},
	});

	// Attach tag mutation
	const addTagMutation = useMutation({
		mutationFn: (name: string) => attachTag(meetingId, name),
		onSuccess: () => {
			toast.success('Tag attached');
			setNewTagName('');
			setIsAddingTag(false);
			queryClient.invalidateQueries({ queryKey: ['meeting', meetingId] });
		},
		onError: (err: any) => {
			toast.error(err.message || 'Failed to attach tag');
		},
	});

	// Detach tag mutation
	const removeTagMutation = useMutation({
		mutationFn: (tagId: number) => detachTag(meetingId, tagId),
		onSuccess: () => {
			toast.success('Tag removed');
			queryClient.invalidateQueries({ queryKey: ['meeting', meetingId] });
		},
	});

	if (meetingLoading) {
		return (
			<div className="flex h-full items-center justify-center">
				<div className="flex flex-col items-center gap-3">
					<div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--brand-primary)] border-t-transparent" />
					<p className="text-xs text-[var(--text-muted)]">
						Loading meeting details...
					</p>
				</div>
			</div>
		);
	}

	if (!meeting) {
		return (
			<div className="p-8 text-center">
				<h2 className="text-lg font-semibold text-[var(--text-primary)]">
					Meeting not found
				</h2>
				<Link
					href="/meetings"
					className="mt-3 inline-block text-xs font-medium text-[var(--brand-primary)] hover:underline"
				>
					← Return to Meetings Library
				</Link>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full overflow-hidden">
			{/* Meeting Detail Header */}
			<div className="border-b border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3 sm:px-6 shrink-0">
				<div className="flex flex-col gap-3">
					{/* Top navigation row */}
					<div className="flex items-center justify-between">
						<Link
							href="/meetings"
							className="inline-flex items-center gap-1 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors"
						>
							<ChevronLeft className="h-4 w-4" />
							Back to Meetings
						</Link>

						{/* Action toolbar */}
						<div className="flex items-center gap-2">
							{/* Export Dropdown */}
							<div className="relative">
								<button
									onClick={() => setExportMenuOpen(!exportMenuOpen)}
									className="flex items-center gap-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] shadow-xs transition-colors"
								>
									<Download className="h-3.5 w-3.5" />
									<span>Export</span>
								</button>

								{exportMenuOpen && (
									<>
										<div
											className="fixed inset-0 z-30"
											onClick={() => setExportMenuOpen(false)}
										/>
										<div className="absolute right-0 top-full mt-1 z-40 w-44 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] py-1 shadow-xl">
											<a
												href={getExportUrl(meetingId, 'md')}
												download
												className="flex w-full items-center gap-2 px-3 py-2 text-xs text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
												onClick={() => setExportMenuOpen(false)}
											>
												Markdown (.md)
											</a>
											<a
												href={getExportUrl(meetingId, 'txt')}
												download
												className="flex w-full items-center gap-2 px-3 py-2 text-xs text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
												onClick={() => setExportMenuOpen(false)}
											>
												Plain Text (.txt)
											</a>
										</div>
									</>
								)}
							</div>

							{/* Delete button */}
							<button
								onClick={() => setDeleteDialogOpen(true)}
								className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-500/10 shadow-xs transition-colors dark:text-red-400"
							>
								<Trash2 className="h-3.5 w-3.5" />
								<span>Delete</span>
							</button>
						</div>
					</div>

					{/* Title and metadata row */}
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
						{/* Title (inline editable) */}
						<div className="flex-1">
							{isEditingTitle ? (
								<div className="flex items-center gap-2">
									<input
										type="text"
										value={editTitleValue}
										onChange={(e) => setEditTitleValue(e.target.value)}
										className="rounded-xl border border-[var(--brand-primary)] bg-[var(--bg-secondary)] px-3 py-1.5 text-lg font-bold text-[var(--text-primary)] outline-none w-full max-w-lg"
										autoFocus
									/>
									<button
										onClick={() => {
											if (editTitleValue.trim()) {
												updateTitleMutation.mutate(editTitleValue.trim());
											}
										}}
										className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-500/10"
									>
										<Check className="h-4 w-4" />
									</button>
									<button
										onClick={() => setIsEditingTitle(false)}
										className="rounded-lg p-1.5 text-red-500 hover:bg-red-500/10"
									>
										<X className="h-4 w-4" />
									</button>
								</div>
							) : (
								<div className="flex items-center gap-2 group">
									<h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
										{meeting.title}
									</h1>
									<button
										onClick={() => {
											setEditTitleValue(meeting.title);
											setIsEditingTitle(true);
										}}
										className="opacity-0 group-hover:opacity-100 rounded-lg p-1 text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all"
										title="Edit title"
									>
										<Edit3 className="h-3.5 w-3.5" />
									</button>
								</div>
							)}

							{/* Metadata: Date, Duration, Participants */}
							<div className="mt-1.5 flex flex-wrap items-center gap-4 text-xs text-[var(--text-secondary)]">
								<div className="flex items-center gap-1.5">
									<Calendar className="h-3.5 w-3.5 text-[var(--text-muted)]" />
									<span>{formatDate(meeting.meeting_date)}</span>
								</div>
								<div className="flex items-center gap-1.5">
									<Clock className="h-3.5 w-3.5 text-[var(--text-muted)]" />
									<span>{formatDuration(meeting.duration_seconds)}</span>
								</div>
								{meeting.participants.length > 0 && (
									<div className="flex items-center gap-1 text-[var(--text-muted)]">
										<span>Participants:</span>
										<span className="font-medium text-[var(--text-primary)]">
											{meeting.participants.map((p) => p.name).join(', ')}
										</span>
									</div>
								)}
							</div>
						</div>

						{/* Tags */}
						<div className="flex flex-wrap items-center gap-1.5">
							{meeting.tags.map((tag) => (
								<span
									key={tag.id}
									className="group inline-flex items-center gap-1 rounded-full bg-[var(--bg-tertiary)] px-2.5 py-0.5 text-xs font-medium text-[var(--text-secondary)]"
								>
									{tag.name}
									<button
										onClick={() => removeTagMutation.mutate(tag.id)}
										className="opacity-60 hover:opacity-100 text-[var(--text-muted)] hover:text-red-500"
									>
										<X className="h-3 w-3" />
									</button>
								</span>
							))}

							{isAddingTag ? (
								<div className="flex items-center gap-1">
									<input
										type="text"
										placeholder="Tag name..."
										value={newTagName}
										onChange={(e) => setNewTagName(e.target.value)}
										className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] px-2 py-0.5 text-xs text-[var(--text-primary)] outline-none w-24"
										autoFocus
										onKeyDown={(e) => {
											if (e.key === 'Enter' && newTagName.trim()) {
												addTagMutation.mutate(newTagName.trim());
											}
										}}
									/>
									<button
										onClick={() => {
											if (newTagName.trim()) {
												addTagMutation.mutate(newTagName.trim());
											}
										}}
										className="rounded p-1 text-emerald-600 hover:bg-emerald-500/10"
									>
										<Check className="h-3 w-3" />
									</button>
									<button
										onClick={() => setIsAddingTag(false)}
										className="rounded p-1 text-red-500 hover:bg-red-500/10"
									>
										<X className="h-3 w-3" />
									</button>
								</div>
							) : (
								<button
									onClick={() => setIsAddingTag(true)}
									className="inline-flex items-center gap-1 rounded-full border border-dashed border-[var(--border-color)] px-2 py-0.5 text-xs text-[var(--text-muted)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors"
								>
									<Plus className="h-3 w-3" />
									Tag
								</button>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Main Two-Column Content Area */}
			<div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-4 p-4">
				{/* Left Column: Media Player + Transcript Panel (7 cols on desktop) */}
				<div className="lg:col-span-7 flex flex-col h-full gap-4 overflow-hidden">
					{/* Media Player */}
					<MediaPlayer mediaUrl={meeting.media_url} title={meeting.title} />

					{/* Scrollable Diarized Transcript Panel */}
					<div className="flex-1 overflow-hidden">
						<TranscriptPanel
							segments={transcript}
							speakers={meeting.speakers}
							isLoading={transcriptLoading}
							onAddComment={(segmentId) => {
								setSelectedSegmentId(segmentId);
								setCommentModalOpen(true);
							}}
							onCreateSoundbite={(seg) => {
								setSelectedSegment(seg);
								setSoundbiteModalOpen(true);
							}}
						/>
					</div>
				</div>

				{/* Right Column: AI Super Summary Panel (5 cols on desktop) */}
				<div className="lg:col-span-5 flex flex-col h-full overflow-hidden">
					<SummaryPanel
						meetingId={meetingId}
						summary={meeting.summary}
						keyTopics={meeting.key_topics}
						actionItems={meeting.action_items}
						isLoading={meetingLoading}
						isRegenerating={regenerateMutation.isPending}
						onRegenerate={() => setRegenerateDialogOpen(true)}
						onRefresh={refetchMeeting}
					/>
				</div>
			</div>

			{/* Comment Modal */}
			<CommentModal
				isOpen={commentModalOpen}
				meetingId={meetingId}
				segmentId={selectedSegmentId}
				onClose={() => {
					setCommentModalOpen(false);
					setSelectedSegmentId(null);
				}}
				onSuccess={refetchMeeting}
			/>

			{/* Soundbite Clip Modal */}
			<SoundbiteModal
				isOpen={soundbiteModalOpen}
				meetingId={meetingId}
				segment={selectedSegment}
				onClose={() => {
					setSoundbiteModalOpen(false);
					setSelectedSegment(null);
				}}
				onSuccess={refetchMeeting}
			/>

			{/* Delete Confirmation Modal */}
			<ConfirmDialog
				isOpen={deleteDialogOpen}
				title="Delete Meeting"
				description="Are you sure you want to permanently delete this meeting? All transcript segments, AI summaries, and action items will be removed."
				confirmLabel="Delete"
				isDestructive
				isLoading={deleteMutation.isPending}
				onConfirm={() => deleteMutation.mutate()}
				onCancel={() => setDeleteDialogOpen(false)}
			/>

			{/* Regenerate Summary Confirmation Modal */}
			<ConfirmDialog
				isOpen={regenerateDialogOpen}
				title="Regenerate AI Summary"
				description="Regenerating the AI summary will re-run the LLM on this meeting transcript and overwrite existing bullet notes, action items, and chapters. Do you want to proceed?"
				confirmLabel="Regenerate with AI"
				isLoading={regenerateMutation.isPending}
				onConfirm={() => regenerateMutation.mutate()}
				onCancel={() => setRegenerateDialogOpen(false)}
			/>
		</div>
	);
}
