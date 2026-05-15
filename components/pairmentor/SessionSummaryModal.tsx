"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  X, Download, Clock, MessageCircle, Code2, HelpCircle,
  Trophy, AlertTriangle, TrendingUp, ChevronDown, ChevronUp,
  Sparkles, Target, BookOpen,
} from "lucide-react";
import type { SessionAnalysis, ChatMessage } from "@/lib/sessionAnalyzer";
import { generateSessionPDF } from "@/lib/generateSessionPDF";

interface SessionSummaryModalProps {
  analysis: SessionAnalysis;
  messages: ChatMessage[];
  studentName: string;
  targetRole: string;
  sessionMode: "mentor" | "interview";
  sessionDate: Date;
  onClose: () => void;
}

export function SessionSummaryModal({
  analysis,
  messages,
  studentName,
  targetRole,
  sessionMode,
  sessionDate,
  onClose,
}: SessionSummaryModalProps) {
  const [showTranscript, setShowTranscript] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      await generateSessionPDF(analysis, messages, studentName, targetRole, sessionMode, sessionDate);
    } catch (err) {
      console.error("[PDF] Generation failed:", err);
      alert("Failed to generate PDF. Check console for details.");
    } finally {
      setIsGenerating(false);
    }
  };

  const ratingColor =
    analysis.overallRating === "Excellent" ? "text-emerald-500" :
    analysis.overallRating === "Good" ? "text-amber-500" : "text-red-500";

  const ratingBg =
    analysis.overallRating === "Excellent" ? "bg-emerald-500/10 border-emerald-500/20" :
    analysis.overallRating === "Good" ? "bg-amber-500/10 border-amber-500/20" : "bg-red-500/10 border-red-500/20";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-md" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 flex flex-col"
        style={{
          background: "rgba(253, 249, 241, 0.92)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(167, 146, 119, 0.25)",
        }}
      >
        {/* ── Header ───────────────────────────────────────── */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-[#A79277]/15">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A79277] to-[#8C7A61] flex items-center justify-center shadow-md">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-zinc-900 tracking-tight">Session Summary</h2>
              <p className="text-xs text-[#8C7A61] font-medium mt-0.5">
                {sessionDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                {" · "}
                {analysis.metrics.durationMinutes} min
                {" · "}
                {sessionMode === "interview" ? "Mock Interview" : "Mentor Mode"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 hover:bg-[#A79277]/10 transition-colors"
          >
            <X className="h-5 w-5 text-[#A79277]" />
          </button>
        </div>

        {/* ── Scrollable Content ────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

          {/* Rating Badge */}
          <div className="flex justify-center">
            <div className={`px-6 py-3 rounded-2xl border ${ratingBg} flex items-center gap-3`}>
              <Trophy className={`h-6 w-6 ${ratingColor}`} />
              <div>
                <p className={`text-lg font-black ${ratingColor}`}>{analysis.overallRating}</p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Overall Rating</p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <p className="text-sm text-[#5C4A3A] leading-relaxed text-center font-medium px-4">
            {analysis.summary}
          </p>

          {/* Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Clock, label: "Duration", value: `${analysis.metrics.durationMinutes}m` },
              { icon: MessageCircle, label: "Messages", value: `${analysis.metrics.totalMessages}` },
              { icon: Code2, label: "Code Subs", value: `${analysis.metrics.codeSubmissions}` },
              { icon: HelpCircle, label: "Questions", value: `${analysis.metrics.questionsAsked}` },
            ].map((m, i) => (
              <div key={i} className="bg-white/60 rounded-xl p-3 border border-[#A79277]/10 text-center">
                <m.icon className="h-4 w-4 text-[#A79277] mx-auto mb-1" />
                <p className="text-lg font-black text-zinc-900">{m.value}</p>
                <p className="text-[10px] text-[#8C7A61] font-bold uppercase tracking-wider">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Key Takeaways */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-[#A79277]" />
              <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Key Takeaways</h3>
            </div>
            <div className="space-y-2">
              {analysis.keyTakeaways.map((item, i) => (
                <div key={i} className="flex items-start gap-2 bg-white/50 rounded-xl px-4 py-2.5 border border-[#A79277]/10">
                  <span className="text-[#A79277] font-black text-xs mt-0.5">{i + 1}.</span>
                  <p className="text-sm text-[#5C4A3A] font-medium">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Strengths</h3>
            </div>
            <div className="space-y-2">
              {analysis.strengths.map((s, i) => (
                <div key={i} className="bg-emerald-50/80 border border-emerald-200/50 rounded-xl px-4 py-3">
                  <p className="text-sm font-bold text-emerald-700">✓ {s.title}</p>
                  <p className="text-xs text-emerald-600/80 mt-0.5">{s.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Weaknesses */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Areas to Improve</h3>
            </div>
            <div className="space-y-2">
              {analysis.weaknesses.map((w, i) => (
                <div key={i} className="bg-amber-50/80 border border-amber-200/50 rounded-xl px-4 py-3">
                  <p className="text-sm font-bold text-amber-700">⚠ {w.title}</p>
                  <p className="text-xs text-amber-600/80 mt-0.5">{w.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Improvements */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-[#A79277]" />
              <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Next Steps</h3>
            </div>
            <div className="space-y-2">
              {analysis.improvements.map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-white/50 rounded-xl px-4 py-2.5 border border-[#A79277]/10">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#A79277] text-white text-[10px] font-black flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-[#5C4A3A] font-medium">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Transcript Toggle */}
          <div>
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="flex items-center gap-2 text-sm font-bold text-[#A79277] hover:text-[#8C7A61] transition-colors w-full"
            >
              {showTranscript ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {showTranscript ? "Hide" : "Show"} Full Transcript ({messages.length} messages)
            </button>
            {showTranscript && (
              <div className="mt-3 space-y-2 max-h-72 overflow-y-auto rounded-xl border border-[#A79277]/10 bg-white/40 p-3">
                {messages.map((m, i) => (
                  <div key={i} className={`flex gap-2 ${m.is_user ? "flex-row-reverse" : ""}`}>
                    <span className={`text-[10px] font-black uppercase tracking-wider mt-1 flex-shrink-0 ${m.is_user ? "text-[#A79277]" : "text-zinc-400"}`}>
                      {m.is_user ? "You" : "AI"}
                    </span>
                    <p className={`text-xs leading-relaxed px-3 py-2 rounded-xl max-w-[85%] ${
                      m.is_user
                        ? "bg-[#A79277]/10 text-[#5C4A3A] ml-auto"
                        : "bg-white text-zinc-700 border border-zinc-100"
                    }`}>
                      {m.message_text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Footer Actions ────────────────────────────── */}
        <div className="p-4 border-t border-[#A79277]/15 flex items-center justify-between gap-3 bg-white/40">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl border-[#A79277]/20 text-[#8C7A61] hover:bg-[#A79277]/5 font-bold"
          >
            Close
          </Button>
          <Button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="rounded-xl bg-zinc-900 hover:bg-[#A79277] text-white font-bold px-6 shadow-lg hover:shadow-[#A79277]/30 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
          >
            {isGenerating ? (
              <><Download className="mr-2 h-4 w-4 animate-bounce" />Generating...</>
            ) : (
              <><Download className="mr-2 h-4 w-4" />Download PDF Report</>
            )}
          </Button>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(167, 146, 119, 0.25);
          border-radius: 999px;
        }
      `}</style>
    </div>
  );
}
