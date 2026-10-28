"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function AquaTraceLandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-mist text-ink font-sans selection:bg-ink selection:text-white">
      {/* =========================================================================
          SECTION 1: NAVIGATION
      ========================================================================= */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Wordmark & Geometric Mark */}
          <Link
            href="/"
            className="flex items-center space-x-3 text-ink group focus-visible:outline-ink"
            aria-label="AquaTrace Home"
          >
            <div className="w-7 h-7 bg-ink border border-slate flex items-center justify-center p-1">
              <svg
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full stroke-white"
                strokeWidth="2"
                strokeLinecap="square"
              >
                <path d="M3 10h14M10 3v14M5 5l10 10" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-base font-bold tracking-tight uppercase leading-none">
                AquaTrace
              </span>
              <span className="font-mono text-[10px] text-slate tracking-widest uppercase mt-0.5">
                Surveillance Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            className="hidden md:flex items-center space-x-8 font-mono text-xs uppercase tracking-wider"
            aria-label="Main Navigation"
          >
            <a
              href="#overview"
              className="text-slate hover:text-ink transition-colors focus-visible:outline-ink py-1"
            >
              Overview
            </a>
            <a
              href="#how-it-works"
              className="text-slate hover:text-ink transition-colors focus-visible:outline-ink py-1"
            >
              How It Works
            </a>
            <a
              href="#features"
              className="text-slate hover:text-ink transition-colors focus-visible:outline-ink py-1"
            >
              Features
            </a>
            <a
              href="#responsible-use"
              className="text-slate hover:text-ink transition-colors focus-visible:outline-ink py-1"
            >
              Responsible Use
            </a>
          </nav>

          {/* Primary Action Button & Mobile Menu Trigger */}
          <div className="flex items-center space-x-4">
            <Link
              href="/investigation"
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 bg-ink text-white font-mono text-xs uppercase font-semibold border border-slate hover:bg-slate transition-colors focus-visible:outline-ink"
            >
              Open AquaTrace
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 border border-slate text-ink bg-white focus-visible:outline-ink"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              <svg
                className="w-5 h-5 stroke-ink"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                strokeLinecap="square"
              >
                {mobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate px-4 py-4 space-y-3 font-mono text-xs uppercase">
            <a
              href="#overview"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-slate hover:text-ink border-b border-mist"
            >
              Overview
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-slate hover:text-ink border-b border-mist"
            >
              How It Works
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-slate hover:text-ink border-b border-mist"
            >
              Features
            </a>
            <a
              href="#responsible-use"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-slate hover:text-ink border-b border-mist"
            >
              Responsible Use
            </a>
            <Link
              href="/investigation"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center py-2.5 bg-ink text-white font-semibold border border-slate"
            >
              Open AquaTrace
            </Link>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* =========================================================================
            SECTION 2: HERO
        ========================================================================= */}
        <section className="border-b border-slate bg-mist py-12 md:py-20 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Product Messaging */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center space-x-2 px-2.5 py-1 border border-slate bg-white text-slate font-mono text-[11px] tracking-wider uppercase">
                  <span className="w-2 h-2 bg-ink inline-block" />
                  <span>Epidemiological Outbreak Workstation</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-ink leading-tight">
                  Turn outbreak data into clear investigation priorities.
                </h1>

                <p className="text-base sm:text-lg text-slate leading-relaxed max-w-2xl">
                  When a waterborne outbreak is suspected, every source deserves investigation—but
                  not every lead provides the same evidence. AquaTrace helps public-health teams
                  analyse exposure data, compare illness rates, and prioritise the next steps with
                  transparent, evidence-based analysis.
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
                  <Link
                    href="/investigation"
                    className="inline-flex items-center justify-center px-6 py-3.5 bg-ink text-white font-mono text-sm uppercase font-semibold border border-slate hover:bg-slate transition-colors text-center"
                  >
                    Start an Investigation
                  </Link>
                  <a
                    href="#how-it-works"
                    className="inline-flex items-center justify-center px-6 py-3.5 bg-white text-ink font-mono text-sm uppercase font-semibold border border-slate hover:bg-mist transition-colors text-center"
                  >
                    Explore How It Works
                  </a>
                </div>

                <div className="pt-2 border-t border-slate/30">
                  <p className="font-mono text-xs text-slate tracking-wide uppercase">
                    Transparent statistics. Clear evidence. Human-led decisions.
                  </p>
                </div>
              </div>

              {/* Art-Directed Hero Product Visual */}
              <div className="lg:col-span-5">
                <div className="bg-white border border-slate">
                  {/* Visual Header */}
                  <div className="bg-mist px-3 py-2 border-b border-slate flex justify-between items-center text-xs font-mono">
                    <span className="font-bold text-ink uppercase tracking-wider">
                      Candidate Prioritisation
                    </span>
                    <span className="bg-white px-1.5 py-0.5 border border-slate text-[10px] text-slate">
                      SYNTHETIC PREVIEW
                    </span>
                  </div>

                  {/* Visual Content: Miniature Evidence Matrix */}
                  <div className="p-4 space-y-4 font-mono text-xs">
                    {/* Top Source Lead */}
                    <div className="border border-slate p-3 bg-white space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] text-slate uppercase block">
                            Candidate Source
                          </span>
                          <span className="text-sm font-bold text-ink">
                            Municipal Borehole #3
                          </span>
                        </div>
                        <span className="bg-ink text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                          Priority 1
                        </span>
                      </div>

                      {/* 2x2 Breakdown */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-mist text-[11px]">
                        <div>
                          <span className="text-slate block">Exposed Attack Rate</span>
                          <span className="font-bold text-ink">70.8% (34 / 48)</span>
                        </div>
                        <div>
                          <span className="text-slate block">Unexposed Attack Rate</span>
                          <span className="font-bold text-ink">12.9% (8 / 62)</span>
                        </div>
                      </div>

                      {/* Statistical Confidence */}
                      <div className="bg-mist p-2 border border-slate flex justify-between items-center text-[11px]">
                        <div>
                          <span className="text-slate">Relative Risk: </span>
                          <span className="font-bold text-ink">5.49</span>
                        </div>
                        <span className="text-slate">Wald 95% CI: [2.81, 10.73]</span>
                      </div>
                    </div>

                    {/* Secondary Source Comparison */}
                    <div className="border border-slate p-3 bg-mist/60 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-ink">Eastern Distribution Tank</span>
                        <span className="border border-slate bg-white text-slate px-1.5 py-0.5 text-[10px]">
                          Priority 2
                        </span>
                      </div>
                      <div className="flex justify-between text-slate text-[11px]">
                        <span>Attack Rate: 34.0%</span>
                        <span>Relative Risk: 1.42 (CI: 0.88, 2.29)</span>
                      </div>
                    </div>

                    {/* Data Quality & Telemetry Banner */}
                    <div className="flex justify-between items-center text-[10px] text-slate pt-1 border-t border-slate/30">
                      <span>VALIDATED: 110 RECORDS</span>
                      <span>TEMPORAL SLICE: T = DAY 4</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 3: THE PROBLEM AND THE APPROACH
        ========================================================================= */}
        <section id="overview" className="border-b border-slate bg-white py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-12">
              <span className="font-mono text-xs uppercase tracking-wider text-slate block mb-2">
                Operational Context
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
                Make the next investigation step clearer.
              </h2>
            </div>

            {/* Editorial Layout for 3 Challenges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              <div className="border border-slate p-6 bg-mist flex flex-col justify-between">
                <div>
                  <div className="font-mono text-xs font-bold text-slate mb-2">
                    01 // DATA BARRIER
                  </div>
                  <h3 className="text-base font-bold text-ink mb-3 uppercase font-mono">
                    Fragmented information
                  </h3>
                  <p className="text-sm text-slate leading-relaxed">
                    Exposure surveys, illness records, and source information can be difficult to
                    analyse consistently when held in separate files.
                  </p>
                </div>
              </div>

              <div className="border border-slate p-6 bg-mist flex flex-col justify-between">
                <div>
                  <div className="font-mono text-xs font-bold text-slate mb-2">
                    02 // STATISTICAL NOISE
                  </div>
                  <h3 className="text-base font-bold text-ink mb-3 uppercase font-mono">
                    Uncertain evidence
                  </h3>
                  <p className="text-sm text-slate leading-relaxed">
                    Missing exposure information and incomplete observations can complicate
                    comparisons between possible sources.
                  </p>
                </div>
              </div>

              <div className="border border-slate p-6 bg-mist flex flex-col justify-between">
                <div>
                  <div className="font-mono text-xs font-bold text-slate mb-2">
                    03 // FIELD CONSTRAINTS
                  </div>
                  <h3 className="text-base font-bold text-ink mb-3 uppercase font-mono">
                    Limited investigation resources
                  </h3>
                  <p className="text-sm text-slate leading-relaxed">
                    Teams need a transparent basis for deciding which sources deserve closer
                    investigation and what additional evidence is needed.
                  </p>
                </div>
              </div>
            </div>

            {/* Approach Statement */}
            <div className="mt-8 border border-slate bg-ink text-white p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-3">
                  <span className="font-mono text-xs text-mist uppercase tracking-widest block font-bold">
                    The AquaTrace Approach
                  </span>
                </div>
                <div className="md:col-span-9">
                  <p className="text-base sm:text-lg text-mist leading-relaxed font-normal">
                    Bring the available information into one workflow. Validate the records, compare
                    source-specific illness rates, review uncertainty, and prepare a clear
                    investigation brief.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 4: HOW IT WORKS
        ========================================================================= */}
        <section id="how-it-works" className="border-b border-slate bg-mist py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-12">
              <span className="font-mono text-xs uppercase tracking-wider text-slate block mb-2">
                Workflow Sequence
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
                From raw data to a clearer field plan.
              </h2>
            </div>

            {/* 4 Connected Process Steps */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Step 1 */}
              <div className="border border-slate bg-white p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="font-mono text-2xl font-black text-ink mb-2">01</div>
                  <h3 className="font-mono text-sm font-bold text-ink uppercase tracking-wider mb-2">
                    Import
                  </h3>
                  <p className="text-xs text-slate leading-relaxed">
                    Upload a structured illness and water-source exposure CSV.
                  </p>
                </div>
                <div className="pt-3 border-t border-mist text-[10px] font-mono text-slate">
                  CSV SCHEMA ENFORCED
                </div>
              </div>

              {/* Step 2 */}
              <div className="border border-slate bg-white p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="font-mono text-2xl font-black text-ink mb-2">02</div>
                  <h3 className="font-mono text-sm font-bold text-ink uppercase tracking-wider mb-2">
                    Validate
                  </h3>
                  <p className="text-xs text-slate leading-relaxed">
                    Identify missing information, inconsistent values, duplicate records, and
                    unknown exposures before interpreting the dataset.
                  </p>
                </div>
                <div className="pt-3 border-t border-mist text-[10px] font-mono text-slate">
                  ANOMALY DETECTION
                </div>
              </div>

              {/* Step 3 */}
              <div className="border border-slate bg-white p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="font-mono text-2xl font-black text-ink mb-2">03</div>
                  <h3 className="font-mono text-sm font-bold text-ink uppercase tracking-wider mb-2">
                    Compare
                  </h3>
                  <p className="text-xs text-slate leading-relaxed">
                    Examine attack rates, relative risks, confidence intervals where calculable,
                    and the evidence supporting each candidate source.
                  </p>
                </div>
                <div className="pt-3 border-t border-mist text-[10px] font-mono text-slate">
                  2×2 EPIDEMIOLOGICAL MATRIX
                </div>
              </div>

              {/* Step 4 */}
              <div className="border border-slate bg-white p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="font-mono text-2xl font-black text-ink mb-2">04</div>
                  <h3 className="font-mono text-sm font-bold text-ink uppercase tracking-wider mb-2">
                    Investigate
                  </h3>
                  <p className="text-xs text-slate leading-relaxed">
                    Review the timeline, understand the limitations, and prepare a field brief to
                    support human-led investigation.
                  </p>
                </div>
                <div className="pt-3 border-t border-mist text-[10px] font-mono text-slate">
                  STRUCTURED BRIEF & AUDIT
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 5: FEATURE SHOWCASE (6 POLISHED CAPABILITIES)
        ========================================================================= */}
        <section id="features" className="border-b border-slate bg-white py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-12">
              <span className="font-mono text-xs uppercase tracking-wider text-slate block mb-2">
                Core Capabilities
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
                Evidence that is easier to inspect and act on.
              </h2>
            </div>

            {/* Varied Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1: Data Quality First */}
              <div className="border border-slate bg-mist p-6 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-ink">
                    <svg className="w-5 h-5 stroke-ink" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="square" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="font-mono text-sm font-bold uppercase tracking-wider">
                      1. Data Quality First
                    </h3>
                  </div>
                  <p className="text-xs text-slate leading-relaxed">
                    AquaTrace surfaces missing values, duplicate participant IDs, invalid dates,
                    unknown exposures, and dataset limitations before interpreting results.
                  </p>
                </div>

                {/* Structured Checklist Preview */}
                <div className="mt-5 border border-slate bg-white p-3 font-mono text-[11px] space-y-1.5">
                  <div className="flex justify-between text-ink font-semibold">
                    <span>PARTICIPANT ID UNIQUENESS</span>
                    <span>100% PASS</span>
                  </div>
                  <div className="flex justify-between text-slate">
                    <span>DATE COHERENCE CHECK</span>
                    <span>VERIFIED</span>
                  </div>
                  <div className="flex justify-between text-slate">
                    <span>UNKNOWN EXPOSURES FLAG</span>
                    <span>3 AUDITED</span>
                  </div>
                </div>
              </div>

              {/* Feature 2: Epidemiological Analysis */}
              <div className="border border-slate bg-mist p-6 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-ink">
                    <svg className="w-5 h-5 stroke-ink" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="square" d="M16 8v8m-4-5v5m-4-2v2m-2 4h16a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="font-mono text-sm font-bold uppercase tracking-wider">
                      2. Epidemiological Analysis
                    </h3>
                  </div>
                  <p className="text-xs text-slate leading-relaxed">
                    Calculates source-specific attack rates and relative risks, with confidence
                    intervals where appropriate—grounded strictly in classical epidemiology.
                  </p>
                </div>

                {/* Exposed vs Unexposed Preview */}
                <div className="mt-5 border border-slate bg-white p-3 font-mono text-[11px] space-y-1">
                  <div className="grid grid-cols-2 gap-2 text-ink">
                    <div>
                      <span className="text-slate block text-[10px]">EXPOSED RATE</span>
                      <span className="font-bold">70.8% (34/48)</span>
                    </div>
                    <div>
                      <span className="text-slate block text-[10px]">UNEXPOSED RATE</span>
                      <span className="font-bold">12.9% (8/62)</span>
                    </div>
                  </div>
                  <div className="pt-1.5 text-[10px] text-slate border-t border-mist">
                    RR = 5.49 [WALD 95% CI: 2.81 - 10.73]
                  </div>
                </div>
              </div>

              {/* Feature 3: Transparent Source Prioritisation */}
              <div className="border border-slate bg-mist p-6 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-ink">
                    <svg className="w-5 h-5 stroke-ink" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="square" d="M3 4h18M3 10h18M3 16h18M3 20h18" />
                    </svg>
                    <h3 className="font-mono text-sm font-bold uppercase tracking-wider">
                      3. Transparent Prioritisation
                    </h3>
                  </div>
                  <p className="text-xs text-slate leading-relaxed">
                    Candidate sources are prioritised using documented statistical evidence and data
                    sufficiency—not an opaque AI score. Prioritisation does not confirm
                    contamination.
                  </p>
                </div>

                {/* Mini Table Preview */}
                <div className="mt-5 border border-slate bg-white p-2.5 font-mono text-[10px] space-y-1">
                  <div className="flex justify-between font-bold border-b border-mist pb-1">
                    <span>SOURCE</span>
                    <span>RR</span>
                    <span>PRIORITY</span>
                  </div>
                  <div className="flex justify-between text-ink">
                    <span>Borehole #3</span>
                    <span>5.49</span>
                    <span className="font-bold bg-ink text-white px-1">HIGH (P1)</span>
                  </div>
                  <div className="flex justify-between text-slate">
                    <span>Spring Well B</span>
                    <span>1.12</span>
                    <span>LOW (P4)</span>
                  </div>
                </div>
              </div>

              {/* Feature 4: Timeline Replay */}
              <div className="border border-slate bg-mist p-6 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-ink">
                    <svg className="w-5 h-5 stroke-ink" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="square" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="font-mono text-sm font-bold uppercase tracking-wider">
                      4. Timeline Replay
                    </h3>
                  </div>
                  <p className="text-xs text-slate leading-relaxed">
                    Explore how findings and priorities evolve as additional records become
                    available over time, carefully separating data arrival from contamination time.
                  </p>
                </div>

                {/* Minimal Timeline Graphic */}
                <div className="mt-5 border border-slate bg-white p-3 font-mono text-[11px] space-y-2">
                  <div className="flex justify-between text-slate text-[10px]">
                    <span>T=DAY 1</span>
                    <span className="text-ink font-bold">T=DAY 3 [CURRENT]</span>
                    <span>T=DAY 7</span>
                  </div>
                  <div className="w-full bg-mist h-2 border border-slate relative">
                    <div className="bg-ink h-full w-1/2" />
                  </div>
                  <div className="text-[10px] text-slate text-right">
                    CUMULATIVE CASES: 42
                  </div>
                </div>
              </div>

              {/* Feature 5: Source Mapping */}
              <div className="border border-slate bg-mist p-6 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-ink">
                    <svg className="w-5 h-5 stroke-ink" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="square" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="square" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <h3 className="font-mono text-sm font-bold uppercase tracking-wider">
                      5. Source Mapping
                    </h3>
                  </div>
                  <p className="text-xs text-slate leading-relaxed">
                    Source locations can be inspected when validated geographical coordinates are
                    provided, without implying proximity establishes an exposure relationship.
                  </p>
                </div>

                {/* Schematic Grid Location View */}
                <div className="mt-5 border border-slate bg-white p-3 font-mono text-[10px] space-y-1">
                  <div className="flex justify-between text-slate">
                    <span>GRID REF: 41.0082°N, 28.9784°E</span>
                    <span>ZONE 4B</span>
                  </div>
                  <div className="border border-slate bg-mist p-2 flex justify-between items-center text-ink font-bold">
                    <span>[+] BOREHOLE #3</span>
                    <span>VALID COORDINATES</span>
                  </div>
                </div>
              </div>

              {/* Feature 6: Field Investigation Briefs */}
              <div className="border border-slate bg-mist p-6 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-ink">
                    <svg className="w-5 h-5 stroke-ink" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="square" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="font-mono text-sm font-bold uppercase tracking-wider">
                      6. Field Investigation Briefs
                    </h3>
                  </div>
                  <p className="text-xs text-slate leading-relaxed">
                    Synthesise statistical calculations, data-quality caveats, and proposed sampling
                    steps into a concise, exportable field brief for health authorities.
                  </p>
                </div>

                {/* Brief Preview */}
                <div className="mt-5 border border-slate bg-white p-3 font-mono text-[11px] space-y-1">
                  <div className="font-bold text-ink">BRIEF // MUNICIPAL WATER AUDIT</div>
                  <div className="text-[10px] text-slate">
                    TARGET: SOURCE #3 WATER SAMPLING & AUDIT
                  </div>
                  <div className="text-[10px] text-slate">
                    STATUS: READY FOR HUMAN REVIEW
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 6: EVIDENCE PREVIEW
        ========================================================================= */}
        <section className="border-b border-slate bg-mist py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-12">
              <span className="font-mono text-xs uppercase tracking-wider text-slate block mb-2">
                Empirical Rigour
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
                See the reasoning behind the priority.
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate leading-relaxed">
                The platform does not merely assign an abstract badge. It exposes the underlying
                contingency figures, denominators, variance bounds, and missing data indicators.
              </p>
            </div>

            {/* Illustrative Comparison Panel */}
            <div className="border border-slate bg-white">
              {/* Header */}
              <div className="bg-ink text-white px-4 py-3 flex flex-wrap justify-between items-center font-mono text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 bg-white inline-block" />
                  <span className="font-bold uppercase tracking-wider">
                    Evidence Inspection Panel // Candidate Source: Municipal Borehole #3
                  </span>
                </div>
                <span className="bg-slate px-2 py-0.5 text-[10px] text-white tracking-widest uppercase">
                  ILLUSTRATIVE SYNTHETIC DATA
                </span>
              </div>

              {/* Data Table Matrix */}
              <div className="p-4 sm:p-6 overflow-x-auto">
                <table className="w-full text-left font-mono text-xs border border-slate border-collapse">
                  <thead>
                    <tr className="bg-mist text-ink border-b border-slate">
                      <th className="p-3 border-r border-slate font-bold uppercase">Exposure Cohort</th>
                      <th className="p-3 border-r border-slate font-bold uppercase">Ill Cases</th>
                      <th className="p-3 border-r border-slate font-bold uppercase">Total Exposed</th>
                      <th className="p-3 border-r border-slate font-bold uppercase">Attack Rate</th>
                      <th className="p-3 font-bold uppercase">Risk Metric</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate">
                    <tr>
                      <td className="p-3 border-r border-slate font-semibold text-ink">
                        Exposed (Drank from Source #3)
                      </td>
                      <td className="p-3 border-r border-slate text-ink font-bold">34</td>
                      <td className="p-3 border-r border-slate text-slate">48</td>
                      <td className="p-3 border-r border-slate font-bold text-ink">70.8%</td>
                      <td className="p-3 text-slate font-bold" rowSpan={2}>
                        Relative Risk: <span className="text-ink">5.49</span>
                        <br />
                        <span className="text-[11px] font-normal text-slate">
                          Wald 95% CI: [2.81 - 10.73]
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 border-r border-slate font-semibold text-ink">
                        Unexposed (Did not drink)
                      </td>
                      <td className="p-3 border-r border-slate text-ink font-bold">8</td>
                      <td className="p-3 border-r border-slate text-slate">62</td>
                      <td className="p-3 border-r border-slate font-bold text-ink">12.9%</td>
                    </tr>
                  </tbody>
                </table>

                {/* Contextual Limitations & Interpretation Footer */}
                <div className="mt-4 pt-4 border-t border-mist grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="border border-slate p-3 bg-mist">
                    <span className="text-slate block text-[10px] uppercase font-bold">
                      Uncertainty & Data Completeness
                    </span>
                    <p className="mt-1 text-slate text-[11px] leading-relaxed">
                      3 participant records contained unknown exposure status for this source and
                      were excluded from the relative risk denominator to prevent bias.
                    </p>
                  </div>
                  <div className="border border-slate p-3 bg-white">
                    <span className="text-slate block text-[10px] uppercase font-bold">
                      Investigation Priority Verdict
                    </span>
                    <p className="mt-1 text-ink text-[11px] font-bold leading-relaxed">
                      PRIORITY 1 // High statistical attack rate disparity supports prioritised
                      sampling of Municipal Borehole #3.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 7: RESPONSIBLE USE
        ========================================================================= */}
        <section id="responsible-use" className="border-b border-slate bg-white py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-12">
              <span className="font-mono text-xs uppercase tracking-wider text-slate block mb-2">
                Ethical & Scientific Guardrails
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
                Support the investigation. Keep decisions evidence-led.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {/* Principle 1 */}
              <div className="border border-slate p-6 bg-mist space-y-2">
                <div className="font-mono text-xs text-slate font-bold uppercase">
                  Principle 01
                </div>
                <h3 className="font-mono text-sm font-bold text-ink uppercase tracking-wider">
                  Association is not confirmation
                </h3>
                <p className="text-xs sm:text-sm text-slate leading-relaxed">
                  A statistical association can help identify a source for further investigation,
                  but it does not independently establish contamination.
                </p>
              </div>

              {/* Principle 2 */}
              <div className="border border-slate p-6 bg-mist space-y-2">
                <div className="font-mono text-xs text-slate font-bold uppercase">
                  Principle 02
                </div>
                <h3 className="font-mono text-sm font-bold text-ink uppercase tracking-wider">
                  Uncertainty stays visible
                </h3>
                <p className="text-xs sm:text-sm text-slate leading-relaxed">
                  Unknown exposures and incomplete observations should be disclosed transparently
                  rather than silently guessed or smoothed over.
                </p>
              </div>

              {/* Principle 3 */}
              <div className="border border-slate p-6 bg-mist space-y-2">
                <div className="font-mono text-xs text-slate font-bold uppercase">
                  Principle 03
                </div>
                <h3 className="font-mono text-sm font-bold text-ink uppercase tracking-wider">
                  Human oversight remains essential
                </h3>
                <p className="text-xs sm:text-sm text-slate leading-relaxed">
                  AquaTrace supports investigation and documentation. Physical water sampling,
                  certified laboratory testing, and statutory public-health decisions remain
                  under authorized human control.
                </p>
              </div>

              {/* Principle 4 */}
              <div className="border border-slate p-6 bg-mist space-y-2">
                <div className="font-mono text-xs text-slate font-bold uppercase">
                  Principle 04
                </div>
                <h3 className="font-mono text-sm font-bold text-ink uppercase tracking-wider">
                  AI is an assistant, not the source of truth
                </h3>
                <p className="text-xs sm:text-sm text-slate leading-relaxed">
                  Any optional AI-generated explanation must rely strictly on validated analysis
                  results. Statistical values must come from deterministic calculation code, not
                  generated language model text.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 8: FINAL CTA
        ========================================================================= */}
        <section className="border-b border-slate bg-ink text-white py-16 md:py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Start with the evidence you have.
            </h2>
            <p className="text-base sm:text-lg text-mist max-w-2xl mx-auto leading-relaxed">
              Organise your investigation, compare possible water sources, and make the next steps
              easier to understand.
            </p>
            <div className="pt-4">
              <Link
                href="/investigation"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-ink font-mono text-sm uppercase font-bold border border-slate hover:bg-mist transition-colors"
              >
                Open AquaTrace
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================================
          SECTION 9: FOOTER
      ========================================================================= */}
      <footer className="bg-white border-t border-slate py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-mist">
            {/* Wordmark & Description */}
            <div className="space-y-2 max-w-md">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-ink inline-block" />
                <span className="font-mono text-base font-bold uppercase tracking-tight text-ink">
                  AquaTrace
                </span>
              </div>
              <p className="text-xs text-slate leading-relaxed">
                Evidence-based waterborne outbreak investigation and response-prioritisation
                platform for public health teams.
              </p>
            </div>

            {/* Navigation Anchor Links & Workspace Link */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs uppercase text-slate">
              <a href="#overview" className="hover:text-ink">
                Overview
              </a>
              <a href="#how-it-works" className="hover:text-ink">
                How It Works
              </a>
              <a href="#features" className="hover:text-ink">
                Features
              </a>
              <a href="#responsible-use" className="hover:text-ink">
                Responsible Use
              </a>
              <Link href="/investigation" className="font-bold text-ink underline">
                Workstation →
              </Link>
            </div>
          </div>

          {/* Responsible Use Disclaimer */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-mono text-slate">
            <p className="max-w-3xl leading-relaxed">
              AquaTrace supports outbreak investigation through transparent analysis. Statistical
              associations do not confirm contamination and do not replace laboratory testing or
              public-health judgement.
            </p>
            <span className="whitespace-nowrap text-[11px]">
              &copy; {new Date().getFullYear()} AquaTrace
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
