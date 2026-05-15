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
  initialTopic?: string;
  initialStack?: string;
  autoStart?: boolean;
  submittedCode?: string | null;
  sessionStart?: string;
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

const CODE_TRIGGER_PATTERNS: RegExp[] = [
  /\b(write|implement|type|show me|create|code|solve|give me)\b.*\b(the code|some code|a function|your solution|your approach|this part|it|that up|this up|the solution|an algorithm|a class)\b/i,
  /\b(start coding|code this|code it|let's code|let us code|please code|can you code|code out)\b/i,
  /\bplease\s*(?:,\s*)?(write|implement|code|solve)\b/i,
  /\bgo ahead and\b.*\b(code|write|implement|solve)\b/i,
  /\b(how would you code|can you implement|write out|code out|write the code)\b/i,
  /\byour task is to\b.*\b(implement|write|code|solve)\b/i,
  /\b(write|implement)\b.*\b(binary search|sorting|algorithm|data structure|loop|condition)\b/i,
  /\b(please write the code|write the code for this|write a function)\b/i
];

function classifyTranscript(text: string): "code-trigger" | "question-task" | "explanatory" {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();
  
  if (
    lower.includes("write the code") || 
    lower.includes("write some code") || 
    lower.includes("implement the code") || 
    lower.includes("start coding") || 
    lower.includes("code this") || 
    lower.includes("code it") ||
    lower.includes("write a function") ||
    lower.includes("implement this") ||
    lower.includes("code out") ||
    lower.includes("write out") ||
    lower.includes("implement out")
  ) {
    return "code-trigger";
  }
  
  if (CODE_TRIGGER_PATTERNS.some(p => p.test(lower))) return "code-trigger";
  
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

let globalVapiInstance: any = null;
let globalIsVoiceActive = false;
let globalIsAiSpeaking = false;
let globalListenersAttached = false;
let globalSessionStartTime: Date | null = null;
let globalTimeoutRef: NodeJS.Timeout | null = null;
let globalLatestAssistantMessage = "";

const globalStateCallbacks = {
  setIsVoiceActive: (val: boolean) => {},
  setIsAiSpeaking: (val: boolean) => {},
  setIsConnecting: (val: boolean) => {},
  setConnectionError: (val: string | null) => {},
  setCurrentTechnique: (tech: string) => {},
  onMentorTask: (task: string | null) => {},
  onTriggerCodeFocus: () => {},
};

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

const clearGlobalTimeout = () => {
  if (globalTimeoutRef) {
    clearTimeout(globalTimeoutRef);
    globalTimeoutRef = null;
  }
};

const getNormalPrompt = (studentContext: string) => `You are an elite Senior Software Engineer and CS Mentor named Mentor AI. You are conducting an interactive pair-programming session.

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
- When presenting a coding problem to the user, ALWAYS prompt them to start coding immediately.
- ONLY when you are actively giving the user a specific coding task or problem to solve, you MUST end your sentence with the EXACT phrase: "Please write the code."
- Do NOT say "Please write the code" if you are just asking them what topic they want to practice, or if you are answering a conceptual question.
- When they are stuck, give them a tiny hint wrapped in a question.
- Always keep your spoken responses SHORT, SHARP, and CONCISE (2-3 sentences max). This is a fast-paced voice conversation.
- Wait for them to respond. Do not talk over them.${studentContext}`;

const getInterviewPrompt = () => `You are a STRICT technical interviewer from a top tier tech company. You are conducting a formal placement-style coding interview with a candidate.

Your interviewing style:
- Act like a real, slightly intimidating technical interviewer.
- Give mild pressure.
- Do NOT be overly friendly. Keep it strictly professional.
- IMMEDIATELY present a real DSA or system design problem once the topic is decided.
- ONLY when you have presented a specific coding problem or asked for specific code modifications, you MUST end your sentence with the EXACT phrase: "Please write the code." 
- Do NOT use the phrase "Please write the code" if you are merely asking what topic they want to be interviewed on.
- When the candidate submits code, deeply scrutinize it. Ask for time and space complexity, edge cases, and failure modes.
- Refuse to give them the answer if they get stuck.
- Keep your responses short, sharp, and concise.

IMPORTANT: Keep your spoken responses SHORT. You are in a voice conversation, not writing an essay. NEVER ask the candidate to "explain their approach using voice" before coding. ALWAYS prompt them to code immediately by saying "Please write the code."`;

export function VoiceInterface({ onTriggerCodeFocus, onMentorTask, vapiAssistantId, submittedCode, onSessionEnd, initialTopic, initialStack, autoStart }: VoiceInterfaceProps) {
  const [isVoiceActive, setIsVoiceActive] = useState(globalIsVoiceActive);
  const [isAiSpeaking, setIsAiSpeaking] = useState(globalIsAiSpeaking);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isInterviewMode, setIsInterviewMode] = useState(false);
  const [currentTechnique, setCurrentTechnique] = useState("SOCRATIC");
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    globalStateCallbacks.setIsVoiceActive = setIsVoiceActive;
    globalStateCallbacks.setIsAiSpeaking = setIsAiSpeaking;
    globalStateCallbacks.setIsConnecting = setIsConnecting;
    globalStateCallbacks.setConnectionError = setConnectionError;
    globalStateCallbacks.setCurrentTechnique = setCurrentTechnique;
    globalStateCallbacks.onMentorTask = onMentorTask;
    globalStateCallbacks.onTriggerCodeFocus = onTriggerCodeFocus;
  }, [onMentorTask, onTriggerCodeFocus]);

  const autoStartAttemptedRef = useRef(false);

  useEffect(() => {
    if (autoStart && !globalIsVoiceActive && !isConnecting && !autoStartAttemptedRef.current) {
      autoStartAttemptedRef.current = true;
      startVoiceSession();
    }
  }, [autoStart, isConnecting]);

  useEffect(() => {
    if (submittedCode && globalVapiInstance && globalIsVoiceActive) {
      // Log the code submission to the database so it's captured in session history
      const DEMO_USER_ID = "00000000-0000-0000-0000-000000000000";
      supabase.from('chat_history').insert({
        user_id: DEMO_USER_ID,
        message_text: `I have submitted the following code:\n\`\`\`typescript\n${submittedCode}\n\`\`\``,
        is_user: true
      }).then((res: any) => { if (res.error) console.error(res.error) });

      globalVapiInstance.send({
        type: "add-message",
        message: {
          role: "system",
          content: `The user has just submitted this code. Please analyze it for logical correctness, edge cases, and improvements:\n\n\`\`\`typescript\n${submittedCode}\n\`\`\``
        }
      });
    }
  }, [submittedCode]);

  useEffect(() => {
    const vapi = getVapiInstance();
    if (!vapi) {
      setConnectionError("Vapi Public Key is missing! Add NEXT_PUBLIC_VAPI_PUBLIC_KEY to .env.local.");
      return;
    }

    if (!globalListenersAttached) {
      vapi.on("call-start", () => {
        clearGlobalTimeout();
        globalIsVoiceActive = true;
        globalSessionStartTime = new Date();
        globalStateCallbacks.setIsConnecting(false);
        globalStateCallbacks.setConnectionError(null);
        globalStateCallbacks.setIsVoiceActive(true);
      });

      vapi.on("call-end", () => {
        clearGlobalTimeout();
        globalIsVoiceActive = false;
        globalIsAiSpeaking = false;
        globalStateCallbacks.setIsVoiceActive(false);
        globalStateCallbacks.setIsAiSpeaking(false);
        globalStateCallbacks.setIsConnecting(false);
      });

      vapi.on("speech-start", () => {
        globalIsAiSpeaking = true;
        globalStateCallbacks.setIsAiSpeaking(true);
      });
      
      vapi.on("speech-end", () => {
        globalIsAiSpeaking = false;
        globalStateCallbacks.setIsAiSpeaking(false);
        if (globalLatestAssistantMessage.trim()) {
          const DEMO_USER_ID = "00000000-0000-0000-0000-000000000000";
          supabase.from('chat_history').insert({
            user_id: DEMO_USER_ID,
            message_text: globalLatestAssistantMessage.trim(),
            is_user: false
          }).then((res: any) => { if (res.error) console.error(res.error) });
          globalLatestAssistantMessage = "";
        }
      });

      vapi.on("error", (error: any) => {
        const errorMsg = error?.errorMsg || error?.message || error?.error?.message || error?.error?.errorMsg || "Unknown error";
        const safeErrorStr = String(errorMsg).toLowerCase();
        
        if (safeErrorStr.includes("krisp") || safeErrorStr.includes("microphone")) return;
        
        const isFatal = /meeting has ended|unauthorized|invalid|not found/i.test(safeErrorStr);
        if (isFatal) {
          clearGlobalTimeout();
          globalIsVoiceActive = false;
          globalIsAiSpeaking = false;
          globalStateCallbacks.setConnectionError(`Connection failed: ${errorMsg}`);
          globalStateCallbacks.setIsConnecting(false);
          globalStateCallbacks.setIsVoiceActive(false);
          globalStateCallbacks.setIsAiSpeaking(false);
        }
      });

      vapi.on("message", (message: any) => {
        const DEMO_USER_ID = "00000000-0000-0000-0000-000000000000";
        
        let text = "";
        let isAssistant = false;
        let isUser = false;

        if (message.type === "transcript") {
          if (message.role === "user" && message.transcriptType === "final") {
            isUser = true;
            text = message.transcript;
          } else if (message.role === "assistant") {
            isAssistant = true;
            text = message.transcript;
          }
        } else if (message.type === "conversation-update" && message.conversation) {
          const lastMsg = message.conversation[message.conversation.length - 1];
          if (lastMsg && lastMsg.role === "assistant" && lastMsg.content) {
            isAssistant = true;
            text = lastMsg.content;
            globalLatestAssistantMessage = text;
          }
        }

        if (isUser && text) {
          supabase.from('chat_history').insert({
            user_id: DEMO_USER_ID,
            message_text: text,
            is_user: true
          }).then((res: any) => { if (res.error) console.error(res.error) });
          
          globalStateCallbacks.onMentorTask(null);
          return;
        }

        if (isAssistant && text) {
          const cls = classifyTranscript(text);
          const technique = detectTechnique(text);
          globalStateCallbacks.setCurrentTechnique(technique);
          
          if (cls === "code-trigger") {
            globalStateCallbacks.onMentorTask(text);
            if (typeof globalStateCallbacks.onTriggerCodeFocus === "function") {
              globalStateCallbacks.onTriggerCodeFocus();
            }
          } else if (cls === "question-task") {
            globalStateCallbacks.onMentorTask(text);
          }
        }
      });

      globalListenersAttached = true;
    }
  }, []);

  const getStudentContextAsync = async () => {
    const DEMO_USER_ID = "00000000-0000-0000-0000-000000000000";
    let studentContext = "";
    try {
      const [profileRes, weaknessesRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', DEMO_USER_ID).single(),
        supabase.from('weaknesses').select('*').eq('user_id', DEMO_USER_ID)
      ]);

      const profile = profileRes.data;
      const weaknesses = weaknessesRes.data || [];

      if (profile) {
        studentContext += `\n\n--- STUDENT PROFILE ---\nName: ${profile.name || "Student"}\nTarget Role: ${profile.target_role || "Software Engineer"}\nLearning Style: ${profile.learning_style || "Visual"}\n`;
      }
      
      if (weaknesses.length > 0) {
        studentContext += `\n--- KNOWN WEAKNESSES (PAST MISTAKES) ---\n`;
        weaknesses.forEach((w: any) => {
          studentContext += `- [${w.severity.toUpperCase()}] ${w.category}: ${w.title}. Context: ${w.description}\n`;
        });
        studentContext += `\nIMPORTANT: Use these weaknesses to guide your questions naturally.\n`;
      }

      if (initialTopic && initialStack) {
        studentContext += `\n\n--- CURRENT SESSION TOPIC ---\nThe user has specifically requested to focus on **${initialTopic}** within the **${initialStack}** tech stack.\n`;
      }
    } catch (e) {
      console.warn("Failed to load context", e);
    }
    return studentContext;
  };

  const startVoiceSession = async () => {
    const vapi = getVapiInstance();
    if (!vapi) { setConnectionError("Vapi not initialized."); return; }
    try {
      setIsConnecting(true);
      setConnectionError(null);
      clearGlobalTimeout();

      globalTimeoutRef = setTimeout(() => {
        setConnectionError(`Connection timed out.`);
        setIsConnecting(false);
        try { vapi.stop(); } catch (_) {}
      }, CONNECTION_TIMEOUT_MS);

      const studentContext = await getStudentContextAsync();
      const firstMessage = isInterviewMode
        ? (initialTopic ? `Hello. I will be your interviewer today. We'll be focusing on ${initialTopic}. Are you ready?` : "Hello. I will be your interviewer today. On what topic would you like to be interviewed?")
        : (initialTopic && initialStack ? `Great choice! We're now focusing on ${initialTopic} in the ${initialStack} stack.` : "Hello! Ready for a session?");

      const DEMO_USER_ID = "00000000-0000-0000-0000-000000000000";
      
      let historyRes: any = { data: [] };
      try {
        if (sessionStart && sessionStart !== "undefined" && !isNaN(Number(sessionStart))) {
          const sessionDate = new Date(Number(sessionStart));
          const endDate = new Date(sessionDate.getTime() + 60 * 60 * 1000 * 2); 
          
          const res = await supabase.from('chat_history')
            .select('*')
            .eq('user_id', DEMO_USER_ID)
            .gte('created_at', sessionDate.toISOString())
            .lte('created_at', endDate.toISOString())
            .order('created_at', { ascending: true })
            .limit(100);
          historyRes = { data: res.data ? [...res.data].reverse() : [] }; 
        } else {
          historyRes = await supabase.from('chat_history').select('*').eq('user_id', DEMO_USER_ID).order('created_at', { ascending: false }).limit(30);
        }
      } catch (err) {
        console.warn("Could not fetch chat history", err);
        historyRes = { data: [] };
      }
      
      const history = (historyRes.data || []).reverse();

      let historyText = "";
      if (history.length > 0) {
        historyText = "\n\n--- PREVIOUS CONVERSATION HISTORY ---\n" + 
          history.map((msg: any) => `${msg.is_user ? 'Student' : 'Mentor'}: ${msg.message_text}`).join("\n\n") + 
          "\n\n--- END OF HISTORY ---\nResume the conversation naturally from here.";
      }

      const systemPrompt = (isInterviewMode ? getInterviewPrompt() : getNormalPrompt(studentContext)) + historyText;

      const assistantConfig = {
        name: isInterviewMode ? "Strict Technical Interviewer" : "MentorForge AI Mentor",
        firstMessage,
        model: {
          provider: "openai" as const,
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system" as const,
              content: systemPrompt
            }
          ]
        },
        voice: { provider: "11labs" as const, voiceId: "burt" },
        silenceTimeoutSeconds: 3600,
        maxDurationSeconds: 3600,
      };

      if (vapiAssistantId && vapiAssistantId !== "inline") {
        await vapi.start(vapiAssistantId, { 
          name: assistantConfig.name, 
          firstMessage, 
          model: assistantConfig.model,
          silenceTimeoutSeconds: 600,
          maxDurationSeconds: 3600
        });
      } else {
        await vapi.start(assistantConfig);
      }
    } catch (error: any) {
      console.error("Failed to start voice session:", error);
      clearGlobalTimeout();
      const errorMsg = error?.message || error?.toString() || "Unknown error";
      setConnectionError(`Could not start voice session: ${errorMsg}`);
      setIsConnecting(false);
    }
  };

  const endVoiceSession = () => {
    clearGlobalTimeout();
    const durationMinutes = globalSessionStartTime ? (Date.now() - globalSessionStartTime.getTime()) / 60000 : 0;
    globalIsVoiceActive = false;
    globalIsAiSpeaking = false;
    setIsVoiceActive(false);
    setIsAiSpeaking(false);
    
    const vapi = getVapiInstance();
    if (vapi) vapi.stop();

    if (onSessionEnd) {
      onSessionEnd({ durationMinutes, sessionMode: isInterviewMode ? "interview" : "mentor" });
    }
    globalSessionStartTime = null;
  };

  const handleModeToggle = async () => {
    const newMode = !isInterviewMode;
    setIsInterviewMode(newMode);
    
    if (globalIsVoiceActive && globalVapiInstance) {
      const studentContext = await getStudentContextAsync();
      const newPrompt = newMode ? getInterviewPrompt() : getNormalPrompt(studentContext);
      globalVapiInstance.send({ type: "add-message", message: { role: "system", content: newPrompt } });
    }
  };

  return (
    <div className="flex h-full flex-col bg-transparent">
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FFF2E1]/60 via-transparent to-transparent transition-opacity duration-1000 pointer-events-none z-0 ${isVoiceActive ? 'opacity-100' : 'opacity-0'}`} />
        
        <div className="absolute top-6 right-6 z-20 flex items-center gap-3 bg-white/70 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-sm border border-[#A79277]/20 transition-all hover:bg-white/90">
          <div className="flex flex-col text-right">
            <span className="font-bold text-zinc-900 text-sm">Mock Interview Mode</span>
            <span className="text-[10px] font-medium text-[#6B5A47]">Strict technical interviewer</span>
          </div>
          <button
            onClick={handleModeToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#A79277] focus:ring-offset-2 ${isInterviewMode ? 'bg-[#ef4444]' : 'bg-zinc-300'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isInterviewMode ? 'translate-x-6' : 'translate-x-1 shadow-sm'}`} />
          </button>
        </div>

        <div className="z-10 flex flex-col items-center mt-12">
          <Avatar className="h-28 w-28 mb-8 border-[3px] border-[#A79277]/30 shadow-[0_10px_30px_rgba(167,146,119,0.2)] bg-gradient-to-br from-white to-[#FDF9F1]">
            <AvatarFallback className="bg-transparent text-[#A79277]">
              <BrainCircuit className="h-14 w-14" />
            </AvatarFallback>
          </Avatar>
          <h2 className="text-3xl font-black tracking-tight text-zinc-900 mb-2 drop-shadow-sm">Mentor AI</h2>
          
          <div className="flex items-center gap-3 mb-12 h-6">
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
