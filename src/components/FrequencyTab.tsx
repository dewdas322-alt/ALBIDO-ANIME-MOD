import React, { useMemo } from 'react';
import { K3Issue } from '../types/k3';
import { computeFrequencyAnalysis } from '../utils/engine';
import { BarChart3, Flame, Snowflake, TrendingUp, Compass } from 'lucide-react';

interface FrequencyTabProps {
  history: K3Issue[];
}

export const FrequencyTab: React.FC<FrequencyTabProps> = ({ history }) => {
  const analysis = useMemo(() => {
    return computeFrequencyAnalysis(history);
  }, [history]);

  const maxCount = useMemo(() => {
    let m = 1;
    Object.values(analysis.sumCounts).forEach(c => {
      if (c > m) m = c;
    });
    return m;
  }, [analysis]);

  return (
    <div className="space-y-3 font-mono">
      {/* Header Info */}
      <div className="flex items-center justify-between p-2.5 bg-black/40 border border-white/10 rounded-2xl backdrop-blur-xl">
        <div className="flex items-center gap-1.5">
          <BarChart3 className="w-3.5 h-3.5 text-red-400" />
          <h3 className="text-xs font-['Orbitron'] font-bold text-zinc-100">
            LAST 100 DRAWS · FREQUENCY
          </h3>
        </div>
        <span className="text-[10px] text-amber-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
          {analysis.totalAnalyzed} ROUNDS
        </span>
      </div>

      {/* Big vs Small & Even vs Odd Dual Cards */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Size Spectrum */}
        <div className="bg-black/40 border border-white/10 rounded-2xl p-2.5 space-y-1.5 backdrop-blur-xl">
          <div className="flex justify-between items-center text-[10px] text-zinc-400">
            <span>SIZE (3-18)</span>
            <span className="text-zinc-200 font-bold">AVG {analysis.averageSum}</span>
          </div>

          <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden flex border border-white/5">
            <div 
              style={{ width: `${analysis.bigPct}%` }}
              className="bg-red-500 transition-all duration-300"
            />
            <div 
              style={{ width: `${analysis.smallPct}%` }}
              className="bg-amber-500 transition-all duration-300"
            />
          </div>

          <div className="flex justify-between text-[10px]">
            <span className="text-red-400 font-bold">BIG: {analysis.bigPct}%</span>
            <span className="text-amber-400 font-bold">SML: {analysis.smallPct}%</span>
          </div>
        </div>

        {/* Parity Spectrum */}
        <div className="bg-black/40 border border-white/10 rounded-2xl p-2.5 space-y-1.5 backdrop-blur-xl">
          <div className="flex justify-between items-center text-[10px] text-zinc-400">
            <span>PARITY</span>
            <span className="text-zinc-200 font-bold">RATIO</span>
          </div>

          <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden flex border border-white/5">
            <div 
              style={{ width: `${analysis.evenPct}%` }}
              className="bg-cyan-500 transition-all duration-300"
            />
            <div 
              style={{ width: `${analysis.oddPct}%` }}
              className="bg-purple-500 transition-all duration-300"
            />
          </div>

          <div className="flex justify-between text-[10px]">
            <span className="text-cyan-400 font-bold">EVN: {analysis.evenPct}%</span>
            <span className="text-purple-400 font-bold">ODD: {analysis.oddPct}%</span>
          </div>
        </div>
      </div>

      {/* Hot & Cold Spotlight */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-black/40 border border-white/10 rounded-2xl p-2.5 backdrop-blur-xl">
          <div className="flex items-center gap-1 text-[10px] text-red-400 font-bold mb-1.5">
            <Flame className="w-3 h-3 text-red-500" />
            <span>HOTTEST NUMBERS</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {analysis.hotNumbers.map((h, i) => (
              <div key={i} className="bg-white/5 rounded-lg p-1 text-center border border-white/5">
                <div className="text-sm font-black font-['Orbitron'] text-white">#{h.num}</div>
                <div className="text-[9px] text-zinc-400">{h.count} hits ({h.pct}%)</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-black/40 border border-white/10 rounded-2xl p-2.5 backdrop-blur-xl">
          <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-bold mb-1.5">
            <Snowflake className="w-3 h-3 text-cyan-400" />
            <span>COLD / DUE REVERSION</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {analysis.coldNumbers.map((c, i) => (
              <div key={i} className="bg-white/5 rounded-lg p-1 text-center border border-white/5">
                <div className="text-sm font-black font-['Orbitron'] text-white">#{c.num}</div>
                <div className="text-[9px] text-zinc-400">{c.count} hits ({c.pct}%)</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Complete 3-18 Sum Distribution Histogram */}
      <div className="bg-black/40 border border-white/10 rounded-2xl p-3 backdrop-blur-xl">
        <div className="text-[10px] text-zinc-400 mb-2 flex justify-between">
          <span>SUM 3 TO 18 FREQUENCY DISTRIBUTION</span>
          <span className="text-amber-400">PEAK: 10-11</span>
        </div>

        <div className="grid grid-cols-16 gap-0.5 h-24 items-end pt-2 pb-1 border-b border-white/5">
          {Array.from({ length: 16 }, (_, i) => i + 3).map(num => {
            const count = analysis.sumCounts[num] || 0;
            const heightPct = Math.max(8, Math.round((count / (maxCount || 1)) * 100));
            const isBig = num >= 11;
            const isHot = analysis.hotNumbers.some(h => h.num === num);

            return (
              <div key={num} className="flex flex-col items-center h-full justify-end group">
                <div 
                  className={`w-full rounded-t transition-all ${
                    isHot 
                      ? 'bg-gradient-to-t from-red-500 to-amber-400 shadow-sm' 
                      : isBig 
                        ? 'bg-red-500/70 hover:bg-red-400' 
                        : 'bg-amber-500/70 hover:bg-amber-400'
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-16 gap-0.5 text-center pt-1.5">
          {Array.from({ length: 16 }, (_, i) => i + 3).map(num => (
            <span 
              key={num} 
              className={`text-[9px] font-bold ${
                num >= 11 ? 'text-red-400' : 'text-amber-400'
              }`}
            >
              {num}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
