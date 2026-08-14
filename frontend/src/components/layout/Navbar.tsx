// Top navigation bar with global search, dark mode toggle, and profile menu
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
	Search,
	Bell,
	Moon,
	Sun,
	ChevronDown,
	User,
	LogOut,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { getInitials } from '@/lib/utils';

export function Navbar() {
	const [searchValue, setSearchValue] = useState('');
	const [showNotifications, setShowNotifications] = useState(false);
	const [showProfile, setShowProfile] = useState(false);
	const [mounted, setMounted] = useState(false);
	const router = useRouter();
	const { theme, setTheme } = useTheme();

	// Prevent hydration mismatch for client-side theme
	useEffect(() => {
		setMounted(true);
	}, []);

	// Handle global search submission
	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchValue.trim()) {
			router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`);
		}
	};

	return (
		<header
			className="flex h-16 items-center justify-between border-b px-6 gap-6 shrink-0 transition-colors"
			style={{
				backgroundColor: 'var(--bg-primary)',
				borderColor: 'var(--border-color)',
			}}
		>
			{/* Global Search — wide and centered */}
			<form onSubmit={handleSearch} className="flex-1 max-w-xl">
				<div className="relative group">
					<Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--brand-primary)] transition-colors" />
					<input
						type="text"
						placeholder="Search meetings, speakers, topics..."
						value={searchValue}
						onChange={(e) => setSearchValue(e.target.value)}
						className="w-full rounded-full border py-2.5 pl-11 pr-16 text-sm outline-none transition-all focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/15 placeholder:text-[var(--text-muted)]"
						style={{
							backgroundColor: 'var(--bg-secondary)',
							borderColor: 'var(--border-color)',
							color: 'var(--text-primary)',
						}}
					/>
					<div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 pointer-events-none">
						<kbd className="rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--text-muted)] shadow-sm">
							⌘K
						</kbd>
					</div>
				</div>
			</form>

			{/* Right actions */}
			<div className="flex items-center gap-3">
				{/* Dark Mode Toggle */}
				<button
					onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
					className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)]/40 transition-all shadow-sm"
					title="Toggle theme"
					aria-label="Toggle theme"
				>
					{mounted ? (
						theme === 'dark' ? (
							<Sun className="h-4 w-4 text-amber-400" />
						) : (
							<Moon className="h-4 w-4" />
						)
					) : (
						<div className="h-4 w-4" />
					)}
				</button>

				{/* Notification Bell */}
				<div className="relative">
					<button
						onClick={() => setShowNotifications(!showNotifications)}
						className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)]/40 transition-all shadow-sm"
						title="Notifications"
					>
						<Bell className="h-4 w-4" />
					</button>

					{showNotifications && (
						<>
							<div
								className="fixed inset-0 z-40"
								onClick={() => setShowNotifications(false)}
							/>
							<div
								className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border p-4 shadow-xl backdrop-blur-md animate-fade-in-up"
								style={{
									backgroundColor: 'var(--bg-card)',
									borderColor: 'var(--border-color)',
								}}
							>
								<div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
									<p className="text-sm font-semibold text-[var(--text-primary)]">
										Notifications
									</p>
									<span className="rounded-full bg-[var(--brand-primary)]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[var(--brand-primary)]">
										0 new
									</span>
								</div>
								<p className="mt-4 text-sm text-[var(--text-muted)] text-center py-3">
									All meeting summaries are up to date.
								</p>
							</div>
						</>
					)}
				</div>

				{/* User Avatar & Menu */}
				<div className="relative ml-1">
					<button
						onClick={() => setShowProfile(!showProfile)}
						className="flex items-center gap-2.5 rounded-full p-1.5 hover:bg-[var(--bg-hover)] transition-colors"
					>
						<div
							className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm ring-2 ring-[var(--brand-primary)]/20"
							style={{ background: 'var(--brand-gradient)' }}
						>
							{getInitials('Anurag Basuri')}
						</div>
						<ChevronDown className="h-3.5 w-3.5 text-[var(--text-muted)]" />
					</button>

					{showProfile && (
						<>
							<div
								className="fixed inset-0 z-40"
								onClick={() => setShowProfile(false)}
							/>
							<div
								className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border p-1.5 shadow-xl animate-fade-in-up"
								style={{
									backgroundColor: 'var(--bg-card)',
									borderColor: 'var(--border-color)',
								}}
							>
								<div className="px-3 py-2.5 border-b border-[var(--border-color)]">
									<p className="text-sm font-semibold text-[var(--text-primary)]">
										Anurag Basuri
									</p>
									<p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
										anurag@fireflies.dev
									</p>
								</div>
								<button
									onClick={() => {
										setShowProfile(false);
										router.push('/settings');
									}}
									className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors mt-1"
								>
									<User className="h-4 w-4 text-[var(--brand-primary)]" />
									Workspace Settings
								</button>
								<button
									onClick={() => setShowProfile(false)}
									className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-red-600 hover:bg-red-500/10 transition-colors"
								>
									<LogOut className="h-4 w-4" />
									Sign Out
								</button>
							</div>
						</>
					)}
				</div>
			</div>
		</header>
	);
}
