"use client";

import React, { useState } from "react";

export interface EpicurveBucketItem {
  timestamp: string;
  date_label: string;
  case_count: number;
  cumulative_cases: number;
  survey_count: number;
}

interface EpicurveChartProps {
  buckets: EpicurveBucketItem[];
  activeCutoffTimestamp: string | null;
  onSelectCutoff: (timestamp: string) => void;
}

export default function EpicurveChart({
  buckets,
  activeCutoffTimestamp,
  onSelectCutoff,
}: EpicurveChartProps) {
  const [showTableAlt, setShowTableAlt] = useState(false);

  if (!buckets || buckets.length === 0) {
    return (
      <div className="border border-borderline bg-canvas p-6 rounded-xl text-center text-xs text-muted">
        No temporal data available for epicurve plotting. Ingest dataset with valid ISO-8601 recorded_at timestamps.
      </div>
    );
  }

  const maxCaseCount = Math.max(...buckets.map((b) => b.case_count), 1);
  const totalCases = buckets.reduce((acc, b) => acc + b.case_count, 0);

  return (
    <div className="border border-borderline bg-white p-5 rounded-xl shadow-subtle">
      {/* Chart Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-borderline pb-3 mb-4 gap-2 text-xs">
        <div>
          <span className="font-bold text-navy uppercase tracking-wider block text-sm">
            Epidemic Curve (Cases by Recorded Observation Date)
          </span>
          <span className="text-muted text-xs">
            Visualizes new illness counts emerging over time &bull; Total Cases in Cohort: <strong className="text-navy">{totalCases}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowTableAlt(!showTableAlt)}
            className="border border-borderline px-3 py-1.5 text-xs font-semibold text-navy hover:bg-canvas transition-colors rounded-lg"
          >
            {showTableAlt ? "Show Visual Chart" : "Show Accessible Table (WCAG)"}
          </button>
        </div>
      </div>

      {showTableAlt ? (
        /* Accessible Table Alternative */
        <div className="overflow-x-auto max-h-60 border border-borderline rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-canvas text-muted border-b border-borderline uppercase text-[10px] font-semibold">
              <tr>
                <th className="py-2 px-3 border-r border-borderline">Date Interval</th>
                <th className="py-2 px-3 border-r border-borderline text-right">Daily Cases</th>
                <th className="py-2 px-3 border-r border-borderline text-right">Cumulative Cases</th>
                <th className="py-2 px-3 border-r border-borderline text-right">Surveys Logged</th>
                <th className="py-2 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderline">
              {buckets.map((b) => {
                const isSelected = activeCutoffTimestamp === b.timestamp;
                return (
                  <tr
                    key={b.timestamp}
                    className={`hover:bg-aqua/20 transition-colors ${isSelected ? "bg-aqua/30 font-bold" : ""}`}
                  >
                    <td className="py-2 px-3 border-r border-borderline text-navy font-medium">
                      {b.date_label} ({b.timestamp.slice(0, 10)})
                    </td>
                    <td className="py-2 px-3 border-r border-borderline text-right font-mono text-navy font-bold">
                      {b.case_count}
                    </td>
                    <td className="py-2 px-3 border-r border-borderline text-right font-mono text-muted">
                      {b.cumulative_cases}
                    </td>
                    <td className="py-2 px-3 border-r border-borderline text-right font-mono text-muted">
                      {b.survey_count}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => onSelectCutoff(b.timestamp)}
                        className="text-teal font-bold hover:underline text-xs"
                      >
                        Set Cutoff
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Visual High-Contrast Bar Chart */
        <div>
          <div className="h-44 w-full flex items-end gap-2 pt-6 pb-2 px-3 border border-borderline bg-canvas rounded-xl relative">
            {buckets.map((b) => {
              const heightPercent = Math.max((b.case_count / maxCaseCount) * 100, 5);
              const isActive = activeCutoffTimestamp === b.timestamp;
              const isPastCutoff =
                activeCutoffTimestamp && new Date(b.timestamp) > new Date(activeCutoffTimestamp);

              return (
                <div
                  key={b.timestamp}
                  onClick={() => onSelectCutoff(b.timestamp)}
                  className="flex-1 flex flex-col items-center justify-end h-full cursor-pointer group relative"
                  title={`${b.date_label}: ${b.case_count} cases (${b.survey_count} surveys)`}
                >
                  {/* Tooltip on hover */}
                  <div className="absolute -top-8 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                    <span className="bg-navy text-white text-[11px] px-2 py-0.5 rounded shadow-card whitespace-nowrap">
                      {b.date_label}: {b.case_count} cases
                    </span>
                  </div>

                  {/* Case Count Label */}
                  {b.case_count > 0 && (
                    <span className="text-[10px] font-mono font-bold text-navy mb-1">
                      {b.case_count}
                    </span>
                  )}

                  {/* Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-md transition-all ${
                      isActive
                        ? "bg-teal ring-2 ring-teal-light shadow-card"
                        : isPastCutoff
                        ? "bg-slate/30 border border-dashed border-borderline opacity-40"
                        : "bg-navy hover:bg-teal transition-colors"
                    }`}
                  />

                  {/* Bottom Label */}
                  <span className="text-[10px] font-medium text-muted mt-1.5 truncate max-w-[48px]">
                    {b.date_label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-muted mt-3">
            <span>Click any day bar to set the timeline replay cutoff instant</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-navy inline-block" /> Included in Replay
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-slate/30 border border-dashed border-borderline inline-block opacity-50" /> Excluded (Future Data)
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
