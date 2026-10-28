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
};
