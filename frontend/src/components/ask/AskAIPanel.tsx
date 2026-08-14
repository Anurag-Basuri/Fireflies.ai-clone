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
		<div className="flex flex-col h-full rounded-2xl border border-(--border-color) bg-(--bg-card) shadow-sm overflow-hidden">
			{/* Header */}
			<div className="flex items-center gap-3 border-b border-(--border-color)/60 p-4 bg-(--bg-secondary)/50">
				<div
					className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm"
					style={{ background: 'var(--brand-gradient)' }}
				>
					<Bot className="h-5 w-5" />
				</div>
				<div>
					<h4 className="text-sm font-bold text-(--text-primary) flex items-center gap-2">
						AskFred
						<span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold text-purple-600 dark:text-purple-400 border border-purple-500/20">
							AI Assistant
						</span>
					</h4>
					<p className="text-xs text-(--text-muted) mt-0.5">
						Answers questions using this meeting's transcript
					</p>
				</div>
			</div>

			{/* Chat Messages scroll area */}
			<div className="flex-1 overflow-y-auto p-4 space-y-5">
				{messages.map((msg, idx) => (
					<div
						key={idx}
						className={`flex items-start gap-3 ${
							msg.role === 'user' ? 'flex-row-reverse' : ''
						}`}
					>
						<div
							className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
								msg.role === 'user'
									? 'bg-(--brand-primary) text-white shadow-sm'
									: 'bg-(--bg-tertiary) text-(--brand-primary) border border-(--border-color)'
							}`}
						>
							{msg.role === 'user' ? (
								<User className="h-4 w-4" />
							) : (
								<Sparkles className="h-4 w-4" />
							)}
						</div>

						<div
							className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-sm ${
								msg.role === 'user'
									? 'bg-(--brand-primary) text-white rounded-tr-sm'
									: 'bg-(--bg-secondary) text-(--text-primary) border border-(--border-color)/60 rounded-tl-sm'
							}`}
						>
							<p>{msg.content}</p>
							<span
								className={`block text-[10px] mt-2 text-right opacity-70 ${
									msg.role === 'user'
										? 'text-white'
										: 'text-(--text-muted)'
								}`}
							>
								{msg.timestamp}
							</span>
						</div>
					</div>
				))}

				{isLoading && (
					<div className="flex items-start gap-3">
						<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--bg-tertiary)] text-[var(--brand-primary)] border border-(--border-color)">
							<Loader2 className="h-4 w-4 animate-spin" />
						</div>
						<div className="rounded-2xl rounded-tl-sm bg-[var(--bg-secondary)] border border-[var(--border-color)]/60 p-3.5 text-sm text-[var(--text-muted)] shadow-sm">
							Fred is thinking...
						</div>
					</div>
				)}
			</div>

			{/* Suggested prompt chips */}
			{messages.length <= 2 && (
				<div className="px-4 py-3 border-t border-[var(--border-color)]/40 bg-[var(--bg-secondary)]/30 flex flex-wrap gap-2">
					{suggestions.map((sug, i) => (
						<button
							key={i}
							onClick={() => setInputQuestion(sug)}
							className="rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors shadow-sm text-left"
						>
							{sug}
						</button>
					))}
				</div>
			)}

			{/* Chat input box */}
			<form
				onSubmit={handleSend}
				className="flex items-center gap-2 border-t border-[var(--border-color)]/60 p-4 bg-[var(--bg-card)]"
			>
				<input
					type="text"
					placeholder="Ask Fred a question..."
					value={inputQuestion}
					onChange={(e) => setInputQuestion(e.target.value)}
					disabled={isLoading}
					className="flex-1 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 shadow-sm"
				/>
				<button
					type="submit"
					disabled={isLoading || !inputQuestion.trim()}
					className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-primary)] text-white shadow-sm hover:bg-[var(--brand-primary-dark)] disabled:opacity-50 transition-colors shrink-0"
				>
					<Send className="h-4 w-4 ml-0.5" />
				</button>
			</form>
		</div>
	);
}
