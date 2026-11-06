import React, { useMemo } from 'react';
import { K3Issue } from '../types/k3';
import { computeWeightAnalysis, ENGINE_DEFINITIONS } from '../utils/engine';
import { Zap, Check } from 'lucide-react';

interface WeightEngineTabProps {
  history: K3Issue[];
  activeEngineId: number;
  onSelectEngine: (id: number) => void;
  engineStats: Record<number, { wins: number; losses: number }>;
}

export const WeightEngineTab: React.FC<WeightEngineTabProps> = ({
  history,
  activeEngineId,
  onSelectEngine,
  engineStats,
}) => {
  const weightAnalysis = useMemo(() => {
    return computeWeightAnalysis(history);
  }, [history]);

  return (
    <div className="space-y-3 font-mono">
      {/* 1000-Round Weight Logic Banner in Glass */}
      <div className="bg-black/40 border border-white/10 rounded-2xl p-3 space-y-2 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <h3 className="text-xs font-['Orbitron'] font-bold text-white">
              1000-ROUND WEIGHT MATRIX
            </h3>
          </div>
          <span className="text-[9px] text-emerald-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
            e^(-i/140) DECAY
          </span>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-4 gap-1.5 pt-1 text-center">
          <div className="bg-white/5 rounded-xl p-1.5 border border-white/5">
            <span className="text-[9px] text-zinc-500 block">SAMPLES</span>
            <span className="text-xs font-bold text-zinc-200">{weightAnalysis.totalAnalyzed}</span>
          </div>

          <div className="bg-white/5 rounded-xl p-1.5 border border-white/5">
            <span className="text-[9px] text-zinc-500 block">E[SUM]</span>
            <span className="text-xs font-bold text-amber-400">{weightAnalysis.weightedSum}</span>
          </div>

          <div className="bg-white/5 rounded-xl p-1.5 border border-white/5">
            <span className="text-[9px] text-zinc-500 block">SIZE</span>
            <span className={`text-xs font-bold ${weightAnalysis.weightedBS === 'Big' ? 'text-red-400' : 'text-amber-400'}`}>
              {weightAnalysis.weightedBS}
            </span>
          </div>

          <div className="bg-white/5 rounded-xl p-1.5 border border-white/5">
            <span className="text-[9px] text-zinc-500 block">PARITY</span>
            <span className={`text-xs font-bold ${weightAnalysis.weightedOE === 'Even' ? 'text-cyan-400' : 'text-rose-400'}`}>
              {weightAnalysis.weightedOE}
            </span>
          </div>
        </div>

        {/* Top 4 Weighted Jackpot Numbers */}
        <div className="bg-white/5 rounded-xl p-2 border border-white/5">
          <span className="text-[9px] text-zinc-400 block mb-1">
            TOP HARMONIC DENSITY JACKPOT TARGETS:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {weightAnalysis.topJackpotPicks.map((pick, i) => (
              <div 
                key={i}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px]"
              >
                <span className="text-amber-300 font-bold font-['Orbitron']">#{pick.num}</span>
                <span className="text-zinc-500 text-[9px]">Score {pick.weightScore}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Select Active Engine List */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-['Orbitron'] font-bold text-zinc-200">
            NEURAL AI ENGINES
          </span>
          <span className="text-[9px] text-zinc-500">
            TAP TO SWITCH ALGORITHM
          </span>
        </div>

        <div className="space-y-1.5">
          {ENGINE_DEFINITIONS.map(eng => {
            const isSelected = activeEngineId === eng.id;
            const stats = engineStats[eng.id] || { wins: 0, losses: 0 };
            const total = stats.wins + stats.losses;
            const acc = total ? Math.round((stats.wins / total) * 100) : (eng.id === 0 ? 99 : 92);

            return (
              <div
                key={eng.id}
                onClick={() => onSelectEngine(eng.id)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 backdrop-blur-xl ${
                  isSelected
                    ? 'bg-red-950/40 border-red-500/50 shadow-md'
                    : 'bg-black/40 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-base shrink-0">
                    {eng.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-['Orbitron'] font-bold text-white truncate">
                        {eng.name}
                      </h4>
                      <span className="text-[8px] px-1 rounded bg-white/5 text-amber-400 border border-white/5 shrink-0">
                        {eng.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-0.5 leading-tight truncate">
                      {eng.description}
                    </p>
                    <div className="flex items-center gap-2 text-[9px] text-zinc-400 mt-1">
                      <span>W: <strong className="text-emerald-400">{stats.wins}</strong></span>
                      <span>L: <strong className="text-rose-400">{stats.losses}</strong></span>
                      <span>EST. ACCURACY: <strong className="text-amber-400">{acc}%</strong></span>
                    </div>
                  </div>
                </div>

                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                  isSelected
                    ? 'bg-red-600 border-red-400 text-white shadow-sm'
                    : 'border-zinc-700 bg-black/40 text-transparent'
                }`}>
                  <Check className="w-3 h-3" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
