// Reusable confirmation modal dialog for destructive or critical actions
'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
	isOpen: boolean;
	title: string;
	description: string;
	confirmLabel?: string;
	cancelLabel?: string;
	isDestructive?: boolean;
	isLoading?: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}

// Render accessible confirmation dialog modal
export function ConfirmDialog({
	isOpen,
	title,
	description,
	confirmLabel = 'Confirm',
	cancelLabel = 'Cancel',
	isDestructive = false,
	isLoading = false,
	onConfirm,
	onCancel,
}: ConfirmDialogProps) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
			<div
				className="w-full max-w-md rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-2xl animate-in zoom-in-95 duration-150"
				role="dialog"
				aria-modal="true"
			>
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-3">
						{isDestructive ? (
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
								<AlertTriangle className="h-5 w-5" />
							</div>
						) : (
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
								<AlertTriangle className="h-5 w-5" />
							</div>
						)}
						<h3 className="text-lg font-semibold text-[var(--text-primary)]">
							{title}
						</h3>
					</div>
					<button
						onClick={onCancel}
						className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				<p className="mt-3 text-sm text-[var(--text-secondary)] leading-relaxed">
					{description}
				</p>

				<div className="mt-6 flex items-center justify-end gap-3">
					<button
						type="button"
						onClick={onCancel}
						disabled={isLoading}
						className="rounded-full border border-[var(--border-color)] px-5 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"
					>
						{cancelLabel}
					</button>
					<button
						type="button"
						onClick={onConfirm}
						disabled={isLoading}
						className={`rounded-full px-5 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 shadow-sm ${
							isDestructive
								? 'bg-red-600 hover:bg-red-700 hover:shadow-red-600/20'
								: 'bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-dark)] hover:shadow-[var(--brand-primary)]/20'
						}`}
					>
						{isLoading ? 'Processing...' : confirmLabel}
					</button>
				</div>
			</div>
		</div>
	);
}
