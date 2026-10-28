import os
import logging
from typing import Dict, Any, Optional
from backend.app.schemas.models import AnalysisResponse
from backend.app.config import settings

logger = logging.getLogger("aquatrace.ai")

async def generate_ai_explanation(
    analysis: AnalysisResponse,
    investigation_title: str
) -> Dict[str, Any]:
    """
    Generates a plain-language summary of deterministic analysis results using Groq LLM.
    Strictly constrained: never recalculates or modifies numbers.
    Gracefully degrades if GROQ_API_KEY is not set or network/service is unavailable.
    """
    if not settings.GROQ_API_KEY:
        return {
            "status": "unavailable",
            "message": "AI explanation service is currently inactive (GROQ_API_KEY is not configured). Deterministic analytical results remain authoritative.",
            "draft_summary": None,
            "key_observations": []
        }

    try:
        from langchain_groq import ChatGroq
        from langchain_core.messages import SystemMessage, HumanMessage
        
        # Prepare deterministic context strictly containing computed statistics
        source_summaries = []
        for s in analysis.sources:
            rr_str = f"{s.relative_risk:.2f}" if s.relative_risk is not None else "Undefined"
            ci_str = f"({s.confidence_interval_95.lower:.2f} to {s.confidence_interval_95.upper:.2f})" if s.ci_calculable and s.confidence_interval_95 else "Unavailable"
            source_summaries.append(
                f"- Source '{s.source_name}' ({s.source_type}): Priority={s.candidate_priority}, "
                f"Exposed Attack Rate={s.exposed_attack_rate_pct}, Unexposed Attack Rate={s.unexposed_attack_rate_pct}, "
                f"RR={rr_str}, 95% CI={ci_str}, Unknown exposures={s.unknown_exposure_count}."
            )
            
        context_text = (
            f"Investigation: {investigation_title}\n"
            f"Cohort: {analysis.eligible_records} eligible participants ({analysis.ill_count} ill, {analysis.not_ill_count} not ill).\n"
            f"Timeline status: {'Filtered at ' + str(analysis.timeline_cutoff) if analysis.is_timeline_filtered else 'Full cumulative dataset'}.\n"
            "Calculated Source Statistics:\n" + "\n".join(source_summaries)
        )
        
        system_prompt = (
            "You are an assistant to a public health epidemiologist. "
            "Your role is ONLY to provide a concise, professional 2-3 paragraph plain-language summary "
            "of the supplied deterministic statistical results for a field investigation brief. "
            "CRITICAL RULES:\n"
            "1. NEVER alter, recalculate, or guess numbers. Use ONLY the exact numbers provided in context.\n"
            "2. NEVER declare a water source contaminated or safe. Always emphasize that statistical association guides field sanitary sampling and does not prove contamination.\n"
            "3. Note any unknown exposures or confidence interval limitations.\n"
            "4. Do NOT use emojis or marketing adjectives."
        )
        
        llm = ChatGroq(
            groq_api_key=settings.GROQ_API_KEY,
            model_name=settings.GROQ_MODEL,
            temperature=0.1,
            max_tokens=500
        )
        
        response = await llm.ainvoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"Please summarize these findings for the field team:\n\n{context_text}")
        ])
        
        return {
            "status": "success",
            "message": "AI-generated synthesis generated for human health officer review.",
            "draft_summary": response.content,
            "key_observations": [
                f"Prioritized source: {analysis.sources[0].source_name} ({analysis.sources[0].candidate_priority})" if analysis.sources else "No candidate sources analysed."
            ]
        }
    except Exception as e:
        logger.warning(f"Groq AI explanation failed: {e}")
        return {
            "status": "fallback",
            "message": f"AI service temporarily unavailable ({str(e)}). Deterministic analysis values remain authoritative.",
            "draft_summary": None,
            "key_observations": []
        }
