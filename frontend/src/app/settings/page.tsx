// Settings page with Fireflies-style configuration cards and placeholder sections
'use client';

import React from 'react';
import {
	Settings,
	Bot,
	Puzzle,
	Users,
	HardDrive,
	Key,
	Shield,
	ExternalLink,
} from 'lucide-react';

export default function SettingsPage() {
	return (
		<div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-200">
			<div>
				<h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
					Workspace Settings
				</h1>
				<p className="mt-1 text-xs text-[var(--text-secondary)]">
					Manage your AI notetaker settings, integrations, permissions, and
					workspace preferences
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
				{/* Notetaker Bot Card */}
				<div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-xs flex flex-col justify-between">
					<div>
						<div className="flex items-center justify-between">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
								<Bot className="h-5 w-5" />
							</div>
							<span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
								Coming Soon
							</span>
						</div>
						<h3 className="mt-4 text-base font-semibold text-[var(--text-primary)]">
							AI Notetaker Bot
						</h3>
						<p className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed">
							Configure Fred to automatically join your Zoom, Google Meet, and
							Microsoft Teams calendar events and capture live audio.
						</p>
					</div>
					<div className="mt-6 border-t border-[var(--border-color)]/60 pt-4">
						<button
							disabled
							className="rounded-xl border border-[var(--border-color)] px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] cursor-not-allowed"
						>
							Auto-Join Rules (Locked)
						</button>
					</div>
				</div>

				{/* Integrations Card */}
				<div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-xs flex flex-col justify-between">
					<div>
						<div className="flex items-center justify-between">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
								<Puzzle className="h-5 w-5" />
							</div>
							<span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
								Coming Soon
							</span>
						</div>
						<h3 className="mt-4 text-base font-semibold text-[var(--text-primary)]">
							Apps & Integrations
						</h3>
						<p className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed">
							Connect Slack, Notion, Asana, Linear, Salesforce, and HubSpot to
							sync meeting recaps and tasks directly to your tools.
						</p>
					</div>
					<div className="mt-6 border-t border-[var(--border-color)]/60 pt-4">
						<button
							disabled
							className="rounded-xl border border-[var(--border-color)] px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] cursor-not-allowed"
						>
							Manage 20+ Integrations (Locked)
						</button>
					</div>
				</div>

				{/* Team & Collaboration */}
				<div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-xs flex flex-col justify-between">
					<div>
						<div className="flex items-center justify-between">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
								<Users className="h-5 w-5" />
							</div>
							<span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
								Coming Soon
							</span>
						</div>
						<h3 className="mt-4 text-base font-semibold text-[var(--text-primary)]">
							Team & Workspaces
						</h3>
						<p className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed">
							Invite teammates, set channel privacy, share soundbites, and
							configure role-based access control (RBAC).
						</p>
					</div>
					<div className="mt-6 border-t border-[var(--border-color)]/60 pt-4">
						<button
							disabled
							className="rounded-xl border border-[var(--border-color)] px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] cursor-not-allowed"
						>
							Invite Members (Locked)
						</button>
					</div>
				</div>

				{/* Storage & Security */}
				<div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-xs flex flex-col justify-between">
					<div>
						<div className="flex items-center justify-between">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
								<Shield className="h-5 w-5" />
							</div>
							<span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
								Active
							</span>
						</div>
						<h3 className="mt-4 text-base font-semibold text-[var(--text-primary)]">
							Security & SQLite Volume
						</h3>
						<p className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed">
							Local SQLite persistent volume active. Transcripts, summaries,
							audio files, and action items encrypted and stored locally.
						</p>
					</div>
					<div className="mt-6 border-t border-[var(--border-color)]/60 pt-4 flex items-center justify-between text-xs text-[var(--text-muted)]">
						<span>Database: SQLite 3</span>
						<span className="font-mono text-emerald-600">Encrypted</span>
					</div>
				</div>
			</div>
		</div>
	);
}
