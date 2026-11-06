import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Volume2, VolumeX, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { sound } from '../utils/audio';

interface BootDecodingScreenProps {
  onUnlock: () => void;
}

const BOOT_STAGES = [
  { time: 0.6, text: 'SYNCHRONIZING K3 1-MIN REAL DRAW DATA' },
  { time: 1.6, text: 'PARSING 100-ROUND NUMBER FREQUENCY MATRIX' },
  { time: 2.8, text: 'APPLYING 1000-ROUND EXPONENTIAL WEIGHT ENGINE' },
  { time: 3.9, text: 'CALIBRATING LEVEL 1-2 WIN DEFENSE ARBITER' },
  { time: 4.8, text: 'BRAHMASTRA AI UNLOCKED // ACCESS GRANTED' },
];

export const BootDecodingScreen: React.FC<BootDecodingScreenProps> = ({ onUnlock }) => {
  const [timeLeft, setTimeLeft] = useState(5.0);
  const [stageIdx, setStageIdx] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(sound.enabled);
  const [isClosing, setIsClosing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasUnlockedRef = useRef(false);

  const doUnlock = () => {
    if (hasUnlockedRef.current) return;
    hasUnlockedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    setIsClosing(true);
    sound.playBootSuccess();
    // Smooth transition
    setTimeout(() => {
      onUnlock();
    }, 400);
  };

  useEffect(() => {
    const startTime = Date.now();
    const totalMs = 5000;

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, (totalMs - elapsed) / 1000);
      setTimeLeft(parseFloat(remaining.toFixed(1)));

      const elapsedSec = elapsed / 1000;
      let s = 0;
      for (let i = 0; i < BOOT_STAGES.length; i++) {
        if (elapsedSec >= BOOT_STAGES[i].time) s = i;
      }
      setStageIdx(prev => {
        if (prev !== s) sound.playCipherTick();
        return s;
      });

      if (elapsed >= totalMs) {
        doUnlock();
      }
    }, 50);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const progress = Math.min(100, Math.max(0, ((5.0 - timeLeft) / 5.0) * 100));

  return (
    <AnimatePresence>
      {!isClosing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#070103]/95 backdrop-blur-2xl text-zinc-100 p-4 select-none"
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-red-600/15 rounded-full blur-[100px] pointer-events-none" />

          {/* Sound Toggle */}
          <button
            onClick={() => setAudioEnabled(sound.toggle())}
            className="absolute top-5 right-5 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-zinc-300 hover:text-white transition-colors backdrop-blur-md"
          >
            {audioEnabled ? <Volume2 className="w-3.5 h-3.5 text-red-400" /> : <VolumeX className="w-3.5 h-3.5 text-zinc-500" />}
            <span>{audioEnabled ? 'SOUND ON' : 'MUTED'}</span>
          </button>

          {/* Glassmorphic Central Terminal Box */}
          <div className="relative z-10 w-full max-w-sm rounded-3xl bg-zinc-950/60 border border-white/10 p-6 flex flex-col items-center shadow-[0_0_50px_rgba(239,68,68,0.2)] backdrop-blur-xl">
            {/* Brand Kicker */}
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span className="text-[10px] font-mono tracking-widest text-red-400 font-bold uppercase">
                QUANTUM SYSTEM DECODER
              </span>
            </div>

            <h1 className="text-2xl font-black font-['Orbitron'] tracking-wider text-white text-center">
              ALBIDO ANIME MOD
            </h1>

            <p className="text-[11px] font-mono text-zinc-400 mt-1 mb-5 text-center">
              BY <span className="text-amber-400 font-bold">AJAY TRADER</span> · BRAHMASTRA ENGINE
            </p>

            {/* Circular Progress HUD */}
            <div className="relative my-2 flex items-center justify-center">
              <svg className="w-36 h-36 -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  className="stroke-white/5"
                  strokeWidth="5"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  className="stroke-red-500 transition-all duration-75 ease-linear"
                  strokeWidth="5"
                  strokeDasharray={377}
                  strokeDashoffset={377 - (377 * progress) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black font-['Orbitron'] text-white tracking-wider">
                  {timeLeft > 0 ? `${timeLeft.toFixed(1)}s` : '0.0s'}
                </span>
                <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest mt-0.5">
                  INITIALIZING
                </span>
              </div>
            </div>

            {/* Stepper Status Feed */}
            <div className="w-full bg-black/40 border border-white/5 rounded-2xl p-3 my-4 space-y-2 text-[10px] font-mono">
              {BOOT_STAGES.map((st, i) => {
                const isPast = stageIdx > i || timeLeft <= 0;
                const isCurrent = stageIdx === i && timeLeft > 0;

                return (
                  <div
                    key={i}
                    className={`flex items-center justify-between transition-colors ${
                      isPast
                        ? 'text-emerald-400'
                        : isCurrent
                          ? 'text-amber-300 font-bold'
                          : 'text-zinc-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {isPast ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      ) : (
                        <span className={`w-1.5 h-1.5 rounded-full ${isCurrent ? 'bg-amber-400 animate-pulse' : 'bg-zinc-700'} shrink-0`} />
                      )}
                      <span className="truncate">{st.text}</span>
                    </div>
                    <span className="ml-2 font-semibold">
                      {isPast ? '[OK]' : isCurrent ? 'RUNNING' : 'WAIT'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Instant Unlock Button */}
            <button
              onClick={doUnlock}
              className="w-full py-2.5 px-4 rounded-xl font-['Orbitron'] text-xs font-bold tracking-wider text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-98 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] flex items-center justify-center gap-2"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>{timeLeft <= 0 ? 'ENTER DASHBOARD' : 'OPEN DASHBOARD NOW'}</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
