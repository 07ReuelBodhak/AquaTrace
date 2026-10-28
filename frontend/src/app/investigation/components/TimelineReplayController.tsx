"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { EpicurveBucketItem } from "./EpicurveChart";

// Lazy load Epicurve Chart with accessible loading fallback
const EpicurveChart = dynamic(() => import("./EpicurveChart"), {
  ssr: false,
  loading: () => (
    <div className="border border-borderline bg-canvas p-6 rounded-xl text-center text-xs text-muted">
      Loading epidemic curve visualization module...
    </div>
  ),
});

interface TimelineReplayControllerProps {
  earliestTimestamp: string | null;
  latestTimestamp: string | null;
  activeCutoff: string | null;
  eligibleRecordsCount: number;
  totalRecordsCount: number;
  buckets: EpicurveBucketItem[];
  onCutoffChange: (cutoff: string | null) => void;
  onResetToFull: () => void;
}

export default function TimelineReplayController({
  activeCutoff,
  eligibleRecordsCount,
  totalRecordsCount,
  buckets,
  onCutoffChange,
  onResetToFull,
}: TimelineReplayControllerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  const availableCutoffs = buckets.map((b) => b.timestamp);

  const currentIndex = activeCutoff
    ? availableCutoffs.indexOf(activeCutoff)
    : availableCutoffs.length - 1;

  useEffect(() => {
    if (!isPlaying) {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
      return;
    }

    const intervalMs = Math.max(1500 / speedMultiplier, 300);

    playTimerRef.current = setInterval(() => {
      if (availableCutoffs.length === 0) return;

      const nextIdx = currentIndex + 1;
      if (nextIdx >= availableCutoffs.length) {
        setIsPlaying(false);
      } else {
        onCutoffChange(availableCutoffs[nextIdx]);
      }
    }, intervalMs);

    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, currentIndex, speedMultiplier, availableCutoffs, onCutoffChange]);

  const handleStepBackward = () => {
    setIsPlaying(false);
    if (currentIndex > 0) {
      onCutoffChange(availableCutoffs[currentIndex - 1]);
    }
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    if (currentIndex < availableCutoffs.length - 1) {
      onCutoffChange(availableCutoffs[currentIndex + 1]);
    } else {
      onResetToFull();
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPlaying(false);
    const idx = parseInt(e.target.value, 10);
    if (idx >= availableCutoffs.length - 1) {
      onResetToFull();
    } else {
      onCutoffChange(availableCutoffs[idx]);
    }
  };

  const isFullDataset = !activeCutoff || currentIndex === availableCutoffs.length - 1;

  return (
    <section aria-label="Temporal Outbreak Replay" className="bg-white border border-borderline rounded-2xl p-6 shadow-subtle space-y-5">
      {/* Replay Controls Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-borderline pb-4 gap-3">
        <div>
          <div className="text-sm font-bold text-navy uppercase tracking-wider flex items-center gap-2">
            Temporal Timeline Replay & Epicurve Engine
            <span className="bg-aqua text-teal-dark px-2 py-0.5 rounded-full text-[11px] font-semibold border border-teal/20">
              ZERO-LEAKAGE INVARIANT
            </span>
          </div>
          <p className="text-xs text-muted mt-1">
            Evaluating outbreak risk strictly using evidence known at or before cutoff <code className="bg-canvas px-1.5 py-0.5 rounded border border-borderline text-navy font-semibold">T</code>.
          </p>
        </div>

        {/* Current Cutoff Status Badge */}
        <div className="flex items-center gap-2.5 text-xs">
          <div className="border border-borderline px-3.5 py-1.5 rounded-lg bg-canvas text-navy">
            <span className="text-muted text-[10px] block uppercase font-medium">Replay Cutoff Instant</span>
            <span className="font-bold">
              {isFullDataset
                ? "T = FULL DATASET (LIVE)"
                : `T = ${activeCutoff?.slice(0, 10)} 23:59 UTC`}
            </span>
          </div>

          <div className="border border-borderline px-3.5 py-1.5 rounded-lg bg-white text-navy">
            <span className="text-muted text-[10px] block uppercase font-medium">Eligible Cohort</span>
            <span className="font-bold">
              {eligibleRecordsCount.toLocaleString()} / {totalRecordsCount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Lazy-loaded Epicurve Visualization */}
      <EpicurveChart
        buckets={buckets}
        activeCutoffTimestamp={activeCutoff}
        onSelectCutoff={(ts) => {
          setIsPlaying(false);
          onCutoffChange(ts);
        }}
      />

      {/* Scrubbing Bar & Playback Controls */}
      <div className="bg-canvas border border-borderline rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Playback Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleStepBackward}
              disabled={currentIndex <= 0}
              className="border border-borderline bg-white px-3 py-1.5 text-navy hover:bg-aqua/30 transition-colors disabled:opacity-40 rounded-lg font-semibold text-xs shadow-subtle"
              title="Step backward one observation day"
            >
              &larr; Previous Day
            </button>

            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="border border-teal bg-teal text-white px-4 py-1.5 hover:bg-teal-dark transition-all rounded-lg font-bold text-xs uppercase tracking-wider shadow-subtle flex items-center gap-1.5"
            >
              <span>{isPlaying ? "Pause [||]" : "Play Replay [>]"}</span>
            </button>

            <button
              type="button"
              onClick={handleStepForward}
              disabled={isFullDataset}
              className="border border-borderline bg-white px-3 py-1.5 text-navy hover:bg-aqua/30 transition-colors disabled:opacity-40 rounded-lg font-semibold text-xs shadow-subtle"
              title="Step forward one observation day"
            >
              Next Day &rarr;
            </button>

            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                onResetToFull();
              }}
              className={`border border-borderline px-3.5 py-1.5 font-bold text-xs transition-colors rounded-lg ${
                isFullDataset ? "bg-navy text-white shadow-subtle" : "bg-white text-navy hover:bg-aqua/30"
              }`}
            >
              Reset to Full Live Data
            </button>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-muted text-xs mr-1">Replay Speed:</span>
            {[1, 2, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSpeedMultiplier(s)}
                className={`border border-borderline px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                  speedMultiplier === s ? "bg-teal text-white shadow-subtle" : "bg-white text-muted hover:text-navy hover:bg-canvas"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Continuous Time Scrubber Slider */}
        <div className="space-y-1.5 pt-1">
          <input
            type="range"
            min={0}
            max={Math.max(availableCutoffs.length - 1, 0)}
            value={currentIndex >= 0 ? currentIndex : availableCutoffs.length - 1}
            onChange={handleSliderChange}
            className="w-full h-2.5 bg-white border border-borderline rounded-lg accent-teal cursor-pointer"
          />

          <div className="flex justify-between text-[11px] text-muted">
            <span>{buckets[0]?.date_label || "Start"}</span>
            <span className="text-navy font-bold">
              {isFullDataset
                ? "Full Outbreak Data (All Observations Included)"
                : `Active Cutoff: ${buckets[currentIndex]?.date_label || activeCutoff?.slice(0, 10)}`}
            </span>
            <span>{buckets[buckets.length - 1]?.date_label || "Peak / Current"}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
