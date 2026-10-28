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
  contingency_table: ContingencyMatrix;
  risk_metrics: RiskMetrics;
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
   * POST /api/v1/datasets/upload
   * Accepts multipart/form-data containing survey_file (required) and optional sources_file
   */
  async uploadDataset(
    surveyFile: File,
    sourcesFile?: File
  ): Promise<DatasetUploadResponse> {
    const formData = new FormData();
    formData.append("survey_file", surveyFile);
    if (sourcesFile) {
      formData.append("sources_file", sourcesFile);
    }

    const res = await fetch(`${API_BASE_URL}/datasets/upload`, {
      method: "POST",
      body: formData,
    });
    return handleResponse<DatasetUploadResponse>(res);
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
    return handleResponse<SourceAnalysisResult[]>(res);
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
