// Top navbar with global search, notifications, user avatar, and dark mode toggle
'use client';

import { useState } from 'react';
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
import { cn, getInitials } from '@/lib/utils';

export function Navbar() {
	const [searchValue, setSearchValue] = useState('');
	const [showNotifications, setShowNotifications] = useState(false);
	const [showProfile, setShowProfile] = useState(false);
	const router = useRouter();
	const { theme, setTheme } = useTheme();

	// Handle global search submission
	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchValue.trim()) {
			router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`);
		}
	};

	return (
		<header
			className="flex h-14 items-center justify-between border-b px-4 gap-4"
			style={{
				backgroundColor: 'var(--bg-primary)',
				borderColor: 'var(--border-color)',
			}}
		>
			{/* Global search bar */}
			<form onSubmit={handleSearch} className="flex-1 max-w-lg">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
					<input
						type="text"
						placeholder="Search meetings, transcripts..."
						value={searchValue}
						onChange={(e) => setSearchValue(e.target.value)}
						className="w-full rounded-lg border py-2 pl-10 pr-4 text-sm outline-none transition-colors focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20"
						style={{
							backgroundColor: 'var(--bg-secondary)',
							borderColor: 'var(--border-color)',
							color: 'var(--text-primary)',
						}}
					/>
				</div>
			</form>

			{/* Right side actions */}
			<div className="flex items-center gap-2">
				{/* Dark mode toggle */}
				<button
					onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
					className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-[var(--bg-tertiary)]"
					title="Toggle theme"
				>
					{theme === 'dark' ? (
						<Sun className="h-4 w-4 text-[var(--text-secondary)]" />
					) : (
						<Moon className="h-4 w-4 text-[var(--text-secondary)]" />
					)}
				</button>

				{/* Notifications */}
				<div className="relative">
					<button
						onClick={() => setShowNotifications(!showNotifications)}
						className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-[var(--bg-tertiary)]"
					>
						<Bell className="h-4 w-4 text-[var(--text-secondary)]" />
					</button>
					{showNotifications && (
						<>
							<div
								className="fixed inset-0 z-40"
								onClick={() => setShowNotifications(false)}
							/>
							<div
								className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border p-4 shadow-xl"
								style={{
									backgroundColor: 'var(--bg-primary)',
									borderColor: 'var(--border-color)',
								}}
							>
								<p className="text-sm font-semibold text-[var(--text-primary)]">
									Notifications
								</p>
								<p className="mt-2 text-xs text-[var(--text-muted)]">
									No new notifications
								</p>
							</div>
						</>
					)}
				</div>

				{/* User profile dropdown */}
				<div className="relative">
					<button
						onClick={() => setShowProfile(!showProfile)}
						className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-[var(--bg-tertiary)]"
					>
						<div
							className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
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
								className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border py-1 shadow-xl"
								style={{
									backgroundColor: 'var(--bg-primary)',
									borderColor: 'var(--border-color)',
								}}
							>
								<button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]">
									<User className="h-4 w-4" />
									Profile
								</button>
								<button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]">
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
