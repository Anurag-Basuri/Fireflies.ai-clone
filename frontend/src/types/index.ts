// TypeScript type definitions mirroring the backend Pydantic schemas

export interface User {
	id: number;
	name: string;
	email: string;
	avatar_url: string | null;
	created_at: string;
}

export interface Participant {
	id: number;
	meeting_id: number;
	name: string;
	email: string | null;
	role: string | null;
}

export interface Speaker {
	id: number;
	meeting_id: number;
	label: string;
	color_hex: string;
}

export interface Tag {
	id: number;
	name: string;
}

export interface TranscriptSegment {
	id: number;
	meeting_id: number;
	speaker_id: number | null;
	speaker_label: string | null;
	speaker_color: string | null;
	start_time: number;
	end_time: number;
	content: string;
	sequence_index: number;
}

export interface Summary {
	id: number;
	meeting_id: number;
	overview: string | null;
	bullet_notes_json: string | null;
	generated_by: string;
	created_at: string;
}

export interface KeyTopic {
	id: number;
	meeting_id: number;
	title: string;
	start_time: number | null;
	order_index: number;
}

export interface ActionItem {
	id: number;
	meeting_id: number;
	text: string;
	assignee: string | null;
	due_date: string | null;
	is_completed: boolean;
	created_at: string;
}

export interface Comment {
	id: number;
	meeting_id: number;
	segment_id: number | null;
	user_id: number;
	content: string;
	created_at: string;
}

export interface Soundbite {
	id: number;
	meeting_id: number;
	segment_id: number | null;
	title: string;
	start_time: number;
	end_time: number;
	created_at: string;
}

export interface MeetingListItem {
	id: number;
	title: string;
	meeting_date: string;
	duration_seconds: number | null;
	status: string;
	media_type: string | null;
	created_at: string;
	updated_at: string;
	participants: Participant[];
	tags: Tag[];
}

export interface MeetingDetail extends MeetingListItem {
	owner_id: number;
	media_url: string | null;
	speakers: Speaker[];
	summary: Summary | null;
	key_topics: KeyTopic[];
	action_items: ActionItem[];
}

export interface PaginatedMeetings {
	items: MeetingListItem[];
	total: number;
	page: number;
	page_size: number;
	total_pages: number;
}

export interface TranscriptSearchMatch {
	segment: TranscriptSegment;
	match_offsets: number[][];
}

export interface TranscriptSearchResponse {
	query: string;
	total_matches: number;
	matches: TranscriptSearchMatch[];
}

export interface SearchResult {
	meeting_id: number;
	meeting_title: string;
	segment_id: number | null;
	content: string;
	start_time: number | null;
	match_type: string;
}

export interface SearchResponse {
	query: string;
	total_results: number;
	results: SearchResult[];
}

export interface AskResponse {
	answer: string;
	meeting_id: number;
}

export interface MeetingCreateData {
	title: string;
	meeting_date: string;
	duration_seconds?: number;
	participants: { name: string; email?: string; role?: string }[];
	transcript_text?: string;
}

export interface ActionItemCreateData {
	text: string;
	assignee?: string;
	due_date?: string;
}

export interface ActionItemUpdateData {
	text?: string;
	assignee?: string;
	due_date?: string;
	is_completed?: boolean;
}
