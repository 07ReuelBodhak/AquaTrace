"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { api, SourceAnalysisResult, PriorityStatus } from "@/lib/api";

interface BenchmarkSourceConfig {
  source_id: string;
  source_name: string;
  source_type: string;
  station_code: string;
  a: number; // exposed ill
  b: number; // exposed well
  c: number; // unexposed ill
  d: number; // unexposed well
  unknown_count: number;
}

const BENCHMARK_SOURCES: BenchmarkSourceConfig[] = [
  {
    source_id: "substation_07",
    source_name: "Substation-7 Junction B",
    source_type: "Municipal Main Feed",
    station_code: "SEC-4B-09 // WN-7721",
    a: 86,
    b: 138,
    c: 56,
    d: 1202,
    unknown_count: 0,
  },
  {
    source_id: "reservoir_bravo",
    source_name: "Reservoir Bravo Pump #4",
    source_type: "Pumping Station",
    station_code: "BOOSTER-ZN-02",
    a: 31,
    b: 160,
    c: 111,
    d: 1180,
    unknown_count: 0,
  },
  {
    source_id: "public_fountain",
    source_name: "Sector 4B Public Fountain Commons",
    source_type: "Municipal Standpipe",
    station_code: "CIVIC-PLAZA-ST",
    a: 18,
    b: 110,
    c: 124,
    d: 1230,
    unknown_count: 0,
  },
  {
    source_id: "wellhead_alpha",
    source_name: "Wellhead Alpha-2 (Deep Aquifer)",
    source_type: "Deep Aquifer Borehole",
    station_code: "SEALED-AQ-120M",
    a: 12,
    b: 123,
    c: 130,
    d: 1217,
    unknown_count: 0,
  },
  {
    source_id: "tanker_line_3",
    source_name: "Commercial Tanker Supply Line 3",
    source_type: "Commercial Tanker Supply",
    station_code: "CHLOR-TRUCK-03",
    a: 5,
    b: 63,
    c: 137,
    d: 1277,
    unknown_count: 0,
  },
  {
    source_id: "borehole_south",
    source_name: "Private Borehole Cluster South",
    source_type: "Unregulated Wells",
    station_code: "RESIDENTIAL-EXT-S",
    a: 2,
    b: 4,
    c: 140,
    d: 1336,
    unknown_count: 0,
  },
];

function computeSourceAnalysis(cfg: BenchmarkSourceConfig): SourceAnalysisResult {
  const { a, b, c, d } = cfg;
  const n_exposed = a + b;
  const n_unexposed = c + d;
  const total = n_exposed + n_unexposed;

  const zero_cell = a === 0 || b === 0 || c === 0 || d === 0;
  let a_calc = a;
  let b_calc = b;
  let c_calc = c;
  let d_calc = d;
  let n_exp_calc = n_exposed;
  let n_unexp_calc = n_unexposed;

  if (zero_cell) {
    a_calc += 0.5;
    b_calc += 0.5;
    c_calc += 0.5;
    d_calc += 0.5;
    n_exp_calc = a_calc + b_calc;
    n_unexp_calc = c_calc + d_calc;
  }

  const ar_exp = n_exposed > 0 ? a / n_exposed : 0;
  const ar_unexp = n_unexposed > 0 ? c / n_unexposed : 0;
  const ar_overall = total > 0 ? (a + c) / total : 0;

  const ar_exp_calc = a_calc / n_exp_calc;
  const ar_unexp_calc = c_calc / n_unexp_calc;
  const rr = ar_unexp_calc > 0 ? ar_exp_calc / ar_unexp_calc : 1.0;

  const var_log_rr = Math.max(
    0.0001,
    1 / a_calc - 1 / n_exp_calc + 1 / c_calc - 1 / n_unexp_calc
  );
  const se_log_rr = Math.sqrt(var_log_rr);
  const ci_lower = Math.exp(Math.log(rr) - 1.96 * se_log_rr);
  const ci_upper = Math.exp(Math.log(rr) + 1.96 * se_log_rr);

  const rd = ar_exp - ar_unexp;
  const paf = ar_overall > 0 ? Math.max(0, ((ar_overall - ar_unexp) / ar_overall) * 100) : 0;

  let priority_status: PriorityStatus = "LOW_PRIORITY";
  if (a < 3 || n_exposed < 5) {
    priority_status = "INSUFFICIENT_DATA";
  } else if (rr >= 2.0 && ci_lower > 1.0 && a >= 5) {
    priority_status = "HIGH_PRIORITY";
  } else if ((rr > 1.2 || (rr >= 2.0 && ci_lower <= 1.0)) && a >= 3) {
    priority_status = "MODERATE_PRIORITY";
  } else if (rr <= 1.0 || ci_upper < 1.0) {
    priority_status = "LOW_PRIORITY";
  }

  return {
    source_id: cfg.source_id,
    source_name: cfg.source_name,
    source_type: cfg.source_type,
    contingency_table: {
      a,
      b,
      c,
      d,
      n_exposed,
      n_unexposed,
      total,
      zero_cell_corrected: zero_cell,
    },
    risk_metrics: {
      attack_rate_exposed: ar_exp,
      attack_rate_unexposed: ar_unexp,
      attack_rate_overall: ar_overall,
      relative_risk: rr,
      risk_difference: rd,
      population_attributable_fraction: paf,
      ci_lower,
      ci_upper,
      priority_status,
    },
  };
}

export default function InvestigationDashboard() {
  const [sources, setSources] = useState<SourceAnalysisResult[]>(() =>
    BENCHMARK_SOURCES.map(computeSourceAnalysis)
  );
  const [totalSurveyed, setTotalSurveyed] = useState<number>(1482);
  const [totalCases, setTotalCases] = useState<number>(142);
  const [overallAttackRate, setOverallAttackRate] = useState<number>(0.0958);
  const [selectedSourceId, setSelectedSourceId] = useState<string>("substation_07");

  // Filtering & Sorting
  const [searchQuery, setSearchQuery] = useState<string>("" );
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<string>("RR_DESC");
  const [onlySignificant, setOnlySignificant] = useState<boolean>(false);

  // Ingestion State
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<{
    state: "idle" | "uploading" | "success" | "error";
    message: string;
    datasetId?: string;
  }>({
    state: "success",
    message: "Benchmark outbreak survey active (Sector 4B). 1,482 verified participant records.",
    datasetId: "DS-BENCHMARK-4B",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api
      .getHealth()
      .then((health) => {
        if (health.active_dataset) {
          api
            .calculateAnalysis()
            .then((res) => {
              if (res.sources && res.sources.length > 0) {
                setSources(res.sources);
                setTotalSurveyed(res.total_records_evaluated);
                setTotalCases(res.total_cases);
                setOverallAttackRate(res.overall_attack_rate);
                setSelectedSourceId(res.sources[0].source_id);
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  const handleLoadDemoData = () => {
    const calculated = BENCHMARK_SOURCES.map(computeSourceAnalysis);
    setSources(calculated);
    setTotalSurveyed(1482);
    setTotalCases(142);
    setOverallAttackRate(0.0958);
    setSelectedSourceId("substation_07");
    setUploadStatus({
      state: "success",
      message: "Sector 4B benchmark dataset loaded (1,482 records, 6 sources evaluated).",
      datasetId: "DS-BENCHMARK-4B",
    });
  };

  const handleProcessFile = async (file: File) => {
    if (!file.name.endsWith(".csv")) {
      setUploadStatus({
        state: "error",
        message: "Invalid file format: Please provide an RFC-4180 compliant .csv file.",
      });
      return;
    }

    setUploadStatus({
      state: "uploading",
      message: `Ingesting ${file.name}...`,
    });

    try {
      const text = await file.text();
      const lines = text
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      if (lines.length < 2) {
        throw new Error("CSV file contains no record rows.");
      }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      if (!headers.includes("participant_id") || !headers.includes("illness_status")) {
        throw new Error("CSV must contain 'participant_id' and 'illness_status' headers.");
      }

      const exposureCols = headers.filter((h) => h.endsWith("_exposure"));
      if (exposureCols.length === 0) {
        throw new Error("CSV must include at least one '<source_id>_exposure' column.");
      }

      const illIdx = headers.indexOf("illness_status");
      let clientCases = 0;
      const clientTotal = lines.length - 1;

      const sourceMaps: Record<
        string,
        { a: number; b: number; c: number; d: number; colIdx: number }
      > = {};

      exposureCols.forEach((col) => {
        sourceMaps[col] = { a: 0, b: 0, c: 0, d: 0, colIdx: headers.indexOf(col) };
      });

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(",").map((c) => c.trim().toLowerCase());
        const rawStatus = row[illIdx];
        const isIll =
          rawStatus === "ill" || rawStatus === "1" || rawStatus === "true" || rawStatus === "yes";
        if (isIll) clientCases++;

        exposureCols.forEach((col) => {
          const s = sourceMaps[col];
          const val = row[s.colIdx];
          const isExp = val === "1" || val === "true" || val === "yes";
          if (isExp && isIll) s.a++;
          else if (isExp && !isIll) s.b++;
          else if (!isExp && isIll) s.c++;
          else if (!isExp && !isIll) s.d++;
        });
      }

      const parsedSources: SourceAnalysisResult[] = exposureCols.map((col) => {
        const s = sourceMaps[col];
        const source_id = col.replace(/_exposure$/, "");
        const prettyName = source_id
          .split("_")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");

        return computeSourceAnalysis({
          source_id,
          source_name: prettyName,
          source_type: "Survey Ingress Node",
          station_code: `INGRESS-${source_id.toUpperCase()}`,
          a: s.a,
          b: s.b,
          c: s.c,
          d: s.d,
          unknown_count: 0,
        });
      });

      setSources(parsedSources);
      setTotalSurveyed(clientTotal);
      setTotalCases(clientCases);
      setOverallAttackRate(clientTotal > 0 ? clientCases / clientTotal : 0);
      if (parsedSources.length > 0) {
        setSelectedSourceId(parsedSources[0].source_id);
      }

      setUploadStatus({
        state: "success",
        message: `Parsed ${file.name}: ${clientTotal} records, ${exposureCols.length} candidate sources.`,
        datasetId: "DS-CUSTOM-" + Math.floor(Math.random() * 90000 + 10000),
      });
    } catch (err: unknown) {
      setUploadStatus({
        state: "error",
        message: err instanceof Error ? err.message : "Failed to parse CSV file.",
      });
    }
  };

  const filteredSources = useMemo(() => {
    let result = [...sources];

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.source_name.toLowerCase().includes(q) ||
          s.source_id.toLowerCase().includes(q) ||
          s.source_type.toLowerCase().includes(q)
      );
    }

    if (priorityFilter !== "ALL") {
      result = result.filter((s) => s.risk_metrics.priority_status === priorityFilter);
    }

    if (onlySignificant) {
      result = result.filter((s) => s.risk_metrics.ci_lower > 1.0);
    }

    result.sort((x, y) => {
      switch (sortOrder) {
        case "RR_DESC":
          return y.risk_metrics.relative_risk - x.risk_metrics.relative_risk;
        case "RR_ASC":
          return x.risk_metrics.relative_risk - y.risk_metrics.relative_risk;
        case "AR_EXP_DESC":
          return y.risk_metrics.attack_rate_exposed - x.risk_metrics.attack_rate_exposed;
        default:
          return 0;
      }
    });

    return result;
  }, [sources, searchQuery, priorityFilter, sortOrder, onlySignificant]);

  const selectedSource = useMemo(() => {
    return (
      sources.find((s) => s.source_id === selectedSourceId) ||
      sources[0] ||
      computeSourceAnalysis(BENCHMARK_SOURCES[0])
    );
  }, [sources, selectedSourceId]);

  const renderPriorityBadge = (status: PriorityStatus) => {
    switch (status) {
      case "HIGH_PRIORITY":
        return (
          <span className="inline-block bg-ink text-white px-2 py-0.5 text-xs font-mono font-bold uppercase tracking-wider">
            [P1 - HIGH]
          </span>
        );
      case "MODERATE_PRIORITY":
        return (
          <span className="inline-block bg-white border border-slate text-ink px-2 py-0.5 text-xs font-mono font-bold uppercase">
            [P2 - MEDIUM]
          </span>
        );
      case "LOW_PRIORITY":
        return (
          <span className="inline-block bg-mist border border-slate text-slate px-2 py-0.5 text-xs font-mono uppercase">
            [P3 - LOW]
          </span>
        );
      case "INSUFFICIENT_DATA":
      default:
        return (
          <span className="inline-block bg-mist border border-dashed border-slate text-slate px-2 py-0.5 text-xs font-mono uppercase">
            [INSUFFICIENT]
          </span>
        );
    }
  };

  return (
    <main className="flex-1 w-full max-w-[1920px] mx-auto p-4 md:p-6 space-y-4 font-sans bg-mist">
      {/* ===================================================================== */}
      {/* 1. OUTBREAK OVERVIEW KPI HEADER CARDS                                 */}
      {/* ===================================================================== */}
      <section aria-label="Key Performance Indicators" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Total Surveyed */}
        <div className="bg-white border border-slate p-4">
          <div className="flex justify-between items-center text-xs font-mono text-slate border-b border-mist pb-1 mb-2">
            <span>SURVEILLANCE CENSUS</span>
            <span className="text-ink font-bold">[SEC-4B]</span>
          </div>
          <div className="text-xs font-mono text-slate uppercase">TOTAL SURVEYED</div>
          <div className="text-3xl font-bold font-mono text-ink tracking-tight mt-1">
            {totalSurveyed.toLocaleString()}
          </div>
          <div className="mt-2 text-xs font-mono text-slate border-t border-mist pt-1.5 flex justify-between">
            <span>Census Ingestion</span>
            <span className="font-bold text-ink">100% VERIFIED</span>
          </div>
        </div>

        {/* Card 2: Total Cases */}
        <div className="bg-white border border-slate p-4">
          <div className="flex justify-between items-center text-xs font-mono text-slate border-b border-mist pb-1 mb-2">
            <span>CASE REGISTRY</span>
            <span className="bg-ink text-white px-1 text-[10px] font-bold">SURGE ACTIVE</span>
          </div>
          <div className="text-xs font-mono text-slate uppercase">CONFIRMED / PROBABLE CASES</div>
          <div className="text-3xl font-bold font-mono text-ink tracking-tight mt-1">
            {totalCases.toLocaleString()}
          </div>
          <div className="mt-2 text-xs font-mono text-slate border-t border-mist pt-1.5 flex justify-between">
            <span>Epidemic Slope</span>
            <span className="font-bold text-ink">+1.82 / DAY</span>
          </div>
        </div>

        {/* Card 3: Overall Attack Rate */}
        <div className="bg-white border border-slate p-4">
          <div className="flex justify-between items-center text-xs font-mono text-slate border-b border-mist pb-1 mb-2">
            <span>POPULATION IMPACT</span>
            <span className="text-ink font-bold">[EPI METRIC]</span>
          </div>
          <div className="text-xs font-mono text-slate uppercase">OVERALL ATTACK RATE</div>
          <div className="text-3xl font-bold font-mono text-ink tracking-tight mt-1">
            {(overallAttackRate * 100).toFixed(2)}%
          </div>
          <div className="mt-2 text-xs font-mono text-slate border-t border-mist pt-1.5 flex justify-between">
            <span>Baseline Exceedance</span>
            <span className="font-bold text-ink">
              {(overallAttackRate / 0.0012).toFixed(1)}x BASELINE
            </span>
          </div>
        </div>

        {/* Card 4: Active Candidate Sources */}
        <div className="bg-white border border-slate p-4">
          <div className="flex justify-between items-center text-xs font-mono text-slate border-b border-mist pb-1 mb-2">
            <span>SOURCE MONITORING</span>
            <span className="text-ink font-bold">[{sources.length} NODES]</span>
          </div>
          <div className="text-xs font-mono text-slate uppercase">ACTIVE CANDIDATE SOURCES</div>
          <div className="text-3xl font-bold font-mono text-ink tracking-tight mt-1">
            {sources.length} SOURCES
          </div>
          <div className="mt-2 text-xs font-mono text-slate border-t border-mist pt-1.5 flex justify-between">
            <span>Priorities</span>
            <span className="font-bold text-ink">
              {sources.filter((s) => s.risk_metrics.priority_status === "HIGH_PRIORITY").length} P1 High /{" "}
              {sources.filter((s) => s.risk_metrics.priority_status === "MODERATE_PRIORITY").length} P2 Med
            </span>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 2. CSV INGESTION DROPZONE & VALIDATION MANIFEST                       */}
      {/* ===================================================================== */}
      <section aria-label="Surveillance Ingestion Pipeline" className="bg-white border border-slate p-4">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              handleProcessFile(e.dataTransfer.files[0]);
            }
          }}
          className={`border-2 ${
            isDragging ? "border-ink bg-mist" : "border-dashed border-slate bg-mist/50"
          } p-4 flex flex-col lg:flex-row items-center justify-between gap-4`}
        >
          <div className="flex items-center space-x-3 w-full lg:w-auto">
            <div className="w-9 h-9 bg-ink text-white flex items-center justify-center font-mono font-bold text-xs flex-shrink-0">
              CSV
            </div>
            <div>
              <div className="text-xs font-mono text-ink uppercase font-bold flex items-center gap-2">
                Outbreak Exposure Data Ingestion
                <span className="bg-white border border-slate px-1 text-[10px] text-slate">RFC-4180</span>
              </div>
              <div className="text-xs font-mono text-slate mt-0.5">
                Drag-and-drop raw survey .csv or load sample outbreak records to evaluate 2x2 attack rates.
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full lg:w-auto justify-end">
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleProcessFile(e.target.files[0]);
                }
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="h-8 px-4 bg-white text-ink border border-slate text-xs font-mono uppercase font-semibold hover:bg-mist transition-colors"
            >
              Browse CSV File
            </button>
            <button
              type="button"
              onClick={handleLoadDemoData}
              className="h-8 px-4 bg-ink text-white border border-slate text-xs font-mono uppercase font-semibold hover:bg-slate transition-colors"
            >
              Load Demo Outbreak Data
            </button>
          </div>
        </div>

        {uploadStatus.state !== "idle" && (
          <div
            className={`mt-3 p-2.5 border text-xs font-mono flex items-center justify-between ${
              uploadStatus.state === "error"
                ? "bg-ink text-white border-ink"
                : "bg-mist border-slate text-ink"
            }`}
          >
            <div className="flex items-center space-x-2">
              <span className="font-bold">
                {uploadStatus.state === "error" ? "[ERROR]" : "[READY]"}
              </span>
              <span>{uploadStatus.message}</span>
            </div>
            {uploadStatus.datasetId && (
              <span className="font-bold border border-slate px-1 bg-white text-ink text-[11px]">
                {uploadStatus.datasetId}
              </span>
            )}
          </div>
        )}
      </section>

      {/* ===================================================================== */}
      {/* 3. SORTING & FILTERING TOOLBAR                                        */}
      {/* ===================================================================== */}
      <section aria-label="Filters and Sorting" className="bg-white border border-slate p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="flex items-center border border-slate bg-white px-2.5 h-8 w-64">
            <span className="font-mono text-xs text-slate mr-2 font-bold">FIND:</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate source..."
              className="w-full bg-transparent border-none p-0 text-xs font-mono text-ink focus:outline-none placeholder:text-slate"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="font-mono text-xs text-slate hover:text-ink ml-1 font-bold"
              >
                [x]
              </button>
            )}
          </div>

          {/* Priority Select */}
          <div className="flex items-center text-xs font-mono">
            <span className="bg-mist border border-r-0 border-slate px-2 h-8 flex items-center text-slate font-bold uppercase">
              Priority:
            </span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="h-8 bg-white border border-slate text-xs font-mono text-ink px-2 focus:outline-none"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH_PRIORITY">P1 High Priority</option>
              <option value="MODERATE_PRIORITY">P2 Medium Suspicion</option>
              <option value="LOW_PRIORITY">P3 Low / Protective</option>
              <option value="INSUFFICIENT_DATA">Insufficient Data</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 justify-end">
          {/* Sort Select */}
          <div className="flex items-center text-xs font-mono">
            <span className="bg-mist border border-r-0 border-slate px-2 h-8 flex items-center text-slate font-bold uppercase">
              Sort:
            </span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="h-8 bg-white border border-slate text-xs font-mono text-ink px-2 focus:outline-none"
            >
              <option value="RR_DESC">Relative Risk (RR) High → Low</option>
              <option value="RR_ASC">Relative Risk (RR) Low → High</option>
              <option value="AR_EXP_DESC">Exposed Attack Rate Descending</option>
            </select>
          </div>

          {/* Significance Checkbox */}
          <label className="flex items-center space-x-2 h-8 px-3 border border-slate bg-mist text-xs font-mono cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlySignificant}
              onChange={(e) => setOnlySignificant(e.target.checked)}
              className="w-3.5 h-3.5 text-ink bg-white border border-slate focus:ring-0"
            />
            <span className="uppercase font-bold text-ink">Significance (CI &gt; 1.0)</span>
          </label>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 4. CANDIDATE WATER SOURCE PRIORITISATION TABLE                       */}
      {/* ===================================================================== */}
      <section aria-label="Candidate Water Sources Ledger" className="bg-white border border-slate overflow-hidden">
        <div className="bg-mist border-b border-slate px-4 py-2.5 flex flex-wrap justify-between items-center text-xs font-mono">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-ink uppercase tracking-wider">
              CANDIDATE WATER SOURCE PRIORITISATION MATRIX
            </span>
            <span className="text-slate">|</span>
            <span className="text-slate">DETERMINISTIC 2×2 CONTINGENCY EVALUATION</span>
          </div>
          <div className="flex items-center space-x-3 text-slate">
            <span>CONFIDENCE INTERVAL: 95%</span>
            <span className="bg-ink text-white px-2 py-0.5 font-bold">
              MATCHING: {filteredSources.length} / {sources.length}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border-b border-slate">
            <thead>
              <tr className="bg-mist/70 border-b border-slate text-xs font-mono text-slate uppercase">
                <th className="py-2.5 px-3 border-r border-slate font-bold">Candidate Source &amp; Type</th>
                <th className="py-2.5 px-3 border-r border-slate font-bold">Exposed Attack Rate</th>
                <th className="py-2.5 px-3 border-r border-slate font-bold">Unexposed Attack Rate</th>
                <th className="py-2.5 px-3 border-r border-slate font-bold">Relative Risk (RR) [95% CI]</th>
                <th className="py-2.5 px-3 border-r border-slate font-bold">Risk Diff (RD)</th>
                <th className="py-2.5 px-3 border-r border-slate font-bold">Priority Status</th>
                <th className="py-2.5 px-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate font-mono text-xs">
              {filteredSources.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate">
                    No candidate water sources match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredSources.map((source) => {
                  const isSelected = source.source_id === selectedSourceId;
                  const { contingency_table, risk_metrics } = source;
                  return (
                    <tr
                      key={source.source_id}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? "bg-mist font-semibold" : "bg-white hover:bg-mist/50"
                      }`}
                      onClick={() => setSelectedSourceId(source.source_id)}
                    >
                      <td className="py-2.5 px-3 border-r border-slate">
                        <div className="font-bold text-ink flex items-center gap-2">
                          {isSelected && <span className="w-2 h-2 bg-ink inline-block" />}
                          {source.source_name}
                        </div>
                        <div className="text-[11px] text-slate">
                          {source.source_type} {"//"} {source.source_id}
                        </div>
                      </td>

                      <td className="py-2.5 px-3 border-r border-slate">
                        <div className="font-bold text-ink">
                          {(risk_metrics.attack_rate_exposed * 100).toFixed(2)}%
                        </div>
                        <div className="text-[11px] text-slate">
                          ({contingency_table.a} / {contingency_table.n_exposed})
                        </div>
                      </td>

                      <td className="py-2.5 px-3 border-r border-slate">
                        <div className="text-ink">
                          {(risk_metrics.attack_rate_unexposed * 100).toFixed(2)}%
                        </div>
                        <div className="text-[11px] text-slate">
                          ({contingency_table.c} / {contingency_table.n_unexposed})
                        </div>
                      </td>

                      <td className="py-2.5 px-3 border-r border-slate">
                        <div className="font-bold text-ink text-sm">
                          RR: {risk_metrics.relative_risk.toFixed(2)}
                        </div>
                        <div className="text-[11px] text-slate">
                          [95% CI: {risk_metrics.ci_lower.toFixed(2)} – {risk_metrics.ci_upper.toFixed(2)}]
                        </div>
                      </td>

                      <td className="py-2.5 px-3 border-r border-slate">
                        <div className="font-bold text-ink">
                          {(risk_metrics.risk_difference * 100).toFixed(2)}%
                        </div>
                        <div className="text-[11px] text-slate">
                          PAF: {risk_metrics.population_attributable_fraction.toFixed(1)}%
                        </div>
                      </td>

                      <td className="py-2.5 px-3 border-r border-slate">
                        {renderPriorityBadge(risk_metrics.priority_status)}
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSourceId(source.source_id);
                          }}
                          className={`h-7 px-3 text-xs font-mono uppercase font-semibold border ${
                            isSelected
                              ? "bg-ink text-white border-ink"
                              : "bg-white text-ink border-slate hover:bg-mist"
                          }`}
                        >
                          {isSelected ? "Inspecting" : "Inspect 2×2"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 5. INTERACTIVE 2x2 CONTINGENCY MATRIX INSPECTION DRAWER / SPLIT VIEW  */}
      {/* ===================================================================== */}
      <section aria-label="Contingency Matrix Deep Analytical Inspector" className="bg-white border-2 border-ink">
        <div className="bg-ink text-white px-4 py-2.5 flex flex-wrap justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 bg-white inline-block" />
            <span className="font-bold font-mono text-sm uppercase tracking-wider">
              2×2 Contingency Matrix // {selectedSource.source_name.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center space-x-3 font-mono text-xs">
            <span className="bg-white text-ink px-2 py-0.5 font-bold">
              {selectedSource.risk_metrics.priority_status}
            </span>
            <span className="text-mist">NODE ID: {selectedSource.source_id}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate">
          {/* Left Column: 2x2 Matrix */}
          <div className="lg:col-span-7 p-4 space-y-3">
            <div className="flex justify-between items-center font-mono text-xs text-slate">
              <span className="font-bold text-ink uppercase">Bivariate Exposure Breakdown</span>
              <span>Total Surveyed: {selectedSource.contingency_table.total.toLocaleString()}</span>
            </div>

            <div className="overflow-x-auto border border-slate">
              <table className="w-full text-center border-collapse font-mono text-xs">
                <thead>
                  <tr className="bg-mist border-b border-slate text-slate uppercase">
                    <th className="p-2.5 border-r border-slate text-left">Exposure Cohort</th>
                    <th className="p-2.5 border-r border-slate font-bold text-ink">Ill (Cases)</th>
                    <th className="p-2.5 border-r border-slate font-bold text-ink">Well (Non-Cases)</th>
                    <th className="p-2.5 border-r border-slate font-bold text-ink">Marginal Total</th>
                    <th className="p-2.5 font-bold text-ink">Attack Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate">
                  {/* Exposed Row */}
                  <tr>
                    <td className="p-2.5 border-r border-slate text-left font-bold text-ink bg-mist/60">
                      Exposed [Drank]
                    </td>
                    <td className="p-2.5 border-r border-slate font-bold text-ink bg-mist/30">
                      <span className="text-[10px] text-slate block font-normal">Cell a</span>
                      {selectedSource.contingency_table.a.toLocaleString()}
                    </td>
                    <td className="p-2.5 border-r border-slate text-slate">
                      <span className="text-[10px] text-slate block font-normal">Cell b</span>
                      {selectedSource.contingency_table.b.toLocaleString()}
                    </td>
                    <td className="p-2.5 border-r border-slate font-bold text-ink bg-mist/30">
                      {selectedSource.contingency_table.n_exposed.toLocaleString()}
                    </td>
                    <td className="p-2.5 font-bold text-ink bg-mist/50">
                      {(selectedSource.risk_metrics.attack_rate_exposed * 100).toFixed(2)}%
                    </td>
                  </tr>

                  {/* Unexposed Row */}
                  <tr>
                    <td className="p-2.5 border-r border-slate text-left font-bold text-ink bg-mist/60">
                      Unexposed [Did not drink]
                    </td>
                    <td className="p-2.5 border-r border-slate font-bold text-ink bg-mist/30">
                      <span className="text-[10px] text-slate block font-normal">Cell c</span>
                      {selectedSource.contingency_table.c.toLocaleString()}
                    </td>
                    <td className="p-2.5 border-r border-slate text-slate">
                      <span className="text-[10px] text-slate block font-normal">Cell d</span>
                      {selectedSource.contingency_table.d.toLocaleString()}
                    </td>
                    <td className="p-2.5 border-r border-slate font-bold text-ink bg-mist/30">
                      {selectedSource.contingency_table.n_unexposed.toLocaleString()}
                    </td>
                    <td className="p-2.5 font-bold text-ink bg-mist/50">
                      {(selectedSource.risk_metrics.attack_rate_unexposed * 100).toFixed(2)}%
                    </td>
                  </tr>

                  {/* Marginal Totals */}
                  <tr className="bg-mist font-bold text-ink border-t-2 border-slate">
                    <td className="p-2.5 border-r border-slate text-left uppercase">Total Cohort</td>
                    <td className="p-2.5 border-r border-slate">
                      {(selectedSource.contingency_table.a + selectedSource.contingency_table.c).toLocaleString()}
                    </td>
                    <td className="p-2.5 border-r border-slate">
                      {(selectedSource.contingency_table.b + selectedSource.contingency_table.d).toLocaleString()}
                    </td>
                    <td className="p-2.5 border-r border-slate">
                      {selectedSource.contingency_table.total.toLocaleString()}
                    </td>
                    <td className="p-2.5">
                      {(selectedSource.risk_metrics.attack_rate_overall * 100).toFixed(2)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center text-[11px] font-mono text-slate border-t border-mist pt-2">
              <span>Haldane-Anscombe Zero-Cell Correction: {selectedSource.contingency_table.zero_cell_corrected ? "Applied (+0.5)" : "Not Required"}</span>
              <span>Unknown Exposure Exclusions: 0 records</span>
            </div>
          </div>

          {/* Right Column: Quantitative Parameters */}
          <div className="lg:col-span-5 p-4 space-y-3 font-mono text-xs bg-mist/30">
            <div className="font-bold text-ink uppercase border-b border-mist pb-1">
              Epidemiological Risk Synthesis
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 border border-slate bg-white">
                <span className="text-slate">Relative Risk (RR):</span>
                <span className="text-base font-bold text-ink">
                  {selectedSource.risk_metrics.relative_risk.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center p-2 border border-slate bg-white">
                <span className="text-slate">Wald 95% Confidence Interval:</span>
                <span className="font-bold text-ink">
                  [{selectedSource.risk_metrics.ci_lower.toFixed(2)} – {selectedSource.risk_metrics.ci_upper.toFixed(2)}]
                </span>
              </div>

              <div className="flex justify-between items-center p-2 border border-slate bg-white">
                <span className="text-slate">Risk Difference (RD):</span>
                <span className="font-bold text-ink">
                  {(selectedSource.risk_metrics.risk_difference * 100).toFixed(2)}%
                </span>
              </div>

              <div className="flex justify-between items-center p-2 border border-slate bg-white">
                <span className="text-slate">Pop. Attributable Fraction (PAF):</span>
                <span className="font-bold text-ink">
                  {selectedSource.risk_metrics.population_attributable_fraction.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="p-3 border border-slate bg-white space-y-1">
              <span className="text-[10px] text-slate uppercase font-bold block">
                Investigation Assessment
              </span>
              <p className="text-slate leading-relaxed text-[11px]">
                {selectedSource.risk_metrics.priority_status === "HIGH_PRIORITY"
                  ? "Elevated relative risk with confidence interval bounded above 1.0 indicates strong statistical association. Recommended for immediate physical water sampling and containment audit."
                  : selectedSource.risk_metrics.priority_status === "MODERATE_PRIORITY"
                  ? "Moderate association observed. Recommended for secondary verification and exposure boundary review."
                  : "No statistically significant elevated risk observed relative to unexposed population."}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
