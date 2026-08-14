// Typed API client for communicating with the FastAPI backend
import type {
	PaginatedMeetings,
	MeetingDetail,
	MeetingCreateData,
	TranscriptSegment,
	TranscriptSearchResponse,
	Summary,
	ActionItem,
	ActionItemCreateData,
	ActionItemUpdateData,
	Tag,
	Comment,
	Soundbite,
	SearchResponse,
	AskResponse,
	User,
} from '@/types';

const API_BASE =
	process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

// Generic fetch wrapper with error handling
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
	const url = `${API_BASE}${path}`;
	const res = await fetch(url, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			...options?.headers,
		},
	});

	if (!res.ok) {
		const error = await res.json().catch(() => ({ detail: 'Request failed' }));
		throw new Error(error.detail || `API error: ${res.status}`);
	}

	// Handle 204 No Content
	if (res.status === 204) {
		return undefined as T;
	}

	return res.json();
}

// Meetings
export async function fetchMeetings(params?: {
	q?: string;
	date_from?: string;
	date_to?: string;
	participant?: string;
	tag?: string;
	sort?: string;
	page?: number;
	page_size?: number;
}): Promise<PaginatedMeetings> {
	const searchParams = new URLSearchParams();
	if (params) {
		Object.entries(params).forEach(([key, value]) => {
			if (value !== undefined && value !== '') {
				searchParams.set(key, String(value));
			}
		});
	}
	const query = searchParams.toString();
	return apiFetch<PaginatedMeetings>(`/meetings${query ? `?${query}` : ''}`);
}

export async function fetchMeeting(id: number): Promise<MeetingDetail> {
	return apiFetch<MeetingDetail>(`/meetings/${id}`);
}

export async function createMeeting(
	data: MeetingCreateData,
): Promise<MeetingDetail> {
	return apiFetch<MeetingDetail>('/meetings', {
		method: 'POST',
		body: JSON.stringify(data),
	});
}

export async function updateMeeting(
	id: number,
	data: Partial<MeetingCreateData>,
): Promise<MeetingDetail> {
	return apiFetch<MeetingDetail>(`/meetings/${id}`, {
		method: 'PATCH',
		body: JSON.stringify(data),
	});
}

export async function deleteMeeting(id: number): Promise<void> {
	return apiFetch<void>(`/meetings/${id}`, { method: 'DELETE' });
}

// Upload meeting with file
export async function uploadMeeting(
	formData: FormData,
): Promise<MeetingDetail> {
	const url = `${API_BASE}/meetings/upload`;
	const res = await fetch(url, {
		method: 'POST',
		body: formData,
	});

	if (!res.ok) {
		const error = await res.json().catch(() => ({ detail: 'Upload failed' }));
		throw new Error(error.detail || `Upload error: ${res.status}`);
	}

	return res.json();
}

// Transcript
export async function fetchTranscript(
	meetingId: number,
): Promise<TranscriptSegment[]> {
	return apiFetch<TranscriptSegment[]>(`/meetings/${meetingId}/transcript`);
}

export async function searchTranscript(
	meetingId: number,
	query: string,
): Promise<TranscriptSearchResponse> {
	return apiFetch<TranscriptSearchResponse>(
		`/meetings/${meetingId}/transcript/search?q=${encodeURIComponent(query)}`,
	);
}

// Summary
export async function fetchSummary(meetingId: number): Promise<Summary> {
	return apiFetch<Summary>(`/meetings/${meetingId}/summary`);
}

export async function regenerateSummary(meetingId: number): Promise<Summary> {
	return apiFetch<Summary>(`/meetings/${meetingId}/summary/regenerate`, {
		method: 'POST',
	});
}

// Action Items
export async function fetchActionItems(
	meetingId: number,
): Promise<ActionItem[]> {
	return apiFetch<ActionItem[]>(`/meetings/${meetingId}/action-items`);
}

export async function createActionItem(
	meetingId: number,
	data: ActionItemCreateData,
): Promise<ActionItem> {
	return apiFetch<ActionItem>(`/meetings/${meetingId}/action-items`, {
		method: 'POST',
		body: JSON.stringify(data),
	});
}

export async function updateActionItem(
	itemId: number,
	data: ActionItemUpdateData,
): Promise<ActionItem> {
	return apiFetch<ActionItem>(`/action-items/${itemId}`, {
		method: 'PATCH',
		body: JSON.stringify(data),
	});
}

export async function deleteActionItem(itemId: number): Promise<void> {
	return apiFetch<void>(`/action-items/${itemId}`, { method: 'DELETE' });
}

// Tags
export async function fetchTags(): Promise<Tag[]> {
	return apiFetch<Tag[]>('/tags');
}

export async function attachTag(meetingId: number, name: string): Promise<Tag> {
	return apiFetch<Tag>(`/meetings/${meetingId}/tags`, {
		method: 'POST',
		body: JSON.stringify({ name }),
	});
}

export async function detachTag(
	meetingId: number,
	tagId: number,
): Promise<void> {
	return apiFetch<void>(`/meetings/${meetingId}/tags/${tagId}`, {
		method: 'DELETE',
	});
}

// Comments
export async function fetchComments(meetingId: number): Promise<Comment[]> {
	return apiFetch<Comment[]>(`/meetings/${meetingId}/comments`);
}

export async function createComment(
	meetingId: number,
	data: { content: string; segment_id?: number },
): Promise<Comment> {
	return apiFetch<Comment>(`/meetings/${meetingId}/comments`, {
		method: 'POST',
		body: JSON.stringify(data),
	});
}

// Soundbites
export async function fetchSoundbites(meetingId: number): Promise<Soundbite[]> {
	return apiFetch<Soundbite[]>(`/meetings/${meetingId}/soundbites`);
}

export async function createSoundbite(
	meetingId: number,
	data: {
		title: string;
		segment_id?: number;
		start_time: number;
		end_time: number;
	},
): Promise<Soundbite> {
	return apiFetch<Soundbite>(`/meetings/${meetingId}/soundbites`, {
		method: 'POST',
		body: JSON.stringify(data),
	});
}

// Search
export async function globalSearch(query: string): Promise<SearchResponse> {
	return apiFetch<SearchResponse>(`/search?q=${encodeURIComponent(query)}`);
}

// Ask AI
export async function askMeeting(
	meetingId: number,
	question: string,
): Promise<AskResponse> {
	return apiFetch<AskResponse>(`/meetings/${meetingId}/ask`, {
		method: 'POST',
		body: JSON.stringify({ question }),
	});
}

// User
export async function fetchCurrentUser(): Promise<User> {
	return apiFetch<User>('/users/me');
}

// Export
export function getExportUrl(meetingId: number, format: string): string {
	return `${API_BASE}/meetings/${meetingId}/export?format=${format}`;
}
