import math
from typing import List, Dict, Any, Optional
from backend.app.schemas.models import SourceComparison, ConfidenceInterval

# Provisional default coordinates for known synthetic and reference sources
SOURCE_METADATA_REGISTRY = {
    "handpump_14": {
        "name": "Handpump 14",
        "type": "Public Handpump",
        "coordinates": {"lat": 27.1751, "lng": 78.0421},
        "is_synthetic": True
    },
    "well_3": {
        "name": "Well 3",
        "type": "Shallow Dug Well",
        "coordinates": {"lat": 27.1785, "lng": 78.0465},
        "is_synthetic": True
    },
    "community_tank_2": {
        "name": "Community Tank 2",
        "type": "Elevated Community Tank",
        "coordinates": {"lat": 27.1712, "lng": 78.0388},
        "is_synthetic": True
    }
}

def calculate_source_statistics(
    source_id: str,
    records: List[Dict[str, Any]]
) -> SourceComparison:
    """
    Computes deterministic 2x2 contingency matrix, attack rates, relative risk,
    log-RR 95% Wald confidence intervals, and candidate prioritization.
    Does NOT use any LLM or heuristic guessing.
    """
    a = 0  # exposed and ill
    b = 0  # exposed and not ill
    c = 0  # unexposed and ill
    d = 0  # unexposed and not ill
    unknown_exposure_count = 0
    
    exposure_field = f"{source_id}_exposure"
    
    for r in records:
        illness = str(r.get("illness_status", "")).strip().lower()
        exposure = str(r.get(exposure_field, r.get("source_exposures", {}).get(source_id, ""))).strip().lower()
        
        # Exclude unknown illness from 2x2 matrix
        if illness not in ("ill", "not_ill"):
            continue
            
        if exposure == "yes":
            if illness == "ill":
                a += 1
            else:
                b += 1
        elif exposure == "no":
            if illness == "ill":
                c += 1
            else:
                d += 1
        else:
            unknown_exposure_count += 1

    n1 = a + b  # exposed denominator
    n0 = c + d  # unexposed denominator
    
    exposed_ar: Optional[float] = None
    exposed_ar_pct: Optional[str] = None
    if n1 > 0:
        exposed_ar = round(a / n1, 4)
        exposed_ar_pct = f"{(a / n1) * 100:.1f}% ({a}/{n1})"
        
    unexposed_ar: Optional[float] = None
    unexposed_ar_pct: Optional[str] = None
    if n0 > 0:
        unexposed_ar = round(c / n0, 4)
        unexposed_ar_pct = f"{(c / n0) * 100:.1f}% ({c}/{n0})"

    # Relative Risk
    relative_risk: Optional[float] = None
    limitations: List[str] = []
    
    if n1 == 0 or n0 == 0:
        limitations.append("Missing exposed or unexposed comparison group.")
    elif c == 0:
        if a > 0:
            limitations.append("Zero ill cases among unexposed participants; Relative Risk is mathematically undefined.")
        else:
            relative_risk = 0.0
    elif exposed_ar is not None and unexposed_ar is not None and unexposed_ar > 0:
        relative_risk = round(exposed_ar / unexposed_ar, 2)
        
    # 95% Confidence Interval for Relative Risk (log-RR Wald method)
    # SE(log RR) = sqrt(1/a - 1/(a+b) + 1/c - 1/(c+d))
    ci: Optional[ConfidenceInterval] = None
    ci_calculable = False
    ci_limitation_reason: Optional[str] = None
    
    if a > 0 and c > 0 and n1 > a and n0 > c and relative_risk is not None and relative_risk > 0:
        try:
            var_log_rr = (1.0 / a) - (1.0 / n1) + (1.0 / c) - (1.0 / n0)
            if var_log_rr > 0:
                se_log_rr = math.sqrt(var_log_rr)
                log_rr = math.log(relative_risk)
                lower_ci = round(math.exp(log_rr - 1.96 * se_log_rr), 2)
                upper_ci = round(math.exp(log_rr + 1.96 * se_log_rr), 2)
                ci = ConfidenceInterval(lower=lower_ci, upper=upper_ci)
                ci_calculable = True
            else:
                ci_limitation_reason = "Non-positive variance encountered in log-RR variance estimate."
        except Exception as e:
            ci_limitation_reason = f"Log-RR calculation error: {str(e)}"
    else:
        if a == 0 or c == 0:
            ci_limitation_reason = "Zero cell in 2x2 contingency table prevents standard log-RR Wald confidence interval."
        elif n1 == a or n0 == c:
            ci_limitation_reason = "100% attack rate in a subgroup prevents finite Wald variance calculation."
        elif relative_risk is None:
            ci_limitation_reason = "Relative Risk could not be calculated."
        else:
            ci_limitation_reason = "Insufficient subgroup sample counts for asymptotic Wald interval."

    if ci_limitation_reason:
        limitations.append(ci_limitation_reason)

    if unknown_exposure_count > 0:
        limitations.append(f"{unknown_exposure_count} participant(s) had unknown exposure status for this source.")

    # Candidate Prioritization Rules
    candidate_priority: str
    priority_reason: str
    data_sufficiency: str
    
    total_source_obs = n1 + n0
    if total_source_obs < 15:
        data_sufficiency = "LOW (Sample size < 15)"
    elif total_source_obs < 50:
        data_sufficiency = "MODERATE (15 <= Sample size < 50)"
    else:
        data_sufficiency = "HIGH (Sample size >= 50)"

    if n1 == 0 or n0 == 0:
        candidate_priority = "INSUFFICIENT_DATA"
        priority_reason = "One of the exposure groups has zero observations."
    elif relative_risk is None:
        candidate_priority = "REQUIRES_VERIFICATION"
        priority_reason = "Relative risk is undefined due to zero unexposed cases; requires clinical field verification."
    elif relative_risk <= 1.0:
        candidate_priority = "NO_OBSERVED_POSITIVE_ASSOCIATION"
        priority_reason = f"Relative risk of {relative_risk:.2f} does not demonstrate elevated illness risk among exposed participants."
    elif ci_calculable and ci is not None:
        if ci.lower > 1.0 and relative_risk >= 2.0 and a >= 5:
            candidate_priority = "HIGH_PRIORITY_CANDIDATE"
            priority_reason = (
                f"Statistically elevated illness risk (RR = {relative_risk:.2f}, 95% CI: {ci.lower:.2f} - {ci.upper:.2f}). "
                f"Exposed attack rate is {exposed_ar_pct} vs {unexposed_ar_pct} unexposed with {a} exposed cases."
            )
        elif ci.lower <= 1.0 <= ci.upper:
            candidate_priority = "INCONCLUSIVE_EVIDENCE"
            priority_reason = (
                f"Relative risk is elevated ({relative_risk:.2f}), but the 95% confidence interval ({ci.lower:.2f} - {ci.upper:.2f}) "
                f"spans 1.0, indicating statistical uncertainty."
            )
        else:
            candidate_priority = "INCONCLUSIVE_EVIDENCE"
            priority_reason = f"Elevated association (RR = {relative_risk:.2f}), but does not meet high-priority threshold."
    else:
        if relative_risk >= 2.0:
            candidate_priority = "INCONCLUSIVE_EVIDENCE"
            priority_reason = f"Relative risk is elevated ({relative_risk:.2f}), but confidence interval is uncalculable due to small or zero cells."
        else:
            candidate_priority = "INCONCLUSIVE_EVIDENCE"
            priority_reason = f"Modest association (RR = {relative_risk:.2f}) with uncalculable confidence interval."

    meta = SOURCE_METADATA_REGISTRY.get(source_id, {})
    clean_name = meta.get("name", source_id.replace("_", " ").title())
    source_type = meta.get("type", "Water Source")
    coords = meta.get("coordinates", None)
    is_synth = meta.get("is_synthetic", False)

    priority_level_map = {
        "HIGH_PRIORITY_CANDIDATE": "HIGH",
        "INCONCLUSIVE_EVIDENCE": "MEDIUM",
        "REQUIRES_VERIFICATION": "MEDIUM",
        "NO_OBSERVED_POSITIVE_ASSOCIATION": "LOW",
        "INSUFFICIENT_DATA": "LOW",
    }
    priority_level = priority_level_map.get(candidate_priority, "LOW")

    return SourceComparison(
        source_id=source_id,
        source_name=clean_name,
        source_type=source_type,
        coordinates=coords,
        is_synthetic_coordinates=is_synth,
        exposed_ill=a,
        exposed_not_ill=b,
        exposed_denominator=n1,
        exposed_attack_rate=exposed_ar,
        exposed_attack_rate_pct=exposed_ar_pct,
        unexposed_ill=c,
        unexposed_not_ill=d,
        unexposed_denominator=n0,
        unexposed_attack_rate=unexposed_ar,
        unexposed_attack_rate_pct=unexposed_ar_pct,
        unknown_exposure_count=unknown_exposure_count,
        relative_risk=relative_risk,
        confidence_interval_95=ci,
        ci_calculable=ci_calculable,
        ci_limitation_reason=ci_limitation_reason,
        candidate_priority=candidate_priority,
        priority_level=priority_level,
        priority_reason=priority_reason,
        data_sufficiency=data_sufficiency,
        limitations=limitations
    )
