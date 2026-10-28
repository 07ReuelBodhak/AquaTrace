/**
 * AquaTrace API Client Wrapper
 * Conforms strictly to /docs/api-contract.md
 * Communicates with FastAPI backend (/api/v1)
 */

export interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
  database?: string;
  active_dataset: boolean;
}

export interface ApiErrorDetail {
  loc?: (string | number)[];
  msg?: string;
  type?: string;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
}

export interface DatasetUploadResponse {
  dataset_id: string;
  row_count: number;
  source_ids: string[];
  min_timestamp?: string;
  max_timestamp?: string;
  message: string;
}

export interface ContingencyMatrix {
  a: number;      // exposed ill
  b: number;      // exposed well
  c: number;      // unexposed ill
  d: number;      // unexposed well
  n_exposed: number;    // n_e = a + b
  n_unexposed: number;  // n_u = c + d
  total: number;        // total cohort = a + b + c + d
  zero_cell_corrected: boolean;
}

export type PriorityStatus =
  | "HIGH_PRIORITY"
  | "MODERATE_PRIORITY"
  | "LOW_PRIORITY"
  | "INSUFFICIENT_DATA";

export interface RiskMetrics {
  attack_rate_exposed: number;
  attack_rate_unexposed: number;
  attack_rate_overall: number;
  relative_risk: number;
  risk_difference: number;
  population_attributable_fraction: number;
  ci_lower: number;
  ci_upper: number;
  priority_status: PriorityStatus;
}

export interface SourceAnalysisResult {
  source_id: string;
  source_name: string;
  source_type: string;
  coordinates?: { lat: number; lng: number };
  contingency_table: ContingencyMatrix;
  risk_metrics: RiskMetrics;
}

export function mapBackendSourceToFrontend(s: Record<string, unknown>): SourceAnalysisResult {
  const cTable = (s.contingency_table as Record<string, unknown>) || {};
  const rMetrics = (s.risk_metrics as Record<string, unknown>) || {};
  const cInterval = (s.confidence_interval_95 as Record<string, unknown>) || {};

  const a = Number(s.exposed_ill ?? cTable.a ?? 0);
  const b = Number(s.exposed_not_ill ?? cTable.b ?? 0);
  const c = Number(s.unexposed_ill ?? cTable.c ?? 0);
  const d = Number(s.unexposed_not_ill ?? cTable.d ?? 0);
  const ne = Number(s.exposed_denominator ?? (a + b));
  const nu = Number(s.unexposed_denominator ?? (c + d));
  const total = ne + nu;

  const ar_e = s.exposed_attack_rate !== undefined && s.exposed_attack_rate !== null
    ? Number(s.exposed_attack_rate)
    : (ne > 0 ? a / ne : 0);
  const ar_u = s.unexposed_attack_rate !== undefined && s.unexposed_attack_rate !== null
    ? Number(s.unexposed_attack_rate)
    : (nu > 0 ? c / nu : 0);
  const ar_tot = total > 0 ? (a + c) / total : 0;

  const rr = s.relative_risk !== undefined && s.relative_risk !== null
    ? Number(s.relative_risk)
    : (ar_u > 0 ? ar_e / ar_u : 0);
  const rd = s.risk_difference !== undefined && s.risk_difference !== null
    ? Number(s.risk_difference)
    : (ar_e - ar_u);
  const paf = s.population_attributable_fraction !== undefined && s.population_attributable_fraction !== null
    ? Number(s.population_attributable_fraction)
    : (ar_tot > 0 ? Math.max((ar_tot - ar_u) / ar_tot, 0) : 0);

  const ci_lower = Number(cInterval.lower ?? rMetrics.ci_lower ?? 0);
  const ci_upper = Number(cInterval.upper ?? rMetrics.ci_upper ?? 0);

  let pStatus: PriorityStatus = "LOW_PRIORITY";
  const rawP = String(s.candidate_priority || s.priority_level || rMetrics.priority_status || "").toUpperCase();
  if (rawP.includes("HIGH")) {
    pStatus = "HIGH_PRIORITY";
  } else if (
    rawP.includes("MEDIUM") ||
    rawP.includes("MODERATE") ||
    rawP.includes("INCONCLUSIVE") ||
    rawP.includes("VERIFICATION")
  ) {
    pStatus = "MODERATE_PRIORITY";
  } else if (rawP.includes("INSUFFICIENT")) {
    pStatus = "INSUFFICIENT_DATA";
  }

  return {
    source_id: String(s.source_id || "source"),
    source_name: String(s.source_name || s.source_id || "Water Source"),
    source_type: String(s.source_type || "Water Point"),
    coordinates: s.coordinates as { lat: number; lng: number } | undefined,
    contingency_table: {
      a,
      b,
      c,
      d,
      n_exposed: ne,
      n_unexposed: nu,
      total,
      zero_cell_corrected: Boolean(cTable.zero_cell_corrected || false),
    },
    risk_metrics: {
      attack_rate_exposed: ar_e,
      attack_rate_unexposed: ar_u,
      attack_rate_overall: ar_tot,
      relative_risk: rr,
      risk_difference: rd,
      population_attributable_fraction: paf,
      ci_lower,
      ci_upper,
      priority_status: pStatus,
    },
  };
}

export interface AnalysisRequest {
  cutoff_timestamp?: string;
}

export interface AnalysisResponse {
  cutoff_timestamp: string;
  total_records_evaluated: number;
  total_cases: number;
  overall_attack_rate: number;
  sources: SourceAnalysisResult[];
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export class ApiClientError extends Error {
  public code: string;
  public details?: ApiErrorDetail[];
  public status: number;

  constructor(status: number, code: string, message: string, details?: ApiErrorDetail[]) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errBody: ApiErrorResponse | null = null;
    try {
      errBody = await res.json();
    } catch {
      // response was not JSON
    }
    const code = errBody?.error?.code || `HTTP_${res.status}`;
    const message = errBody?.error?.message || `Request failed with status ${res.status}`;
    const details = errBody?.error?.details;
    throw new ApiClientError(res.status, code, message, details);
  }
  return res.json() as Promise<T>;
}

export const api = {
  /**
   * Health status endpoint
   * GET /api/v1/health
   */
  async getHealth(): Promise<HealthResponse> {
    const res = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });
    return handleResponse<HealthResponse>(res);
  },

  /**
   * Dataset CSV Upload endpoint
   * POST /api/v1/datasets/import
   */
  async uploadDataset(
    surveyFile: File,
    sourcesFile?: File,
    invId: string = "current"
  ): Promise<DatasetUploadResponse> {
    const formData = new FormData();
    formData.append("file", surveyFile);
    formData.append("investigation_id", invId);
    if (sourcesFile) {
      formData.append("sources_file", sourcesFile);
    }

    const res = await fetch(`${API_BASE_URL}/datasets/import`, {
      method: "POST",
      body: formData,
    });
    return handleResponse<DatasetUploadResponse>(res);
  },

  /**
   * Clears the active dataset, resetting to empty state
   * POST /api/v1/datasets/clear
   */
  async clearDataset(): Promise<{ status: string; message: string; dataset_version: number }> {
    const res = await fetch(`${API_BASE_URL}/datasets/clear`, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    });
    return handleResponse(res);
  },

  /**
   * Explicitly loads benchmark sample dataset
   * POST /api/v1/datasets/seed-benchmark
   */
  async seedBenchmarkDataset(): Promise<{ status: string; message: string; record_count: number; dataset_id: string }> {
    const res = await fetch(`${API_BASE_URL}/datasets/seed-benchmark`, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    });
    return handleResponse(res);
  },

  /**
   * Current Dataset Metadata endpoint
   * GET /api/v1/datasets/current
   */
  async getCurrentDataset(): Promise<{
    investigation_id: string;
    title: string;
    geographic_area: string;
    status: string;
    latest_dataset_version: number;
    total_records: number;
    detected_sources: string[];
  }> {
    const res = await fetch(`${API_BASE_URL}/datasets/current`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });
    return handleResponse(res);
  },

  /**
   * Candidate Sources evaluation endpoint
   * GET /api/v1/datasets/sources
   */
  async getDatasetSources(params: Record<string, string> = {}): Promise<SourceAnalysisResult[]> {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_BASE_URL}/datasets/sources?${query}` : `${API_BASE_URL}/datasets/sources`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });
    const rawList = await handleResponse<Record<string, unknown>[]>(res);
    return (rawList || []).map(mapBackendSourceToFrontend);
  },

  /**
   * Dynamic Timeline Range and Epicurve Buckets endpoint
   * GET /api/v1/analysis/{invId}/timeline-range
   */
  async getTimelineRange(invId: string = "current", stepHours: number = 24): Promise<{
    investigation_id: string;
    dataset_version: number;
    earliest_timestamp: string | null;
    latest_timestamp: string | null;
    total_records: number;
    total_cases: number;
    buckets: Array<{
      timestamp: string;
      date_label: string;
      case_count: number;
      cumulative_cases: number;
      survey_count: number;
    }>;
  }> {
    const res = await fetch(`${API_BASE_URL}/analysis/${invId}/timeline-range?step_hours=${stepHours}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });
    return handleResponse(res);
  },

  /**
   * Authoritative Epidemiological Analysis Snapshot
   * GET /api/v1/analysis/{invId}
   */
  async getAnalysis(invId: string = "current", cutoff?: string | null): Promise<{
    investigation_id: string;
    dataset_version: number;
    calculated_at: string;
    timeline_cutoff: string | null;
    is_timeline_filtered: boolean;
    total_records: number;
    eligible_records: number;
    ill_count: number;
    not_ill_count: number;
    unknown_illness_count: number;
    sources: SourceAnalysisResult[];
  }> {
    const url = cutoff
      ? `${API_BASE_URL}/analysis/${invId}?timeline_cutoff=${encodeURIComponent(cutoff)}`
      : `${API_BASE_URL}/analysis/${invId}`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });
    const rawData = await handleResponse<Record<string, unknown>>(res);
    const rawSources = (rawData.sources as Record<string, unknown>[]) || [];
    return {
      investigation_id: String(rawData.investigation_id || invId),
      dataset_version: Number(rawData.dataset_version || 1),
      calculated_at: String(rawData.calculated_at || new Date().toISOString()),
      timeline_cutoff: rawData.timeline_cutoff ? String(rawData.timeline_cutoff) : null,
      is_timeline_filtered: Boolean(rawData.is_timeline_filtered),
      total_records: Number(rawData.total_records || 0),
      eligible_records: Number(rawData.eligible_records || 0),
      ill_count: Number(rawData.ill_count || 0),
      not_ill_count: Number(rawData.not_ill_count || 0),
      unknown_illness_count: Number(rawData.unknown_illness_count || 0),
      sources: rawSources.map(mapBackendSourceToFrontend),
    };
  },

  /**
   * Epidemiological calculation engine endpoint
   * POST /api/v1/analysis/calculate
   */
  async calculateAnalysis(
    payload: AnalysisRequest = {}
  ): Promise<AnalysisResponse> {
    const res = await fetch(`${API_BASE_URL}/analysis/calculate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
    return handleResponse<AnalysisResponse>(res);
  },

  /**
   * Field Investigation Brief PDF Download
   * GET /api/v1/reports/{invId}/pdf
   */
  async downloadPdfReport(invId: string = "current", cutoff?: string | null): Promise<Blob> {
    const url = cutoff
      ? `${API_BASE_URL}/reports/${invId}/pdf?timeline_cutoff=${encodeURIComponent(cutoff)}`
      : `${API_BASE_URL}/reports/${invId}/pdf`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/pdf",
      },
    });
    if (!res.ok) {
      throw new Error(`PDF export failed with status ${res.status}`);
    }
    return res.blob();
  },

  /**
   * Guardrailed AI Explanation using Groq (openai/gpt-oss-120b)
   * POST /api/v1/ai/explain/{invId}
   */
  async getAiExplanation(invId: string = "current", cutoff?: string | null): Promise<{
    status: string;
    message: string;
    draft_summary: string | null;
    key_observations: string[];
  }> {
    const url = cutoff
      ? `${API_BASE_URL}/ai/explain/${invId}?timeline_cutoff=${encodeURIComponent(cutoff)}`
      : `${API_BASE_URL}/ai/explain/${invId}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    });
    return handleResponse(res);
  },

  /**
   * Response Planner Tasks (TASK-05)
   * GET /api/v1/tasks/{invId}
   */
  async getTasks(invId: string = "current"): Promise<Array<{
    task_id: string;
    investigation_id: string;
    title: string;
    description?: string;
    assigned_role?: string;
    priority: string;
    status: string;
    due_date?: string;
    associated_source_id?: string;
  }>> {
    const res = await fetch(`${API_BASE_URL}/tasks/${invId}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    return handleResponse(res);
  },

  /**
   * Create Response Task (TASK-05)
   * POST /api/v1/tasks/{invId}
   */
  async createTask(
    payload: {
      title: string;
      description?: string;
      assigned_role?: string;
      priority?: string;
      due_date?: string;
      associated_source_id?: string;
    },
    invId: string = "current"
  ): Promise<Record<string, unknown>> {
    const res = await fetch(`${API_BASE_URL}/tasks/${invId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  /**
   * Update Task Status
   * PATCH /api/v1/tasks/{invId}/{taskId}
   */
  async updateTaskStatus(taskId: string, status: string, invId: string = "current"): Promise<Record<string, unknown>> {
    const res = await fetch(`${API_BASE_URL}/tasks/${invId}/${taskId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },
};
