# Unit tests for transcript parser covering VTT, JSON, and plain text formats
from app.services.transcript_parser import (
    parse_vtt,
    parse_json_transcript,
    parse_plain_text,
    parse_transcript,
)


# Test parsing WebVTT formatted transcripts
def test_parse_vtt():
    vtt_content = """WEBVTT

1
00:00:01.000 --> 00:00:04.500
Sarah: Welcome everyone to the meeting.

2
00:00:05.000 --> 00:00:09.000
Marcus: Thanks Sarah, glad to be here.
"""
    segments = parse_vtt(vtt_content)
    assert len(segments) == 2
    assert segments[0]["speaker"] == "Sarah"
    assert segments[0]["start_time"] == 1.0
    assert segments[0]["end_time"] == 4.5
    assert segments[0]["content"] == "Welcome everyone to the meeting."

    assert segments[1]["speaker"] == "Marcus"
    assert segments[1]["start_time"] == 5.0
    assert segments[1]["end_time"] == 9.0


# Test parsing JSON transcripts
def test_parse_json_transcript():
    json_content = """[
        {"start_time": 0.0, "end_time": 15.0, "speaker": "Alex", "content": "Let's review the proposal."},
        {"start_time": 15.0, "end_time": 30.0, "speaker": "Jordan", "content": "I agree with the terms."}
    ]"""
    segments = parse_json_transcript(json_content)
    assert len(segments) == 2
    assert segments[0]["speaker"] == "Alex"
    assert segments[1]["content"] == "I agree with the terms."


# Test parsing plain text transcripts with timestamps and speakers
def test_parse_plain_text():
    text_content = """[00:15] Alice: Let's begin the review.
[00:30] Bob: Everything looks solid."""
    segments = parse_plain_text(text_content)
    assert len(segments) == 2
    assert segments[0]["speaker"] == "Alice"
    assert segments[0]["start_time"] == 15.0
    assert segments[1]["speaker"] == "Bob"
    assert segments[1]["start_time"] == 30.0
