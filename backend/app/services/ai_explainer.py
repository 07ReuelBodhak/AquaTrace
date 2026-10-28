import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import logging
from typing import Dict, Any
from groq import AsyncGroq

try:
    from backend.app.schemas.models import AnalysisResponse
    from backend.app.core.config import settings
except ImportError:
    from app.schemas.models import AnalysisResponse
    from app.core.config import settings

logger = logging.getLogger("aquatrace.ai")

async def generate_ai_explanation(
    analysis: AnalysisResponse,
    investigation_title: str
) -> Dict[str, Any]:
    """
    Generates a plain-language summary of deterministic analysis results using Groq LLM (openai/gpt-oss-120b).
    Strictly constrained: never recalculates or modifies numbers.
    Gracefully degrades if GROQ_API_KEY is not set or provider is unreachable.
    """
    top_source = analysis.sources[0].source_name if analysis.sources else "None identified"
    top_priority = analysis.sources[0].candidate_priority if analysis.sources else "N/A"

    if not settings.GROQ_API_KEY:
        return {
            "status": "unavailable",
            "message": "AI explanation service is inactive (GROQ_API_KEY not configured).",
            "draft_summary": (
                f"Statistical evaluation for '{investigation_title}' across {analysis.eligible_records} eligible participants "
                f"identified {len(analysis.sources)} candidate water sources. Priority candidate: {top_source}. "
                "Physical inspection and sanitary water sampling are recommended prior to regulatory action."
            ),
            "key_observations": [f"Top Candidate: {top_source} ({top_priority})"]
        }

    try:
        # Prepare strictly allowlisted aggregate statistics
        source_summaries = []
        for s in analysis.sources:
            rr_str = f"{s.relative_risk:.2f}" if s.relative_risk is not None else "Undefined"
            ci_str = (
                f"[{s.confidence_interval_95.lower:.2f} - {s.confidence_interval_95.upper:.2f}]"
                if s.ci_calculable and s.confidence_interval_95
                else "Unavailable"
            )
            source_summaries.append(
                f"- {s.source_name} ({s.source_type}): Priority={s.candidate_priority}, "
                f"Exposed AR={s.exposed_attack_rate_pct or 'N/A'}, Unexposed AR={s.unexposed_attack_rate_pct or 'N/A'}, "
                f"Relative Risk={rr_str}, 95% CI={ci_str}, Unknown Exposures={s.unknown_exposure_count}."
            )

        context_text = (
            f"Investigation: {investigation_title}\n"
            f"Cohort: {analysis.eligible_records} participants ({analysis.ill_count} ill, {analysis.not_ill_count} not ill).\n"
            f"Timeline Filter: {'Recorded at or before ' + str(analysis.timeline_cutoff) if analysis.is_timeline_filtered else 'Full cumulative survey'}.\n"
            f"Evaluated Sources:\n" + "\n".join(source_summaries)
        )

        system_prompt = (
            "You are a public health epidemiological intelligence assistant. "
            "Write a concise 2-paragraph executive briefing for field officers based ONLY on the supplied statistics.\n"
            "MANDATORY INVARIANTS:\n"
            "1. NEVER alter, recalculate, or invent numbers. Use ONLY the exact figures provided in context.\n"
            "2. NEVER declare a water source contaminated or safe. State that statistical association indicates priority for physical inspection and water sampling.\n"
            "3. Mention sample size and unknown exposures if present.\n"
            "4. Do NOT use emojis, marketing adjectives, or conversational pleasantries."
        )

        client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        completion = await client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Summarize these verified outbreak investigation findings:\n\n{context_text}"}
            ],
            temperature=0.1,
            max_tokens=600
        )

        content = completion.choices[0].message.content or ""

        return {
            "status": "success",
            "message": "AI executive synthesis generated using openai/gpt-oss-120b for human review.",
            "draft_summary": content,
            "key_observations": [
                f"Priority Candidate: {top_source} ({top_priority})"
            ]
        }
    except Exception as e:
        logger.warning(f"Groq API call failed: {e}")
        # Deterministic safe fallback
        return {
            "status": "fallback",
            "message": f"Provider unavailable ({str(e)}). Deterministic analytical results remain authoritative.",
            "draft_summary": (
                f"Investigation summary for '{investigation_title}': Evaluated {analysis.eligible_records} survey participants "
                f"({analysis.ill_count} symptomatic cases, overall attack rate {round((analysis.ill_count/max(analysis.eligible_records, 1))*100, 1)}%). "
                f"Statistical prioritization identifies '{top_source}' as the highest-priority candidate for field testing."
            ),
            "key_observations": [f"Top Candidate: {top_source} ({top_priority})"]
        }
