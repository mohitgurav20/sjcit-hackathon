"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Code2, MessageCircleQuestion, X } from "lucide-react";
import { CodeEditor } from "@/components/pairmentor/CodeEditor";
import { VoiceInterface } from "@/components/pairmentor/VoiceInterface";
import { LogicForgeCanvas } from "@/components/pairmentor/LogicForgeCanvas";
import { SessionSummaryModal } from "@/components/pairmentor/SessionSummaryModal";
import { analyzeSession, type SessionAnalysis, type ChatMessage } from "@/lib/sessionAnalyzer";
import { supabase } from "@/lib/supabase";
const starterCode = `function binarySearch(arr: number[], target: number): number {
  // TODO: Implement binary search
  return -1;
}`;

export default function PairMentorPage() {
  const [code, setCode] = useState<string>(starterCode);
  const [showCanvas, setShowCanvas] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [mentorTask, setMentorTask] = useState<string | null>(null);
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);
  const [showSessionSummary, setShowSessionSummary] = useState(false);
  const [sessionAnalysisData, setSessionAnalysisData] = useState<{
    analysis: SessionAnalysis;
    messages: ChatMessage[];
    studentName: string;
    targetRole: string;
    sessionMode: "mentor" | "interview";
    sessionDate: Date;
  } | null>(null);

  const handleSessionEnd = useCallback(async (data: { durationMinutes: number; sessionMode: "mentor" | "interview" }) => {
    const DEMO_USER_ID = "00000000-0000-0000-0000-000000000000";

    try {
      // Fetch recent chat history, profile, and weaknesses in parallel
      const [historyRes, profileRes, weaknessesRes] = await Promise.all([
        supabase.from("chat_history").select("*").eq("user_id", DEMO_USER_ID).order("created_at", { ascending: true }).limit(200),
        supabase.from("profiles").select("*").eq("user_id", DEMO_USER_ID).single(),
        supabase.from("weaknesses").select("*").eq("user_id", DEMO_USER_ID),
      ]);

      const chatMessages: ChatMessage[] = (historyRes.data || []).map((m: any) => ({
        id: m.id,
        message_text: m.message_text,
        is_user: m.is_user,
        created_at: m.created_at,
      }));

      const profile = profileRes.data;
      const weaknesses = (weaknessesRes.data || []).map((w: any) => ({
        id: w.id,
        title: w.title,
        category: w.category,
        severity: w.severity,
        occurrences: w.occurrences,
        description: w.description,
      }));

      const analysis = analyzeSession(chatMessages, data.durationMinutes, data.sessionMode, weaknesses);

      setSessionAnalysisData({
        analysis,
        messages: chatMessages,
        studentName: profile?.name || "Student",
        targetRole: profile?.target_role || "Software Engineer",
        sessionMode: data.sessionMode,
        sessionDate: new Date(),
      });
      setShowSessionSummary(true);
    } catch (error) {
      console.error("[SessionSummary] Failed to generate summary:", error);
    }
  }, []);

  const handleTriggerCodeFocus = () => {
    // Automatically open the floating code editor modal
    setShowCodeEditor(true);
  };

  const handleMentorTask = useCallback((task: string | null) => {
    setMentorTask(task);
  }, []);

  const handleConvertLogicToCode = () => {
    setCode(`function binarySearch(arr: number[], target: number): number {
  // 1. Initialize variables / pointers
  let left = 0;
  let right = arr.length - 1;

  // 2. While / For loop
  while (left <= right) {
    // 3. Calculate mid
    const mid = Math.floor((left + right) / 2);

    // 4. Check condition
    if (arr[mid] === target) {
      // 5. Return result
      return mid;
    }

    // 6. Handle edge case / adjust pointers
    if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  // 7. Base case / Not found
  return -1;
}`);
    setShowCanvas(false);
    setShowCodeEditor(true);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">PairMentor Session</h1>
          <p className="text-muted-foreground mt-2">Interactive pair-programming with your AI mentor.</p>
        </div>
        <Button 
          onClick={() => setShowCanvas(true)}
          className="bg-accent text-accent-foreground hover:bg-accent/80 shadow-sm border border-border"
        >
          <Code2 className="mr-2 h-4 w-4 text-primary" />
          Open LogicForge Canvas
        </Button>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* "Mentor Asked:" — Current Question / Task Box               */}
      {/* Hidden by default. Appears when AI asks a question or task. */}
      {/* Dismisses when the student responds or manually closed.     */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {mentorTask && !showCodeEditor && (
        <div
          id="mentor-task-box"
          className="animate-in fade-in slide-in-from-top-3 duration-400 ease-out relative z-50"
          style={{
            background: "#FFF2E1",
            border: "1.5px solid #A79277",
            borderRadius: "14px",
            padding: "16px 20px",
            boxShadow: "0 4px 20px rgba(167, 146, 119, 0.15), 0 1px 4px rgba(167, 146, 119, 0.1)",
          }}
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div
              className="flex-shrink-0 mt-0.5"
              style={{
                background: "#A79277",
                borderRadius: "10px",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MessageCircleQuestion className="h-5 w-5 text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p
                className="text-xs font-bold tracking-wider uppercase mb-1"
                style={{ color: "#A79277" }}
              >
                Mentor Asked
              </p>
              <p
                className="text-[15px] leading-relaxed font-medium"
                style={{ color: "#5C4A3A" }}
              >
                {mentorTask}
              </p>
            </div>

            {/* Dismiss button */}
            <button
              onClick={() => setMentorTask(null)}
              className="flex-shrink-0 mt-0.5 rounded-lg p-1.5 transition-colors hover:bg-[#A79277]/15 active:bg-[#A79277]/25"
              aria-label="Dismiss task"
            >
              <X className="h-4 w-4" style={{ color: "#A79277" }} />
            </button>
          </div>

          {/* Subtle pulsing dot to show it's active */}
          <div className="flex items-center gap-2 mt-3 ml-12">
            <span
              className="flex h-2 w-2 rounded-full animate-pulse"
              style={{ background: "#A79277" }}
            />
            <span
              className="text-xs font-medium"
              style={{ color: "#A79277" }}
            >
              Waiting for your response…
            </span>
          </div>
        </div>
      )}

      {/* Main Workspace - Voice Hub */}
      <div className="flex-1 rounded-[2rem] border border-[#A79277]/20 bg-white/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative transition-all duration-500 hover:shadow-[0_20px_40px_rgba(167,146,119,0.1)]">
        <VoiceInterface 
          onTriggerCodeFocus={handleTriggerCodeFocus}
          onMentorTask={handleMentorTask}
          vapiAssistantId="9e0764f1-7314-4c1a-b495-2bc09fa90296" 
          submittedCode={submittedCode}
          onSessionEnd={handleSessionEnd}
        />
      </div>

      {/* Floating Code Editor Modal */}
      {showCodeEditor && (
        <div className="absolute inset-0 z-40 bg-zinc-900/40 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in zoom-in-95 duration-300">
          
          {mentorTask && (
            <div
              className="w-full max-w-5xl mb-4 shrink-0 animate-in fade-in slide-in-from-top-3 duration-400 ease-out"
              style={{
                background: "rgba(255, 242, 225, 0.85)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(167, 146, 119, 0.3)",
                borderRadius: "16px",
                padding: "16px 20px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
              }}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className="flex-shrink-0 mt-0.5 shadow-sm"
                  style={{
                    background: "linear-gradient(135deg, #A79277 0%, #8C7A61 100%)",
                    borderRadius: "12px",
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MessageCircleQuestion className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-[#8C7A61] uppercase tracking-[0.15em] mb-1.5">Mentor Asked</h3>
                  <p className="text-zinc-800 font-semibold leading-relaxed">{mentorTask}</p>
                </div>
              </div>
            </div>
          )}

          <div className="w-full flex-1 max-h-full max-w-5xl bg-[#1e1e1e] border border-zinc-700/50 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col ring-1 ring-white/10">
            <CodeEditor 
              code={code} 
              onChange={(val) => setCode(val || "")} 
              onClose={() => setShowCodeEditor(false)}
              onSubmit={(c) => {
                setSubmittedCode(c);
                // Trigger a re-render sequence so the effect fires in VoiceInterface
                setTimeout(() => setSubmittedCode(null), 100);
              }}
            />
          </div>
        </div>
      )}

      {/* LogicForge Canvas Overlay */}
      {showCanvas && (
        <LogicForgeCanvas 
          onClose={() => setShowCanvas(false)} 
          onConvert={handleConvertLogicToCode} 
        />
      )}

      {/* Session Summary Modal */}
      {showSessionSummary && sessionAnalysisData && (
        <SessionSummaryModal
          analysis={sessionAnalysisData.analysis}
          messages={sessionAnalysisData.messages}
          studentName={sessionAnalysisData.studentName}
          targetRole={sessionAnalysisData.targetRole}
          sessionMode={sessionAnalysisData.sessionMode}
          sessionDate={sessionAnalysisData.sessionDate}
          onClose={() => setShowSessionSummary(false)}
        />
      )}
    </div>
  );
}
