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
		<div className="flex flex-col h-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs overflow-hidden">
			{/* Top Bar with Tabs and Regenerate button */}
			<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 border-b border-[var(--border-color)]/60 px-4 py-2.5 bg-[var(--bg-secondary)]/50">
				{/* Horizontal Tab List */}
				<div className="flex items-center gap-1 overflow-x-auto">
					{tabs.map((tab) => {
						const Icon = tab.icon;
						const isActive = activeTab === tab.id;

						return (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap ${
									isActive
										? 'bg-[var(--brand-primary)] text-white shadow-xs font-semibold'
										: tab.isSpecial
											? 'text-purple-600 hover:bg-purple-500/10 dark:text-purple-400'
											: 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
								}`}
							>
								<Icon className="h-3.5 w-3.5" />
								<span>{tab.label}</span>
							</button>
						);
					})}
				</div>

				{/* Regenerate with AI button */}
				<button
					onClick={onRegenerate}
					disabled={isRegenerating || isLoading}
					className="flex items-center justify-center gap-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-1.5 text-xs font-medium text-[var(--brand-primary)] hover:border-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5 disabled:opacity-50 transition-colors shadow-xs shrink-0"
					title="Regenerate summary with AI"
				>
					<RotateCw
						className={`h-3 w-3 ${isRegenerating ? 'animate-spin' : ''}`}
					/>
					<span>{isRegenerating ? 'Generating...' : 'Regenerate'}</span>
				</button>
			</div>

			{/* Tab Content Container */}
			<div className="flex-1 overflow-y-auto p-4 space-y-4">
				{isLoading || isRegenerating ? (
					<SummarySkeleton />
				) : (
					<>
						{activeTab === 'overview' && (
							<div className="space-y-4 animate-in fade-in duration-150">
								<OverviewCard summary={summary} />
								<NotesList bulletNotesJson={summary?.bullet_notes_json} />
							</div>
						)}

						{activeTab === 'notes' && (
							<div className="animate-in fade-in duration-150">
								<NotesList bulletNotesJson={summary?.bullet_notes_json} />
							</div>
						)}

						{activeTab === 'actions' && (
							<div className="animate-in fade-in duration-150">
								<ActionItemList
									meetingId={meetingId}
									items={actionItems}
									onRefresh={onRefresh}
								/>
							</div>
						)}

						{activeTab === 'outline' && (
							<div className="animate-in fade-in duration-150">
								<TopicsOutline topics={keyTopics} />
							</div>
						)}

						{activeTab === 'ask' && (
							<div className="h-[500px] animate-in fade-in duration-150">
								<AskAIPanel meetingId={meetingId} />
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}
