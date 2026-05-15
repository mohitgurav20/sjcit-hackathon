import { WeaknessHunterPanel } from "@/components/weakness-hunter/WeaknessHunterPanel";
import { getWeaknessSummary } from "@/lib/weakness-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Target } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function WeaknessHunterPage() {
  const summary = await getWeaknessSummary();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-zinc-900 flex items-center gap-4 drop-shadow-sm">
          <div className="h-12 w-12 rounded-2xl bg-white/60 backdrop-blur-md flex items-center justify-center shadow-sm border border-[#A79277]/20">
            <Target className="h-6 w-6 text-[#A79277]" />
          </div>
          Weakness Hunter
        </h1>
        <p className="text-[#6B5A47] mt-3 font-medium text-lg ml-16">
          Track and eliminate your recurring logical mistakes using LogicReplay.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Stats Card */}
        <Card className="bg-white/60 backdrop-blur-xl border border-[#A79277]/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] hover:shadow-[0_20px_40px_rgba(167,146,119,0.1)] transition-all duration-500 lg:col-span-1 h-fit">
          <CardHeader className="pb-4 border-b border-[#A79277]/10 bg-white/40">
            <CardTitle className="flex items-center gap-2 text-xl font-bold text-zinc-900">
              <AlertTriangle className="h-5 w-5 text-[#A79277]" />
              Weakness Summary
            </CardTitle>
            <CardDescription className="text-[#6B5A47] font-medium">
              {summary.totalOccurrences} total mistakes tracked across {summary.total} patterns
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center justify-between p-5 rounded-2xl bg-[#ef4444]/5 border border-[#ef4444]/20 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                <span className="text-xs font-black uppercase tracking-widest text-[#ef4444]/80">Critical</span>
                <span className="text-4xl font-black text-[#ef4444] drop-shadow-sm">{summary.critical}</span>
              </div>
              <div className="flex items-center justify-between p-5 rounded-2xl bg-[#f59e0b]/5 border border-[#f59e0b]/20 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                <span className="text-xs font-black uppercase tracking-widest text-[#f59e0b]/80">Moderate</span>
                <span className="text-4xl font-black text-[#f59e0b] drop-shadow-sm">{summary.moderate}</span>
              </div>
              <div className="flex items-center justify-between p-5 rounded-2xl bg-[#10b981]/5 border border-[#10b981]/20 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                <span className="text-xs font-black uppercase tracking-widest text-[#10b981]/80">Minor</span>
                <span className="text-4xl font-black text-[#10b981] drop-shadow-sm">{summary.minor}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Full Weakness Hunter Panel */}
        <div className="lg:col-span-2">
          <Card className="bg-white/60 backdrop-blur-xl border border-[#A79277]/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem]">
            <CardContent className="p-6">
              <WeaknessHunterPanel weaknesses={summary.weaknesses} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
