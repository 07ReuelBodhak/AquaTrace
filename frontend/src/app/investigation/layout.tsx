import React from "react";
import Link from "next/link";

export default function InvestigationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-main font-sans">
      {/* Workstation Top Navigation Bar */}
      <header className="flex justify-between items-center w-full px-6 h-16 border-b border-borderline bg-white select-none">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-navy flex items-center justify-center text-white">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 stroke-white" strokeWidth="2.2">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            </div>
            <span className="text-base font-bold text-navy tracking-tight group-hover:text-teal transition-colors">
              AquaTrace <span className="font-normal text-muted text-xs ml-1 uppercase">/ Workstation</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1 h-16 text-xs uppercase font-medium">
            <Link
              href="/"
              className="h-16 flex items-center px-3 text-muted hover:text-navy transition-colors"
            >
              &larr; Overview
            </Link>
            <Link
              href="/investigation"
              className="h-16 flex items-center px-3 border-b-2 border-teal text-teal font-bold"
            >
              Active Investigation
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-teal/20 bg-aqua/50 text-teal-dark text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-teal animate-pulse inline-block" />
            <span className="font-semibold">SYSTEM READY // DETERMINISTIC ENGINE</span>
          </div>

          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-borderline bg-canvas hover:bg-aqua/40 text-navy text-xs font-semibold transition-colors"
            title="Switch or Authenticate Health Officer"
          >
            <svg className="w-3.5 h-3.5 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>DR. VANCE (OFFICER-741)</span>
          </Link>
        </div>
      </header>

      {/* Sub-header Meta Command Ribbon */}
      <section className="w-full bg-white border-b border-borderline px-6 py-2.5 flex flex-wrap justify-between items-center text-xs">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <div className="flex items-center space-x-1.5">
            <span className="text-muted font-medium">Active Outbreak:</span>
            <span className="font-bold text-navy bg-canvas px-2 py-0.5 rounded border border-borderline">
              Sector 4B Surveillance Survey
            </span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-muted font-medium">Jurisdiction:</span>
            <span className="text-main font-semibold">
              Metro Health Surveillance District
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-muted text-[11px]">
          <span>Statistical Standard: <strong className="text-navy">Katz Log-Wald 95% CI</strong></span>
          <span>&bull;</span>
          <span>Zero-Cell: <strong className="text-navy">Haldane-Anscombe (+0.5)</strong></span>
        </div>
      </section>

      {/* Main Investigation Content Shell */}
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}
