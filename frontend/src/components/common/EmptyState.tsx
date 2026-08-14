// Empty state placeholder component for displaying when no items match filters or lists are empty
import React from 'react';
import { FolderSearch } from 'lucide-react';

interface EmptyStateProps {
	title?: string;
	description?: string;
	action?: React.ReactNode;
	icon?: React.ReactNode;
}

// Render empty state with customizable title, description, and action button
export function EmptyState({
	title = 'No meetings found',
	description = 'Try adjusting your search query or filters to find what you are looking for.',
	action,
	icon,
}: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-12 text-center shadow-sm">
			<div
				className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-sm mb-2"
				style={{ background: 'var(--brand-gradient)' }}
			>
				{icon || <FolderSearch className="h-7 w-7" />}
			</div>
			<h3 className="mt-4 text-base font-semibold text-[var(--text-primary)]">
				{title}
			</h3>
			<p className="mt-1 max-w-sm text-sm text-[var(--text-secondary)]">
				{description}
			</p>
			{action && <div className="mt-6">{action}</div>}
		</div>
	);
}
