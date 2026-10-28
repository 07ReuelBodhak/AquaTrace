"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function AquaTraceLandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"handpump" | "well">("handpump");

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-main font-sans selection:bg-teal selection:text-white">
      {/* =========================================================================
          SECTION 1: NAVIGATION
      ========================================================================= */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-borderline w-full transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Wordmark & Crest */}
          <Link
            href="/"
            className="flex items-center space-x-3 group focus-visible:outline-teal"
            aria-label="AquaTrace Home"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy to-teal flex items-center justify-center text-white shadow-subtle group-hover:shadow-card transition-all">
              {/* Stylized water droplet / node shield mark */}
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 stroke-white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                <path d="M12 11v5" />
                <circle cx="12" cy="18" r="1" fill="white" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-navy tracking-tight leading-none">
                AquaTrace
              </span>
              <span className="text-[11px] font-medium text-muted tracking-wider uppercase mt-1">
                Outbreak Evidence Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden md:flex items-center space-x-8 text-sm font-medium text-muted"
            aria-label="Main Navigation"
          >
            <a href="#overview" className="hover:text-teal transition-colors py-1">
              Overview
            </a>
            <a href="#how-it-works" className="hover:text-teal transition-colors py-1">
              How It Works
            </a>
            <a href="#features" className="hover:text-teal transition-colors py-1">
              Features
            </a>
            <a href="#evidence" className="hover:text-teal transition-colors py-1">
              Evidence & Math
            </a>
            <a href="#responsible-use" className="hover:text-teal transition-colors py-1">
              Responsible Use
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-navy hover:text-teal hover:bg-aqua/40 rounded-lg transition-colors"
            >
              Officer Login
            </Link>
            <Link
              href="/investigation"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-teal hover:bg-teal-dark rounded-lg shadow-subtle hover:shadow-card transition-all flex items-center gap-1.5"
            >
              <span>Open Workstation</span>
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-muted hover:text-navy rounded-lg focus-visible:outline-teal"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle Navigation Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-borderline bg-white px-4 pt-3 pb-6 space-y-3 shadow-card animate-fadeIn">
            <a
              href="#overview"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-main hover:bg-aqua/30 rounded-lg"
            >
              Overview
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-main hover:bg-aqua/30 rounded-lg"
            >
              How It Works
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-main hover:bg-aqua/30 rounded-lg"
            >
              Features
            </a>
            <a
              href="#evidence"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-main hover:bg-aqua/30 rounded-lg"
            >
              Evidence & Math
            </a>
            <a
              href="#responsible-use"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-main hover:bg-aqua/30 rounded-lg"
            >
              Responsible Use
            </a>
            <div className="pt-3 border-t border-borderline flex flex-col gap-2">
              <Link
                href="/login"
                className="w-full text-center py-2.5 text-sm font-semibold text-navy bg-aqua/50 hover:bg-aqua rounded-lg"
              >
                Officer Login
              </Link>
              <Link
                href="/investigation"
                className="w-full text-center py-2.5 text-sm font-semibold text-white bg-teal hover:bg-teal-dark rounded-lg shadow-subtle"
              >
                Launch Workstation
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          SECTION 2: HERO
      ========================================================================= */}
      <section id="overview" className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-white via-aqua/20 to-canvas border-b border-borderline">
        {/* Subtle Water Pattern SVG in background */}
        <div className="absolute inset-0 pointer-events-none opacity-25">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,30 C30,20 50,45 100,25 L100,0 L0,0 Z" fill="#DDF4F1" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Heading and Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-aqua border border-teal/20 text-teal-dark text-xs font-semibold tracking-wide shadow-subtle">
                <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
                Evidence-Based Waterborne Outbreak Investigation
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-navy tracking-tight leading-[1.12]">
                When an outbreak happens,{" "}
                <span className="text-teal">know what to investigate next.</span>
              </h1>

              <p className="text-lg sm:text-xl text-muted leading-relaxed max-w-2xl mx-auto lg:mx-0">
                When people become ill and several water sources are suspected, investigators need more than scattered records. AquaTrace helps public-health teams check exposure data, compare illness rates, and identify which sources deserve closer investigation.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/investigation"
                  className="w-full sm:w-auto px-7 py-3.5 text-base font-semibold text-white bg-teal hover:bg-teal-dark rounded-xl shadow-card hover:shadow-float transition-all flex items-center justify-center gap-2"
                >
                  <span>Start an Investigation</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>

                <a
                  href="#how-it-works"
                  className="w-full sm:w-auto px-7 py-3.5 text-base font-semibold text-navy bg-white hover:bg-aqua/40 border border-borderline hover:border-teal/40 rounded-xl shadow-subtle transition-all text-center"
                >
                  See How It Works
                </a>
              </div>

              {/* Subtitle Guarantee */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-muted font-medium">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-teal" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  Clear Evidence
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-teal" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  Transparent 2x2 Statistics
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-teal" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  Human-Led Decisions
                </span>
              </div>
            </div>

            {/* Right Column: Visual Product Teaser Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border border-borderline p-6 shadow-float relative">
                {/* Visual Header */}
                <div className="flex items-center justify-between pb-4 border-b border-borderline">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-danger/80" />
                    <div className="w-3 h-3 rounded-full bg-warning/80" />
                    <div className="w-3 h-3 rounded-full bg-success/80" />
                    <span className="ml-2 text-xs font-semibold text-navy">Municipal Surveillance Workspace</span>
                  </div>
                  <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-aqua text-teal-dark border border-teal/20">
                    LIVE CALCULATION
                  </span>
                </div>

                {/* Priority Source Preview */}
                <div className="mt-5 space-y-4">
                  <div className="p-4 rounded-xl bg-canvas border border-borderline hover:border-teal/50 transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[11px] font-semibold text-teal uppercase tracking-wider block">
                          Top Candidate Lead
                        </span>
                        <h4 className="text-base font-bold text-navy mt-0.5">Handpump #14 (North Sector)</h4>
                        <p className="text-xs text-muted mt-0.5">Public borehole &bull; Deep aquifer extraction</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-navy text-white shadow-subtle">
                        P1 HIGH PRIORITY
                      </span>
                    </div>

                    {/* Rates Comparison */}
                    <div className="mt-4 grid grid-cols-2 gap-3 pt-3 border-t border-borderline text-xs">
                      <div className="p-2.5 rounded-lg bg-white border border-borderline">
                        <span className="text-muted block text-[11px]">Illness rate if exposed:</span>
                        <span className="text-base font-bold text-navy mt-0.5 block">60.0%</span>
                        <span className="text-[10px] text-muted">(42 of 70 ill)</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-borderline">
                        <span className="text-muted block text-[11px]">Illness rate if unexposed:</span>
                        <span className="text-base font-bold text-navy mt-0.5 block">15.0%</span>
                        <span className="text-[10px] text-muted">(24 of 160 ill)</span>
                      </div>
                    </div>

                    {/* Relative Risk Callout */}
                    <div className="mt-3.5 p-3 rounded-lg bg-aqua/60 border border-teal/20 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-navy font-bold">Relative Risk: 4.0x</span>
                        <span className="text-muted block text-[11px] mt-0.5">
                          Illness was 4 times as common in the exposed cohort.
                        </span>
                      </div>
                      <span className="text-[11px] font-mono font-semibold text-teal-dark whitespace-nowrap">
                        95% CI: 2.6 – 6.1
                      </span>
                    </div>
                  </div>

                  {/* Second lower-priority comparison */}
                  <div className="p-3.5 rounded-xl bg-white border border-borderline flex items-center justify-between text-xs">
                    <div>
                      <h5 className="font-semibold text-navy">Well #3 (Sector Center)</h5>
                      <p className="text-[11px] text-muted mt-0.5">Equal rates: 30% exposed vs 30% unexposed (RR: 1.0)</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-canvas text-muted border border-borderline">
                      NO EXCESS RISK
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-borderline flex items-center justify-between text-[11px] text-muted">
                  <span>Standard CDC / WHO 2x2 formula</span>
                  <Link href="/investigation" className="text-teal font-semibold hover:underline">
                    Inspect full contingency matrix &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: VISUAL PRODUCT PREVIEW (INTERACTIVE WORKFLOW)
      ========================================================================= */}
      <section className="py-20 bg-white border-b border-borderline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold text-teal tracking-wider uppercase">Interactive Demonstration</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy mt-2">
              From Raw Survey Data to Actionable Priorities
            </h2>
            <p className="text-base sm:text-lg text-muted mt-3">
              Explore how AquaTrace parses survey data, separates known from unknown exposures, and isolates statistically significant risks.
            </p>
          </div>

          {/* Interactive Switcher */}
          <div className="bg-canvas border border-borderline rounded-2xl p-6 sm:p-8 shadow-card">
            {/* Top Switcher Tabs */}
            <div className="flex flex-wrap items-center justify-between pb-6 border-b border-borderline gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("handpump")}
                  className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    activeTab === "handpump"
                      ? "bg-navy text-white shadow-subtle"
                      : "bg-white text-muted hover:text-navy border border-borderline"
                  }`}
                >
                  Candidate A: Handpump #14 (High Priority)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("well")}
                  className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    activeTab === "well"
                      ? "bg-navy text-white shadow-subtle"
                      : "bg-white text-muted hover:text-navy border border-borderline"
                  }`}
                >
                  Candidate B: Well #3 (Inconclusive)
                </button>
              </div>

              <span className="text-xs font-mono font-medium text-muted bg-white px-3 py-1.5 rounded-lg border border-borderline">
                Cohort: 240 Surveyed Participants
              </span>
            </div>

            {/* Tab Content Display */}
            {activeTab === "handpump" ? (
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* 2x2 Breakdown Table */}
                <div className="lg:col-span-7 bg-white rounded-xl border border-borderline p-5 shadow-subtle">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-navy uppercase tracking-wider">
                      2x2 Contingency Matrix: Handpump #14
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-aqua text-teal-dark">
                      a=42, b=28, c=24, d=136
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-canvas text-muted border-b border-borderline">
                          <th className="py-2.5 px-3">Exposure Status</th>
                          <th className="py-2.5 px-3 text-right">Ill (Cases)</th>
                          <th className="py-2.5 px-3 text-right">Well (Healthy)</th>
                          <th className="py-2.5 px-3 text-right">Total</th>
                          <th className="py-2.5 px-3 text-right font-bold text-navy">Attack Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-borderline">
                        <tr className="hover:bg-aqua/10">
                          <td className="py-2.5 px-3 font-semibold text-navy">Drank from Handpump #14</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-navy">42</td>
                          <td className="py-2.5 px-3 text-right font-mono text-muted">28</td>
                          <td className="py-2.5 px-3 text-right font-mono text-muted">70</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-teal">60.0%</td>
                        </tr>
                        <tr className="hover:bg-aqua/10">
                          <td className="py-2.5 px-3 font-semibold text-muted">Did Not Drink</td>
                          <td className="py-2.5 px-3 text-right font-mono text-muted">24</td>
                          <td className="py-2.5 px-3 text-right font-mono text-muted">136</td>
                          <td className="py-2.5 px-3 text-right font-mono text-muted">160</td>
                          <td className="py-2.5 px-3 text-right font-mono text-muted">15.0%</td>
                        </tr>
                        <tr className="bg-canvas/60 font-semibold">
                          <td className="py-2 px-3 text-muted">Total Evaluated</td>
                          <td className="py-2 px-3 text-right font-mono text-navy">66</td>
                          <td className="py-2 px-3 text-right font-mono text-muted">164</td>
                          <td className="py-2 px-3 text-right font-mono text-navy">230</td>
                          <td className="py-2 px-3 text-right font-mono text-muted">28.7%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <p className="text-[11px] text-muted mt-3">
                    * 10 participants with unknown exposure are safely preserved in data-quality audit totals and excluded from denominators.
                  </p>
                </div>

                {/* Plain-Language Interpretation Panel */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-aqua/50 border border-teal/20 rounded-xl p-5">
                    <span className="text-xs font-bold text-teal-dark uppercase tracking-wide block">
                      Plain-Language Evidence Summary
                    </span>
                    <h4 className="text-xl font-bold text-navy mt-1">
                      Strong Positive Association (RR: 4.00)
                    </h4>
                    <p className="text-sm text-main mt-2 leading-relaxed">
                      People who drank from Handpump #14 were <strong className="text-navy">4.0 times more likely</strong> to fall ill compared to those who did not drink from it (60.0% attack rate vs 15.0%).
                    </p>
                    <p className="text-xs text-muted mt-2 leading-relaxed">
                      The 95% confidence interval spans from <strong className="text-navy">2.62 to 6.11</strong>. Because the lower bound is well above 1.0, this elevated risk is statistically significant.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-borderline flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-navy block">Recommended Next Step:</span>
                      <span className="text-muted">Prioritize Handpump #14 for physical inspection & water sampling.</span>
                    </div>
                    <span className="px-3 py-1 rounded bg-navy text-white font-bold text-[11px] whitespace-nowrap">
                      PRIORITY 1
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* 2x2 Breakdown Table for Well 3 */}
                <div className="lg:col-span-7 bg-white rounded-xl border border-borderline p-5 shadow-subtle">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-navy uppercase tracking-wider">
                      2x2 Contingency Matrix: Well #3
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-canvas text-muted border border-borderline">
                      a=30, b=70, c=36, d=84
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-canvas text-muted border-b border-borderline">
                          <th className="py-2.5 px-3">Exposure Status</th>
                          <th className="py-2.5 px-3 text-right">Ill (Cases)</th>
                          <th className="py-2.5 px-3 text-right">Well (Healthy)</th>
                          <th className="py-2.5 px-3 text-right">Total</th>
                          <th className="py-2.5 px-3 text-right font-bold text-navy">Attack Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-borderline">
                        <tr className="hover:bg-aqua/10">
                          <td className="py-2.5 px-3 font-semibold text-navy">Drank from Well #3</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-navy">30</td>
                          <td className="py-2.5 px-3 text-right font-mono text-muted">70</td>
                          <td className="py-2.5 px-3 text-right font-mono text-muted">100</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-muted">30.0%</td>
                        </tr>
                        <tr className="hover:bg-aqua/10">
                          <td className="py-2.5 px-3 font-semibold text-muted">Did Not Drink</td>
                          <td className="py-2.5 px-3 text-right font-mono text-muted">36</td>
                          <td className="py-2.5 px-3 text-right font-mono text-muted">84</td>
                          <td className="py-2.5 px-3 text-right font-mono text-muted">120</td>
                          <td className="py-2.5 px-3 text-right font-mono text-muted">30.0%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <p className="text-[11px] text-muted mt-3">
                    * Both exposed and unexposed groups exhibit an identical 30.0% attack rate.
                  </p>
                </div>

                {/* Plain-Language Interpretation Panel */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-canvas border border-borderline rounded-xl p-5">
                    <span className="text-xs font-bold text-muted uppercase tracking-wide block">
                      Plain-Language Evidence Summary
                    </span>
                    <h4 className="text-xl font-bold text-navy mt-1">
                      No Excess Risk Observed (RR: 1.00)
                    </h4>
                    <p className="text-sm text-main mt-2 leading-relaxed">
                      Illness occurred at exactly the same rate (30.0%) among people who used Well #3 and those who did not.
                    </p>
                    <p className="text-xs text-muted mt-2 leading-relaxed">
                      The relative risk is exactly 1.00. Exposure to this well shows no statistical connection to the outbreak in this cohort.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-borderline flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-navy block">Recommended Next Step:</span>
                      <span className="text-muted">Deprioritize inspection; focus sampling supplies on Handpump #14.</span>
                    </div>
                    <span className="px-3 py-1 rounded bg-canvas text-muted border border-borderline font-bold text-[11px] whitespace-nowrap">
                      LOW PRIORITY
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: THE PROBLEM
      ========================================================================= */}
      <section className="py-20 bg-canvas border-b border-borderline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-teal tracking-wider uppercase">The Public Health Challenge</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy mt-2">
              Finding the right lead should not mean guessing.
            </h2>
            <p className="text-base sm:text-lg text-muted mt-3">
              During waterborne surges, health authorities operate under immense time pressure and incomplete field intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Problem 1 */}
            <div className="bg-white rounded-2xl border border-borderline p-7 shadow-subtle hover:shadow-card transition-all">
              <div className="w-12 h-12 rounded-xl bg-aqua text-teal flex items-center justify-center font-bold text-lg mb-5">
                <svg className="w-6 h-6 stroke-teal" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-navy">1. Information is scattered.</h3>
              <p className="text-sm text-muted mt-2.5 leading-relaxed">
                Clinic logs, household questionnaires, and municipal maps arrive in disjointed spreadsheets with conflicting column headers and unvalidated entries.
              </p>
            </div>

            {/* Problem 2 */}
            <div className="bg-white rounded-2xl border border-borderline p-7 shadow-subtle hover:shadow-card transition-all">
              <div className="w-12 h-12 rounded-xl bg-aqua text-teal flex items-center justify-center font-bold text-lg mb-5">
                <svg className="w-6 h-6 stroke-teal" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-navy">2. The evidence is incomplete.</h3>
              <p className="text-sm text-muted mt-2.5 leading-relaxed">
                Many patients cannot remember which tap they drank from. Silently discarding unknown answers or treating them as unexposed leads to false conclusions.
              </p>
            </div>

            {/* Problem 3 */}
            <div className="bg-white rounded-2xl border border-borderline p-7 shadow-subtle hover:shadow-card transition-all">
              <div className="w-12 h-12 rounded-xl bg-aqua text-teal flex items-center justify-center font-bold text-lg mb-5">
                <svg className="w-6 h-6 stroke-teal" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-navy">3. Time is strictly limited.</h3>
              <p className="text-sm text-muted mt-2.5 leading-relaxed">
                Field inspectors cannot test every pump simultaneously. They need a transparent, defensible ranking to allocate testing kits and containment teams where risk is highest.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: HOW IT WORKS
      ========================================================================= */}
      <section id="how-it-works" className="py-20 bg-white border-b border-borderline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-teal tracking-wider uppercase">Systematic Investigation Workflow</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy mt-2">
              Four steps from survey data to a clearer investigation plan.
            </h2>
            <p className="text-base sm:text-lg text-muted mt-3">
              AquaTrace follows standard field epidemiology protocols to transform raw logs into verifiable action.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="bg-canvas rounded-2xl p-6 border border-borderline hover:border-teal/50 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-navy text-white flex items-center justify-center font-bold text-sm mb-4">
                  01
                </div>
                <h4 className="text-base font-bold text-navy">Upload the data</h4>
                <p className="text-xs text-muted mt-2 leading-relaxed">
                  Import an RFC-4180 CSV containing participant illness status and water-source exposure columns.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-borderline text-[11px] font-mono text-teal font-semibold">
                &bull; Auto header matching
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-canvas rounded-2xl p-6 border border-borderline hover:border-teal/50 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-navy text-white flex items-center justify-center font-bold text-sm mb-4">
                  02
                </div>
                <h4 className="text-base font-bold text-navy">Check information</h4>
                <p className="text-xs text-muted mt-2 leading-relaxed">
                  Validate row errors, detect duplicate participant IDs, and separate unknown exposures without silent data loss.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-borderline text-[11px] font-mono text-teal font-semibold">
                &bull; Zero silent filtering
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-canvas rounded-2xl p-6 border border-borderline hover:border-teal/50 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-navy text-white flex items-center justify-center font-bold text-sm mb-4">
                  03
                </div>
                <h4 className="text-base font-bold text-navy">Compare sources</h4>
                <p className="text-xs text-muted mt-2 leading-relaxed">
                  Compute attack rates and relative risks with 95% Katz log-Wald confidence intervals and zero-cell corrections.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-borderline text-[11px] font-mono text-teal font-semibold">
                &bull; 100% deterministic math
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-canvas rounded-2xl p-6 border border-borderline hover:border-teal/50 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-navy text-white flex items-center justify-center font-bold text-sm mb-4">
                  04
                </div>
                <h4 className="text-base font-bold text-navy">Prepare next steps</h4>
                <p className="text-xs text-muted mt-2 leading-relaxed">
                  Replay evidence across time cutoffs and export an audit-ready Field Investigation Brief PDF for municipal teams.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-borderline text-[11px] font-mono text-teal font-semibold">
                &bull; Audit-ready PDF brief
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: FEATURES
      ========================================================================= */}
      <section id="features" className="py-20 bg-canvas border-b border-borderline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-teal tracking-wider uppercase">Built for Public Health Professionals</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy mt-2">
              Everything needed to examine the evidence more clearly.
            </h2>
            <p className="text-base sm:text-lg text-muted mt-3">
              Engineered with data integrity, statistical precision, and clear field communication at its core.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-7 border border-borderline shadow-subtle hover:shadow-card transition-all">
              <div className="w-11 h-11 rounded-xl bg-aqua text-teal flex items-center justify-center font-bold mb-5">
                <svg className="w-6 h-6 stroke-teal" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-navy">CSV Ingestion & Audit</h3>
              <p className="text-sm text-muted mt-2 leading-relaxed">
                Accepts survey spreadsheets, checks for malformed headers or duplicate participants, and shows an actionable issue report before committing.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-7 border border-borderline shadow-subtle hover:shadow-card transition-all">
              <div className="w-11 h-11 rounded-xl bg-aqua text-teal flex items-center justify-center font-bold mb-5">
                <svg className="w-6 h-6 stroke-teal" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-navy">Deterministic 2x2 Engine</h3>
              <p className="text-sm text-muted mt-2 leading-relaxed">
                Calculates attack rates, relative risk, and Wald 95% confidence intervals using audited Python formulas—never delegated to an LLM.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-7 border border-borderline shadow-subtle hover:shadow-card transition-all">
              <div className="w-11 h-11 rounded-xl bg-aqua text-teal flex items-center justify-center font-bold mb-5">
                <svg className="w-6 h-6 stroke-teal" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-navy">Zero-Leakage Timeline Replay</h3>
              <p className="text-sm text-muted mt-2 leading-relaxed">
                Rewind the investigation to any previous date cutoff. Future evidence is strictly excluded from earlier calculations.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-2xl p-7 border border-borderline shadow-subtle hover:shadow-card transition-all">
              <div className="w-11 h-11 rounded-xl bg-aqua text-teal flex items-center justify-center font-bold mb-5">
                <svg className="w-6 h-6 stroke-teal" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-navy">Validated Source Mapping</h3>
              <p className="text-sm text-muted mt-2 leading-relaxed">
                Visualizes water points only when confirmed GPS coordinates exist. The system never infers exposure from proximity alone.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-2xl p-7 border border-borderline shadow-subtle hover:shadow-card transition-all">
              <div className="w-11 h-11 rounded-xl bg-aqua text-teal flex items-center justify-center font-bold mb-5">
                <svg className="w-6 h-6 stroke-teal" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-navy">Field Brief PDF Export</h3>
              <p className="text-sm text-muted mt-2 leading-relaxed">
                Produces publication-grade, monochromatic PDF briefs complete with provenance fingerprints, 2x2 tables, and clear caveats.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-2xl p-7 border border-borderline shadow-subtle hover:shadow-card transition-all">
              <div className="w-11 h-11 rounded-xl bg-aqua text-teal flex items-center justify-center font-bold mb-5">
                <svg className="w-6 h-6 stroke-teal" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-navy">Guardrailed Plain Explanations</h3>
              <p className="text-sm text-muted mt-2 leading-relaxed">
                Translates verified statistics into natural language briefings with strict boundaries: never recalculates figures or invents medical claims.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: EXPLAIN THE EVIDENCE & MATH
      ========================================================================= */}
      <section id="evidence" className="py-20 bg-white border-b border-borderline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold text-teal tracking-wider uppercase">Epidemiological Transparency</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-navy leading-tight">
                Understand why a source deserves attention.
              </h2>
              <p className="text-base text-muted leading-relaxed">
                Public health decisions require transparent numbers. In AquaTrace, every relative risk value is tied to an explicit numerator and denominator:
              </p>

              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-xl bg-canvas border border-borderline">
                  <h4 className="text-sm font-bold text-navy">Exposed Attack Rate (AR_e = a / n_e)</h4>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    The percentage of individuals who fell ill among all individuals who drank from this specific water source.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-canvas border border-borderline">
                  <h4 className="text-sm font-bold text-navy">Unexposed Attack Rate (AR_u = c / n_u)</h4>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    The baseline percentage of individuals who fell ill without drinking from this water source.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-aqua/50 border border-teal/20">
                  <h4 className="text-sm font-bold text-navy">Relative Risk (RR = AR_e / AR_u)</h4>
                  <p className="text-xs text-main mt-1 leading-relaxed">
                    The ratio comparing the two rates. A relative risk of 4.0 means illness was 4 times as common in the exposed cohort.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="bg-canvas border border-borderline rounded-2xl p-6 shadow-card">
                <div className="flex items-center justify-between pb-3 border-b border-borderline text-xs font-mono">
                  <span className="font-bold text-navy">MATHEMATICAL RIGOR // CDC PROTOCOL</span>
                  <span className="text-teal font-semibold">KATZ LOG-WALD 95% CI</span>
                </div>

                <div className="mt-5 space-y-4 text-xs font-mono text-muted">
                  <div className="p-3 bg-white rounded-lg border border-borderline">
                    <span className="text-[10px] text-muted block uppercase">Standard Error Formula</span>
                    <span className="text-xs font-bold text-navy block mt-0.5">
                      SE(ln(RR)) = &radic;[ 1/a - 1/n_e + 1/c - 1/n_u ]
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-borderline">
                    <span className="text-[10px] text-muted block uppercase">Haldane-Anscombe Zero-Cell Correction</span>
                    <span className="text-xs font-bold text-navy block mt-0.5">
                      If any cell = 0, add 0.5 to prevent division-by-zero errors.
                    </span>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-borderline">
                    <span className="text-xs font-bold text-navy block uppercase mb-1">
                      Scientific Integrity Invariant
                    </span>
                    <p className="text-xs text-muted font-sans leading-relaxed">
                      A statistical association indicates where further investigation is urgently needed. It does not replace physical inspection or laboratory water culture.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: RESPONSIBLE USE
      ========================================================================= */}
      <section id="responsible-use" className="py-20 bg-canvas border-b border-borderline">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="text-xs font-bold text-teal tracking-wider uppercase">Human Decision Authority</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-navy">
            Evidence that informs decisions, not replaces them.
          </h2>
          <p className="text-base sm:text-lg text-muted max-w-3xl mx-auto leading-relaxed">
            AquaTrace is built to assist qualified epidemiologists and water authorities. The platform never issues automatic emergency shutdown orders, makes medical diagnoses, or acts as an autonomous agent.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 text-left">
            <div className="bg-white p-5 rounded-xl border border-borderline">
              <h4 className="text-sm font-bold text-navy">Human-in-the-Loop</h4>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Response tasks, water testing assignments, and advisories are logged and approved manually by officers.
              </p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-borderline">
              <h4 className="text-sm font-bold text-navy">Privacy First</h4>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Uses pseudonymous participant IDs and coarse area labels. Identifiable health data is never shared.
              </p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-borderline">
              <h4 className="text-sm font-bold text-navy">Transparent Auditability</h4>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Every calculation snapshot records the immutable dataset version hash, timestamp, and methodology parameters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 9: FINAL CALL TO ACTION
      ========================================================================= */}
      <section className="py-20 bg-gradient-to-br from-navy via-navy to-teal-dark text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Start with the data you have.
          </h2>
          <p className="text-base sm:text-xl text-aqua/90 max-w-2xl mx-auto leading-relaxed">
            Organise your investigation, compare possible water sources, and prepare clearer next steps using transparent mathematical evidence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/investigation"
              className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-navy bg-white hover:bg-aqua rounded-xl shadow-float hover:shadow-card transition-all"
            >
              Launch Outbreak Workstation
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-white bg-teal hover:bg-teal-light border border-teal-light/40 rounded-xl transition-all"
            >
              Officer Access Gateway
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 10: FOOTER
      ========================================================================= */}
      <footer className="bg-white border-t border-borderline py-12 text-xs text-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-lg bg-navy flex items-center justify-center text-white font-bold text-xs">
              A
            </div>
            <span className="font-bold text-navy text-sm">AquaTrace</span>
            <span className="border-l border-borderline pl-3 text-muted">
              Evidence-First Waterborne Outbreak Investigation
            </span>
          </div>

          <div className="flex items-center space-x-6 text-muted">
            <a href="#overview" className="hover:text-navy transition-colors">Overview</a>
            <a href="#how-it-works" className="hover:text-navy transition-colors">Methodology</a>
            <a href="#features" className="hover:text-navy transition-colors">Features</a>
            <Link href="/login" className="hover:text-navy transition-colors">Officer Gateway</Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pt-6 border-t border-borderline text-center text-[11px] text-muted">
          AquaTrace supports investigation prioritisation. An observed statistical association does not prove contamination or replace laboratory water culture testing.
        </div>
      </footer>
    </div>
  );
}
