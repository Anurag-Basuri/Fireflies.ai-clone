// Modal for creating meetings via file upload, pasted transcript, or quick demo preset
'use client';

import React, { useState } from 'react';
import {
	X,
	Upload,
	FileText,
	Sparkles,
	Plus,
	Trash2,
	CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { createMeeting, uploadMeeting } from '@/lib/api';

interface CreateMeetingModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

// Preset samples for fast demo creation
const PRESET_SAMPLES = [
	{
		title: 'AI Product Strategy & Roadmap Alignment',
		participants: [
			{ name: 'Alex Rivera', role: 'Head of Product' },
			{ name: 'Jessica Wang', role: 'Staff ML Engineer' },
			{ name: 'Samuel Miller', role: 'UX Research Lead' },
		],
		transcript: `Alex Rivera: Welcome everyone. Let's discuss our AI integration strategy for Q4. Jessica, how is the model evaluation progressing?
Jessica Wang: We tested three frontier models. The inference latency is down to 180ms with 96% accuracy on summary extraction. I will prepare the benchmark report by Friday.
Samuel Miller: From user testing, 82% of managers found the action item extraction extremely valuable. We should make sure the due date parser supports relative dates like 'next Monday'.
Alex Rivera: Great observation. Samuel, please document the edge cases for date parsing. Jessica, proceed with deploying the model to staging. Let's sync again next Tuesday.`,
	},
	{
		title: 'Infrastructure & Kubernetes Security Review',
		participants: [
			{ name: 'Devon Vance', role: 'DevOps Lead' },
			{ name: 'Chloe Bennett', role: 'Security Architect' },
		],
		transcript: `Devon Vance: We are auditing our Kubernetes cluster access ahead of our ISO 27001 renewal.
Chloe Bennett: All worker nodes have been upgraded to the latest patch. We need to enforce network policies on the ingress controller. I'll configure the Calico rules by Wednesday.
Devon Vance: Perfect. I'll also enable automated secrets rotation in Vault for all database credentials.`,
	},
];

// Render modal with tabs for File Upload, Paste Text, and Demo Preset
export function CreateMeetingModal({
	isOpen,
	onClose,
	onSuccess,
}: CreateMeetingModalProps) {
	const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'preset'>(
		'upload',
	);
	const [isLoading, setIsLoading] = useState(false);

	// Form fields
	const [title, setTitle] = useState('');
	const [meetingDate, setMeetingDate] = useState(
		new Date().toISOString().split('T')[0],
	);
	const [participants, setParticipants] = useState<
		{ name: string; email: string; role: string }[]
	>([{ name: '', email: '', role: '' }]);

	// File upload state
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	// Paste text state
	const [transcriptText, setTranscriptText] = useState('');

	if (!isOpen) return null;

	// Add participant row
	const handleAddParticipant = () => {
		setParticipants([...participants, { name: '', email: '', role: '' }]);
	};

	// Remove participant row
	const handleRemoveParticipant = (index: number) => {
		setParticipants(participants.filter((_, i) => i !== index));
	};

	// Update participant field
	const handleParticipantChange = (
		index: number,
		field: 'name' | 'email' | 'role',
		value: string,
	) => {
		const updated = [...participants];
		updated[index][field] = value;
		setParticipants(updated);
	};

	// Apply preset template
	const handleSelectPreset = (preset: (typeof PRESET_SAMPLES)[0]) => {
		setTitle(preset.title);
		setParticipants(
			preset.participants.map((p) => ({
				name: p.name,
				email: `${p.name.toLowerCase().replace(' ', '.')}@example.com`,
				role: p.role,
			})),
		);
		setTranscriptText(preset.transcript);
		setActiveTab('paste');
	};

	// Submit handler
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) {
			toast.error('Please provide a meeting title');
			return;
		}

		setIsLoading(true);
		const filteredParticipants = participants.filter(
			(p) => p.name.trim() !== '',
		);

		try {
			if (activeTab === 'upload') {
				if (!selectedFile) {
					toast.error('Please select a transcript or media file');
					setIsLoading(false);
					return;
				}

				const formData = new FormData();
				formData.append('title', title.trim());
				formData.append('meeting_date', meetingDate);
				formData.append(
					'participants_json',
					JSON.stringify(filteredParticipants),
				);
				formData.append('transcript_file', selectedFile);

				await uploadMeeting(formData);
				toast.success('Meeting uploaded & AI summary generated successfully!');
			} else {
				await createMeeting({
					title: title.trim(),
					meeting_date: meetingDate,
					participants: filteredParticipants,
					transcript_text: transcriptText.trim() || undefined,
				});
				toast.success('Meeting created & AI summary generated successfully!');
			}

			onSuccess();
			onClose();
		} catch (error: any) {
			toast.error(error.message || 'Failed to create meeting');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
			<div
				className="w-full max-w-2xl rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-2xl animate-in zoom-in-95 duration-150 my-8"
				role="dialog"
				aria-modal="true"
			>
				{/* Modal header */}
				<div className="flex items-center justify-between border-b border-[var(--border-color)]/60 pb-4">
					<div className="flex items-center gap-2">
						<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
							<Sparkles className="h-5 w-5" />
						</div>
						<div>
							<h3 className="text-lg font-semibold text-[var(--text-primary)]">
								Create New Meeting
							</h3>
							<p className="text-xs text-[var(--text-muted)]">
								Upload or paste a transcript to automatically generate AI
								summaries
							</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				{/* Source Tabs */}
				<div className="mt-4 flex rounded-xl bg-[var(--bg-secondary)] p-1">
					<button
						type="button"
						onClick={() => setActiveTab('upload')}
						className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-medium transition-colors ${
							activeTab === 'upload'
								? 'bg-[var(--bg-card)] text-[var(--brand-primary)] shadow-xs font-semibold'
								: 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
						}`}
					>
						<Upload className="h-3.5 w-3.5" />
						Upload File (.txt, .vtt, .json)
					</button>
					<button
						type="button"
						onClick={() => setActiveTab('paste')}
						className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-medium transition-colors ${
							activeTab === 'paste'
								? 'bg-[var(--bg-card)] text-[var(--brand-primary)] shadow-xs font-semibold'
								: 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
						}`}
					>
						<FileText className="h-3.5 w-3.5" />
						Paste Transcript
					</button>
					<button
						type="button"
						onClick={() => setActiveTab('preset')}
						className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-medium transition-colors ${
							activeTab === 'preset'
								? 'bg-[var(--bg-card)] text-[var(--brand-primary)] shadow-xs font-semibold'
								: 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
						}`}
					>
						<Sparkles className="h-3.5 w-3.5" />
						Demo Presets
					</button>
				</div>

				{/* Preset Selector View */}
				{activeTab === 'preset' ? (
					<div className="mt-6 space-y-3">
						<p className="text-xs font-medium text-[var(--text-secondary)]">
							Choose a pre-written meeting template for instant 1-click
							evaluation:
						</p>
						{PRESET_SAMPLES.map((preset, idx) => (
							<div
								key={idx}
								onClick={() => handleSelectPreset(preset)}
								className="cursor-pointer rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 transition-all hover:border-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5"
							>
								<div className="flex items-center justify-between">
									<h4 className="text-sm font-semibold text-[var(--text-primary)]">
										{preset.title}
									</h4>
									<span className="text-xs text-[var(--brand-primary)] font-medium">
										Use Preset →
									</span>
								</div>
								<p className="mt-1 text-xs text-[var(--text-muted)]">
									{preset.participants.map((p) => p.name).join(', ')}
								</p>
							</div>
						))}
					</div>
				) : (
					/* Create Form */
					<form onSubmit={handleSubmit} className="mt-5 space-y-4">
						{/* Meeting Title */}
						<div>
							<label className="block text-xs font-medium text-[var(--text-primary)] mb-1">
								Meeting Title *
							</label>
							<input
								type="text"
								placeholder="e.g. Q4 Executive Leadership Sync"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								required
								className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3.5 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20"
							/>
						</div>

						{/* Meeting Date */}
						<div>
							<label className="block text-xs font-medium text-[var(--text-primary)] mb-1">
								Meeting Date *
							</label>
							<input
								type="date"
								value={meetingDate}
								onChange={(e) => setMeetingDate(e.target.value)}
								required
								className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3.5 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
							/>
						</div>

						{/* Upload File Input */}
						{activeTab === 'upload' && (
							<div>
								<label className="block text-xs font-medium text-[var(--text-primary)] mb-1">
									Transcript or Media File *
								</label>
								<div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 text-center hover:border-[var(--brand-primary)]/50 transition-colors">
									<Upload className="h-8 w-8 text-[var(--text-muted)]" />
									<input
										type="file"
										accept=".txt,.vtt,.json,.mp3,.mp4,.wav,.m4a"
										onChange={(e) =>
											setSelectedFile(e.target.files ? e.target.files[0] : null)
										}
										className="mt-2 text-xs text-[var(--text-secondary)] file:mr-2 file:rounded-lg file:border-0 file:bg-[var(--brand-primary)] file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white hover:file:bg-[var(--brand-primary-dark)]"
									/>
									{selectedFile && (
										<p className="mt-2 flex items-center gap-1 text-xs text-emerald-600 font-medium">
											<CheckCircle className="h-3.5 w-3.5" />
											Selected: {selectedFile.name} (
											{(selectedFile.size / 1024).toFixed(1)} KB)
										</p>
									)}
								</div>
							</div>
						)}

						{/* Paste Transcript Textarea */}
						{activeTab === 'paste' && (
							<div>
								<label className="block text-xs font-medium text-[var(--text-primary)] mb-1">
									Paste Transcript Text
								</label>
								<textarea
									rows={6}
									placeholder="Speaker 1: Hi everyone...&#10;Speaker 2: Thanks for having me..."
									value={transcriptText}
									onChange={(e) => setTranscriptText(e.target.value)}
									className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-3 text-xs font-mono text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20"
								/>
							</div>
						)}

						{/* Participants Section */}
						<div>
							<div className="flex items-center justify-between mb-2">
								<label className="text-xs font-medium text-[var(--text-primary)]">
									Participants
								</label>
								<button
									type="button"
									onClick={handleAddParticipant}
									className="flex items-center gap-1 text-xs font-medium text-[var(--brand-primary)] hover:underline"
								>
									<Plus className="h-3 w-3" />
									Add Participant
								</button>
							</div>

							<div className="space-y-2 max-h-36 overflow-y-auto pr-1">
								{participants.map((p, idx) => (
									<div key={idx} className="flex items-center gap-2">
										<input
											type="text"
											placeholder="Full Name"
											value={p.name}
											onChange={(e) =>
												handleParticipantChange(idx, 'name', e.target.value)
											}
											className="flex-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] px-2.5 py-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
										/>
										<input
											type="text"
											placeholder="Role (e.g. Designer)"
											value={p.role}
											onChange={(e) =>
												handleParticipantChange(idx, 'role', e.target.value)
											}
											className="w-32 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] px-2.5 py-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
										/>
										{participants.length > 1 && (
											<button
												type="button"
												onClick={() => handleRemoveParticipant(idx)}
												className="rounded-lg p-1.5 text-red-500 hover:bg-red-500/10 transition-colors"
											>
												<Trash2 className="h-3.5 w-3.5" />
											</button>
										)}
									</div>
								))}
							</div>
						</div>

						{/* Submit button */}
						<div className="mt-6 flex items-center justify-end gap-3 border-t border-[var(--border-color)]/60 pt-4">
							<button
								type="button"
								onClick={onClose}
								className="rounded-xl border border-[var(--border-color)] px-4 py-2 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={isLoading}
								className="flex items-center gap-1.5 rounded-xl bg-[var(--brand-primary)] px-5 py-2 text-xs font-medium text-white shadow-xs hover:bg-[var(--brand-primary-dark)] transition-colors disabled:opacity-50"
							>
								{isLoading ? (
									'Processing AI Summary...'
								) : (
									<>
										<Sparkles className="h-3.5 w-3.5" />
										Create & Generate Summary
									</>
								)}
							</button>
						</div>
					</form>
				)}
			</div>
		</div>
	);
}
