// Modal for adding a comment to a meeting or transcript segment
'use client';

import React, { useState } from 'react';
import { X, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { createComment } from '@/lib/api';

interface CommentModalProps {
	isOpen: boolean;
	meetingId: number;
	segmentId?: number | null;
	onClose: () => void;
	onSuccess: () => void;
}

// Render modal to write and attach a comment
export function CommentModal({
	isOpen,
	meetingId,
	segmentId,
	onClose,
	onSuccess,
}: CommentModalProps) {
	const [content, setContent] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	if (!isOpen) return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!content.trim()) return;

		setIsLoading(true);
		try {
			await createComment(meetingId, {
				content: content.trim(),
				segment_id: segmentId || undefined,
			});
			toast.success('Comment pinned successfully');
			setContent('');
			onSuccess();
			onClose();
		} catch (error: any) {
			toast.error(error.message || 'Failed to add comment');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
			<div
				className="w-full max-w-md rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-2xl animate-in zoom-in-95 duration-150"
				role="dialog"
				aria-modal="true"
			>
				<div className="flex items-center justify-between border-b border-[var(--border-color)]/60 pb-3">
					<div className="flex items-center gap-2">
						<div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
							<MessageSquare className="h-4 w-4" />
						</div>
						<h3 className="text-base font-semibold text-[var(--text-primary)]">
							{segmentId ? 'Add Comment on Segment' : 'Add Meeting Comment'}
						</h3>
					</div>
					<button
						onClick={onClose}
						className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="mt-4 space-y-4">
					<textarea
						rows={4}
						placeholder="Write your observation or note here..."
						value={content}
						onChange={(e) => setContent(e.target.value)}
						required
						className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-3 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20"
					/>

					<div className="flex items-center justify-end gap-3">
						<button
							type="button"
							onClick={onClose}
							className="rounded-xl border border-[var(--border-color)] px-4 py-2 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isLoading || !content.trim()}
							className="rounded-xl bg-[var(--brand-primary)] px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-[var(--brand-primary-dark)] disabled:opacity-50 transition-colors"
						>
							{isLoading ? 'Saving...' : 'Pin Comment'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
