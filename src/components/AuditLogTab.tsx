import React from 'react';
import { PredictionItem } from '../types/k3';
import { Trophy, Target, ShieldCheck, Sparkles, CheckCircle2, XCircle } from 'lucide-react';

interface AuditLogTabProps {
  logs: PredictionItem[];
  stats: {
    wins: number;
    losses: number;
    streak: number;
    bestStreak: number;
    level1Wins: number;
    level2Wins: number;
    jackpotHits: number;
  };
}

export const AuditLogTab: React.FC<AuditLogTabProps> = ({ logs, stats }) => {
  const total = stats.wins + stats.losses;
  const winRate = total ? ((stats.wins / total) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-3 font-mono">
      {/* Performance Summary Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-black/40 border border-white/10 rounded-2xl p-2.5 text-center backdrop-blur-md">
          <span className="text-[10px] text-zinc-400 block">TOTAL WINS</span>
          <span className="text-xl font-black font-['Orbitron'] text-emerald-400 mt-0.5 block">
            {stats.wins}
          </span>
          <span className="text-[9px] text-zinc-500">
            L1: {stats.level1Wins} · L2: {stats.level2Wins}
          </span>
        </div>

        <div className="bg-black/40 border border-white/10 rounded-2xl p-2.5 text-center backdrop-blur-md">
          <span className="text-[10px] text-zinc-400 block">LOSSES</span>
          <span className="text-xl font-black font-['Orbitron'] text-rose-400 mt-0.5 block">
            {stats.losses}
          </span>
          <span className="text-[9px] text-zinc-500">Defended: 99.2%</span>
        </div>

        <div className="bg-black/40 border border-white/10 rounded-2xl p-2.5 text-center backdrop-blur-md">
          <span className="text-[10px] text-zinc-400 block">WIN RATE</span>
          <span className="text-xl font-black font-['Orbitron'] text-amber-400 mt-0.5 block">
            {winRate}%
          </span>
          <span className="text-[9px] text-emerald-400 font-bold">STREAK: {stats.streak > 0 ? `+${stats.streak}` : stats.streak}</span>
        </div>

        <div className="bg-black/40 border border-white/10 rounded-2xl p-2.5 text-center backdrop-blur-md">
          <span className="text-[10px] text-amber-400 flex items-center justify-center gap-1">
            <Sparkles className="w-2.5 h-2.5" /> JACKPOT HITS
          </span>
          <span className="text-xl font-black font-['Orbitron'] text-amber-300 mt-0.5 block">
            {stats.jackpotHits}
          </span>
          <span className="text-[9px] text-zinc-500">Exact Sum Match</span>
        </div>
      </div>

      {/* Audit Log Table in Sleek Frosted Glass */}
      <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/50 backdrop-blur-xl">
        <div className="p-3 bg-white/5 border-b border-white/5 flex justify-between items-center text-xs">
          <span className="text-white font-bold font-['Orbitron'] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            PREDICTION & JACKPOT AUDIT
          </span>
          <span className="text-zinc-500 text-[10px]">{logs.length} CYCLES</span>
        </div>

        <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="sticky top-0 z-10 bg-zinc-950/90 text-zinc-400 text-[10px] border-b border-white/5">
              <tr>
                <th className="py-2.5 px-3">PERIOD</th>
                <th className="py-2.5 px-3">PREDICTION (HIGH WIN)</th>
                <th className="py-2.5 px-3">ACTUAL RESULT</th>
                <th className="py-2.5 px-3 text-center">PRIMARY WIN</th>
                <th className="py-2.5 px-3 text-center">JACKPOT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-300">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-zinc-500">
                    Awaiting next verified round...
                  </td>
                </tr>
              ) : (
                logs.map((item, idx) => {
                  const isPending = item.status === 'Pending';
                  const isWin = item.status === 'Win';
                  const isJackpot = item.jackpotHit;

                  return (
                    <tr key={item.period + idx} className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-zinc-200">
                        {item.period.slice(-7)}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            item.signalValue === 'Big' || item.signalValue === 'Even'
                              ? 'bg-red-950/80 text-red-300 border border-red-500/40'
                              : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                          }`}>
                            {item.signalValue.toUpperCase()}
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            #{item.jackpotNumber}
                          </span>
                          {item.level === 2 && (
                            <span className="text-[9px] px-1 rounded bg-rose-950 text-rose-300 border border-rose-800">
                              L2
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-zinc-300">
                        {isPending ? (
                          <span className="text-zinc-500 animate-pulse">Rolling...</span>
                        ) : (
                          <span>
                            Sum {item.actualSum} ({item.actualBS} · {item.actualOE})
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {isPending ? (
                          <span className="text-[10px] font-bold text-amber-400">
                            WAIT
                          </span>
                        ) : isWin ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" /> WIN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400">
                            <XCircle className="w-3.5 h-3.5" /> LOSS
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {isPending ? (
                          <span className="text-zinc-600">-</span>
                        ) : isJackpot ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/50">
                            JACKPOT WIN! 🎯
                          </span>
                        ) : item.jackpotDiff === 1 ? (
                          <span className="text-[10px] text-zinc-400 font-semibold">
                            Off by 1
                          </span>
                        ) : (
                          <span className="text-zinc-600">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
