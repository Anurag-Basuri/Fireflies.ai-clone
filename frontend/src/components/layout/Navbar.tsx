// Top navigation bar with global search, keyboard shortcuts, dark mode toggle, and profile menu
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
	Sparkles,
	SlidersHorizontal,
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
			className="flex h-14 items-center justify-between border-b px-5 gap-4 shrink-0 transition-colors"
			style={{
				backgroundColor: 'var(--bg-primary)',
				borderColor: 'var(--border-color)',
			}}
		>
			{/* Global Search with shortcut pill */}
			<form onSubmit={handleSearch} className="flex-1 max-w-md">
				<div className="relative group">
					<Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--brand-primary)] transition-colors" />
					<input
						type="text"
						placeholder="Search meetings, speakers, topics..."
						value={searchValue}
						onChange={(e) => setSearchValue(e.target.value)}
						className="w-full rounded-xl border py-1.5 pl-9 pr-14 text-xs outline-none transition-all focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/15"
						style={{
							backgroundColor: 'var(--bg-secondary)',
							borderColor: 'var(--border-color)',
							color: 'var(--text-primary)',
						}}
					/>
					<div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 pointer-events-none">
						<kbd className="rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--text-muted)] shadow-2xs">
							⌘K
						</kbd>
					</div>
				</div>
			</form>

			{/* Right actions */}
			<div className="flex items-center gap-2">
				{/* AI Status Badge */}
				<div className="hidden md:flex items-center gap-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-1 text-[11px] font-medium text-[var(--text-secondary)]">
					<span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
					<span>Fred AI Active</span>
				</div>

				{/* Dark Mode Toggle */}
				<button
					onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
					className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)]/40 transition-colors shadow-2xs"
					title="Toggle theme"
					aria-label="Toggle theme"
				>
					{mounted ? (
						theme === 'dark' ? (
							<Sun className="h-3.5 w-3.5 text-amber-400" />
						) : (
							<Moon className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
						)
					) : (
						<div className="h-3.5 w-3.5" />
					)}
				</button>

				{/* Notification Bell */}
				<div className="relative">
					<button
						onClick={() => setShowNotifications(!showNotifications)}
						className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)]/40 transition-colors shadow-2xs"
						title="Notifications"
					>
						<Bell className="h-3.5 w-3.5" />
					</button>

					{showNotifications && (
						<>
							<div
								className="fixed inset-0 z-40"
								onClick={() => setShowNotifications(false)}
							/>
							<div
								className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border p-4 shadow-xl backdrop-blur-md"
								style={{
									backgroundColor: 'var(--bg-card)',
									borderColor: 'var(--border-color)',
								}}
							>
								<div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]/60">
									<p className="text-xs font-semibold text-[var(--text-primary)]">
										Notifications
									</p>
									<span className="rounded-full bg-[var(--brand-primary)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--brand-primary)]">
										0 new
									</span>
								</div>
								<p className="mt-3 text-xs text-[var(--text-muted)] text-center py-2">
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
						className="flex items-center gap-2 rounded-xl p-1 hover:bg-[var(--bg-tertiary)] transition-colors"
					>
						<div
							className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shadow-xs"
							style={{ backgroundColor: 'var(--brand-primary)' }}
						>
							{getInitials('Anurag Basuri')}
						</div>
						<ChevronDown className="h-3 w-3 text-[var(--text-muted)]" />
					</button>

					{showProfile && (
						<>
							<div
								className="fixed inset-0 z-40"
								onClick={() => setShowProfile(false)}
							/>
							<div
								className="absolute right-0 top-full z-50 mt-2 w-52 rounded-2xl border p-1.5 shadow-xl"
								style={{
									backgroundColor: 'var(--bg-card)',
									borderColor: 'var(--border-color)',
								}}
							>
								<div className="px-3 py-2 border-b border-[var(--border-color)]/60">
									<p className="text-xs font-semibold text-[var(--text-primary)]">
										Anurag Basuri
									</p>
									<p className="text-[11px] text-[var(--text-muted)] truncate">
										anurag@fireflies.dev
									</p>
								</div>
								<button
									onClick={() => {
										setShowProfile(false);
										router.push('/settings');
									}}
									className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors mt-1"
								>
									<User className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
									Workspace Settings
								</button>
								<button
									onClick={() => setShowProfile(false)}
									className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-red-600 hover:bg-red-500/10 transition-colors"
								>
									<LogOut className="h-3.5 w-3.5" />
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
