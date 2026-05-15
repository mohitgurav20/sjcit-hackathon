"use client";

import { motion } from "framer-motion";

export function BackgroundMesh() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#FFF2E1] via-[#FDF9F1] to-[#FDF9F1] opacity-70" />
      <motion.div 
        animate={{ y: [0, -30, 0], scale: [1, 1.05, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-gradient-to-r from-[#A79277]/30 to-[#D4B996]/30 rounded-full blur-[120px]"
      />
      <motion.div 
        animate={{ y: [0, 40, 0], scale: [1, 1.1, 1], opacity: [0.15, 0.3, 0.15] }}
        transition={{ repeat: Infinity, duration: 10, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[-10%] right-[5%] w-[600px] h-[600px] bg-gradient-to-r from-[#D4B996]/20 to-[#8C7A61]/20 rounded-full blur-[140px]"
      />
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxNjcsIDE0NiwgMTE5LCAwLjA2KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] [mask-image:linear-gradient(to_bottom,white,transparent,transparent)] opacity-40 pointer-events-none" />
    </div>
  );
}
