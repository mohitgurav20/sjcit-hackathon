"use client";

import { useState } from "react";
import { type TechStack } from "@/lib/tech-stacks-data";
import { TechStackMindmap } from "@/components/tech-stacks/TechStackMindmap";
import { Layers, ChevronRight } from "lucide-react";

function StackProgress({ stack }: { stack: TechStack }) {
  const nonCenter = stack.nodes.filter((n) => !n.id.endsWith("-center"));
  const strong = nonCenter.filter((n) => n.mastery === "strong").length;
  const average = nonCenter.filter((n) => n.mastery === "average").length;
  const total = nonCenter.length;
  const pct = total === 0 ? 0 : Math.round(((strong * 1 + average * 0.5) / total) * 100);

  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 bg-white/50 backdrop-blur-sm rounded-full overflow-hidden flex shadow-inner">
        <div className="h-full bg-gradient-to-r from-[#10b981] to-[#34d399] transition-all duration-700 ease-out" style={{ width: `${(strong / total) * 100}%` }} />
        <div className="h-full bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] transition-all duration-700 ease-out delay-150" style={{ width: `${(average / total) * 100}%` }} />
      </div>
      <span className="text-xs font-black text-[#A79277] w-10 text-right tracking-tight">{pct}%</span>
    </div>
  );
}

export function TechStacksClient({ stacks }: { stacks: TechStack[] }) {
  const [selectedStack, setSelectedStack] = useState<TechStack>(stacks[0]);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black tracking-tight text-zinc-900 flex items-center gap-4 drop-shadow-sm">
          <div className="h-12 w-12 rounded-2xl bg-white/60 backdrop-blur-md flex items-center justify-center shadow-sm border border-[#A79277]/20">
            <Layers className="h-6 w-6 text-[#A79277]" />
          </div>
          Tech Stack Mindmaps
        </h1>
        <p className="text-[#6B5A47] mt-3 font-medium text-lg ml-16">Explore industry tech stacks. Nodes are colored by your mastery level.</p>
      </div>

      {/* Stack Selector + Mindmap */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Sidebar: Stack Cards */}
        <div className="w-80 shrink-0 flex flex-col gap-3 overflow-y-auto pr-4 pb-8 custom-scrollbar">
          {stacks.map((stack) => {
            const isActive = selectedStack.id === stack.id;
            return (
              <button
                key={stack.id}
                onClick={() => setSelectedStack(stack)}
                className={`
                  w-full text-left p-5 shrink-0 rounded-[1.5rem] border transition-all duration-500 relative overflow-hidden
                  ${isActive
                    ? "border-[#A79277]/40 bg-white/80 backdrop-blur-xl shadow-[0_15px_35px_rgba(167,146,119,0.15)] scale-[1.02] transform"
                    : "border-transparent bg-white/40 backdrop-blur-md hover:bg-white/60 hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)] hover:-translate-y-0.5"
                  }
                `}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FFF2E1]/40 to-transparent pointer-events-none" />
                )}
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-3xl filter drop-shadow-sm">{stack.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-black text-sm truncate tracking-wide ${isActive ? "text-[#8C7A61]" : "text-zinc-800"}`}>
                        {stack.name}
                      </h3>
                      <p className="text-xs font-medium text-zinc-500 mt-1 truncate">{stack.description}</p>
                    </div>
                    {isActive && (
                      <div className="h-6 w-6 rounded-full bg-[#FFF2E1] flex items-center justify-center border border-[#A79277]/20 shrink-0">
                        <ChevronRight className="h-3 w-3 text-[#A79277] shrink-0" />
                      </div>
                    )}
                  </div>
                  <StackProgress stack={stack} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Mindmap Canvas */}
        <div className="flex-1 min-w-0 rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#A79277]/20 bg-white/60 backdrop-blur-xl relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/80 via-transparent to-transparent pointer-events-none z-0" />
          <div className="relative z-10 w-full h-full">
            <TechStackMindmap key={selectedStack.id} stack={selectedStack} />
          </div>
        </div>
      </div>
    </div>
  );
}
