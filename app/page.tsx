"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import { 
  ArrowRight, BrainCircuit, Code2, BookX, ZapOff, 
  Mic, SquareTerminal, GitBranch, Target, Network, 
  Briefcase, Headphones, LineChart, PlayCircle, Sparkles,
  Layers, Lock, Cpu
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 }
  }
};

const technologies = [
  "TypeScript", "React", "Next.js", "Python", "Node.js", "PostgreSQL", 
  "GraphQL", "Docker", "AWS", "Rust", "Go", "Supabase", "TailwindCSS"
];

export default function Home() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const yCode = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const rotateXCode = useTransform(scrollYProgress, [0, 1], [15, 0]);

  return (
    <div className="min-h-screen bg-[#FDF9F1] text-zinc-900 font-sans selection:bg-[#A79277] selection:text-white overflow-x-hidden">
      
      {/* 1. Ultra-Premium Parallax Hero Section */}
      <section ref={heroRef} className="relative min-h-[110vh] flex flex-col items-center justify-start px-6 overflow-hidden pt-32 pb-20 perspective-[2000px]">
        {/* Dynamic Mesh/Gradient Background with Parallax */}
        <motion.div style={{ y: yBg }} className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#FFF2E1] via-[#FDF9F1] to-[#FDF9F1] opacity-90" />
          <motion.div 
            animate={{ y: [0, -40, 0], scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
            className="absolute top-[-10%] left-[10%] w-[600px] h-[600px] bg-gradient-to-r from-[#A79277]/30 to-[#D4B996]/30 rounded-full blur-[120px]"
          />
          <motion.div 
            animate={{ y: [0, 40, 0], scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ repeat: Infinity, duration: 12, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-[-10%] right-[5%] w-[700px] h-[700px] bg-gradient-to-r from-[#D4B996]/20 to-[#8C7A61]/20 rounded-full blur-[140px]"
          />
          {/* Animated Grid Pattern */}
          <motion.div 
            animate={{ backgroundPosition: ["0px 0px", "0px 40px"] }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxNjcsIDE0NiwgMTE5LCAwLjA2KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] [mask-image:linear-gradient(to_bottom,white,transparent,transparent)] pointer-events-none" 
          />
        </motion.div>

        <motion.div 
          style={{ opacity: opacityHero }}
          initial="hidden" animate="visible" variants={staggerContainer}
          className="relative z-20 w-full max-w-5xl mx-auto text-center"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/70 backdrop-blur-xl text-[#8C7A61] font-bold text-sm mb-10 border border-[#A79277]/30 shadow-[0_4px_20px_rgba(167,146,119,0.15)] hover:shadow-[0_4px_30px_rgba(167,146,119,0.25)] hover:bg-white/90 transition-all cursor-default">
            <Sparkles className="w-4 h-4 text-[#A79277]" />
            <span className="tracking-widest uppercase text-[11px]">The Next Evolution of CS Education</span>
          </motion.div>
          
          <motion.div variants={fadeUp} className="relative z-30">
            <h1 className="text-6xl md:text-[6rem] lg:text-[7rem] font-black tracking-tighter text-zinc-900 mb-8 leading-[0.95] drop-shadow-sm">
              Don't memorize. <br className="hidden md:block" />
              <span className="bg-gradient-to-br from-[#6B5A47] via-[#A79277] to-[#D4B996] bg-clip-text text-transparent filter drop-shadow-lg">
                Forge Logic.
              </span>
            </h1>
          </motion.div>
          
          <motion.p variants={fadeUp} className="text-xl md:text-2xl text-[#6B5A47] font-medium mb-12 max-w-3xl mx-auto leading-relaxed">
            Stop watching tutorials and start building with your AI Pair-Programming Mentor. Real-time voice feedback, auto-opening editors, and visual logic maps.
          </motion.p>
          
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link 
              href="/pairmentor" 
              className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-white bg-zinc-900 rounded-2xl overflow-hidden transition-all hover:scale-105 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#A79277] to-[#8C7A61] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative flex items-center gap-2">
                Start Learning Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link 
              href="#features" 
              className="group inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-zinc-900 bg-white/70 backdrop-blur-xl rounded-2xl border border-[#A79277]/30 hover:bg-white/100 hover:shadow-[0_10px_30px_rgba(167,146,119,0.2)] transition-all"
            >
              <PlayCircle className="w-5 h-5 mr-2 text-[#A79277] group-hover:scale-110 transition-transform" />
              See How It Works
            </Link>
          </motion.div>
        </motion.div>

        {/* 3D Tilted Floating Code UI Element */}
        <motion.div 
          style={{ y: yCode, rotateX: rotateXCode }}
          initial={{ opacity: 0, y: 150, rotateX: 25 }}
          animate={{ opacity: 1, y: 0, rotateX: 15 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-5xl mx-auto mt-24 transform-gpu"
        >
          {/* Outer Glow */}
          <div className="absolute -inset-4 bg-gradient-to-b from-[#A79277]/30 to-transparent blur-2xl opacity-50 rounded-[2.5rem]" />
          
          <div className="relative rounded-[2rem] overflow-hidden shadow-[0_40px_100px_rgba(167,146,119,0.25)] border-[1.5px] border-white/60 bg-white/50 backdrop-blur-2xl aspect-[21/9] flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 pointer-events-none" />
            
            <div className="relative h-12 bg-white/60 backdrop-blur-md border-b border-white/50 flex items-center px-6 gap-2">
              <div className="flex gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] shadow-sm border border-black/10" />
                <div className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] shadow-sm border border-black/10" />
                <div className="w-3.5 h-3.5 rounded-full bg-[#27C93F] shadow-sm border border-black/10" />
              </div>
              <div className="mx-auto flex items-center gap-2 bg-white/50 px-4 py-1 rounded-full border border-white/60 shadow-sm">
                <Lock className="w-3 h-3 text-[#A79277]" />
                <span className="text-xs font-semibold text-zinc-600 font-sans tracking-wide">mentorforge.ai/session</span>
              </div>
            </div>
            
            <div className="relative flex-1 p-8 md:p-12 font-mono text-sm md:text-lg text-zinc-800 flex flex-col gap-3">
              <div className="flex gap-6 opacity-50"><span className="text-[#A79277] select-none">1</span><span className="text-purple-600 font-semibold">function</span> <span className="text-blue-600 font-semibold">binarySearch</span>(arr: number[], target: number) {"{"}</div>
              <div className="flex gap-6"><span className="text-[#A79277] select-none">2</span><span className="ml-8 text-zinc-500 italic">// "Initialize your pointers here, John."</span></div>
              <div className="flex gap-6"><span className="text-[#A79277] select-none">3</span><span className="ml-8"><span className="text-purple-600 font-semibold">let</span> left = 0;</span></div>
              <div className="flex gap-6"><span className="text-[#A79277] select-none">4</span><span className="ml-8"><span className="text-purple-600 font-semibold">let</span> right = arr.length - 1;</span></div>
              <div className="flex gap-6"><span className="text-[#A79277] select-none">5</span><span className="ml-8 w-1 h-5 bg-[#A79277] animate-pulse" /></div>
              <div className="flex gap-6 opacity-50"><span className="text-[#A79277] select-none">6</span>{"}"}</div>
            </div>
            
            {/* Fake Voice Waveform HUD */}
            <div className="absolute bottom-8 right-8 px-5 py-3 rounded-2xl bg-zinc-900/90 backdrop-blur-xl shadow-2xl border border-white/10 flex items-center gap-4 hover:scale-105 transition-transform cursor-pointer">
              <div className="relative flex items-center justify-center w-4 h-4">
                <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-40" />
                <div className="relative w-2 h-2 rounded-full bg-green-500" />
              </div>
              <div className="flex gap-1.5 items-end h-5">
                {[1,3,2,5,3,4,1,2].map((h,i) => (
                  <motion.div key={i} animate={{ height: [4, h*4, 4] }} transition={{ repeat: Infinity, duration: 1.2, delay: i*0.1 }} className="w-1.5 bg-white rounded-full" />
                ))}
              </div>
              <span className="text-sm text-white font-bold ml-1 tracking-wide">AI Mentor Active</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Infinite Tech Marquee */}
      <div className="relative py-8 bg-white/40 border-y border-[#A79277]/20 backdrop-blur-lg overflow-hidden flex z-30 shadow-sm">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#FDF9F1] to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#FDF9F1] to-transparent z-10" />
        
        <motion.div
          animate={{ x: [0, -1035] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="flex space-x-16 items-center whitespace-nowrap px-8"
        >
          {[...technologies, ...technologies, ...technologies].map((tech, i) => (
            <span key={i} className="text-2xl font-black text-[#A79277]/20 uppercase tracking-widest flex items-center gap-3">
              <Cpu className="w-6 h-6 text-[#A79277]/30" />
              {tech}
            </span>
          ))}
        </motion.div>
      </div>

      {/* 2. Problem Section */}
      <section className="py-32 px-6 bg-white/60 relative z-20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
            className="text-center mb-24"
          >
            <h2 className="text-5xl md:text-6xl font-black text-zinc-900 mb-6 tracking-tighter">The industry is broken. <br/><span className="text-[#A79277]">We're fixing it.</span></h2>
            <p className="text-[#6B5A47] text-xl max-w-3xl mx-auto font-medium">Traditional platforms train you to be a code-monkey. Engineering is about logic, deduction, and architectural thinking.</p>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              { icon: BookX, title: "The Tutorial Hell", desc: "Mindlessly copying code from 10-hour videos gives a false sense of mastery. You learn syntax, but not logic." },
              { icon: ZapOff, title: "Pattern Memorization", desc: "Grinding algorithms by memorizing optimal solutions leaves you helpless when a problem has a slight twist." },
              { icon: BrainCircuit, title: "Zero Real Feedback", desc: "When you get stuck, looking up the answer kills the learning process. You need a senior to guide your thoughts." }
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp} className="group bg-white/80 backdrop-blur-xl p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#A79277]/10 flex flex-col items-center text-center hover:-translate-y-3 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(167,146,119,0.15)]">
                <div className="w-20 h-20 bg-[#FDF9F1] group-hover:bg-[#A79277] group-hover:text-white rounded-[1.5rem] flex items-center justify-center text-[#A79277] mb-8 shadow-inner transition-colors duration-500 rotate-3 group-hover:rotate-0">
                  <item.icon className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 mb-4">{item.title}</h3>
                <p className="text-[#6B5A47] leading-relaxed text-lg">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 3. Features Section - Glassmorphism Grid */}
      <section id="features" className="py-40 px-6 relative z-10 border-t border-[#A79277]/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-[#FFF2E1] via-[#FDF9F1] to-transparent opacity-80 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
            className="text-center mb-24"
          >
            <div className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-[#A79277]/10 text-[#A79277] font-bold text-sm mb-6 uppercase tracking-widest shadow-sm">Platform Features</div>
            <h2 className="text-5xl md:text-7xl font-black text-zinc-900 mb-6 tracking-tighter">Engineered for <br/><span className="bg-gradient-to-r from-[#8C7A61] to-[#A79277] bg-clip-text text-transparent">Deep Mastery</span></h2>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              { icon: Mic, title: "Voice-First AI Mentor", desc: "Talk naturally with a Socratic AI. It asks you leading questions and guides your logic, refusing to just hand you the answer." },
              { icon: SquareTerminal, title: "Auto-Opening Editor", desc: "When the AI asks you to write code, a pristine Monaco editor magically floats up. Type seamlessly while continuing the conversation." },
              { icon: GitBranch, title: "LogicForge Canvas", desc: "Visual learner? Drag and drop logic blocks on an infinite canvas to map out your algorithm before touching any code." },
              { icon: Target, title: "Weakness Hunter", desc: "The AI tracks every mistake. It builds a profile of your logical gaps and automatically replays scenarios to ensure complete mastery." },
              { icon: Network, title: "Tech Stack Mindmaps", desc: "Watch your proficiency grow visually. Every concept you master unlocks connected nodes in a beautiful, interactive knowledge graph." },
              { icon: Briefcase, title: "Mock Interview Mode", desc: "Flip a switch and your friendly mentor turns into a strict FAANG interviewer. Practice under pressure with follow-ups and time constraints." }
            ].map((feature, i) => (
              <motion.div 
                key={i} 
                variants={fadeUp}
                className="group relative bg-white/60 backdrop-blur-2xl p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:bg-white hover:shadow-[0_30px_60px_rgba(167,146,119,0.2)] transition-all duration-500 overflow-hidden"
              >
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-gradient-to-bl from-[#A79277]/15 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="w-16 h-16 bg-[#FFF2E1] rounded-[1.5rem] flex items-center justify-center text-[#A79277] mb-8 shadow-sm group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500 border border-[#A79277]/20">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 mb-4">{feature.title}</h3>
                <p className="text-[#6B5A47] text-lg font-medium leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. How It Works Section - Dark Elegant */}
      <section className="py-40 px-6 bg-zinc-950 text-white relative overflow-hidden rounded-t-[4rem] shadow-[0_-20px_50px_rgba(0,0,0,0.1)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#A79277]/20 via-transparent to-transparent opacity-60" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
            className="text-center mb-32"
          >
            <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-white">Your Path to Mastery</h2>
            <p className="text-zinc-400 text-xl md:text-2xl font-medium max-w-3xl mx-auto">Three simple steps to transform the way you think and code.</p>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}
            className="grid lg:grid-cols-3 gap-16 relative"
          >
            {/* Connecting line for desktop */}
            <div className="hidden lg:block absolute top-[5.5rem] left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-[#A79277]/50 to-transparent shadow-[0_0_10px_#A79277]" />

            {[
              { icon: Headphones, step: "01", title: "Initialize Session", desc: "Connect your mic, state your goal, and let your AI mentor evaluate your current understanding." },
              { icon: Code2, step: "02", title: "Forge the Logic", desc: "Engage in Socratic dialogue. Build visual flows, handle edge cases, and write code iteratively." },
              { icon: LineChart, step: "03", title: "Track & Evolve", desc: "Review your performance metrics, watch your mindmap expand, and tackle targeted weakness replays." }
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp} className="relative z-10 flex flex-col items-center text-center group">
                <div className="w-44 h-44 bg-zinc-900/80 backdrop-blur-xl rounded-full border border-zinc-700/50 flex flex-col items-center justify-center mb-10 shadow-2xl group-hover:border-[#A79277] group-hover:bg-[#A79277]/10 transition-colors duration-500 relative">
                  <div className="absolute inset-0 rounded-full border border-[#A79277]/0 group-hover:border-[#A79277]/50 group-hover:scale-110 transition-all duration-700" />
                  <span className="text-zinc-500 font-mono font-bold text-sm tracking-widest mb-2">{item.step}</span>
                  <item.icon className="w-12 h-12 text-[#A79277]" />
                </div>
                <h3 className="text-3xl md:text-4xl font-bold mb-4">{item.title}</h3>
                <p className="text-zinc-400 text-xl leading-relaxed max-w-sm">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
          
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-32 text-center">
             <Link 
              href="/pairmentor" 
              className="inline-flex items-center justify-center px-12 py-6 text-xl font-bold text-zinc-900 bg-[#FFF2E1] rounded-full hover:bg-white transition-all shadow-[0_0_40px_rgba(167,146,119,0.3)] hover:shadow-[0_0_80px_rgba(167,146,119,0.6)] hover:-translate-y-2 group"
            >
              Start Your First Session
              <ArrowRight className="ml-3 w-6 h-6 text-[#A79277] group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="bg-black py-16 px-6 text-zinc-500 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-3">
              <BrainCircuit className="w-8 h-8 text-[#A79277]" />
              <span className="text-2xl font-black text-white tracking-tight">MentorForge</span>
            </div>
            <p className="text-sm font-medium">Building the next generation of engineers.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-10 text-sm font-bold uppercase tracking-widest">
            <Link href="/dashboard" className="hover:text-[#A79277] transition-colors">Dashboard</Link>
            <Link href="/pairmentor" className="hover:text-[#A79277] transition-colors">PairMentor</Link>
            <Link href="/tech-stacks" className="hover:text-[#A79277] transition-colors">Tech Stacks</Link>
          </div>
          <p className="text-sm font-mono">© {new Date().getFullYear()} MENTORFORGE AI.</p>
        </div>
      </footer>

    </div>
  );
}
