export interface K3Issue {
  issueNumber: string;
  premium: number | string;
  sum: number;
  number?: number;
  dice: number[];
  time?: string;
}

export type BigSmall = 'Big' | 'Small';
export type EvenOdd = 'Even' | 'Odd';
export type SignalType = 'SIZE' | 'PARITY';
export type SignalValue = 'Big' | 'Small' | 'Even' | 'Odd';

export interface PredictionResult {
  signalType: SignalType;
  signalValue: SignalValue;
  confidence: number;
  jackpotNumber: number;
  diceCombo: [number, number, number];
  level: 1 | 2;
  rationale: string;
}

export interface PredictionItem {
  period: string;
  signalType: SignalType;
  signalValue: SignalValue;
  confidence: number;
  jackpotNumber: number;
  diceCombo: [number, number, number];
  level: 1 | 2;
  engineId: number;
  engineName: string;
  actualSum?: number;
  actualBS?: BigSmall;
  actualOE?: EvenOdd;
  status: 'Pending' | 'Win' | 'Loss';
  isWin?: boolean;
  jackpotHit?: boolean;
  jackpotDiff?: number;
  timestamp: number;
}

export interface EngineStats {
  wins: number;
  losses: number;
  streak: number;
  bestStreak: number;
  level1Wins: number;
  level2Wins: number;
  jackpotHits: number;
}

export interface FrequencyAnalysis {
  sumCounts: Record<number, number>;
  totalAnalyzed: number;
  hotNumbers: { num: number; count: number; pct: number }[];
  coldNumbers: { num: number; count: number; pct: number }[];
  bigCount: number;
  smallCount: number;
  bigPct: number;
  smallPct: number;
  evenCount: number;
  oddCount: number;
  evenPct: number;
  oddPct: number;
  averageSum: number;
}

export interface WeightAnalysis {
  totalAnalyzed: number;
  weightedSum: number;
  weightedBS: BigSmall;
  weightedOE: EvenOdd;
  topJackpotPicks: { num: number; weightScore: number }[];
  lambda: number;
  trendMomentum: 'Bullish (Big)' | 'Bearish (Small)' | 'Balanced';
}
