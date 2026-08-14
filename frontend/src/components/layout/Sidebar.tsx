// Left icon navigation sidebar with Fireflies branding, active indicator pills, and tooltips
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
	Home,
	Mic,
	BarChart3,
	Puzzle,
	Settings,
	ShieldCheck,
	Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
	{ href: '/meetings', icon: Home, label: 'Meetings Library' },
	{ href: '#', icon: Mic, label: 'Live Notetaker', disabled: true },
	{
		href: '#',
		icon: BarChart3,
		label: 'Conversation Analytics',
		disabled: true,
	},
	{ href: '#', icon: Users, label: 'Team Collaboration', disabled: true },
	{ href: '#', icon: Puzzle, label: 'Integrations & Apps', disabled: true },
];

export function Sidebar() {
	const pathname = usePathname();

	return (
		<aside
			className="flex w-[72px] flex-col items-center justify-between py-5 px-2 select-none shrink-0 z-30 transition-colors"
			style={{
				backgroundColor: 'var(--bg-sidebar)',
				borderRight: '1px solid rgba(255,255,255,0.06)',
			}}
		>
			{/* Top: Logo & Main Navigation */}
			<div className="flex flex-col items-center w-full gap-6">
				{/* Fireflies Brand Logo */}
				<Link
					href="/meetings"
					className="group relative flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95"
					style={{
						background: 'linear-gradient(135deg, #6c4cf4 0%, #a78bfa 100%)',
						boxShadow: '0 0 24px rgba(108, 76, 244, 0.45)',
					}}
					title="Fireflies.ai"
				>
					<span className="text-white font-black text-lg tracking-tighter select-none">
						Ff
					</span>
				</Link>

				{/* Divider */}
				<div className="w-8 h-px bg-white/10" />

				{/* Nav item list */}
				<nav className="flex flex-col items-center gap-1 w-full">
					{navItems.map((item) => {
						const isActive =
							pathname === item.href ||
							(item.href === '/meetings' && pathname.startsWith('/meetings'));
						const Icon = item.icon;

						return (
							<Link
								key={item.label}
								href={item.disabled ? '#' : item.href}
								className={cn(
									'group relative flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200',
									isActive
										? 'bg-white/15 text-white shadow-sm'
										: 'text-white/40 hover:bg-white/8 hover:text-white/80',
									item.disabled &&
										'cursor-not-allowed opacity-30 hover:bg-transparent hover:text-white/40',
								)}
								title={item.label}
							>
								{/* Left glowing active indicator */}
								{isActive && (
									<span
										className="absolute -left-2 top-2 bottom-2 w-[3px] rounded-r-full"
										style={{
											background: '#6c4cf4',
											boxShadow: '0 0 10px #6c4cf4',
										}}
									/>
								)}

								<Icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.2 : 1.8} />

								{/* Hover Tooltip */}
								<span
									className="pointer-events-none absolute left-full ml-3 z-50 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-xl transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-1 backdrop-blur-md"
									style={{
										backgroundColor: 'rgba(26, 10, 62, 0.95)',
										border: '1px solid rgba(255,255,255,0.1)',
									}}
								>
									{item.label}
									{item.disabled && (
										<span className="ml-1.5 text-[10px] text-amber-300 font-normal">
											Coming Soon
										</span>
									)}
								</span>
							</Link>
						);
					})}
				</nav>
			</div>

			{/* Bottom: Settings & Security */}
			<div className="flex flex-col items-center gap-2">
				<Link
					href="/settings"
					className={cn(
						'group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200',
						pathname === '/settings'
							? 'bg-white/15 text-white'
							: 'text-white/40 hover:bg-white/8 hover:text-white/80',
					)}
					title="Settings"
				>
					<Settings className="h-[18px] w-[18px]" strokeWidth={1.8} />
					<span
						className="pointer-events-none absolute left-full ml-3 z-50 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-xl transition-all duration-200 group-hover:opacity-100 backdrop-blur-md"
						style={{
							backgroundColor: 'rgba(26, 10, 62, 0.95)',
							border: '1px solid rgba(255,255,255,0.1)',
						}}
					>
						Settings
					</span>
				</Link>

				<div
					className="group relative flex h-9 w-9 items-center justify-center rounded-xl text-emerald-400/80 hover:text-emerald-400 transition-colors cursor-default"
					title="Encrypted Local SQLite Database"
				>
					<ShieldCheck className="h-4 w-4" />
					<span
						className="pointer-events-none absolute left-full ml-3 z-50 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-xl transition-all duration-200 group-hover:opacity-100 backdrop-blur-md"
						style={{
							backgroundColor: 'rgba(26, 10, 62, 0.95)',
							border: '1px solid rgba(255,255,255,0.1)',
						}}
					>
						SQLite: Active & Encrypted
					</span>
				</div>
			</div>
		</aside>
	);
}
