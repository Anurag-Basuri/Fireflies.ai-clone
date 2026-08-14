// Bullet notes breakdown list extracted from the meeting discussion
'use client';

import React from 'react';
import { CheckCircle2, ListChecks } from 'lucide-react';

interface NotesListProps {
	bulletNotesJson?: string | null;
}

// Render bullet-point breakdown of key discussion items
export function NotesList({ bulletNotesJson }: NotesListProps) {
	let notes: string[] = [];
	try {
		if (bulletNotesJson) {
			notes = JSON.parse(bulletNotesJson);
		}
	} catch (e) {
		notes = [];
	}

	if (notes.length === 0) {
		return (
			<div className="rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)]/50 p-6 text-center text-xs text-[var(--text-muted)]">
				No bullet notes available for this meeting.
			</div>
		);
	}

	return (
		<div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-xs">
			<div className="flex items-center gap-2 mb-4">
				<ListChecks className="h-4 w-4 text-[var(--brand-primary)]" />
				<h4 className="text-sm font-semibold text-[var(--text-primary)]">
					Key Discussion Notes ({notes.length})
				</h4>
			</div>

			<ul className="space-y-3">
				{notes.map((note, index) => (
					<li
						key={index}
						className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)] leading-relaxed"
					>
						<CheckCircle2 className="h-3.5 w-3.5 text-[var(--brand-primary)] shrink-0 mt-0.5" />
						<span>{note}</span>
					</li>
				))}
			</ul>
		</div>
	);
}
