// Action item list component managing tasks, filter states, and create/edit modal
'use client';

import React, { useState } from 'react';
import { CheckSquare, Plus, Filter } from 'lucide-react';
import { toast } from 'sonner';
import type { ActionItem } from '@/types';
import { updateActionItem, deleteActionItem } from '@/lib/api';
import { ActionItemRow } from './ActionItemRow';
import { ActionItemModal } from './ActionItemModal';

interface ActionItemListProps {
	meetingId: number;
	items: ActionItem[];
	onRefresh: () => void;
}

// Render complete list of action items with status toggle, edit modal, and completion counter
export function ActionItemList({
	meetingId,
	items,
	onRefresh,
}: ActionItemListProps) {
	const [modalOpen, setModalOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<ActionItem | null>(null);
	const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

	// Toggle completion status
	const handleToggle = async (id: number, currentCompleted: boolean) => {
		try {
			await updateActionItem(id, { is_completed: !currentCompleted });
			toast.success(
				!currentCompleted
					? 'Task marked as completed'
					: 'Task marked as pending',
			);
			onRefresh();
		} catch (error: any) {
			toast.error(error.message || 'Failed to update task');
		}
	};

	// Delete action item
	const handleDelete = async (id: number) => {
		try {
			await deleteActionItem(id);
			toast.success('Action item deleted');
			onRefresh();
		} catch (error: any) {
			toast.error(error.message || 'Failed to delete task');
		}
	};

	// Filter items
	const filteredItems = items.filter((item) => {
		if (filter === 'pending') return !item.is_completed;
		if (filter === 'completed') return item.is_completed;
		return true;
	});

	const completedCount = items.filter((i) => i.is_completed).length;

	return (
		<div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-sm">
			{/* Header with Title and Add Button */}
			<div className="flex items-center justify-between border-b border-[var(--border-color)]/60 pb-4">
				<div className="flex items-center gap-2">
					<CheckSquare className="h-4 w-4 text-[var(--brand-primary)]" />
					<h4 className="text-sm font-semibold text-[var(--text-primary)]">
						Action Items ({completedCount}/{items.length})
					</h4>
				</div>

				<button
					type="button"
					onClick={() => {
						setEditingItem(null);
						setModalOpen(true);
					}}
					className="btn-primary text-xs py-1.5 px-3"
				>
					<Plus className="h-3.5 w-3.5" />
					Add Task
				</button>
			</div>

			{/* Filter tabs */}
			{items.length > 0 && (
				<div className="mt-3 flex items-center gap-1 border-b border-[var(--border-color)]/40 pb-3 text-sm">
					<Filter className="h-3 w-3 text-[var(--text-muted)] mr-1" />
					<button
						onClick={() => setFilter('all')}
						className={`rounded-lg px-2.5 py-1 transition-colors ${
							filter === 'all'
								? 'bg-[var(--bg-secondary)] font-semibold text-[var(--brand-primary)]'
								: 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
						}`}
					>
						All ({items.length})
					</button>
					<button
						onClick={() => setFilter('pending')}
						className={`rounded-lg px-2.5 py-1 transition-colors ${
							filter === 'pending'
								? 'bg-[var(--bg-secondary)] font-semibold text-[var(--brand-primary)]'
								: 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
						}`}
					>
						Pending ({items.length - completedCount})
					</button>
					<button
						onClick={() => setFilter('completed')}
						className={`rounded-lg px-2.5 py-1 transition-colors ${
							filter === 'completed'
								? 'bg-[var(--bg-secondary)] font-semibold text-[var(--brand-primary)]'
								: 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
						}`}
					>
						Completed ({completedCount})
					</button>
				</div>
			)}

			{/* List of items */}
			<div className="mt-3 space-y-2">
				{filteredItems.length === 0 ? (
					<div className="py-6 text-center text-sm text-[var(--text-muted)]">
						{items.length === 0
							? 'No action items extracted from this meeting yet.'
							: 'No action items match the selected filter.'}
					</div>
				) : (
					filteredItems.map((item) => (
						<ActionItemRow
							key={item.id}
							item={item}
							onToggle={handleToggle}
							onEdit={(it) => {
								setEditingItem(it);
								setModalOpen(true);
							}}
							onDelete={handleDelete}
						/>
					))
				)}
			</div>

			{/* Create/Edit Modal */}
			<ActionItemModal
				isOpen={modalOpen}
				meetingId={meetingId}
				itemToEdit={editingItem}
				onClose={() => {
					setModalOpen(false);
					setEditingItem(null);
				}}
				onSuccess={onRefresh}
			/>
		</div>
	);
}
