import { memo } from "react";

function Sparkle({ className = "" }) {
  return (
    <svg aria-hidden="true" className={className} width="26" height="26" viewBox="0 0 26 26" fill="none">
      <path
        d="M13 2.5c.7 3.1 3.6 6.1 6.7 6.7-3.1.7-6.1 3.6-6.7 6.7-.7-3.1-3.6-6.1-6.7-6.7 3.1-.7 6.1-3.6 6.7-6.7Z"
        fill="currentColor"
      />
    </svg>
  );
}

export const MarketingPanel = memo(function MarketingPanel() {
  return (
    <div className="relative isolate flex h-full min-h-[440px] w-full items-center font-sans">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage: "radial-gradient(rgba(100,116,139,0.1) 1px, transparent 1px)",
          backgroundSize: "8px 8px",
          maskImage: "radial-gradient(85% 65% at 40% 35%, black 60%, transparent 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 left-10 h-64 w-64 rounded-full blur-3xl"
        style={{
          background: "radial-gradient(closest-side, rgba(245,158,11,0.45), rgba(20,184,166,0.18), transparent 70%)",
        }}
      />
      <div className="pointer-events-none absolute left-8 top-10 hidden h-40 w-40 rounded-full border border-slate-700/50 md:block animate-[orbit_18s_linear_infinite]" />
      <div className="pointer-events-none absolute right-8 bottom-10 hidden h-24 w-24 rounded-full border border-slate-700/50 md:block animate-[orbit_11s_linear_infinite]" />
      <Sparkle className="absolute left-6 top-6 text-slate-500" />
      <Sparkle className="absolute right-8 bottom-8 text-slate-600" />

      <div className="relative z-10 px-6 py-10 sm:px-10">
        <p className="mb-3 text-sm text-slate-300">Sweet Shop Excellence</p>
        <h2 className="text-pretty text-4xl font-bold leading-tight text-white sm:text-5xl">
          Complete full‑stack
          <br />
          sweet shop <span className="text-amber-400">management system</span>
        </h2>
        <p className="mt-4 max-w-md text-base leading-7 text-slate-300">
          Built with <span className="font-medium text-amber-400">TDD methodology</span> and{" "}
          <span className="font-medium text-teal-400">clean architecture</span>. Modern tech stack. Comprehensive testing.
        </p>
      </div>

      <style jsx>{`
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(6px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(6px) rotate(-360deg); }
        }
      `}</style>
    </div>
  );
});