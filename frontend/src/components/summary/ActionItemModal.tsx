// Modal for creating or editing an action item
'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckSquare } from 'lucide-react';
import { toast } from 'sonner';
import type { ActionItem } from '@/types';
import { createActionItem, updateActionItem } from '@/lib/api';

interface ActionItemModalProps {
	isOpen: boolean;
	meetingId: number;
	itemToEdit?: ActionItem | null;
	onClose: () => void;
	onSuccess: () => void;
}

// Render form to add or edit an action item task
export function ActionItemModal({
	isOpen,
	meetingId,
	itemToEdit,
	onClose,
	onSuccess,
}: ActionItemModalProps) {
	const [text, setText] = useState('');
	const [assignee, setAssignee] = useState('');
	const [dueDate, setDueDate] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (itemToEdit) {
			setText(itemToEdit.text);
			setAssignee(itemToEdit.assignee || '');
			setDueDate(itemToEdit.due_date || '');
		} else {
			setText('');
			setAssignee('');
			setDueDate('');
		}
	}, [itemToEdit, isOpen]);

	if (!isOpen) return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!text.trim()) return;

		setIsLoading(true);
		try {
			if (itemToEdit) {
				await updateActionItem(itemToEdit.id, {
					text: text.trim(),
					assignee: assignee.trim() || undefined,
					due_date: dueDate || undefined,
				});
				toast.success('Action item updated');
			} else {
				await createActionItem(meetingId, {
					text: text.trim(),
					assignee: assignee.trim() || undefined,
					due_date: dueDate || undefined,
				});
				toast.success('Action item added');
			}
			onSuccess();
			onClose();
		} catch (error: any) {
			toast.error(error.message || 'Failed to save action item');
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
							<CheckSquare className="h-4 w-4" />
						</div>
						<h3 className="text-base font-semibold text-[var(--text-primary)]">
							{itemToEdit ? 'Edit Action Item' : 'New Action Item'}
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
					<div>
						<label className="block text-xs font-medium text-[var(--text-primary)] mb-1">
							Action Item Description *
						</label>
						<textarea
							rows={3}
							value={text}
							onChange={(e) => setText(e.target.value)}
							required
							placeholder="e.g. Follow up with client regarding SOC 2 report"
							className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-3 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20"
						/>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<div>
							<label className="block text-xs font-medium text-[var(--text-primary)] mb-1">
								Assignee (Optional)
							</label>
							<input
								type="text"
								placeholder="e.g. Sarah Chen"
								value={assignee}
								onChange={(e) => setAssignee(e.target.value)}
								className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
							/>
						</div>

						<div>
							<label className="block text-xs font-medium text-[var(--text-primary)] mb-1">
								Due Date (Optional)
							</label>
							<input
								type="date"
								value={dueDate}
								onChange={(e) => setDueDate(e.target.value)}
								className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
							/>
						</div>
					</div>

					<div className="flex items-center justify-end gap-3 pt-2">
						<button
							type="button"
							onClick={onClose}
							className="rounded-xl border border-[var(--border-color)] px-4 py-2 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isLoading || !text.trim()}
							className="rounded-xl bg-[var(--brand-primary)] px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-[var(--brand-primary-dark)] disabled:opacity-50 transition-colors"
						>
							{isLoading
								? 'Saving...'
								: itemToEdit
									? 'Save Changes'
									: 'Create Task'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
