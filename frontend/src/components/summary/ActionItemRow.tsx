// Single action item row with completion toggle, assignee, and action buttons
'use client';

import React from 'react';
import {
	CheckCircle,
	Circle,
	Calendar,
	User,
	Trash2,
	Edit2,
} from 'lucide-react';
import type { ActionItem } from '@/types';
import { formatDate } from '@/lib/utils';

interface ActionItemRowProps {
	item: ActionItem;
	onToggle: (id: number, currentCompleted: boolean) => void;
	onEdit: (item: ActionItem) => void;
	onDelete: (id: number) => void;
}

// Render action item row with status checkbox, assignee badge, and due date
export function ActionItemRow({
	item,
	onToggle,
	onEdit,
	onDelete,
}: ActionItemRowProps) {
	return (
		<div
			className={`group flex items-start justify-between gap-3 rounded-xl border p-3 transition-all duration-150 ${
				item.is_completed
					? 'border-[var(--border-color)]/60 bg-[var(--bg-secondary)]/50 opacity-75'
					: 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--brand-primary)]/40 hover:shadow-xs'
			}`}
		>
			{/* Left: Checkbox & task text */}
			<div className="flex items-start gap-3 flex-1 min-w-0">
				<button
					type="button"
					onClick={() => onToggle(item.id, item.is_completed)}
					className="mt-0.5 text-[var(--brand-primary)] hover:scale-110 active:scale-95 transition-transform shrink-0"
					aria-label={item.is_completed ? 'Mark incomplete' : 'Mark completed'}
				>
					{item.is_completed ? (
						<CheckCircle className="h-4 w-4 fill-[var(--brand-primary)] text-white dark:text-[var(--bg-card)]" />
					) : (
						<Circle className="h-4 w-4 text-[var(--text-muted)] hover:text-[var(--brand-primary)]" />
					)}
				</button>

				<div className="flex-1 min-w-0">
					<p
						className={`text-xs leading-relaxed ${
							item.is_completed
								? 'line-through text-[var(--text-muted)]'
								: 'text-[var(--text-primary)] font-medium'
						}`}
					>
						{item.text}
					</p>

					{/* Metadata row: Assignee & Due Date */}
					<div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-[var(--text-muted)]">
						{item.assignee && (
							<span className="inline-flex items-center gap-1 rounded-full bg-[var(--brand-primary)]/10 px-2 py-0.5 font-medium text-[var(--brand-primary)]">
								<User className="h-3 w-3" />
								{item.assignee}
							</span>
						)}

						{item.due_date && (
							<span className="flex items-center gap-1 font-mono">
								<Calendar className="h-3 w-3" />
								Due: {formatDate(item.due_date)}
							</span>
						)}
					</div>
				</div>
			</div>

			{/* Right: Edit & Delete buttons */}
			<div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity shrink-0">
				<button
					onClick={() => onEdit(item)}
					className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
					title="Edit action item"
				>
					<Edit2 className="h-3.5 w-3.5" />
				</button>
				<button
					onClick={() => onDelete(item.id)}
					className="rounded-lg p-1.5 text-red-500 hover:bg-red-500/10 transition-colors"
					title="Delete action item"
				>
					<Trash2 className="h-3.5 w-3.5" />
				</button>
			</div>
		</div>
	);
}
