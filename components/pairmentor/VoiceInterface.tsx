"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Vapi from "@vapi-ai/web";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, BrainCircuit, AlertTriangle, RotateCcw } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface VoiceInterfaceProps {
  onTriggerCodeFocus: () => void;
  onMentorTask: (task: string | null) => void;
  vapiAssistantId: string;
  onSessionEnd?: (data: { durationMinutes: number; sessionMode: "mentor" | "interview" }) => void;
}

const CONNECTION_TIMEOUT_MS = 60000;

const QUESTION_TASK_PATTERNS: RegExp[] = [
  /\?\s*$/,
  /^(explain|describe|tell me|walk me through|break down|think about|consider)/i,
  /\b(explain|describe|tell me|walk me through|break down|think about|consider)\b.*\b(this|that|it|the|your|how|why|what)\b/i,
  /\b(how|what|why|when|where|which|can you|could you|would you)\b/i,
  /\b(step by step|in simple words|in your own words|give me|show me your|what is your|what's your)\b/i,
  /\b(what if|suppose|imagine|let's say|assume)\b/i,
];

const EXPLANATORY_PATTERNS: RegExp[] = [
  /^(so|okay|alright|right|now|great|good|perfect|exactly|correct|yes|no|well|let me|i'll|i will|here's|this is|that's|that is|the reason|because|basically)/i,
  /\b(let me explain|i'll walk you through|here's how|this works by|the way this works|in other words)\b/i,
];

function classifyTranscript(text: string): "code-trigger" | "question-task" | "explanatory" {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();
  const codeTriggers = [
    "write the code", "implement this", "write a function",
    "show me your solution", "code this part", "type the function",
    "explain your code", "write your approach"
  ];
  if (codeTriggers.some(phrase => lower.includes(phrase))) return "code-trigger";
  if (trimmed.length < 15) return "explanatory";
  if (EXPLANATORY_PATTERNS.some(p => p.test(trimmed)) && !trimmed.endsWith("?")) return "explanatory";
  if (QUESTION_TASK_PATTERNS.some(p => p.test(trimmed))) return "question-task";
  return "explanatory";
}

function detectTechnique(text: string) {
  const lower = text.toLowerCase();
  if (lower.includes("simple words") || lower.includes("12-year-old") || lower.includes("explain to me like") || lower.includes("feynman")) return "FEYNMAN";
  if (lower.includes("out loud") || lower.includes("line by line") || lower.includes("rubber duck")) return "RUBBER DUCK";
  if (lower.includes("analogy") || lower.includes("think of it like") || lower.includes("imagine")) return "ANALOGY";
  if (lower.includes("what if") || lower.includes("suppose") || lower.includes("edge case")) return "WHAT-IF";
  if (lower.includes("bug") || lower.includes("error") || lower.includes("mistake") || lower.includes("issue") || lower.includes("analyze")) return "ERROR ANALYSIS";
  return "SOCRATIC";
}

// Global singleton to ensure Vapi instance is never destroyed on re-renders or StrictMode unmounts
let globalVapiInstance: any = null;
let globalIsVoiceActive = false;
let globalIsAiSpeaking = false;

function getVapiInstance() {
  if (typeof window === "undefined") return null;
  if (!globalVapiInstance) {
    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    if (publicKey) {
      globalVapiInstance = new Vapi(publicKey);
    }
  }
  return globalVapiInstance;
}

export function VoiceInterface({ onTriggerCodeFocus, onMentorTask, vapiAssistantId, submittedCode, onSessionEnd }: VoiceInterfaceProps & { submittedCode?: string | null }) {
  const [isVoiceActive, setIsVoiceActive] = useState(globalIsVoiceActive);
  const [isAiSpeaking, setIsAiSpeaking] = useState(globalIsAiSpeaking);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isInterviewMode, setIsInterviewMode] = useState(false);
  const [currentTechnique, setCurrentTechnique] = useState("SOCRATIC");
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartTimeRef = useRef<Date | null>(null);

  // Store callbacks in refs so event handlers always see latest
  const onTriggerCodeFocusRef = useRef(onTriggerCodeFocus);
  const onMentorTaskRef = useRef(onMentorTask);
  useEffect(() => { onTriggerCodeFocusRef.current = onTriggerCodeFocus; }, [onTriggerCodeFocus]);
  useEffect(() => { onMentorTaskRef.current = onMentorTask; }, [onMentorTask]);

  const clearConnectionTimeout = useCallback(() => {
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
  }, []);

  // Listen to submittedCode
  useEffect(() => {
    if (submittedCode && globalVapiInstance && isVoiceActive) {
      console.log("[Vapi] Sending submitted code to AI for analysis...");
      globalVapiInstance.send({
        type: "add-message",
        message: {
          role: "user",
          content: `I have just submitted this code. Please analyze it for logical correctness, edge cases, and improvements:\n\n\`\`\`typescript\n${submittedCode}\n\`\`\``
        }
      });
    }
  }, [submittedCode, isVoiceActive]);

  useEffect(() => {
    const vapi = getVapiInstance();
    if (!vapi) {
      setConnectionError("Vapi Public Key is missing! Add NEXT_PUBLIC_VAPI_PUBLIC_KEY to .env.local.");
      return;
    }

    const onCallStart = () => {
      clearConnectionTimeout();
      setIsConnecting(false);
      setConnectionError(null);
      globalIsVoiceActive = true;
      setIsVoiceActive(true);
      sessionStartTimeRef.current = new Date();
      console.log("[Vapi] ✅ Call started — session ALIVE.");
    };

    const onCallEnd = () => {
      clearConnectionTimeout();
      globalIsVoiceActive = false;
      globalIsAiSpeaking = false;
      setIsVoiceActive(false);
      setIsAiSpeaking(false);
      setIsConnecting(false);
      console.log("[Vapi] Call ended — session CLOSED.");
    };

    const onSpeechStart = () => {
      globalIsAiSpeaking = true;
      setIsAiSpeaking(true);
    };
    
    const onSpeechEnd = () => {
      globalIsAiSpeaking = false;
      setIsAiSpeaking(false);
    };

    const onError = (error: any) => {
      console.error("[Vapi] Error:", error);
      const errorMsg = error?.errorMsg || error?.message || error?.error?.message || error?.error?.errorMsg || JSON.stringify(error) || "Unknown error";
      const safeErrorStr = String(errorMsg).toLowerCase();
      
      if (safeErrorStr.includes("krisp") || safeErrorStr.includes("microphone")) {
        console.warn("[Vapi] Krisp or microphone error detected. Gracefully ignoring to prevent crash.");
        return;
      }
      
      const isFatal = /meeting has ended|unauthorized|invalid|not found/i.test(safeErrorStr);
      if (isFatal) {
        clearConnectionTimeout();
        setConnectionError(`Connection failed: ${errorMsg}`);
        setIsConnecting(false);
        setIsVoiceActive(false);
        setIsAiSpeaking(false);
      }
    };

    const onMessage = (message: any) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const DEMO_USER_ID = "00000000-0000-0000-0000-000000000000";
        const text = message.transcript;
        const isUser = message.role === "user";

        // Save to Supabase asynchronously
        supabase.from('chat_history').insert({
          user_id: DEMO_USER_ID,
          message_text: text,
          is_user: isUser
        }).then(({ error }) => {
          if (error) console.error("[Vapi] Failed to save chat history:", error);
        });

        if (isUser) { onMentorTaskRef.current(null); return; }
        if (message.role === "assistant") {
          const text = message.transcript;
          const cls = classifyTranscript(text);
          const technique = detectTechnique(text);
          setCurrentTechnique(technique);
          
          console.log(`[Vapi] "${cls}" (${technique}):`, text.substring(0, 80));
          if (cls === "code-trigger") {
            onMentorTaskRef.current(text);
            onTriggerCodeFocusRef.current();
          } else if (cls === "question-task") {
            onMentorTaskRef.current(text);
          }
        }
      }
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);
    vapi.on("message", onMessage);

    return () => {
      console.log("[Vapi] Component unmounting — detaching listeners to keep Vapi alive.");
      clearConnectionTimeout();
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
      vapi.off("message", onMessage);
      // DO NOT call vapi.stop() here so the session persists!
    };
  }, [clearConnectionTimeout]);

  const startVoiceSession = async () => {
    const vapi = getVapiInstance();
    if (!vapi) { setConnectionError("Vapi not initialized. Check NEXT_PUBLIC_VAPI_PUBLIC_KEY."); return; }
    try {
      setIsConnecting(true);
      setConnectionError(null);
      clearConnectionTimeout();

      // Increased connection timeout for better stability
      timeoutRef.current = setTimeout(() => {
        console.error(`[Vapi] ⏰ Connection timed out after ${CONNECTION_TIMEOUT_MS / 1000}s.`);
        setConnectionError(`Connection timed out (${CONNECTION_TIMEOUT_MS / 1000}s). Check your Vapi account and network.`);
        setIsConnecting(false);
        try { vapi.stop(); } catch (_) {}
      }, CONNECTION_TIMEOUT_MS);

      // --- SUPABASE DATA FETCH ---
      const DEMO_USER_ID = "00000000-0000-0000-0000-000000000000";
      console.log("[Vapi] Fetching student profile, weaknesses, and chat history from Supabase...");
      
      const [profileRes, weaknessesRes, historyRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', DEMO_USER_ID).single(),
        supabase.from('weaknesses').select('*').eq('user_id', DEMO_USER_ID),
        supabase.from('chat_history').select('*').eq('user_id', DEMO_USER_ID).order('created_at', { ascending: false }).limit(30)
      ]);

      const profile = profileRes.data;
      const weaknesses = weaknessesRes.data || [];
      const history = (historyRes.data || []).reverse(); // Order from oldest to newest

      let studentContext = "";
      if (profile) {
        studentContext += `\n\n--- STUDENT PROFILE ---\n`;
        studentContext += `Name: ${profile.name || "Student"}\n`;
        studentContext += `Target Role: ${profile.target_role || "Software Engineer"}\n`;
        studentContext += `Learning Style: ${profile.learning_style || "Visual"}\n`;
      }
      
      if (weaknesses.length > 0) {
        studentContext += `\n--- KNOWN WEAKNESSES (PAST MISTAKES) ---\n`;
        weaknesses.forEach((w: any) => {
          studentContext += `- [${w.severity.toUpperCase()}] ${w.category}: ${w.title}. Context: ${w.description}\n`;
        });
        studentContext += `\nIMPORTANT: Use these weaknesses to guide your questions naturally. For example, if they have an 'Off-by-one' weakness, proactively ask them to dry-run their loop bounds during the conversation.\n`;
      }

      const normalPrompt = `You are an elite Senior Software Engineer and CS Mentor named Mentor AI. You are conducting an interactive pair-programming session.

Your goal is to build strong logical thinking by DYNAMICALLY switching between the following teaching techniques based on the situation.
To ensure the UI updates, you MUST use the exact trigger phrases listed below when switching techniques:

1. Socratic Method: Guide through questions. (Default)
2. Feynman Technique: Ask them to explain it simply. 
   -> TRIGGER PHRASE: You MUST say "Explain this to me in simple words".
3. Rubber Duck Debugging: Tell them to read their code out loud. 
   -> TRIGGER PHRASE: You MUST say "Read your code line by line out loud".
4. Analogical Reasoning: Use real-world analogies tailored to their Learning Style. 
   -> TRIGGER PHRASE: You MUST say "Think of it like...".
5. What-If Scenarios: Proactively challenge their approach. 
   -> TRIGGER PHRASE: You MUST say "What if...".
6. Error Analysis: Guide them to find their own bugs. 
   -> TRIGGER PHRASE: You MUST say "Let's analyze the bug".

YOUR BEHAVIOR:
- When you want the student to write code, you MUST say "Please write the code" or "Implement this".
- When a student submits code, strictly act as a Code Reviewer. Give deep logical feedback on correctness, edge cases, and performance.
- When they are stuck, give them a tiny hint wrapped in a question.
- Always keep your spoken responses SHORT, SHARP, and CONCISE (2-3 sentences max). This is a fast-paced voice conversation.
- Wait for them to respond. Do not talk over them.${studentContext}`;

      const interviewPrompt = `You are a STRICT technical interviewer from a top tier tech company. You are conducting a formal placement-style coding interview with a candidate.

Your interviewing style:
- Act like a real, slightly intimidating technical interviewer.
- Give mild pressure (e.g., "You have 3 minutes to explain your approach", "Let's move faster, we don't have much time").
- Do NOT be overly friendly. Keep it strictly professional.
- Present a real DSA or system design problem immediately.
- Refuse to give them the answer if they get stuck. Instead, say things like "What do you think?", or "Walk me through your thought process."
- When they explain an approach, scrutinize it. Ask for time and space complexity.
- Ask about edge cases and failure modes.
- When you want them to code, explicitly say "Please write the code for this."
- Keep your responses short, sharp, and concise.

IMPORTANT: Keep your spoken responses SHORT. You are in a voice conversation, not writing an essay.`;

      // Use inline assistant config — no dashboard setup needed
      const assistantConfig = {
        name: isInterviewMode ? "Strict Technical Interviewer" : "MentorForge AI Mentor",
        firstMessage: isInterviewMode
          ? "Hello. I'm your interviewer today. We have a lot to cover. Are you ready for your first technical question?"
          : "Hey there! I'm your senior engineer mentor. Let's work through a problem together. What topic would you like to practice today — data structures, algorithms, or system design?",
        model: {
          provider: "openai" as const,
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system" as const,
              content: isInterviewMode ? interviewPrompt : normalPrompt
            },
            ...history.map((msg: any) => ({
              role: (msg.is_user ? "user" : "assistant") as "user" | "assistant",
              content: msg.message_text
            }))
          ]
        },
        voice: {
          provider: "11labs" as const,
          voiceId: "burt"
        },
        // Increased to prevent session from ending automatically
        silenceTimeoutSeconds: 3600,
        maxDurationSeconds: 3600,
        clientMessages: ["transcript", "hang", "function-call", "speech-update", "metadata", "conversation-update"]
      };

      console.log("[Vapi] 🚀 Starting call with inline assistant config...");

      // Try with assistant ID first, fall back to inline config
      if (vapiAssistantId && vapiAssistantId !== "inline") {
        try {
          const overrides = {
            name: assistantConfig.name,
            firstMessage: assistantConfig.firstMessage,
            model: assistantConfig.model,
          };
          await vapi.start(vapiAssistantId, overrides);
          console.log("[Vapi] Started with assistant ID and dynamic overrides.");
          return;
        } catch (e: any) {
          const errMsg = e?.message || String(e);
          if (errMsg.toLowerCase().includes("krisp")) {
            console.warn("[Vapi] Krisp initialization failed. Gracefully ignoring.");
          } else {
            console.warn("[Vapi] Assistant ID failed, falling back to inline config:", e);
          }
        }
      }

      await vapi.start(assistantConfig);
      console.log("[Vapi] ✅ Started with inline config.");
    } catch (error: any) {
      clearConnectionTimeout();
      const errorMsg = error?.message || String(error);
      
      if (errorMsg.toLowerCase().includes("krisp") || errorMsg.toLowerCase().includes("microphone")) {
        console.warn("[Vapi] KrispInitError on start(). Session attempting to continue...");
      } else {
        console.error("[Vapi] ❌ start() threw:", error);
        setConnectionError(errorMsg || "Could not start voice session.");
        setIsConnecting(false);
      }
    }
  };

  const endVoiceSession = () => {
    console.log("[Vapi] User ended session.");
    clearConnectionTimeout();

    // Calculate session duration
    const startTime = sessionStartTimeRef.current;
    const durationMinutes = startTime ? (Date.now() - startTime.getTime()) / 60000 : 0;

    globalIsVoiceActive = false;
    globalIsAiSpeaking = false;
    setIsVoiceActive(false);
    setIsAiSpeaking(false);
    setIsConnecting(false);
    
    const vapi = getVapiInstance();
    if (vapi) {
      try {
        vapi.stop();
      } catch (e) {
        console.error("Error stopping Vapi session:", e);
      }
    }

    // Fire session end callback with duration and mode
    if (onSessionEnd) {
      onSessionEnd({
        durationMinutes,
        sessionMode: isInterviewMode ? "interview" : "mentor",
      });
    }
    sessionStartTimeRef.current = null;
  };

  return (
    <div className="flex h-full flex-col bg-transparent">
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FFF2E1]/60 via-transparent to-transparent transition-opacity duration-1000 pointer-events-none z-0 ${isVoiceActive ? 'opacity-100' : 'opacity-0'}`} />
        <div className="z-10 flex flex-col items-center">
          <Avatar className="h-28 w-28 mb-8 border-[3px] border-[#A79277]/30 shadow-[0_10px_30px_rgba(167,146,119,0.2)] bg-gradient-to-br from-white to-[#FDF9F1]">
            <AvatarFallback className="bg-transparent text-[#A79277]">
              <BrainCircuit className="h-14 w-14" />
            </AvatarFallback>
          </Avatar>
          <h2 className="text-3xl font-black tracking-tight text-zinc-900 mb-2 drop-shadow-sm">Mentor AI</h2>
          <div className="flex items-center gap-3 mb-12">
            <p className="text-[#6B5A47] font-bold flex items-center gap-2 tracking-wide uppercase text-xs">
              {isInterviewMode ? "Mock Interview Mode" : "Senior Engineer Mode"}
              <span className={`flex h-2.5 w-2.5 rounded-full shadow-sm ${isInterviewMode ? 'bg-[#ef4444] shadow-[#ef4444]/40' : 'bg-[#10b981] shadow-[#10b981]/40'}`}></span>
            </p>
            {isVoiceActive && !isInterviewMode && (
              <span key={currentTechnique} className="bg-white text-[#8C7A61] border border-[#A79277]/30 px-3 py-1 rounded-full text-[10px] font-black tracking-[0.1em] uppercase shadow-sm animate-in slide-in-from-top-1 fade-in duration-300">
                ⚡ {currentTechnique}
              </span>
            )}
          </div>
          {connectionError && (
            <div className="mb-8 max-w-md w-full rounded-2xl border border-[#ef4444]/20 bg-[#ef4444]/5 p-5 text-center animate-in fade-in slide-in-from-bottom-2 duration-300 backdrop-blur-md">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-[#ef4444]" />
                <span className="font-bold text-[#ef4444] text-sm uppercase tracking-widest">Connection Error</span>
              </div>
              <p className="text-sm text-[#ef4444]/80 leading-relaxed font-medium">{connectionError}</p>
            </div>
          )}
          {isVoiceActive ? (
            <div className="flex flex-col items-center">
              <div className="relative flex items-center justify-center w-56 h-56 mb-8">
                <div className={`absolute inset-0 rounded-full border border-[#A79277]/20 ${isAiSpeaking ? 'animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]' : 'animate-pulse'}`}></div>
                <div className={`absolute inset-6 rounded-full border border-[#A79277]/30 ${isAiSpeaking ? 'animate-[ping_1.2s_cubic-bezier(0,0,0.2,1)_infinite]' : 'animate-pulse delay-75'}`}></div>
                <div className={`absolute inset-12 rounded-full border border-[#A79277]/40 bg-[#FFF2E1]/20 ${isAiSpeaking ? 'animate-[ping_0.9s_cubic-bezier(0,0,0.2,1)_infinite]' : 'animate-pulse delay-150'}`}></div>
                <div className="absolute inset-16 bg-gradient-to-br from-[#A79277]/10 to-[#8C7A61]/20 rounded-full flex items-center justify-center backdrop-blur-md shadow-inner">
                  <Mic className={`h-10 w-10 text-[#A79277] ${isAiSpeaking ? 'animate-bounce' : ''}`} />
                </div>
              </div>
              <p className="text-xl font-bold text-[#8C7A61] mb-10 animate-pulse tracking-wide">
                {isAiSpeaking ? "AI is Speaking..." : "Listening to you..."}
              </p>
              <Button variant="destructive" size="lg" onClick={endVoiceSession} className="rounded-full px-8 py-6 text-sm font-bold tracking-wider shadow-lg hover:shadow-[#ef4444]/30 transition-all hover:scale-105 border border-white/20">
                <MicOff className="mr-2 h-4 w-4" />
                END SESSION
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Button onClick={startVoiceSession} disabled={isConnecting} className="rounded-full px-10 py-7 text-sm font-black tracking-widest uppercase bg-zinc-900 hover:bg-[#A79277] text-white shadow-xl hover:shadow-[0_10px_30px_rgba(167,146,119,0.3)] transition-all duration-300 hover:scale-105 disabled:opacity-50 border border-white/10">
                {isConnecting ? (<><RotateCcw className="mr-3 h-5 w-5 animate-spin" />Connecting...</>) : connectionError ? (<><RotateCcw className="mr-3 h-5 w-5" />Retry Connection</>) : (<><Mic className="mr-3 h-5 w-5" />Start Session</>)}
              </Button>
              
              <div className="mt-10 flex items-center gap-5 bg-white/50 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-sm border border-[#A79277]/20 transition-all hover:bg-white/80">
                <div className="flex flex-col text-left">
                  <span className="font-bold text-zinc-900">Mock Interview Mode</span>
                  <span className="text-xs font-medium text-[#6B5A47]">Strict technical interviewer</span>
                </div>
                <button
                  onClick={() => setIsInterviewMode(!isInterviewMode)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#A79277] focus:ring-offset-2 ${isInterviewMode ? 'bg-[#ef4444]' : 'bg-zinc-300'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isInterviewMode ? 'translate-x-6' : 'translate-x-1 shadow-sm'}`} />
                </button>
              </div>

              <p className="text-[#8C7A61] mt-8 text-sm font-medium text-center max-w-sm">
                Experience hands-free pair programming. Ensure your microphone is allowed.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
