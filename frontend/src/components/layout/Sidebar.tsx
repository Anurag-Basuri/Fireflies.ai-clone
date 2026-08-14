// Left icon navigation sidebar with Fireflies glowing branding, active indicator pills, and tooltips
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
	Home,
	Mic,
	BarChart3,
	Puzzle,
	Settings,
	Flame,
	ShieldCheck,
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
	{ href: '#', icon: Puzzle, label: 'Integrations & Apps', disabled: true },
	{ href: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
	const pathname = usePathname();

	return (
		<aside
			className="flex w-[68px] flex-col items-center justify-between border-r py-4 px-2 select-none shrink-0 z-30 transition-colors"
			style={{
				backgroundColor: 'var(--bg-sidebar)',
				borderColor: 'rgba(255,255,255,0.06)',
			}}
		>
			{/* Top: Logo & Main Navigation */}
			<div className="flex flex-col items-center w-full gap-5">
				{/* Fireflies Glowing Brand Icon */}
				<Link
					href="/meetings"
					className="group relative flex h-10 w-10 items-center justify-center rounded-2xl shadow-lg transition-transform hover:scale-105 active:scale-95"
					style={{
						background: 'linear-gradient(135deg, #6e62ff 0%, #8b5cf6 100%)',
						boxShadow: '0 0 20px rgba(110, 98, 255, 0.4)',
					}}
					title="Fireflies.ai"
				>
					<Flame className="h-5 w-5 text-white fill-white/80 group-hover:scale-110 transition-transform" />
				</Link>

				{/* Nav item list */}
				<nav className="flex flex-col items-center gap-1.5 w-full">
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
									'group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200',
									isActive
										? 'bg-white/15 text-white shadow-xs font-semibold'
										: 'text-white/40 hover:bg-white/10 hover:text-white/90',
									item.disabled &&
										'cursor-not-allowed opacity-35 hover:bg-transparent',
								)}
								title={item.label}
							>
								{/* Left glowing active bar */}
								{isActive && (
									<span className="absolute -left-2 top-2 bottom-2 w-1 rounded-r-full bg-[#6e62ff] shadow-[0_0_8px_#6e62ff]" />
								)}

								<Icon className="h-4 w-4" />

								{/* Hover Tooltip */}
								<span
									className="pointer-events-none absolute left-full ml-3 z-50 whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-medium text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100 backdrop-blur-md"
									style={{
										backgroundColor: '#1f1b40',
										border: '1px solid rgba(255,255,255,0.1)',
									}}
								>
									{item.label}
									{item.disabled && (
										<span className="ml-1 text-[10px] text-amber-300 font-normal">
											(Coming Soon)
										</span>
									)}
								</span>
							</Link>
						);
					})}
				</nav>
			</div>

			{/* Bottom: Storage & Security Status */}
			<div className="flex flex-col items-center gap-2">
				<Link
					href="/settings"
					className="group relative flex h-8 w-8 items-center justify-center rounded-xl text-white/40 hover:bg-white/10 hover:text-emerald-400 transition-colors"
					title="Encrypted Local SQLite Database"
				>
					<ShieldCheck className="h-4 w-4 text-emerald-400" />
					<span
						className="pointer-events-none absolute left-full ml-3 z-50 whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-medium text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100"
						style={{
							backgroundColor: '#1f1b40',
							border: '1px solid rgba(255,255,255,0.1)',
						}}
					>
						SQLite Volume: Active & Encrypted
					</span>
				</Link>
			</div>
		</aside>
	);
}
