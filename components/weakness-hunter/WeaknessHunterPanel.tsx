"use client";

import { useState } from "react";
import { SEVERITY_CONFIG, type Weakness } from "@/lib/weakness-data";
import { Button } from "@/components/ui/button";
import { X, AlertTriangle, RotateCcw, ChevronRight, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

/* ─── LogicReplay Modal ──────────────────────────────────────────── */

function LogicReplayModal({ weakness, onClose }: { weakness: Weakness; onClose: () => void }) {
  const [activeStep, setActiveStep] = useState(0);
  const [showFix, setShowFix] = useState(false);

  const step = weakness.codeSteps[activeStep];

  return (
    <div className="fixed inset-0 z-50 bg-zinc-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-3xl bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.2)] border border-[#A79277]/30 overflow-hidden animate-in zoom-in-95 duration-400">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#A79277]/10 bg-gradient-to-r from-[#FFF2E1]/80 to-white/80">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl flex items-center justify-center shadow-inner" style={{ backgroundColor: SEVERITY_CONFIG[weakness.severity].bg }}>
              <RotateCcw className="h-6 w-6" style={{ color: SEVERITY_CONFIG[weakness.severity].color }} />
            </div>
            <div>
              <h3 className="font-black text-xl text-zinc-900 drop-shadow-sm">LogicReplay: {weakness.title}</h3>
              <p className="text-sm font-medium text-[#6B5A47] mt-0.5">Step through your mistake line by line</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-10 w-10 hover:bg-[#A79277]/10">
            <X className="h-5 w-5 text-zinc-500" />
          </Button>
        </div>

        {/* Code Trace */}
        <div className="p-6 bg-[#FDF9F1]/50">
          {(!weakness.codeSteps || weakness.codeSteps.length === 0) ? (
            <div className="bg-[#1e1e1e] rounded-2xl p-10 text-center border border-zinc-700/50 shadow-inner flex flex-col items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-zinc-500" />
              </div>
              <p className="text-zinc-400 font-medium">No code trace was recorded for this weakness.</p>
              <p className="text-zinc-500 text-sm mt-2">Only the description and fix are available.</p>
            </div>
          ) : (
            <div className="bg-[#1e1e1e] rounded-2xl overflow-hidden border border-zinc-700/50 shadow-inner">
              {/* Code lines */}
              <div className="p-5 font-mono text-sm leading-relaxed">
                {Array.isArray(weakness.codeSteps) && weakness.codeSteps.map((s, i) => (
                  <div
                    key={s.line || i}
                    className={`
                      flex gap-4 px-3 py-2 rounded-lg transition-all duration-300 cursor-pointer border-l-4
                      ${i === activeStep ? (s.isError ? "bg-[#ef4444]/20 border-[#ef4444]" : "bg-[#3b82f6]/20 border-[#3b82f6]") : "hover:bg-white/5 border-transparent"}
                      ${i < activeStep ? "opacity-60" : ""}
                    `}
                    onClick={() => { setActiveStep(i); setShowFix(false); }}
                  >
                    <span className="text-zinc-600 w-6 text-right shrink-0 select-none font-bold">{s.line || i + 1}</span>
                    <span className={s.isError && i === activeStep ? "text-[#ef4444] font-bold" : "text-zinc-300"}>{s.code}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Explanation bubble */}
          {step && step.explanation && (
            <div className={`mt-5 p-5 rounded-2xl border-l-4 text-sm leading-relaxed animate-in slide-in-from-bottom-2 duration-300 shadow-sm backdrop-blur-md ${
              step.isError 
                ? "bg-[#ef4444]/10 border-[#ef4444] text-[#991b1b]" 
                : "bg-[#3b82f6]/10 border-[#3b82f6] text-[#1e40af]"
            }`}>
              <p className="font-black text-xs uppercase tracking-[0.15em] mb-1.5 opacity-80 flex items-center gap-2">
                {step.isError ? "⚠️ Bug Detected" : `Line ${step.line || activeStep + 1} Explanation`}
              </p>
              <p className="font-medium text-[15px]">{step.explanation}</p>
            </div>
          )}

          {/* Fix section */}
          {(showFix || (!weakness.codeSteps || weakness.codeSteps.length === 0)) && weakness.fix && (
            <div className="mt-5 p-5 rounded-2xl bg-[#10b981]/10 border border-[#10b981]/30 animate-in slide-in-from-bottom-2 duration-400 shadow-sm backdrop-blur-md">
              <p className="font-black text-xs uppercase tracking-[0.15em] text-[#047857] mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                The Fix
              </p>
              <p className="text-[15px] font-medium text-[#065f46] leading-relaxed">{weakness.fix}</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between p-6 border-t border-[#A79277]/10 bg-white/80">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={activeStep === 0 || !weakness.codeSteps || weakness.codeSteps.length === 0}
              onClick={() => { setActiveStep((p) => p - 1); setShowFix(false); }}
              className="border-[#A79277]/30 hover:bg-[#FFF2E1] hover:text-[#A79277] text-zinc-600 rounded-xl"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!weakness.codeSteps || weakness.codeSteps.length === 0 || activeStep === weakness.codeSteps.length - 1}
              onClick={() => { setActiveStep((p) => p + 1); setShowFix(false); }}
              className="border-[#A79277]/30 hover:bg-[#FFF2E1] hover:text-[#A79277] text-zinc-600 rounded-xl"
            >
              Next
            </Button>
            <span className="text-xs font-bold text-[#A79277] ml-3 tracking-widest uppercase">
              {(!weakness.codeSteps || weakness.codeSteps.length === 0) ? "No Steps" : `Step ${activeStep + 1} / ${weakness.codeSteps.length}`}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {!showFix && (
              <Button
                size="sm"
                onClick={() => setShowFix(true)}
                className="bg-gradient-to-r from-[#10b981] to-[#34d399] hover:opacity-90 text-white rounded-xl shadow-md font-bold tracking-wide border-none"
              >
                <Zap className="mr-1.5 h-4 w-4" />
                Show Fix
              </Button>
            )}
            <Link href="/pairmentor">
              <Button size="sm" className="bg-gradient-to-r from-[#8C7A61] to-[#A79277] hover:opacity-90 text-white rounded-xl shadow-md font-bold tracking-wide border-none">
                <ArrowRight className="mr-1.5 h-4 w-4" />
                Practice This
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Weakness Card ──────────────────────────────────────────────── */

function WeaknessCard({ weakness, onReplay }: { weakness: Weakness; onReplay: () => void }) {
  const config = SEVERITY_CONFIG[weakness.severity];

  const formattedDate = (() => {
    try {
      const d = new Date(weakness.lastSeen);
      return isNaN(d.getTime()) ? weakness.lastSeen : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(d);
    } catch {
      return weakness.lastSeen;
    }
  })();

  return (
    <div className="p-6 rounded-[1.5rem] border bg-white/70 backdrop-blur-md hover:bg-white hover:shadow-[0_15px_40px_rgba(167,146,119,0.12)] transition-all duration-400 group border-[#A79277]/20 hover:border-[#A79277]/50 hover:-translate-y-1.5 cursor-pointer flex flex-col h-full">
      <div className="flex items-start justify-between mb-4 gap-2">
        <div className="flex flex-wrap items-start gap-1.5">
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full shadow-sm border border-zinc-100">
            <div className="h-1.5 w-1.5 rounded-full shrink-0 shadow-sm animate-pulse" style={{ backgroundColor: config.color, boxShadow: `0 0 8px ${config.color}80` }} />
            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: config.color }}>
              {config.label}
            </span>
          </div>
          <span className="text-[9px] text-[#8C7A61] bg-[#FFF2E1]/80 px-2.5 py-1 rounded-full font-black uppercase tracking-widest border border-[#A79277]/10">{weakness.category}</span>
        </div>
      </div>

      <div className="flex-1">
        <h4 className="font-black text-lg text-zinc-900 mb-2 group-hover:text-[#A79277] transition-colors leading-tight">{weakness.title}</h4>
        <p className="text-[13px] font-medium text-zinc-500 leading-relaxed mb-6 line-clamp-2">{weakness.description}</p>
      </div>

      <div className="flex items-center justify-between mb-5 pb-5 border-b border-[#A79277]/10">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#A79277] mb-0.5">Occurrences</span>
          <span className="text-xl font-black text-zinc-800">{weakness.occurrences}x</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#A79277] mb-0.5">Last Seen</span>
          <span className="text-sm font-bold text-zinc-600">{formattedDate}</span>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={(e) => { e.stopPropagation(); onReplay(); }}
        className="w-full h-11 border-[#A79277]/30 text-[#8C7A61] bg-[#FFF2E1]/30 hover:bg-[#A79277] hover:text-white hover:border-[#A79277] transition-all rounded-xl font-bold tracking-wide shadow-sm"
      >
        <RotateCcw className="mr-2 h-4 w-4" />
        Replay Mistake
      </Button>
    </div>
  );
}

/* ─── Main Panel ─────────────────────────────────────────────────── */

interface WeaknessHunterPanelProps {
  compact?: boolean;
  weaknesses: Weakness[];
}

export function WeaknessHunterPanel({ compact = false, weaknesses }: WeaknessHunterPanelProps) {
  const [replayTarget, setReplayTarget] = useState<Weakness | null>(null);
  const displayWeaknesses = compact ? weaknesses.slice(0, 3) : weaknesses;

  return (
    <>
      <div className={`flex flex-col ${compact ? "gap-4" : "gap-6"}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#FFF2E1] flex items-center justify-center border border-[#A79277]/20 shadow-sm">
              <AlertTriangle className="h-5 w-5 text-[#A79277]" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-zinc-900 drop-shadow-sm">Weakness Hunter</h3>
              <p className="text-xs font-medium text-[#6B5A47]">Your recurring logical mistakes</p>
            </div>
          </div>
          {compact && (
            <Link href="/pairmentor" className="text-[11px] font-bold uppercase tracking-wider text-[#A79277] hover:text-[#8C7A61] flex items-center gap-1 transition-colors bg-[#FFF2E1]/50 px-3 py-1.5 rounded-full hover:bg-[#FFF2E1]">
              View All <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        {/* Cards */}
        <div className={`grid grid-cols-1 ${compact ? "gap-3" : "gap-5 sm:grid-cols-2 lg:grid-cols-3"}`}>
          {displayWeaknesses.length > 0 ? (
            displayWeaknesses.map((w) => (
              <WeaknessCard key={w.id} weakness={w} onReplay={() => setReplayTarget(w)} />
            ))
          ) : (
            <div className="col-span-full p-10 text-center border rounded-[2rem] border-dashed border-[#A79277]/30 bg-white/40 backdrop-blur-sm">
              <p className="text-base font-bold text-[#6B5A47]">No weaknesses found. You're doing great! 🎉</p>
            </div>
          )}
        </div>
      </div>

      {/* LogicReplay Modal */}
      {replayTarget && (
        <LogicReplayModal weakness={replayTarget} onClose={() => setReplayTarget(null)} />
      )}
    </>
  );
}
