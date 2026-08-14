import json
import re
from typing import Optional
from collections import Counter

from app.core.config import settings
from app.core.logging import logger


# Prompt template for generating a structured meeting summary from transcript text
SUMMARY_PROMPT = """You are an expert meeting assistant. Analyze the following meeting transcript and produce a structured summary.

TRANSCRIPT:
{transcript_text}

Respond ONLY with valid JSON in this exact format:
{{
  "overview": "A 2-4 sentence executive summary of the meeting.",
  "bullet_notes": [
    "Key point 1 discussed in the meeting",
    "Key point 2 discussed in the meeting",
    "Key point 3 discussed in the meeting"
  ],
  "action_items": [
    {{"text": "Action item description", "assignee": "Person name or null", "due_date": "YYYY-MM-DD or null"}},
    {{"text": "Another action item", "assignee": null, "due_date": null}}
  ],
  "key_topics": [
    {{"title": "Topic 1 title", "start_time": 0.0}},
    {{"title": "Topic 2 title", "start_time": 120.5}}
  ]
}}

Guidelines:
- Extract 5-10 bullet notes covering the main discussion points
- Identify all action items with assignees when mentioned
- Identify 3-6 key topics/chapters with approximate start times
- Be concise but comprehensive"""


# Prompt template for the "Ask Fred" meeting Q&A feature
ASK_PROMPT = """You are Fred, an AI meeting assistant. Answer questions about the following meeting based on its transcript and summary.

MEETING SUMMARY:
{summary}

TRANSCRIPT:
{transcript_text}

USER QUESTION: {question}

Provide a clear, concise answer based only on the meeting content. If the answer cannot be determined from the meeting content, say so."""


def generate_summary_with_llm(transcript_text: str) -> Optional[dict]:
    # Call the configured LLM provider to generate a structured summary
    prompt = SUMMARY_PROMPT.format(transcript_text=transcript_text[:15000])

    try:
        if settings.llm_provider == "openai" and settings.openai_api_key:
            return _call_openai(prompt)
        elif settings.llm_provider == "anthropic" and settings.anthropic_api_key:
            return _call_anthropic(prompt)
        else:
            logger.info("No LLM API key configured, using fallback summary")
            return None
    except Exception as e:
        logger.error(f"LLM summary generation failed: {e}")
        return None


def ask_meeting_question(
    question: str,
    transcript_text: str,
    summary_text: str,
) -> Optional[str]:
    # Send a meeting-scoped Q&A question to the LLM
    prompt = ASK_PROMPT.format(
        summary=summary_text,
        transcript_text=transcript_text[:10000],
        question=question,
    )

    try:
        if settings.llm_provider == "openai" and settings.openai_api_key:
            result = _call_openai_text(prompt)
            return result
        elif settings.llm_provider == "anthropic" and settings.anthropic_api_key:
            result = _call_anthropic_text(prompt)
            return result
        else:
            return "I'm sorry, the AI assistant is not configured. Please add an LLM API key to enable this feature."
    except Exception as e:
        logger.error(f"Ask AI failed: {e}")
        return "I encountered an error processing your question. Please try again."


def generate_fallback_summary(transcript_text: str) -> dict:
    # Rule-based fallback when the LLM is unavailable or fails
    lines = transcript_text.strip().split("\n")
    lines = [l.strip() for l in lines if l.strip()]

    # Extract overview from first few meaningful lines
    overview_lines = lines[:5] if len(lines) >= 5 else lines
    overview = "This meeting covered: " + ". ".join(
        line[:100] for line in overview_lines
    )

    # Extract bullet notes from key sentences
    bullet_notes = []
    for line in lines[:20]:
        cleaned = re.sub(r"^\[?\d{1,2}:\d{2}.*?\]?\s*", "", line)
        cleaned = re.sub(r"^[A-Za-z ]+:\s*", "", cleaned)
        if len(cleaned) > 20:
            bullet_notes.append(cleaned[:200])
    bullet_notes = bullet_notes[:10]

    # Naive action item extraction from keywords
    action_items = []
    action_keywords = ["need to", "should", "will", "must", "action", "todo", "follow up", "deadline"]
    for line in lines:
        lower = line.lower()
        if any(kw in lower for kw in action_keywords):
            cleaned = re.sub(r"^\[?\d{1,2}:\d{2}.*?\]?\s*", "", line)
            cleaned = re.sub(r"^[A-Za-z ]+:\s*", "", cleaned)
            if len(cleaned) > 10:
                action_items.append({
                    "text": cleaned[:200],
                    "assignee": None,
                    "due_date": None,
                })
    action_items = action_items[:5]

    # Generate topics from frequency analysis of key terms
    words = re.findall(r"\b[a-z]{4,}\b", transcript_text.lower())
    stop_words = {
        "that", "this", "with", "have", "from", "they", "been",
        "will", "what", "when", "your", "about", "would", "there",
        "their", "which", "could", "other", "into", "more", "some",
        "just", "also", "than", "them", "very", "like", "then",
    }
    filtered = [w for w in words if w not in stop_words]
    common = Counter(filtered).most_common(5)
    key_topics = [
        {"title": word.capitalize(), "start_time": None}
        for word, _ in common
    ]

    return {
        "overview": overview[:500],
        "bullet_notes": bullet_notes,
        "action_items": action_items,
        "key_topics": key_topics,
    }


def _call_openai(prompt: str) -> Optional[dict]:
    # Make an OpenAI API call and parse the JSON response
    import openai

    client = openai.OpenAI(api_key=settings.openai_api_key)
    response = client.chat.completions.create(
        model=settings.llm_model,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=2000,
        timeout=30,
    )
    content = response.choices[0].message.content
    return _parse_llm_json(content)


def _call_anthropic(prompt: str) -> Optional[dict]:
    # Make an Anthropic API call and parse the JSON response
    import anthropic

    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    response = client.messages.create(
        model=settings.llm_model,
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}],
    )
    content = response.content[0].text
    return _parse_llm_json(content)


def _call_openai_text(prompt: str) -> str:
    # Make an OpenAI API call returning raw text
    import openai

    client = openai.OpenAI(api_key=settings.openai_api_key)
    response = client.chat.completions.create(
        model=settings.llm_model,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5,
        max_tokens=1000,
        timeout=30,
    )
    return response.choices[0].message.content


def _call_anthropic_text(prompt: str) -> str:
    # Make an Anthropic API call returning raw text
    import anthropic

    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    response = client.messages.create(
        model=settings.llm_model,
        max_tokens=1000,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.content[0].text


def _parse_llm_json(content: str) -> Optional[dict]:
    # Extract and parse JSON from LLM response, handling markdown fences
    if not content:
        return None

    # Strip markdown code fences
    content = content.strip()
    if content.startswith("```"):
        content = re.sub(r"^```(?:json)?\s*\n?", "", content)
        content = re.sub(r"\n?```\s*$", "", content)

    try:
        return json.loads(content)
    except json.JSONDecodeError:
        logger.error(f"Failed to parse LLM JSON response: {content[:200]}")
        return None
