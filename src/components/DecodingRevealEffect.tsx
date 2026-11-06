import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Cpu, Zap } from 'lucide-react';
import { sound } from '../utils/audio';

interface DecodingRevealEffectProps {
  isDecoding: boolean;
  onComplete: () => void;
  period: string;
  engineName: string;
}

export const DecodingRevealEffect: React.FC<DecodingRevealEffectProps> = ({
  isDecoding,
  onComplete,
  period,
  engineName,
}) => {
  const [candidateSignal, setCandidateSignal] = useState('BIG');
  const [candidateJackpot, setCandidateJackpot] = useState('11');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isDecoding) return;

    const candidates = ['BIG', 'SMALL', 'EVEN', 'ODD'];
    const durationMs = 3200;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / durationMs) * 100));
      setProgress(pct);

      setCandidateSignal(candidates[Math.floor(Math.random() * candidates.length)]);
      setCandidateJackpot(String(Math.floor(Math.random() * 16) + 3));

      if (Math.random() > 0.4) {
        sound.playCipherTick();
      }

      if (elapsed >= durationMs) {
        clearInterval(interval);
        sound.playRevealImpact();
        onComplete();
      }
    }, 60);

    return () => clearInterval(interval);
  }, [isDecoding, onComplete]);

  if (!isDecoding) return null;

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/85 backdrop-blur-xl rounded-2xl p-4 border border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.3)] select-none">
      <motion.div 
        className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent"
        animate={{ top: ['0%', '100%', '0%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />

      <div className="flex items-center gap-1.5 mb-2.5">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
        <span className="text-[10px] font-mono tracking-widest text-red-400 uppercase font-bold">
          DECODING HIGHEST WIN PROBABILITY...
        </span>
      </div>

      {/* Dual Candidate Rolling Card */}
      <div className="flex items-center justify-center gap-3 w-full max-w-xs mb-3">
        {/* Signal Candidate */}
        <div className="flex-1 bg-zinc-950/70 border border-white/10 rounded-xl py-2 px-3 text-center">
          <span className="text-[9px] font-mono text-zinc-400 uppercase block">HIGHEST PROBABILITY</span>
          <span className="text-xl font-black font-['Orbitron'] text-amber-400 glitch-active">
            {candidateSignal}
          </span>
        </div>

        {/* Jackpot Candidate */}
        <div className="w-24 bg-zinc-950/70 border border-white/10 rounded-xl py-2 px-3 text-center">
          <span className="text-[9px] font-mono text-zinc-400 uppercase block">JACKPOT #</span>
          <span className="text-xl font-black font-['Orbitron'] text-rose-400 glitch-active">
            #{candidateJackpot}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="w-full max-w-xs">
        <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 mb-1">
          <span className="text-zinc-300">PERIOD #{period ? period.slice(-6) : '---'}</span>
          <span className="text-amber-400 font-bold">{progress}% RESOLVED</span>
        </div>
        <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-red-500 to-amber-500 transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
