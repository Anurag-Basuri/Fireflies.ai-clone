// Sidebar navigation matching Fireflies' left icon sidebar
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Mic, BarChart3, Puzzle, Settings, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
	{ href: '/meetings', icon: Home, label: 'Meetings' },
	{ href: '#', icon: Mic, label: 'Notetaker', disabled: true },
	{ href: '#', icon: BarChart3, label: 'Analytics', disabled: true },
	{ href: '#', icon: Puzzle, label: 'Integrations', disabled: true },
	{ href: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
	const pathname = usePathname();

	return (
		<aside
			className="flex w-[68px] flex-col items-center border-r py-4 gap-1"
			style={{
				backgroundColor: 'var(--bg-sidebar)',
				borderColor: 'rgba(255,255,255,0.08)',
			}}
		>
			{/* Brand logo */}
			<Link
				href="/meetings"
				className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl"
				style={{ backgroundColor: 'var(--brand-primary)' }}
			>
				<Flame className="h-5 w-5 text-white" />
			</Link>

			{/* Navigation items */}
			<nav className="flex flex-1 flex-col items-center gap-1">
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
									? 'bg-white/15 text-white'
									: 'text-white/50 hover:bg-white/10 hover:text-white/80',
								item.disabled && 'cursor-not-allowed opacity-40',
							)}
							title={item.label}
						>
							<Icon className="h-5 w-5" />
							{/* Tooltip */}
							<span
								className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
								style={{
									backgroundColor: 'var(--bg-tertiary)',
									color: 'var(--text-primary)',
								}}
							>
								{item.label}
								{item.disabled && ' (Coming Soon)'}
							</span>
						</Link>
					);
				})}
			</nav>
		</aside>
	);
}
