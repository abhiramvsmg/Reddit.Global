import re
from functools import lru_cache
from typing import Any

import httpx

from app.core.config import settings
from app.schemas.ai import AiStatusResponse, ModerationResponse, PostAssistResponse


BLOCK_TERMS = {"hate", "kill", "terror", "scam", "dox"}
WARN_TERMS = {"stupid", "idiot", "fraud", "spam", "nsfw"}


def _labels(text: str) -> list[str]:
    lowered = text.lower()
    labels = []
    if any(term in lowered for term in BLOCK_TERMS):
        labels.append("high_risk")
    if any(term in lowered for term in WARN_TERMS):
        labels.append("needs_review")
    if re.search(r"https?://\S+", text):
        labels.append("external_link")
    return labels


def _clamp_score(value: Any) -> float:
    try:
        return round(max(0.0, min(1.0, float(value))), 2)
    except (TypeError, ValueError):
        return 0.0


def moderate_text(text: str) -> ModerationResponse:
    labels = _labels(text)
    toxicity_score = min(1.0, 0.15 * len(labels) + (0.55 if "high_risk" in labels else 0))
    status = "blocked" if "high_risk" in labels else "review" if "needs_review" in labels else "approved"
    reason = ", ".join(labels) if labels else None
    return ModerationResponse(
        status=status,
        reason=reason,
        toxicity_score=round(toxicity_score, 2),
        labels=labels,
    )


def _tags(title: str, content: str | None) -> list[str]:
    words = re.findall(r"[a-zA-Z][a-zA-Z0-9]{3,}", f"{title} {content or ''}".lower())
    ignored = {"this", "that", "with", "from", "have", "your", "about", "post", "first"}
    unique = []
    for word in words:
        if word not in ignored and word not in unique:
            unique.append(word)
    return unique[:5]


def detect_language(text: str) -> str:
    return "en" if text.isascii() else "multi"


def _clean_tags(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    tags = []
    for tag in value:
        normalized = re.sub(r"[^a-zA-Z0-9_-]", "", str(tag).strip().lower())
        if normalized and normalized not in tags:
            tags.append(normalized)
    return tags[:5]


def _coerce_provider_assist(parsed: dict[str, Any], title: str, content: str | None) -> PostAssistResponse:
    moderation_status = str(parsed.get("moderation_status", "review")).lower()
    if moderation_status not in {"approved", "review", "blocked"}:
        moderation_status = "review"

    summary = str(parsed.get("summary") or content or "Link or image post ready for discussion.").strip()
    return PostAssistResponse(
        improved_title=str(parsed.get("improved_title") or title).strip()[:220],
        summary=summary[:500],
        tags=_clean_tags(parsed.get("tags")),
        language=str(parsed.get("language") or detect_language(f"{title} {content or ''}"))[:12],
        toxicity_score=_clamp_score(parsed.get("toxicity_score", 0.0)),
        moderation_status=moderation_status,
        safety_note=f"AI checks routed through {settings.ai_provider}.",
        suggested_body=str(parsed.get("suggested_body") or summary).strip()[:2000],
        tone=str(parsed.get("tone") or "clear").strip()[:40],
        provider=settings.ai_provider,
    )


def _provider_assist(title: str, content: str | None) -> PostAssistResponse | None:
    if settings.ai_provider == "local" or not settings.ai_base_url or not settings.ai_api_key:
        return None

    prompt = (
        "Return compact JSON with keys improved_title, summary, suggested_body, tags, language, "
        "tone, toxicity_score, moderation_status for this community post. Make suggested_body "
        "clear, friendly, and ready to publish without changing the author's meaning.\n\n"
        f"Title: {title}\nContent: {content or ''}"
    )
    try:
        with httpx.Client(timeout=settings.ai_timeout_seconds) as client:
            response = client.post(
                settings.ai_base_url.rstrip("/") + "/chat/completions",
                headers={"Authorization": f"Bearer {settings.ai_api_key}"},
                json={
                    "model": settings.ai_model,
                    "messages": [{"role": "user", "content": prompt}],
                    "response_format": {"type": "json_object"},
                    "temperature": 0.2,
                },
            )
        response.raise_for_status()
        data = response.json()
        import json

        parsed = json.loads(data["choices"][0]["message"]["content"])
        if not isinstance(parsed, dict):
            return None
        return _coerce_provider_assist(parsed, title, content)
    except Exception:
        return None


@lru_cache(maxsize=512)
def _local_assist(title: str, content: str | None) -> PostAssistResponse:
    body = (content or "").strip()
    cleaned_title = re.sub(r"\s+", " ", title.strip())
    improved_title = cleaned_title[:1].upper() + cleaned_title[1:]
    summary = body[:180] + ("..." if len(body) > 180 else "")
    if not summary:
        summary = "Link or image post ready for discussion."
    moderation = moderate_text(f"{title}\n{body}")
    tags = _tags(title, body)
    suggested_body = body
    if body and len(body.split()) < 12:
        suggested_body = f"{body}\n\nWhat do you think? Add your perspective below."

    return PostAssistResponse(
        improved_title=improved_title,
        summary=summary,
        tags=tags,
        language=detect_language(f"{title} {body}"),
        toxicity_score=moderation.toxicity_score,
        moderation_status=moderation.status,
        safety_note=(
            "AI checks are running in local heuristic mode."
            if settings.ai_provider == "local"
            else f"AI checks are routed through {settings.ai_provider}."
        ),
        suggested_body=suggested_body or summary,
        tone="clear",
        provider=settings.ai_provider,
    )


def assist_post(title: str, content: str | None) -> PostAssistResponse:
    provider_result = _provider_assist(title, content)
    if provider_result:
        return provider_result

    return _local_assist(title.strip(), content.strip() if content else None)


def ai_status() -> AiStatusResponse:
    connected = settings.ai_provider != "local" and bool(settings.ai_base_url and settings.ai_api_key)
    return AiStatusResponse(
        provider=settings.ai_provider,
        model=settings.ai_model,
        connected=connected,
        mode="provider" if connected else "local",
    )
