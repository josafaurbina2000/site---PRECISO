import { useEffect, useState } from "react";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50 animate-fade-in pointer-events-none select-none">
      <style>{`
        @keyframes dot-breathe {
          0%, 100% {
            transform: scale(1);
            filter: drop-shadow(0 0 0px rgba(16, 185, 129, 0));
          }
          50% {
            transform: scale(1.45);
            filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.7));
          }
        }
        .animate-dot-breathe {
          animation: dot-breathe 2.4s ease-in-out infinite;
        }
      `}</style>
      
      <div className="flex flex-col items-center gap-3">
        {/* Clean centered Logo with animated green dot */}
        <div className="flex items-baseline gap-0.5">
          <span className="text-[28px] font-extrabold tracking-tight text-[#111827]">
            preciso
          </span>
          <span className="h-2 w-2 rounded-full bg-[#10B981] mb-1.5 animate-dot-breathe"></span>
        </div>
        
        {/* Subtle, elegant text with gentle fade */}
        <p className="text-[11px] font-black tracking-wider text-text-muted uppercase opacity-80 mt-2 animate-pulse">
          Entrando no Preciso...
        </p>
      </div>
    </div>
  );
}
