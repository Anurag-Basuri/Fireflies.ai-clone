// Ask Fred - AI chat panel to ask questions about the current meeting
'use client';

import React, { useState } from 'react';
import { Bot, Send, User, Sparkles, Loader2 } from 'lucide-react';
import { askMeeting } from '@/lib/api';
import { toast } from 'sonner';

interface Message {
	role: 'user' | 'assistant';
	content: string;
	timestamp: string;
}

interface AskAIPanelProps {
	meetingId: number;
}

// Render meeting-scoped conversational AI chat assistant
export function AskAIPanel({ meetingId }: AskAIPanelProps) {
	const [messages, setMessages] = useState<Message[]>([
		{
			role: 'assistant',
			content:
				"Hi, I'm Fred! Ask me anything about this meeting, its decisions, action items, or specific topics discussed.",
			timestamp: new Date().toLocaleTimeString([], {
				hour: '2-digit',
				minute: '2-digit',
			}),
		},
	]);
	const [inputQuestion, setInputQuestion] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	// Send question to LLM
	const handleSend = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!inputQuestion.trim() || isLoading) return;

		const userQuestion = inputQuestion.trim();
		const userMsg: Message = {
			role: 'user',
			content: userQuestion,
			timestamp: new Date().toLocaleTimeString([], {
				hour: '2-digit',
				minute: '2-digit',
			}),
		};

		setMessages((prev) => [...prev, userMsg]);
		setInputQuestion('');
		setIsLoading(true);

		try {
			const res = await askMeeting(meetingId, userQuestion);
			const assistantMsg: Message = {
				role: 'assistant',
				content: res.answer,
				timestamp: new Date().toLocaleTimeString([], {
					hour: '2-digit',
					minute: '2-digit',
				}),
			};
			setMessages((prev) => [...prev, assistantMsg]);
		} catch (error: any) {
			toast.error('Failed to get answer from AI');
			const errorMsg: Message = {
				role: 'assistant',
				content:
					'Sorry, I could not process your question. Please make sure an API key is configured.',
				timestamp: new Date().toLocaleTimeString([], {
					hour: '2-digit',
					minute: '2-digit',
				}),
			};
			setMessages((prev) => [...prev, errorMsg]);
		} finally {
			setIsLoading(false);
		}
	};

	// Suggested prompt pills
	const suggestions = [
		'What were the key decisions made?',
		'Who was assigned action items?',
		'Summarize the biggest concerns raised.',
	];

	return (
		<div className="flex flex-col h-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs overflow-hidden">
			{/* Header */}
			<div className="flex items-center gap-2 border-b border-[var(--border-color)]/60 p-4 bg-[var(--bg-secondary)]/50">
				<div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--brand-primary)] text-white shadow-xs">
					<Bot className="h-4 w-4" />
				</div>
				<div>
					<h4 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
						Ask Fred
						<span className="rounded-full bg-purple-500/10 px-2 py-0.2 text-[10px] font-medium text-purple-600 dark:text-purple-400">
							AI Assistant
						</span>
					</h4>
					<p className="text-[11px] text-[var(--text-muted)]">
						Answers questions using this meeting transcript & summary
					</p>
				</div>
			</div>

			{/* Chat Messages scroll area */}
			<div className="flex-1 overflow-y-auto p-4 space-y-4">
				{messages.map((msg, idx) => (
					<div
						key={idx}
						className={`flex items-start gap-2.5 ${
							msg.role === 'user' ? 'flex-row-reverse' : ''
						}`}
					>
						<div
							className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
								msg.role === 'user'
									? 'bg-[var(--brand-primary)] text-white'
									: 'bg-[var(--bg-tertiary)] text-[var(--brand-primary)]'
							}`}
						>
							{msg.role === 'user' ? (
								<User className="h-3.5 w-3.5" />
							) : (
								<Sparkles className="h-3.5 w-3.5" />
							)}
						</div>

						<div
							className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
								msg.role === 'user'
									? 'bg-[var(--brand-primary)] text-white rounded-tr-xs'
									: 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)]/60 rounded-tl-xs'
							}`}
						>
							<p>{msg.content}</p>
							<span
								className={`block text-[10px] mt-1 text-right opacity-70 ${
									msg.role === 'user'
										? 'text-white'
										: 'text-[var(--text-muted)]'
								}`}
							>
								{msg.timestamp}
							</span>
						</div>
					</div>
				))}

				{isLoading && (
					<div className="flex items-start gap-2.5">
						<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--bg-tertiary)] text-[var(--brand-primary)]">
							<Loader2 className="h-3.5 w-3.5 animate-spin" />
						</div>
						<div className="rounded-2xl rounded-tl-xs bg-[var(--bg-secondary)] border border-[var(--border-color)]/60 p-3 text-xs text-[var(--text-muted)]">
							Fred is thinking...
						</div>
					</div>
				)}
			</div>

			{/* Suggested prompt chips */}
			{messages.length <= 2 && (
				<div className="px-4 py-2 border-t border-[var(--border-color)]/40 bg-[var(--bg-secondary)]/30 flex flex-wrap gap-1.5">
					{suggestions.map((sug, i) => (
						<button
							key={i}
							onClick={() => setInputQuestion(sug)}
							className="rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] px-2.5 py-1 text-[11px] text-[var(--text-secondary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors text-left"
						>
							{sug}
						</button>
					))}
				</div>
			)}

			{/* Chat input box */}
			<form
				onSubmit={handleSend}
				className="flex items-center gap-2 border-t border-[var(--border-color)]/60 p-3 bg-[var(--bg-card)]"
			>
				<input
					type="text"
					placeholder="Ask Fred a question about this meeting..."
					value={inputQuestion}
					onChange={(e) => setInputQuestion(e.target.value)}
					disabled={isLoading}
					className="flex-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20"
				/>
				<button
					type="submit"
					disabled={isLoading || !inputQuestion.trim()}
					className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--brand-primary)] text-white shadow-xs hover:bg-[var(--brand-primary-dark)] disabled:opacity-50 transition-colors shrink-0"
				>
					<Send className="h-3.5 w-3.5" />
				</button>
			</form>
		</div>
	);
}
