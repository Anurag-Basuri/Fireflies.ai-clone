import re
import json
from typing import Optional

from app.core.logging import logger


def parse_vtt(content: str) -> list[dict]:
    # Parse WebVTT format into structured segment dicts
    segments = []
    lines = content.strip().split("\n")
    idx = 0
    sequence = 0

    while idx < len(lines):
        line = lines[idx].strip()

        # Skip WEBVTT header and empty lines
        if not line or line.startswith("WEBVTT") or line.startswith("NOTE"):
            idx += 1
            continue

        # Skip numeric cue identifiers
        if line.isdigit():
            idx += 1
            continue

        # Look for timestamp line
        timestamp_match = re.match(
            r"(\d{2}:\d{2}[:\.]?\d{0,2}\.?\d{0,3})\s*-->\s*(\d{2}:\d{2}[:\.]?\d{0,2}\.?\d{0,3})",
            line,
        )
        if timestamp_match:
            start_str = timestamp_match.group(1)
            end_str = timestamp_match.group(2)
            start_time = _parse_timestamp(start_str)
            end_time = _parse_timestamp(end_str)

            # Collect text lines until the next blank line
            idx += 1
            text_lines = []
            while idx < len(lines) and lines[idx].strip():
                text_lines.append(lines[idx].strip())
                idx += 1

            full_text = " ".join(text_lines)
            speaker, text = _extract_speaker(full_text)

            segments.append({
                "start_time": start_time,
                "end_time": end_time,
                "content": text,
                "speaker": speaker or "Speaker 1",
                "sequence_index": sequence,
            })
            sequence += 1
        else:
            idx += 1

    return segments


def parse_json_transcript(content: str) -> list[dict]:
    # Parse JSON transcript format with flexible key detection
    data = json.loads(content)
    segments = []

    # Handle both array of segments and object with segments key
    if isinstance(data, dict):
        items = data.get("segments", data.get("transcript", []))
    elif isinstance(data, list):
        items = data
    else:
        return []

    for idx, item in enumerate(items):
        segments.append({
            "start_time": float(item.get("start_time", item.get("start", 0))),
            "end_time": float(item.get("end_time", item.get("end", 0))),
            "content": item.get("content", item.get("text", "")),
            "speaker": item.get("speaker", item.get("speaker_label", f"Speaker {idx % 3 + 1}")),
            "sequence_index": idx,
        })

    return segments


def parse_plain_text(content: str) -> list[dict]:
    # Parse plain text transcripts with optional speaker:text and timestamp patterns
    segments = []
    lines = content.strip().split("\n")
    sequence = 0
    current_time = 0.0

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Try to extract timestamp prefix
        timestamp_match = re.match(
            r"\[?(\d{1,2}:\d{2}(?::\d{2})?(?:\.\d+)?)\]?\s*(.*)",
            line,
        )

        if timestamp_match:
            current_time = _parse_timestamp(timestamp_match.group(1))
            line = timestamp_match.group(2)

        # Extract speaker label if present
        speaker, text = _extract_speaker(line)
        if not text.strip():
            continue

        # Estimate segment duration at 15 seconds per segment
        segment_duration = 15.0

        segments.append({
            "start_time": current_time,
            "end_time": current_time + segment_duration,
            "content": text.strip(),
            "speaker": speaker or "Speaker 1",
            "sequence_index": sequence,
        })

        current_time += segment_duration
        sequence += 1

    return segments


def parse_transcript(content: str, filename: Optional[str] = None) -> list[dict]:
    # Route to the correct parser based on file extension or content detection
    if filename:
        ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
        if ext == "vtt":
            return parse_vtt(content)
        if ext == "json":
            return parse_json_transcript(content)
        if ext == "txt":
            return parse_plain_text(content)

    # Auto-detect format from content
    stripped = content.strip()
    if stripped.startswith("WEBVTT"):
        return parse_vtt(content)
    if stripped.startswith("{") or stripped.startswith("["):
        try:
            return parse_json_transcript(content)
        except json.JSONDecodeError:
            pass

    return parse_plain_text(content)


def _parse_timestamp(ts: str) -> float:
    # Convert HH:MM:SS.mmm or MM:SS.mmm or MM:SS to seconds as float
    ts = ts.replace(",", ".")
    parts = ts.split(":")
    try:
        if len(parts) == 3:
            return float(parts[0]) * 3600 + float(parts[1]) * 60 + float(parts[2])
        if len(parts) == 2:
            return float(parts[0]) * 60 + float(parts[1])
        return float(parts[0])
    except ValueError:
        logger.warning(f"Failed to parse timestamp: {ts}")
        return 0.0


def _extract_speaker(text: str) -> tuple[Optional[str], str]:
    # Extract speaker label from patterns like "Speaker 1: text" or "[Speaker]: text"
    match = re.match(r"\[?([A-Za-z][A-Za-z0-9 ._-]{0,50})\]?\s*:\s*(.*)", text)
    if match:
        speaker = match.group(1).strip()
        remaining = match.group(2).strip()
        # Avoid matching common false positives
        if len(speaker) < 50 and remaining:
            return speaker, remaining
    return None, text
