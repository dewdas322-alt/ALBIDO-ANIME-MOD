import React, { useState } from 'react';
import { Send, Check, Sparkles, Flame, ExternalLink, Copy } from 'lucide-react';

export const OwnerCard: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const telegramLink = 'https://t.me/PROFITWITHAJAY';

  const handleCopy = () => {
    navigator.clipboard.writeText(telegramLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-4 shadow-xl">
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono">
        {/* Left Avatar & Architect Info */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 p-0.5 shadow-md">
              <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center font-['Orbitron'] font-black text-lg text-white">
                AT
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-black flex items-center justify-center" title="Verified Trader">
              <Check className="w-2.5 h-2.5 text-black stroke-[3]" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-['Orbitron'] text-sm font-black text-white tracking-wide">
                AJAY TRADER
              </h3>
              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-0.5">
                <Sparkles className="w-2 h-2" /> VERIFIED
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              BRAHMASTRA AI ARCHITECT
            </p>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleCopy}
            className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 text-xs transition-colors flex items-center gap-1 shrink-0"
            title="Copy Telegram Link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'COPIED!' : 'COPY'}</span>
          </button>

          <a
            href={telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-['Orbitron'] font-bold text-xs tracking-wide shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>JOIN TELEGRAM</span>
            <ExternalLink className="w-3 h-3 text-amber-200" />
          </a>
        </div>
      </div>

      <div className="mt-2.5 pt-2.5 border-t border-white/5 flex flex-wrap items-center justify-between gap-1 text-[10px] font-mono text-zinc-400">
        <span className="flex items-center gap-1 text-zinc-300">
          <Flame className="w-3 h-3 text-red-400" />
          VIP Signals, Strategy Leaks & Real Draws
        </span>
        <span className="text-amber-400 font-semibold">
          @PROFITWITHAJAY
        </span>
      </div>
    </div>
  );
};
