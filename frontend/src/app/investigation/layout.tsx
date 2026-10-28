import React from "react";

export default function InvestigationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans">
      {/* Workstation Top Navigation Bar */}
      <header className="flex justify-between items-center w-full px-4 h-12 border-b border-slate-700 bg-white select-none">
        <div className="flex items-center space-x-6">
          <a href="/" className="flex items-center space-x-2 group">
            <span className="w-3 h-3 bg-slate-900 inline-block" />
            <span className="text-sm tracking-tight text-slate-900 uppercase font-bold font-mono group-hover:underline">
              AquaTrace // WORKSTATION
            </span>
          </a>
          <nav className="hidden md:flex items-center space-x-1 h-12 font-mono text-xs uppercase">
            <a
              href="/"
              className="h-12 flex items-center px-3 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-none"
            >
              ← Back to Overview
            </a>
            <a
              href="/investigation"
              className="h-12 flex items-center px-3 border-b-2 border-slate-900 text-slate-900 font-semibold"
            >
              Active Investigation
            </a>
          </nav>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1 border border-slate-700 bg-white text-slate-900 font-mono text-xs uppercase">
            <span className="w-2 h-2 bg-slate-900 inline-block" />
            <span className="tracking-wider">SYSTEM ONLINE / READY</span>
          </div>
          <div className="hidden xl:flex items-center px-2 py-1 border border-slate-700 text-slate-700 font-mono text-xs">
            OFFICER ID: PH-9042
          </div>
        </div>
      </header>

      {/* Sub-header Meta Command Ribbon */}
      <section className="w-full bg-white border-b border-slate-700 px-4 py-1.5 flex flex-wrap justify-between items-center text-slate-900 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-700 uppercase">Investigation:</span>
            <span className="font-semibold bg-slate-100 px-1.5 py-0.5 border border-slate-700">
              Active Outbreak Survey
            </span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-700 uppercase">Cutoff:</span>
            <span className="bg-slate-100 px-1.5 py-0.5 border border-slate-700">
              Unfiltered (T=Now)
            </span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-700 uppercase">Surveillance Unit:</span>
            <span className="font-semibold bg-slate-900 text-white px-1.5 py-0.5">
              [MUNICIPAL SECTOR 4B]
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-slate-700">
          <span>SESSION: AQ-2026-09A</span>
          <span>AUDIT: ACTIVE</span>
        </div>
      </section>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col">{children}</div>

      {/* Telemetry Footer */}
      <footer className="h-6 bg-white border-t border-slate-700 px-4 flex justify-between items-center font-mono text-xs text-slate-700 select-none">
        <div className="flex items-center space-x-4">
          <span>SEC: UNCLASSIFIED // PUBLIC HEALTH DIRECTIVE</span>
          <span>NODE: LOCAL INSTANCE</span>
        </div>
        <div>
          <span>PALETTE: HIGH-CONTRAST SLATE (STRICT MONOCHROME)</span>
        </div>
      </footer>
    </div>
  );
}
