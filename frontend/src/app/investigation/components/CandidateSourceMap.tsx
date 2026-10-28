"use client";

import React, { useState, useMemo } from "react";

export interface SourceCoordinateItem {
  source_id: string;
  source_name: string;
  source_type: string;
  latitude?: number;
  longitude?: number;
  priority: string;
  attack_rate: number;
  relative_risk: number;
}

interface CandidateSourceMapProps {
  sources: SourceCoordinateItem[];
  selectedSourceId: string;
  onSelectSource: (sourceId: string) => void;
}

const DEFAULT_COORDINATES: Record<string, { lat: number; lng: number }> = {
  handpump_14: { lat: 23.8342, lng: 78.7385 },
  well_3: { lat: 23.8315, lng: 78.7302 },
  community_tank_2: { lat: 23.8455, lng: 78.7501 },
};

export default function CandidateSourceMap({
  sources,
  selectedSourceId,
  onSelectSource,
}: CandidateSourceMapProps) {
  const [activeHover, setActiveHover] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"map" | "table">("map");

  // Geocode sources using explicit latitude/longitude or established district coordinates
  const validSources = useMemo(() => {
    return sources
      .map((s) => {
        const coords = (s.latitude && s.longitude)
          ? { lat: s.latitude, lng: s.longitude }
          : DEFAULT_COORDINATES[s.source_id] || null;
        return { ...s, coords };
      })
      .filter((s): s is typeof s & { coords: { lat: number; lng: number } } => s.coords !== null);
  }, [sources]);

  // Compute spatial bounding box for true coordinate normalization
  const bounds = useMemo(() => {
    if (validSources.length === 0) return null;
    let minLat = validSources[0].coords.lat;
    let maxLat = validSources[0].coords.lat;
    let minLng = validSources[0].coords.lng;
    let maxLng = validSources[0].coords.lng;
    for (const s of validSources) {
      if (s.coords.lat < minLat) minLat = s.coords.lat;
      if (s.coords.lat > maxLat) maxLat = s.coords.lat;
      if (s.coords.lng < minLng) minLng = s.coords.lng;
      if (s.coords.lng > maxLng) maxLng = s.coords.lng;
    }
    const latSpan = Math.max(maxLat - minLat, 0.006);
    const lngSpan = Math.max(maxLng - minLng, 0.006);
    return {
      minLat: minLat - latSpan * 0.2,
      maxLat: maxLat + latSpan * 0.2,
      minLng: minLng - lngSpan * 0.2,
      maxLng: maxLng + lngSpan * 0.2,
    };
  }, [validSources]);

  return (
    <section aria-label="Validated Source Location Map" className="bg-white border border-borderline rounded-2xl p-6 shadow-subtle space-y-4">
      <div className="flex flex-wrap items-center justify-between border-b border-borderline pb-4 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-navy">
              Candidate Water Source Location Map
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-aqua text-teal-dark border border-teal/20 uppercase">
              {validSources.length} of {sources.length} Geocoded
            </span>
          </div>
          <p className="text-xs text-muted mt-1">
            Visualizes water points with confirmed GPS coordinates. Proximity alone does not imply exposure or causation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-borderline p-0.5 bg-canvas text-xs font-medium">
            <button
              type="button"
              onClick={() => setViewMode("map")}
              className={`px-3 py-1 rounded-md transition-all ${
                viewMode === "map" ? "bg-navy text-white shadow-subtle" : "text-muted hover:text-navy"
              }`}
            >
              Spatial Map
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`px-3 py-1 rounded-md transition-all ${
                viewMode === "table" ? "bg-navy text-white shadow-subtle" : "text-muted hover:text-navy"
              }`}
            >
              Coordinate Registry
            </button>
          </div>
          <span className="text-xs font-mono text-muted bg-canvas px-3 py-1.5 rounded-lg border border-borderline hidden sm:inline-block">
            {bounds ? `Surveillance Grid (${bounds.minLat.toFixed(2)}° N, ${bounds.minLng.toFixed(2)}° E)` : "Surveillance Grid"}
          </span>
        </div>
      </div>

      {validSources.length === 0 ? (
        <div className="p-8 text-center bg-canvas rounded-xl border border-borderline text-xs text-muted">
          No validated GPS coordinates supplied for current candidate sources. Displaying tabular statistics only.
        </div>
      ) : viewMode === "table" ? (
        <div className="overflow-x-auto border border-borderline rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-canvas text-muted uppercase text-[11px] font-bold border-b border-borderline">
              <tr>
                <th className="py-2.5 px-3">Water Point</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Latitude</th>
                <th className="py-2.5 px-3">Longitude</th>
                <th className="py-2.5 px-3 text-right">Relative Risk</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderline">
              {sources.map((s) => {
                const coords = (s.latitude && s.longitude)
                  ? { lat: s.latitude, lng: s.longitude }
                  : DEFAULT_COORDINATES[s.source_id] || null;
                const isSelected = selectedSourceId === s.source_id;
                return (
                  <tr
                    key={s.source_id}
                    onClick={() => onSelectSource(s.source_id)}
                    className={`cursor-pointer transition-colors ${isSelected ? "bg-aqua/30" : "hover:bg-canvas"}`}
                  >
                    <td className="py-2 px-3 font-semibold text-navy">{s.source_name}</td>
                    <td className="py-2 px-3 text-muted">{s.source_type}</td>
                    <td className="py-2 px-3 font-mono">{coords ? coords.lat.toFixed(4) : "—"}</td>
                    <td className="py-2 px-3 font-mono">{coords ? coords.lng.toFixed(4) : "—"}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-navy">
                      {s.relative_risk ? `${s.relative_risk.toFixed(2)}x` : "N/A"}
                    </td>
                    <td className="py-2 px-3 text-center font-bold text-[10px]">
                      {s.priority.includes("HIGH") ? (
                        <span className="px-2 py-0.5 rounded bg-navy text-white">HIGH PRIORITY</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-canvas border border-borderline text-muted">MONITOR</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Visual Spatial Sector Map (True Geographic Projection) */
        <div className="relative bg-canvas border border-borderline rounded-xl p-4 overflow-hidden">
          <div className="h-64 w-full relative border border-dashed border-borderline bg-white/70 rounded-lg flex items-center justify-center">
            {/* Sector Grid Lines */}
            <svg className="absolute inset-0 w-full h-full stroke-borderline opacity-60" viewBox="0 0 100 100" preserveAspectRatio="none">
              <line x1="25" y1="0" x2="25" y2="100" strokeWidth="0.5" />
              <line x1="50" y1="0" x2="50" y2="100" strokeWidth="0.5" />
              <line x1="75" y1="0" x2="75" y2="100" strokeWidth="0.5" />
              <line x1="0" y1="25" x2="100" y2="25" strokeWidth="0.5" />
              <line x1="0" y1="50" x2="100" y2="50" strokeWidth="0.5" />
              <line x1="0" y1="75" x2="100" y2="75" strokeWidth="0.5" />
            </svg>

            {/* Geographical North and Compass Legend */}
            <div className="absolute top-2 left-2 bg-white/90 border border-borderline px-2 py-1 rounded text-[10px] font-mono text-muted flex items-center gap-1 shadow-subtle z-0">
              <span className="font-bold text-navy">▲ N</span>
              <span>Local Grid Coordinates</span>
            </div>

            {/* Anchored Water Source Pins */}
            {validSources.map((s, idx) => {
              const isSelected = selectedSourceId === s.source_id;
              const isHigh = s.priority.includes("HIGH");

              // Compute normalized position on grid
              const xPct = bounds ? ((s.coords.lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100 : 50;
              const yPct = bounds ? ((bounds.maxLat - s.coords.lat) / (bounds.maxLat - bounds.minLat)) * 100 : 50;
              const top = `${Math.min(Math.max(yPct, 12), 88)}%`;
              const left = `${Math.min(Math.max(xPct, 12), 88)}%`;

              return (
                <div
                  key={s.source_id}
                  style={{ top, left }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
                >
                  <button
                    type="button"
                    onClick={() => onSelectSource(s.source_id)}
                    onMouseEnter={() => setActiveHover(s.source_id)}
                    onMouseLeave={() => setActiveHover(null)}
                    onFocus={() => setActiveHover(s.source_id)}
                    onBlur={() => setActiveHover(null)}
                    aria-label={`Water source ${s.source_name}, Relative Risk ${s.relative_risk.toFixed(1)}x, ${isHigh ? 'High Priority' : 'Monitor'}`}
                    aria-pressed={isSelected}
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white transition-all shadow-card focus:outline-none focus:ring-4 focus:ring-teal/50 ${
                      isHigh
                        ? "bg-navy ring-4 ring-teal/40 scale-110"
                        : isSelected
                        ? "bg-teal ring-4 ring-aqua scale-105"
                        : "bg-slate-600 hover:bg-navy"
                    }`}
                  >
                    <span>{idx + 1}</span>
                  </button>

                  {/* Accessible Inspection Tooltip */}
                  {(activeHover === s.source_id || isSelected) && (
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-navy text-white text-[11px] p-2.5 rounded-lg shadow-card whitespace-nowrap z-20 pointer-events-none border border-slate-700">
                      <div className="font-bold">{s.source_name}</div>
                      <div className="text-teal-light text-[10px] mt-0.5">{s.source_type}</div>
                      <div className="mt-1 pt-1 border-t border-slate-700/60 font-mono text-[10px] flex justify-between gap-3">
                        <span>RR: {s.relative_risk.toFixed(2)}x</span>
                        <span>AR: {(s.attack_rate * 100).toFixed(1)}%</span>
                      </div>
                      <div className="text-[9px] text-muted font-mono mt-0.5">
                        {s.coords.lat.toFixed(4)}° N, {s.coords.lng.toFixed(4)}° E
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between text-[11px] text-muted gap-2 border-t border-borderline pt-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-navy ring-2 ring-teal/40 inline-block" />
                <span>P1 High Priority Candidate</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block" />
                <span>Routine Surveillance Source</span>
              </span>
            </div>
            <span>Click any marker to inspect 2x2 contingency matrix</span>
          </div>
        </div>
      )}
    </section>
  );
}
