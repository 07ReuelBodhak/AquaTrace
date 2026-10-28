import math
from typing import Tuple
from backend.app.models.schemas import ContingencyTable, PriorityStatus, RiskMetrics


def compute_contingency_matrix(
    a: int,
    b: int,
    c: int,
    d: int,
) -> Tuple[ContingencyTable, RiskMetrics]:
    """
    Computes deterministic 2x2 contingency matrix and epidemiological risk metrics.
    Strictly conforms to Section 3 of /docs/api-contract.md:
      - Haldane-Anscombe 0.5 zero-cell correction when any cell (a, b, c, d) is 0.
      - 95% Wald log-Relative Risk confidence intervals.
      - Priority status classification.
    """
    n_e = a + b
    n_u = c + d
    total = n_e + n_u

    # Descriptive attack rates
    ar_e = (a / n_e) if n_e > 0 else 0.0
    ar_u = (c / n_u) if n_u > 0 else 0.0
    ar_total = ((a + c) / total) if total > 0 else 0.0

    # Risk Difference
    risk_diff = ar_e - ar_u

    # Population Attributable Fraction (PAR%)
    if ar_total > 0:
        par_percent = ((ar_total - ar_u) / ar_total) * 100.0
    else:
        par_percent = 0.0

    # Zero-cell check: Haldane-Anscombe correction
    has_zero_cell = (a == 0 or b == 0 or c == 0 or d == 0)

    if has_zero_cell:
        # Add 0.5 to all four cells for variance and RR estimation
        a_adj = a + 0.5
        b_adj = b + 0.5
        c_adj = c + 0.5
        d_adj = d + 0.5
        ne_adj = a_adj + b_adj
        nu_adj = c_adj + d_adj
        zero_cell_corrected = True
    else:
        a_adj = float(a)
        b_adj = float(b)
        c_adj = float(c)
        d_adj = float(d)
        ne_adj = float(n_e)
        nu_adj = float(n_u)
        zero_cell_corrected = False

    # Relative Risk calculation
    if ne_adj > 0 and nu_adj > 0 and c_adj > 0:
        ar_e_adj = a_adj / ne_adj
        ar_u_adj = c_adj / nu_adj
        if ar_u_adj > 0:
            relative_risk = ar_e_adj / ar_u_adj
        else:
            relative_risk = 0.0
    else:
        relative_risk = 0.0

    # 95% Wald Log-RR Confidence Interval
    # SE(ln(RR)) = sqrt(1/a - 1/n_e + 1/c - 1/n_u)
    if relative_risk > 0 and a_adj > 0 and c_adj > 0 and ne_adj > 0 and nu_adj > 0:
        variance_terms = (1.0 / a_adj) - (1.0 / ne_adj) + (1.0 / c_adj) - (1.0 / nu_adj)
        variance = max(0.0, variance_terms)
        se_log_rr = math.sqrt(variance)
        log_rr = math.log(relative_risk)
        ci_lower = math.exp(log_rr - 1.96 * se_log_rr)
        ci_upper = math.exp(log_rr + 1.96 * se_log_rr)
    else:
        ci_lower = 0.0
        ci_upper = 0.0

    # Priority Status Categorisation according to Contract Section 3.5:
    # 1. INSUFFICIENT_DATA: Exposed cases a < 3 or exposed total n_e < 5
    if a < 3 or n_e < 5:
        priority_status = PriorityStatus.INSUFFICIENT_DATA
    # 2. HIGH_PRIORITY: RR >= 2.0 AND CI_lower > 1.0 AND a >= 5
    elif relative_risk >= 2.0 and ci_lower > 1.0 and a >= 5:
        priority_status = PriorityStatus.HIGH_PRIORITY
    # 3. MODERATE_PRIORITY: (RR > 1.2 OR (RR >= 2.0 AND CI_lower <= 1.0)) AND a >= 3
    elif ((relative_risk > 1.2) or (relative_risk >= 2.0 and ci_lower <= 1.0)) and a >= 3:
        priority_status = PriorityStatus.MODERATE_PRIORITY
    # 4. LOW_PRIORITY: RR <= 1.0 OR CI_upper < 1.0
    elif relative_risk <= 1.0 or ci_upper < 1.0:
        priority_status = PriorityStatus.LOW_PRIORITY
    else:
        priority_status = PriorityStatus.LOW_PRIORITY

    table = ContingencyTable(
        a=a,
        b=b,
        c=c,
        d=d,
        n_exposed=n_e,
        n_unexposed=n_u,
        total=total,
        zero_cell_corrected=zero_cell_corrected,
    )

    metrics = RiskMetrics(
        attack_rate_exposed=round(ar_e, 4),
        attack_rate_unexposed=round(ar_u, 4),
        attack_rate_overall=round(ar_total, 4),
        relative_risk=round(relative_risk, 4),
        risk_difference=round(risk_diff, 4),
        population_attributable_fraction=round(par_percent, 2),
        ci_lower=round(ci_lower, 4),
        ci_upper=round(ci_upper, 4),
        priority_status=priority_status,
    )

    return table, metrics
