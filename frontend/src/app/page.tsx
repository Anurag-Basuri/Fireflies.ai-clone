// Root page redirecting to the main meetings dashboard
import { redirect } from 'next/navigation';

export default function HomePage() {
	redirect('/meetings');
}
