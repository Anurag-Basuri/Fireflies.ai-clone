// Root layout with theme provider, React Query provider, and toast notifications
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'sonner';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'Fireflies - Meeting Notes & Transcription',
	description:
		'AI-powered meeting notes, transcription, and action item tracking platform',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={inter.className}>
				<Providers>
					<div className="flex h-screen overflow-hidden">
						<Sidebar />
						<div className="flex flex-1 flex-col overflow-hidden">
							<Navbar />
							<main className="flex-1 overflow-y-auto bg-[var(--bg-secondary)]">
								{children}
							</main>
						</div>
					</div>
					<Toaster
						position="top-right"
						richColors
						closeButton
						toastOptions={{
							duration: 4000,
						}}
					/>
				</Providers>
			</body>
		</html>
	);
}
