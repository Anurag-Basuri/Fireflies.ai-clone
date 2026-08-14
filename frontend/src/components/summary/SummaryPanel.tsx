// Main tabbed AI Summary panel containing Overview, Notes, Action Items, Outline, and Ask Fred
'use client';

import React, { useState } from 'react';
import {
	FileText,
	ListChecks,
	CheckSquare,
	Bookmark,
	Bot,
	RotateCw,
	Sparkles,
} from 'lucide-react';
import type { Summary, KeyTopic, ActionItem } from '@/types';
import { OverviewCard } from './OverviewCard';
import { NotesList } from './NotesList';
import { ActionItemList } from './ActionItemList';
import { TopicsOutline } from './TopicsOutline';
import { AskAIPanel } from '../ask/AskAIPanel';
import { SummarySkeleton } from '../common/LoadingSkeleton';

interface SummaryPanelProps {
	meetingId: number;
	summary: Summary | null;
	keyTopics: KeyTopic[];
	actionItems: ActionItem[];
	isLoading: boolean;
	isRegenerating: boolean;
	onRegenerate: () => void;
	onRefresh: () => void;
}

// Render Fireflies-grade AI Super Summary tabbed panel
export function SummaryPanel({
	meetingId,
	summary,
	keyTopics,
	actionItems,
	isLoading,
	isRegenerating,
	onRegenerate,
	onRefresh,
}: SummaryPanelProps) {
	const [activeTab, setActiveTab] = useState<
		'overview' | 'notes' | 'actions' | 'outline' | 'ask'
	>('overview');

	interface TabItem {
		id: 'overview' | 'notes' | 'actions' | 'outline' | 'ask';
		label: string;
		icon: React.ComponentType<{ className?: string }>;
		isSpecial?: boolean;
	}

	const tabs: TabItem[] = [
		{ id: 'overview', label: 'Overview', icon: FileText },
		{ id: 'notes', label: 'Notes', icon: ListChecks },
		{
			id: 'actions',
			label: `Actions (${actionItems.length})`,
			icon: CheckSquare,
		},
		{
			id: 'outline',
			label: `Outline (${keyTopics.length})`,
			icon: Bookmark,
		},
		{ id: 'ask', label: 'Ask Fred', icon: Bot, isSpecial: true },
	];

	return (
		<div className="flex flex-col h-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm overflow-hidden">
			{/* Header with AI badge */}
			<div className="flex items-center justify-between px-4 pt-4 pb-0">
				<div className="flex items-center gap-2">
					<div
						className="flex h-7 w-7 items-center justify-center rounded-lg"
						style={{ background: 'var(--brand-gradient)' }}
					>
						<Sparkles className="h-4 w-4 text-white" />
					</div>
					<h3 className="text-sm font-bold text-[var(--text-primary)]">
						AI Super Summary
					</h3>
				</div>

				{/* Regenerate button */}
				<button
					onClick={onRegenerate}
					disabled={isRegenerating || isLoading}
					className="btn-secondary text-xs py-1 px-3 disabled:opacity-50"
					title="Regenerate summary with AI"
				>
					<RotateCw
						className={`h-3 w-3 ${isRegenerating ? 'animate-spin' : ''}`}
					/>
					<span>{isRegenerating ? 'Generating...' : 'Regenerate'}</span>
				</button>
			</div>

			{/* Underline-style Tab Bar */}
			<div className="flex items-center gap-0 border-b border-[var(--border-color)] px-4 mt-3 overflow-x-auto">
				{tabs.map((tab) => {
					const Icon = tab.icon;
					const isActive = activeTab === tab.id;

					return (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`relative flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-all whitespace-nowrap border-b-2 -mb-px ${
								isActive
									? 'text-[var(--brand-primary)] border-[var(--brand-primary)]'
									: tab.isSpecial
										? 'text-purple-500 border-transparent hover:text-purple-400 hover:border-purple-400/30'
										: 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-primary)] hover:border-[var(--border-hover)]'
							}`}
						>
							<Icon className="h-3.5 w-3.5" />
							<span>{tab.label}</span>
						</button>
					);
				})}
			</div>

			{/* Tab Content Container */}
			<div className="flex-1 overflow-y-auto p-4 space-y-4">
				{isLoading || isRegenerating ? (
					<SummarySkeleton />
				) : (
					<>
						{activeTab === 'overview' && (
							<div className="space-y-4 animate-fade-in-up">
								<OverviewCard summary={summary} />
								<NotesList bulletNotesJson={summary?.bullet_notes_json} />
							</div>
						)}

						{activeTab === 'notes' && (
							<div className="animate-fade-in-up">
								<NotesList bulletNotesJson={summary?.bullet_notes_json} />
							</div>
						)}

						{activeTab === 'actions' && (
							<div className="animate-fade-in-up">
								<ActionItemList
									meetingId={meetingId}
									items={actionItems}
									onRefresh={onRefresh}
								/>
							</div>
						)}

						{activeTab === 'outline' && (
							<div className="animate-fade-in-up">
								<TopicsOutline topics={keyTopics} />
							</div>
						)}

						{activeTab === 'ask' && (
							<div className="h-[500px] animate-fade-in-up">
								<AskAIPanel meetingId={meetingId} />
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}
