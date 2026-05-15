"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Play, CheckCircle, TerminalSquare, X } from "lucide-react";

interface CodeEditorProps {
  code: string;
  onChange: (value: string | undefined) => void;
  onClose?: () => void;
  onSubmit?: (code: string) => void;
}

export function CodeEditor({ code, onChange, onClose, onSubmit }: CodeEditorProps) {
  const [output, setOutput] = useState<{ text: string; status: "success" | "error" | "info" } | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunTests = () => {
    setIsRunning(true);
    setOutput(null);
    // Simulate running tests
    setTimeout(() => {
      setIsRunning(false);
      setOutput({
        text: "> npm run test\n\n✓ 3 tests passed successfully.\nExecution time: 0.14s",
        status: "success",
      });
    }, 1200);
  };

  const handleSubmit = () => {
    setIsRunning(true);
    setOutput(null);
    if (onSubmit) {
      onSubmit(code);
    }
    // Simulate submission
    setTimeout(() => {
      setIsRunning(false);
      setOutput({
        text: "> Submitting solution to Mentor...\n\n✅ Code sent to AI!\nListen to your mentor for feedback.",
        status: "success",
      });
    }, 1500);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center px-4 py-3 bg-[#1a1a1a] border-b border-zinc-800/80 backdrop-blur-md">
        <div className="flex items-center gap-2 mr-6">
          <div className="h-3 w-3 rounded-full bg-[#ff5f56] shadow-sm shadow-[#ff5f56]/30" />
          <div className="h-3 w-3 rounded-full bg-[#ffbd2e] shadow-sm shadow-[#ffbd2e]/30" />
          <div className="h-3 w-3 rounded-full bg-[#27c93f] shadow-sm shadow-[#27c93f]/30" />
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-zinc-800/50 rounded-md border border-zinc-700/50 shadow-inner">
          <TerminalSquare className="h-3.5 w-3.5 text-[#A79277]" />
          <span className="font-mono text-xs font-medium text-zinc-300">solution.ts</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Button 
            type="button"
            variant="outline" 
            size="sm" 
            onClick={handleRunTests}
            disabled={isRunning}
            className="h-8 border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all text-xs"
          >
            <Play className="h-3.5 w-3.5 mr-1.5 text-zinc-400" />
            Run Tests
          </Button>
          <Button 
            type="button"
            size="sm" 
            onClick={handleSubmit}
            disabled={isRunning}
            className="h-8 bg-gradient-to-r from-[#8C7A61] to-[#A79277] text-white hover:opacity-90 border-none shadow-[0_0_15px_rgba(167,146,119,0.3)] transition-all text-xs font-bold tracking-wide"
          >
            <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-white/80" />
            Submit
          </Button>
          {onClose && (
            <div className="h-4 w-px bg-zinc-700 mx-1"></div>
          )}
          {onClose && (
            <Button 
              type="button"
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex-1 relative bg-[#1E1E1E]">
        <Editor
          height="100%"
          language="typescript"
          theme="vs-dark"
          value={code}
          onChange={onChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "var(--font-mono)",
            lineHeight: 1.5,
            padding: { top: 16 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: "smooth",
          }}
        />
      </div>

      <div className="h-[200px] border-t bg-[#0D0D0D] p-0 flex flex-col">
        <div className="px-4 py-2 bg-[#1A1A1A] border-b border-zinc-800 flex items-center justify-between">
          <span className="font-mono text-xs font-semibold tracking-wider text-zinc-400 uppercase">Terminal Output</span>
        </div>
        <div className="flex-1 p-4 overflow-auto font-mono text-sm whitespace-pre-wrap">
          {!output && !isRunning && (
            <p className="text-zinc-500 italic">Ready. Click Run Tests to execute your code.</p>
          )}
          {isRunning && (
            <p className="text-zinc-400 animate-pulse">Executing code...</p>
          )}
          {output && (
            <p className={output.status === "success" ? "text-green-400" : "text-red-400"}>
              {output.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
