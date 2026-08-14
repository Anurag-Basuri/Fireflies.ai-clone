// Modal for clipping and saving soundbites from a transcript segment
'use client';

import React, { useState, useEffect } from 'react';
import { X, Scissors } from 'lucide-react';
import { toast } from 'sonner';
import type { TranscriptSegment } from '@/types';
import { createSoundbite } from '@/lib/api';
import { formatTime } from '@/lib/utils';

interface SoundbiteModalProps {
	isOpen: boolean;
	meetingId: number;
	segment: TranscriptSegment | null;
	onClose: () => void;
	onSuccess: () => void;
}

// Render soundbite creation form with start and end timestamps
export function SoundbiteModal({
	isOpen,
	meetingId,
	segment,
	onClose,
	onSuccess,
}: SoundbiteModalProps) {
	const [title, setTitle] = useState('');
	const [startTime, setStartTime] = useState(0);
	const [endTime, setEndTime] = useState(15);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (segment) {
			setTitle(`Clip from ${segment.speaker_label || 'Speaker'}`);
			setStartTime(segment.start_time);
			setEndTime(segment.end_time);
		}
	}, [segment]);

	if (!isOpen || !segment) return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) return;

		setIsLoading(true);
		try {
			await createSoundbite(meetingId, {
				title: title.trim(),
				segment_id: segment.id,
				start_time: startTime,
				end_time: endTime,
			});
			toast.success('Soundbite clip created successfully');
			onSuccess();
			onClose();
		} catch (error: any) {
			toast.error(error.message || 'Failed to create soundbite');
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
						<div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
							<Scissors className="h-4 w-4" />
						</div>
						<h3 className="text-base font-semibold text-[var(--text-primary)]">
							Create Soundbite Clip
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
							Clip Title *
						</label>
						<input
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							required
							className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3.5 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
						/>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<div>
							<label className="block text-xs font-medium text-[var(--text-primary)] mb-1">
								Start Time ({formatTime(startTime)})
							</label>
							<input
								type="number"
								step="0.5"
								min="0"
								value={startTime}
								onChange={(e) => setStartTime(parseFloat(e.target.value) || 0)}
								className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2 text-xs font-mono text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
							/>
						</div>
						<div>
							<label className="block text-xs font-medium text-[var(--text-primary)] mb-1">
								End Time ({formatTime(endTime)})
							</label>
							<input
								type="number"
								step="0.5"
								min={startTime}
								value={endTime}
								onChange={(e) => setEndTime(parseFloat(e.target.value) || 0)}
								className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2 text-xs font-mono text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
							/>
						</div>
					</div>

					<div className="rounded-xl bg-[var(--bg-secondary)] p-3 text-xs text-[var(--text-muted)] italic">
						"{segment.content}"
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
							disabled={isLoading || !title.trim()}
							className="rounded-xl bg-[var(--brand-primary)] px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-[var(--brand-primary-dark)] disabled:opacity-50 transition-colors"
						>
							{isLoading ? 'Creating...' : 'Save Soundbite'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
