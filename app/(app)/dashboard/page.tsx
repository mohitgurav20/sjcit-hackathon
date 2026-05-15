import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OverallProgressMindmap } from "@/components/tech-stacks/OverallProgressMindmap";
import { computeOverallProgress, getTechStacksData, MASTERY_COLORS } from "@/lib/tech-stacks-data";
import { getStudentWeaknesses } from "@/lib/weakness-data";
import Link from "next/link";
import { ArrowRight, Activity, TrendingUp, AlertCircle, Layers } from "lucide-react";
import { RefreshButton } from "@/components/dashboard/RefreshButton";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stacks = await getTechStacksData();
  const weaknesses = await getStudentWeaknesses();

  const progress = computeOverallProgress(stacks);
  
  // Sort weaknesses by occurrences (descending) to show recent activity
  const recentMistakes = [...weaknesses].sort((a, b) => b.occurrences - a.occurrences).slice(0, 3);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-zinc-900 drop-shadow-sm">Dashboard</h1>
          <p className="text-[#6B5A47] mt-2 font-medium">Welcome back to MentorForge! Here's your learning overview.</p>
        </div>
        <RefreshButton />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Overall Tech Stack Progress Mindmap */}
        <Card className="lg:col-span-2 overflow-hidden bg-white/60 backdrop-blur-xl border border-[#A79277]/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] hover:shadow-[0_20px_40px_rgba(167,146,119,0.1)] transition-all duration-500">
          <CardHeader className="pb-4 border-b border-[#A79277]/10 bg-white/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#FFF2E1] flex items-center justify-center border border-[#A79277]/20">
                  <Layers className="h-5 w-5 text-[#A79277]" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-zinc-900">Overall Progress</CardTitle>
                  <CardDescription className="text-[#6B5A47] font-medium">Mastery across all 6 industry tech stacks</CardDescription>
                </div>
              </div>
              <Link
                href="/tech-stacks"
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#A79277] transition-all hover:scale-105 shadow-sm"
              >
                Explore
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="h-[400px] p-0 bg-gradient-to-b from-white/50 to-transparent relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/80 via-transparent to-transparent pointer-events-none z-0" />
            <div className="relative z-10 h-full w-full">
              <OverallProgressMindmap stacks={stacks} />
            </div>
          </CardContent>
        </Card>

        {/* Stats & Recent Activity */}
        <div className="flex flex-col gap-6">
          <Card className="bg-white/60 backdrop-blur-xl border border-[#A79277]/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] flex-1 hover:shadow-[0_20px_40px_rgba(167,146,119,0.1)] transition-all duration-500">
            <CardHeader className="pb-4 border-b border-[#A79277]/10 bg-white/40">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                  <Activity className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-zinc-900">Mastery</CardTitle>
                  <CardDescription className="text-[#6B5A47] font-medium">Out of {progress.total} total skills</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Stats */}
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-zinc-700 flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full shadow-[0_0_10px_#10b981]" style={{ backgroundColor: MASTERY_COLORS.strong }} />
                      Strong
                    </span>
                    <span className="text-sm font-black text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded-full">{progress.strong}</span>
                  </div>
                  <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-gradient-to-r from-[#10b981] to-[#34d399] transition-all duration-1000 ease-out relative" style={{ width: `${(progress.strong / progress.total) * 100}%` }}>
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-zinc-700 flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full shadow-[0_0_10px_#f59e0b]" style={{ backgroundColor: MASTERY_COLORS.average }} />
                      In Progress
                    </span>
                    <span className="text-sm font-black text-[#f59e0b] bg-[#f59e0b]/10 px-2 py-0.5 rounded-full">{progress.average}</span>
                  </div>
                  <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] transition-all duration-1000 ease-out delay-150" style={{ width: `${(progress.average / progress.total) * 100}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-zinc-700 flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full shadow-[0_0_10px_#ef4444]" style={{ backgroundColor: MASTERY_COLORS.weak }} />
                      Not Started
                    </span>
                    <span className="text-sm font-black text-[#ef4444] bg-[#ef4444]/10 px-2 py-0.5 rounded-full">{progress.weak}</span>
                  </div>
                  <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-gradient-to-r from-[#ef4444] to-[#f87171] transition-all duration-1000 ease-out delay-300" style={{ width: `${(progress.weak / progress.total) * 100}%` }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-xl border border-[#A79277]/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] hover:shadow-[0_20px_40px_rgba(167,146,119,0.1)] transition-all duration-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-black uppercase tracking-widest text-[#A79277] flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  Recent Mistakes
                </p>
                <Link href="/weakness-hunter" className="text-xs font-bold text-zinc-400 hover:text-[#A79277] transition-colors">View All</Link>
              </div>
              <div className="space-y-3">
                {recentMistakes.length > 0 ? (
                  recentMistakes.map(w => (
                    <div key={w.id} className="group flex items-center gap-4 p-3 rounded-2xl bg-white hover:bg-[#FFF2E1]/50 border border-zinc-100 hover:border-[#A79277]/30 transition-all cursor-pointer shadow-sm">
                      <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center text-xs font-black shadow-sm ${
                        w.severity === 'critical' ? 'bg-[#ef4444]/15 text-[#ef4444]' :
                        w.severity === 'moderate' ? 'bg-[#f59e0b]/15 text-[#f59e0b]' :
                        'bg-[#10b981]/15 text-[#10b981]'
                      }`}>
                        {w.category.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-zinc-900 truncate group-hover:text-[#A79277] transition-colors">{w.title}</p>
                        <p className="text-xs font-medium text-zinc-500 mt-0.5">Last seen: {w.lastSeen}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center rounded-2xl border border-dashed border-[#A79277]/30 bg-white/50">
                     <p className="text-sm font-medium text-[#6B5A47]">No recent mistakes found! 🚀</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
