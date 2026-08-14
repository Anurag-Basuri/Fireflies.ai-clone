// Utility functions for class name merging and formatting
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Merge Tailwind class names with conflict resolution
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Format seconds into MM:SS or HH:MM:SS display string
export function formatTime(seconds: number): string {
	const hrs = Math.floor(seconds / 3600);
	const mins = Math.floor((seconds % 3600) / 60);
	const secs = Math.floor(seconds % 60);

	if (hrs > 0) {
		return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}
	return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Format seconds into human-readable duration like "57 min" or "1h 23m"
export function formatDuration(seconds: number | null): string {
	if (!seconds) return '--';
	const hrs = Math.floor(seconds / 3600);
	const mins = Math.floor((seconds % 3600) / 60);

	if (hrs > 0) {
		return `${hrs}h ${mins}m`;
	}
	return `${mins} min`;
}

// Format ISO date string into a readable format
export function formatDate(dateStr: string): string {
	const d = new Date(dateStr);
	return d.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
}

// Get initials from a name for avatar display
export function getInitials(name: string): string {
	return name
		.split(' ')
		.map((n) => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2);
}

// Generate a deterministic color from a string for consistent avatar colors
export function stringToColor(str: string): string {
	const colors = [
		'#6366F1',
		'#EC4899',
		'#F59E0B',
		'#10B981',
		'#3B82F6',
		'#8B5CF6',
		'#EF4444',
		'#14B8A6',
	];
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	return colors[Math.abs(hash) % colors.length];
}
