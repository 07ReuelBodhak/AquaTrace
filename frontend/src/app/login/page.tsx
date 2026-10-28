"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OfficerLoginPage() {
  const router = useRouter();
  const [badgeId, setBadgeId] = useState("");
  const [pin, setPin] = useState("");
  const [jurisdiction, setJurisdiction] = useState("Metro Surveillance Division");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuickFill = () => {
    setBadgeId("OFFICER-741");
    setPin("8492");
    setJurisdiction("Metro Surveillance Division");
    setErrorMessage(null);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!badgeId.trim()) {
      setErrorMessage("Health Officer Badge ID is required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const sessionData = {
        authenticated: true,
        officerBadge: badgeId.trim(),
        officerName: badgeId.trim() === "OFFICER-741" ? "Dr. Eleanor Vance" : `Officer ${badgeId.trim()}`,
        role: "Lead Field Epidemiologist",
        jurisdiction: jurisdiction,
        sessionToken: "AT-SESS-" + Math.floor(Math.random() * 900000 + 100000),
        loginTime: new Date().toISOString(),
      };
      sessionStorage.setItem("aquatrace_session", JSON.stringify(sessionData));
      
      setTimeout(() => {
        router.push("/investigation");
      }, 350);
    } catch {
      setErrorMessage("Failed to initialize session. Please check browser storage settings.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-main flex flex-col justify-between font-sans selection:bg-teal selection:text-white">
      {/* Top Utility Bar */}
      <header className="border-b border-borderline bg-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-navy to-teal flex items-center justify-center text-white shadow-subtle">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 stroke-white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            </div>
            <span className="font-bold tracking-tight text-lg text-navy">AquaTrace</span>
            <span className="border-l border-borderline pl-3 text-xs uppercase tracking-wider text-muted font-medium hidden sm:inline">
              Officer Access Gateway
            </span>
          </Link>

          <div className="flex items-center gap-4 text-xs">
            <Link
              href="/"
              className="text-muted hover:text-teal font-medium transition-colors"
            >
              &larr; Back to Overview
            </Link>
          </div>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md border border-borderline bg-white p-8 rounded-2xl shadow-card">
          {/* Card Header */}
          <div className="border-b border-borderline pb-4 mb-6">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-teal block mb-1">
              Surveillance Authority
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-navy">
              Health Officer Verification
            </h1>
            <p className="text-xs text-muted mt-1.5 leading-relaxed">
              Restricted workstation for authorized epidemiological surveillance personnel, water resource inspectors, and field directors.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="border border-danger/40 bg-danger/10 text-danger p-3 mb-5 text-xs rounded-lg leading-tight font-medium">
              <span className="font-bold">Access Denied:</span> {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="badgeId" className="block text-xs font-semibold text-navy mb-1.5 uppercase tracking-wide">
                Officer Badge Identifier
              </label>
              <input
                id="badgeId"
                type="text"
                value={badgeId}
                onChange={(e) => setBadgeId(e.target.value)}
                placeholder="e.g. OFFICER-741"
                className="w-full border border-borderline px-3.5 py-2.5 text-sm font-mono text-navy bg-white focus:outline-none focus:border-teal rounded-lg transition-colors"
                required
              />
            </div>

            <div>
              <label htmlFor="pin" className="block text-xs font-semibold text-navy mb-1.5 uppercase tracking-wide">
                Surveillance PIN / Secret Key
              </label>
              <input
                id="pin"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="****"
                className="w-full border border-borderline px-3.5 py-2.5 text-sm font-mono text-navy bg-white focus:outline-none focus:border-teal rounded-lg transition-colors"
              />
            </div>

            <div>
              <label htmlFor="jurisdiction" className="block text-xs font-semibold text-navy mb-1.5 uppercase tracking-wide">
                Health Jurisdiction Authority
              </label>
              <input
                id="jurisdiction"
                type="text"
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                className="w-full border border-borderline px-3.5 py-2.5 text-sm text-muted bg-canvas rounded-lg"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-teal text-white py-3 px-4 text-xs uppercase tracking-wider font-bold hover:bg-teal-dark rounded-xl shadow-subtle hover:shadow-card transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Authenticating Session..." : "Authorize Workstation Entry"}
              </button>
            </div>
          </form>

          {/* Demo Auto-Fill Box */}
          <div className="mt-6 border-t border-borderline pt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted">Development Testing?</span>
              <button
                type="button"
                onClick={handleQuickFill}
                className="text-teal hover:text-teal-dark font-bold underline transition-colors"
              >
                1-Click Auto-Fill (Dr. Vance)
              </button>
            </div>
          </div>

          {/* Compliance Disclaimer */}
          <div className="mt-6 border border-borderline bg-canvas p-3.5 rounded-xl text-[11px] text-muted leading-relaxed">
            <span className="font-bold text-navy uppercase tracking-wider block mb-0.5">
              Legal & Privacy Notice
            </span>
            All activities and data queries are recorded in the institutional audit log. Access is granted solely for legitimate outbreak investigations under public health statutory mandates.
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-borderline bg-white px-6 py-3 text-center text-xs text-muted">
        AquaTrace Surveillance Protocol 1.0 &bull; Water & Public Health Palette &bull; Zero Unauthorized Data Exposure
      </footer>
    </div>
  );
}
