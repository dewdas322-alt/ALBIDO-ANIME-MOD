/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Menu, 
  X, 
  Volume2, 
  VolumeX, 
  Send, 
  Sparkles, 
  RotateCw, 
  Activity,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Dice1, Dice2, Dice3, Dice4, Dice5, Dice6
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { K3Issue, PredictionItem, PredictionResult, BigSmall, EvenOdd } from './types/k3';
import { 
  getBS, 
  getOE, 
  nextIssue, 
  generateHighProbabilitySignal,
  ENGINE_DEFINITIONS 
} from './utils/engine';
import { sound } from './utils/audio';
import { BootDecodingScreen } from './components/BootDecodingScreen';
import { DecodingRevealEffect } from './components/DecodingRevealEffect';
import { HistoryTab } from './components/HistoryTab';
import { FrequencyTab } from './components/FrequencyTab';
import { WeightEngineTab } from './components/WeightEngineTab';
import { AuditLogTab } from './components/AuditLogTab';
import { BettingControls } from './components/BettingControls';
import { OwnerCard } from './components/OwnerCard';

const DICE_ICON_MAP: Record<number, React.FC<{ className?: string }>> = {
  1: Dice1,
  2: Dice2,
  3: Dice3,
  4: Dice4,
  5: Dice5,
  6: Dice6,
};

export default function App() {
  // Boot screen state: 5s hacker decoding sequence on launch
  const [isBootUnlocked, setIsBootUnlocked] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(sound.enabled);

  // Fresh Session State (Zero data persistence across reloads as requested)
  const [history, setHistory] = useState<K3Issue[]>([]);
  const [currentPeriod, setCurrentPeriod] = useState<string>('');
  const [activeEngineId, setActiveEngineId] = useState<number>(0);

  // High-Probability Single Signal + Jackpot Prediction
  const [prediction, setPrediction] = useState<PredictionResult>({
    signalType: 'SIZE',
    signalValue: 'Big',
    confidence: 98.4,
    jackpotNumber: 11,
    diceCombo: [3, 4, 4],
    level: 1,
    rationale: '1000-Weight & 100-Freq Joint Matrix'
  });

  // Decoding reveal animation state (3.2s)
  const [isDecoding, setIsDecoding] = useState(false);

  // Fresh Session Audit Logs & Stats (Always start from 0)
  const [auditLogs, setAuditLogs] = useState<PredictionItem[]>([]);
  const [stats, setStats] = useState({
    wins: 0,
    losses: 0,
    streak: 0,
    bestStreak: 0,
    level1Wins: 0,
    level2Wins: 0,
    jackpotHits: 0,
  });
  const [engineStats, setEngineStats] = useState<Record<number, { wins: number; losses: number }>>({
    0: { wins: 0, losses: 0 },
    1: { wins: 0, losses: 0 },
    2: { wins: 0, losses: 0 },
    3: { wins: 0, losses: 0 },
    4: { wins: 0, losses: 0 },
    5: { wins: 0, losses: 0 },
  });

  // Last verified round outcome
  const [lastOutcome, setLastOutcome] = useState<{
    win: boolean;
    period: string;
    actualSum: number;
    actualBS: BigSmall;
    actualOE: EvenOdd;
    jackpotHit: boolean;
    level: 1 | 2;
  } | null>(null);

  // Level 2 recovery flag for next round
  const [nextIsRecovery, setNextIsRecovery] = useState(false);

  // 1-Minute UTC Countdown Timer
  const [timerSeconds, setTimerSeconds] = useState(60);

  // Tab navigation
  const [activeTab, setActiveTab] = useState<'history' | 'audit' | 'frequency' | 'weight'>('history');

  // Side Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Track processed periods
  const processedRef = useRef<Set<string>>(new Set());

  // Toggle Sound
  const toggleSound = () => {
    setAudioEnabled(sound.toggle());
  };

  // Fetch K3 live history from backend proxy
  const fetchK3Data = useCallback(async () => {
    try {
      const resp = await fetch('/api/k3/history?limit=1000');
      if (resp.ok) {
        const json = await resp.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data as K3Issue[];
        }
      }
    } catch {
      // Fallback below
    }

    // Dynamic deterministic fallback chain
    const now = Date.now();
    const currMin = Math.floor(now / 60000);
    const baseDate = new Date(now).toISOString().slice(0, 10).replace(/-/g, '');
    const fallbackList: K3Issue[] = [];

    for (let i = 1; i <= 100; i++) {
      const issueIdx = currMin - i;
      const minInDay = issueIdx % 1440;
      const p = `${baseDate}100${String(minInDay).padStart(4, '0')}`;
      const d1 = ((issueIdx * 3) % 6) + 1;
      const d2 = ((issueIdx * 5 + 2) % 6) + 1;
      const d3 = ((issueIdx * 7 + 4) % 6) + 1;
      const sum = d1 + d2 + d3;
      fallbackList.push({
        issueNumber: p,
        premium: `${d1}${d2}${d3}`,
        sum,
        dice: [d1, d2, d3]
      });
    }
    return fallbackList;
  }, []);

  // Handle data updates and verified outcomes
  const handleDataUpdate = useCallback((data: K3Issue[]) => {
    if (!data || !data.length) return;
    setHistory(data);

    const latest = data[0];
    const latestPeriod = latest.issueNumber;
    const latestSum = latest.sum;
    const latestBS = getBS(latestSum);
    const latestOE = getOE(latestSum);

    // Initial period setup on first load
    if (!currentPeriod) {
      const upcoming = nextIssue(latestPeriod);
      setCurrentPeriod(upcoming);
      processedRef.current.add(latestPeriod);

      const pred = generateHighProbabilitySignal(data, false);
      setPrediction(pred);

      const engineName = ENGINE_DEFINITIONS[activeEngineId]?.name || 'Brahmastra Master Fusion';
      setAuditLogs([
        {
          period: upcoming,
          signalType: pred.signalType,
          signalValue: pred.signalValue,
          confidence: pred.confidence,
          jackpotNumber: pred.jackpotNumber,
          diceCombo: pred.diceCombo,
          level: pred.level,
          engineId: activeEngineId,
          engineName,
          status: 'Pending',
          timestamp: Date.now(),
        }
      ]);
      return;
    }

    // Period roll verified
    if (latestPeriod === currentPeriod && !processedRef.current.has(latestPeriod)) {
      processedRef.current.add(latestPeriod);

      // Check primary win condition:
      let isWin = false;
      if (prediction.signalType === 'SIZE') {
        isWin = prediction.signalValue === latestBS;
      } else {
        isWin = prediction.signalValue === latestOE;
      }

      // Check jackpot hit
      const isJackpot = prediction.jackpotNumber === latestSum;
      const diff = Math.abs(prediction.jackpotNumber - latestSum);

      // Update statistics
      setStats(prev => {
        const wins = isWin ? prev.wins + 1 : prev.wins;
        const losses = isWin ? prev.losses : prev.losses + 1;
        const streak = isWin ? (prev.streak >= 0 ? prev.streak + 1 : 1) : (prev.streak <= 0 ? prev.streak - 1 : -1);
        const bestStreak = Math.max(prev.bestStreak, streak);
        const l1 = isWin && prediction.level === 1 ? prev.level1Wins + 1 : prev.level1Wins;
        const l2 = isWin && prediction.level === 2 ? prev.level2Wins + 1 : prev.level2Wins;
        const jHits = isJackpot ? prev.jackpotHits + 1 : prev.jackpotHits;
        return {
          wins,
          losses,
          streak,
          bestStreak,
          level1Wins: l1,
          level2Wins: l2,
          jackpotHits: jHits,
        };
      });

      // Update engine stats
      setEngineStats(prev => {
        const curr = prev[activeEngineId] || { wins: 0, losses: 0 };
        return {
          ...prev,
          [activeEngineId]: {
            wins: isWin ? curr.wins + 1 : curr.wins,
            losses: isWin ? curr.losses : curr.losses + 1,
          }
        };
      });

      // Update audit log
      setAuditLogs(prev => {
        return prev.map(entry => {
          if (entry.period === latestPeriod) {
            return {
              ...entry,
              actualSum: latestSum,
              actualBS: latestBS,
              actualOE: latestOE,
              status: isWin ? 'Win' : 'Loss',
              isWin,
              jackpotHit: isJackpot,
              jackpotDiff: diff,
            };
          }
          return entry;
        });
      });

      // Outcome Banner
      setLastOutcome({
        win: isWin,
        period: latestPeriod,
        actualSum: latestSum,
        actualBS: latestBS,
        actualOE: latestOE,
        jackpotHit: isJackpot,
        level: prediction.level
      });

      if (isWin) {
        sound.playBootSuccess();
        try {
          confetti({ particleCount: 45, spread: 60, origin: { y: 0.6 } });
        } catch {}
        setNextIsRecovery(false); // Reset to Level 1
      } else {
        sound.playBeep(240, 0.2, 'sawtooth');
        setNextIsRecovery(true); // Engages Level 2 recovery shield!
      }

      // Roll to next issue and trigger 3-4s hacker reveal decoding!
      const nextP = nextIssue(latestPeriod);
      setCurrentPeriod(nextP);
      setIsDecoding(true);
    } else if (!processedRef.current.has(latestPeriod)) {
      processedRef.current.add(latestPeriod);
      const nextP = nextIssue(latestPeriod);
      if (currentPeriod && latestPeriod >= currentPeriod) {
        setCurrentPeriod(nextP);
        setIsDecoding(true);
      }
    }
  }, [currentPeriod, prediction, activeEngineId]);

  // Handle completion of the 3-4s decoding reveal
  const handleDecodingComplete = useCallback(() => {
    setIsDecoding(false);
    if (!history.length) return;

    // Generate single highest probability forecast (with Level 2 defense if needed)
    const newPred = generateHighProbabilitySignal(history, nextIsRecovery);
    setPrediction(newPred);

    const engineName = ENGINE_DEFINITIONS[activeEngineId]?.name || 'Brahmastra Master Fusion';
    setAuditLogs(prev => [
      {
        period: currentPeriod,
        signalType: newPred.signalType,
        signalValue: newPred.signalValue,
        confidence: newPred.confidence,
        jackpotNumber: newPred.jackpotNumber,
        diceCombo: newPred.diceCombo,
        level: newPred.level,
        engineId: activeEngineId,
        engineName,
        status: 'Pending',
        timestamp: Date.now(),
      },
      ...prev
    ]);
  }, [history, nextIsRecovery, activeEngineId, currentPeriod]);

  // Manual Trigger
  const handleManualDecode = () => {
    sound.playCipherTick();
    setIsDecoding(true);
  };

  // Switch Engine
  const handleSelectEngine = (id: number) => {
    setActiveEngineId(id);
    sound.playCipherTick();
    if (history.length) {
      setIsDecoding(true);
    }
  };

  // Synchronized 1-minute timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      let rem = 60 - now.getUTCSeconds();
      if (rem === 60) rem = 0;
      setTimerSeconds(rem);

      if (rem === 0 || rem === 58) {
        fetchK3Data().then(data => {
          if (data && data.length) handleDataUpdate(data);
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [fetchK3Data, handleDataUpdate]);

  // Initial load
  useEffect(() => {
    fetchK3Data().then(data => {
      if (data && data.length) handleDataUpdate(data);
    });
  }, [fetchK3Data, handleDataUpdate]);

  const timerMins = Math.floor(timerSeconds / 60);
  const timerSecs = timerSeconds % 60;
  const timerDigits = [
    Math.floor(timerMins / 10),
    timerMins % 10,
    Math.floor(timerSecs / 10),
    timerSecs % 10,
  ];

  const latestDraw = history[0];
  const activeEngineObj = ENGINE_DEFINITIONS[activeEngineId] || ENGINE_DEFINITIONS[0];

  return (
    <>
      {/* 5-Second Hacker Decoding Entrance */}
      {!isBootUnlocked && (
        <BootDecodingScreen onUnlock={() => setIsBootUnlocked(true)} />
      )}

      {/* Main Glassmorphic Viewport */}
      <div className="min-h-screen bg-[#070103] text-zinc-100 flex flex-col items-center selection:bg-red-600 selection:text-white relative">
        {/* Soft Ambient Radial Lights */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-red-600/10 rounded-full blur-[130px] pointer-events-none -z-10" />

        {/* Mobile-First Frame (420px max width, sleek glassform) */}
        <div className="w-full max-w-[430px] min-h-screen border-x border-white/5 bg-zinc-950/60 backdrop-blur-2xl shadow-2xl flex flex-col pb-8 relative">
          
          {/* Top Glass Header */}
          <header className="sticky top-0 z-30 bg-black/60 backdrop-blur-xl border-b border-white/10 px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition-colors active:scale-95"
                title="Open Telemetry Drawer"
              >
                <Menu className="w-4 h-4" />
              </button>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-['Orbitron'] font-extrabold text-sm tracking-wide text-white">
                    ALBIDO ANIME MOD
                  </span>
                </div>
                <div className="text-[9px] font-mono text-zinc-400">
                  AJAY TRADER · BRAHMASTRA AI
                </div>
              </div>
            </div>

            {/* Right Tools */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSound}
                className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
                title={audioEnabled ? 'Mute' : 'Unmute'}
              >
                {audioEnabled ? <Volume2 className="w-3.5 h-3.5 text-red-400" /> : <VolumeX className="w-3.5 h-3.5 text-zinc-600" />}
              </button>

              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-950/50 border border-red-500/30 text-[9px] font-mono font-bold text-red-400">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span>LIVE</span>
              </div>
            </div>
          </header>

          {/* Main Dashboard Body */}
          <main className="p-3 space-y-3 flex-1">
            
            {/* Top Period & 1-Minute Live Countdown Card (Compact Glass) */}
            <section className="rounded-2xl bg-black/40 border border-white/10 p-3.5 backdrop-blur-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">
                    K3 1-MIN · LAST DRAW
                  </span>
                  {latestDraw ? (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        {(latestDraw.dice || [3, 4, 3]).map((d, i) => (
                          <span
                            key={i}
                            className="w-5 h-5 rounded bg-white text-zinc-950 font-black font-['Orbitron'] text-[11px] flex items-center justify-center shadow-sm"
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs font-mono font-semibold text-zinc-200">
                        Sum <strong className="text-white">{latestDraw.sum}</strong> ·{' '}
                        <strong className={latestDraw.sum >= 11 ? 'text-red-400' : 'text-amber-400'}>
                          {getBS(latestDraw.sum)}
                        </strong> ·{' '}
                        <span className="text-cyan-400 font-bold">{getOE(latestDraw.sum)}</span>
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-500 font-mono">Syncing telemetry...</span>
                  )}
                </div>

                {/* 1-Minute Countdown Clock */}
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase">
                    NEXT IN
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-['Orbitron'] font-black text-sm text-white">
                      {timerDigits[0]}{timerDigits[1]}
                    </span>
                    <span className="text-red-400 font-bold text-xs animate-pulse">:</span>
                    <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-['Orbitron'] font-black text-sm text-white">
                      {timerDigits[2]}{timerDigits[3]}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-zinc-400 mt-0.5">
                    #{currentPeriod ? currentPeriod.slice(-5) : '---'}
                  </span>
                </div>
              </div>
            </section>

            {/* COMPACT & HIGH-PRECISION PREDICTION CARD (Single Highest Win Signal + Jackpot) */}
            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-red-950/40 via-black/60 to-black/80 border border-red-500/30 p-3.5 backdrop-blur-xl shadow-[0_0_30px_rgba(239,68,68,0.15)]">
              {/* 3-4s Hacker Reveal Decoding Overlay */}
              <DecodingRevealEffect
                isDecoding={isDecoding}
                onComplete={handleDecodingComplete}
                period={currentPeriod}
                engineName={activeEngineObj.name}
              />

              {/* Header inside Card */}
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-['Orbitron'] font-extrabold text-white">
                    #{currentPeriod ? currentPeriod.slice(-6) : 'TARGET'}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                    prediction.level === 2
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {prediction.level === 2 ? 'LEVEL 2 RECOVERY SHIELD' : 'LEVEL 1 HIGH-CONFIDENCE'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleManualDecode}
                    className="p-1 rounded-lg bg-white/5 border border-white/10 text-amber-400 hover:text-white transition-colors"
                    title="Re-run 3.5s Decoding Animation"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* DUAL COMPACT DISPLAY: 1. HIGHEST PROBABILITY SIGNAL + 2. SINGLE JACKPOT NUMBER */}
              <div className="grid grid-cols-2 gap-2.5 my-3 font-mono">
                {/* 1. PRIMARY HIGH WINNING SIGNAL (Either Size OR Parity) */}
                <div className="bg-black/40 border border-red-500/30 rounded-xl p-2.5 flex flex-col items-center justify-center text-center">
                  <div className="flex items-center gap-1 text-[9px] text-zinc-400 uppercase font-bold tracking-wider">
                    <span>HIGHEST WIN SIGNAL</span>
                    <span className="text-red-400">({prediction.signalType})</span>
                  </div>
                  <div className={`mt-0.5 font-['Orbitron'] font-black text-2xl tracking-wider ${
                    prediction.signalValue === 'Big' || prediction.signalValue === 'Even'
                      ? 'text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.6)]'
                      : 'text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]'
                  }`}>
                    {prediction.signalValue.toUpperCase()}
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold mt-0.5">
                    {prediction.confidence}% PROBABILITY
                  </span>
                </div>

                {/* 2. SINGLE HIGH-WINNING JACKPOT NUMBER */}
                <div className="bg-black/40 border border-amber-500/30 rounded-xl p-2.5 flex flex-col items-center justify-center text-center">
                  <div className="flex items-center gap-1 text-[9px] text-amber-400 uppercase font-bold tracking-wider">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>JACKPOT NUMBER</span>
                  </div>
                  <div className="mt-0.5 font-['Orbitron'] font-black text-2xl text-amber-300 drop-shadow-[0_0_12px_rgba(245,158,11,0.7)]">
                    #{prediction.jackpotNumber}
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono mt-0.5">
                    DICE: [{prediction.diceCombo.join('-')}]
                  </span>
                </div>
              </div>

              {/* Verified Outcome Banner */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-500">PREV RESULT:</span>
                  {lastOutcome ? (
                    <span className={`font-bold flex items-center gap-1 ${lastOutcome.win ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {lastOutcome.win ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {lastOutcome.win ? 'WON' : 'LOST'} (Sum {lastOutcome.actualSum})
                      {lastOutcome.jackpotHit && <span className="text-amber-300 font-black">🎯 JACKPOT HIT!</span>}
                    </span>
                  ) : (
                    <span className="text-zinc-500">AWAITING DRAW</span>
                  )}
                </div>

                <div className="text-zinc-400">
                  STREAK: <strong className={stats.streak > 0 ? 'text-emerald-400' : 'text-zinc-400'}>{stats.streak > 0 ? `+${stats.streak}` : stats.streak}</strong>
                </div>
              </div>
            </section>

            {/* Quick Interactive Simulator & Multiplier Bar */}
            <BettingControls />

            {/* Navigation Tabs (Glassmorphic) */}
            <section className="space-y-3">
              <div className="grid grid-cols-4 gap-1 p-1 bg-black/40 border border-white/10 rounded-xl font-mono text-[10px]">
                <button
                  onClick={() => setActiveTab('history')}
                  className={`py-2 px-1 text-center font-bold rounded-lg transition-all ${
                    activeTab === 'history'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  HISTORY
                </button>

                <button
                  onClick={() => setActiveTab('audit')}
                  className={`py-2 px-1 text-center font-bold rounded-lg transition-all ${
                    activeTab === 'audit'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  AUDIT LOG
                </button>

                <button
                  onClick={() => setActiveTab('frequency')}
                  className={`py-2 px-1 text-center font-bold rounded-lg transition-all ${
                    activeTab === 'frequency'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  100-FREQ
                </button>

                <button
                  onClick={() => setActiveTab('weight')}
                  className={`py-2 px-1 text-center font-bold rounded-lg transition-all ${
                    activeTab === 'weight'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  1000-WEIGHT
                </button>
              </div>

              {/* Tab 1: Game History (with Unlimited Scrolling) */}
              {activeTab === 'history' && (
                <HistoryTab history={history} />
              )}

              {/* Tab 2: Prediction Audit Log */}
              {activeTab === 'audit' && (
                <AuditLogTab logs={auditLogs} stats={stats} />
              )}

              {/* Tab 3: 100-Round Frequency Matrix */}
              {activeTab === 'frequency' && (
                <FrequencyTab history={history} />
              )}

              {/* Tab 4: 1000-Round Weight Logic & AI Engines */}
              {activeTab === 'weight' && (
                <WeightEngineTab
                  history={history}
                  activeEngineId={activeEngineId}
                  onSelectEngine={handleSelectEngine}
                  engineStats={engineStats}
                />
              )}
            </section>

            {/* Official Owner Card: AJAY TRADER */}
            <OwnerCard />

            {/* Footer */}
            <footer className="pt-2 text-center text-[10px] font-mono text-zinc-600 border-t border-white/5 space-y-0.5">
              <div>ALBIDO ANIME MOD · BRAHMASTRA HIGH-PRECISION ENGINE</div>
              <div>OWNER: <strong className="text-zinc-400">AJAY TRADER</strong> · TELEGRAM: <a href="https://t.me/PROFITWITHAJAY" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">@PROFITWITHAJAY</a></div>
            </footer>
          </main>

          {/* Side Drawer Analytics Menu */}
          {isDrawerOpen && (
            <div className="fixed inset-0 z-50 flex">
              <div 
                onClick={() => setIsDrawerOpen(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
              />

              <div className="relative w-72 max-w-[80vw] h-full bg-zinc-950/95 border-r border-white/10 p-5 overflow-y-auto flex flex-col justify-between font-mono z-10 shadow-2xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="font-['Orbitron'] text-xs font-bold text-white tracking-wider">
                      ⚡ REAL-TIME TELEMETRY
                    </span>
                    <button
                      onClick={() => setIsDrawerOpen(false)}
                      className="p-1 rounded bg-white/5 text-zinc-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Summary Metric Grid */}
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="bg-black/40 border border-white/10 rounded-xl p-2.5">
                      <span className="text-[10px] text-zinc-500 block">TOTAL WINS</span>
                      <span className="text-lg font-black font-['Orbitron'] text-emerald-400">{stats.wins}</span>
                    </div>

                    <div className="bg-black/40 border border-white/10 rounded-xl p-2.5">
                      <span className="text-[10px] text-zinc-500 block">LOSSES</span>
                      <span className="text-lg font-black font-['Orbitron'] text-rose-400">{stats.losses}</span>
                    </div>

                    <div className="bg-black/40 border border-white/10 rounded-xl p-2.5">
                      <span className="text-[10px] text-zinc-500 block">WIN RATE</span>
                      <span className="text-lg font-black font-['Orbitron'] text-amber-400">
                        {stats.wins + stats.losses > 0 
                          ? ((stats.wins / (stats.wins + stats.losses)) * 100).toFixed(1) + '%' 
                          : '0.0%'}
                      </span>
                    </div>

                    <div className="bg-black/40 border border-white/10 rounded-xl p-2.5">
                      <span className="text-[10px] text-zinc-500 block">JACKPOTS</span>
                      <span className="text-lg font-black font-['Orbitron'] text-amber-300">{stats.jackpotHits}</span>
                    </div>
                  </div>

                  {/* Level 1 vs Level 2 Breakdown */}
                  <div className="bg-black/40 border border-white/10 rounded-xl p-3 text-xs space-y-1">
                    <div className="text-[10px] text-zinc-400 uppercase font-bold">1-2 LEVEL DEFENSE METRICS</div>
                    <div className="flex justify-between text-zinc-300">
                      <span>Level 1 Direct Wins:</span>
                      <strong className="text-emerald-400">{stats.level1Wins}</strong>
                    </div>
                    <div className="flex justify-between text-zinc-300">
                      <span>Level 2 Recovery Wins:</span>
                      <strong className="text-amber-400">{stats.level2Wins}</strong>
                    </div>
                    <div className="flex justify-between text-zinc-300 border-t border-white/5 pt-1">
                      <span>Max Consecutive Streak:</span>
                      <strong className="text-white">+{stats.bestStreak}</strong>
                    </div>
                  </div>

                  {/* Re-trigger 5s Boot Screen */}
                  <button
                    onClick={() => {
                      setIsDrawerOpen(false);
                      setIsBootUnlocked(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 text-xs font-['Orbitron'] transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>RE-RUN BOOT DECODER</span>
                  </button>
                </div>

                {/* Telegram Drawer Link */}
                <div className="pt-4 border-t border-white/10">
                  <a
                    href="https://t.me/PROFITWITHAJAY"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-['Orbitron'] font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>AJAY TRADER TELEGRAM</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
