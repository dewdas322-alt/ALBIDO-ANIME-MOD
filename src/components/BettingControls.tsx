import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { Shuffle } from 'lucide-react';

export const BettingControls: React.FC = () => {
  const [activeColor, setActiveColor] = useState<'green' | 'violet' | 'red'>('green');
  const [selectedNum, setSelectedNum] = useState<number | null>(7);
  const [selectedMult, setSelectedMult] = useState<number>(1);
  const [activeBS, setActiveBS] = useState<'Big' | 'Small'>('Big');

  const handleRandom = () => {
    const r = Math.floor(Math.random() * 10);
    setSelectedNum(r);
    sound.playCipherTick();
  };

  const handleSelectNum = (n: number) => {
    setSelectedNum(n);
    sound.playCipherTick();
  };

  const handleSelectColor = (c: 'green' | 'violet' | 'red') => {
    setActiveColor(c);
    sound.playCipherTick();
  };

  const handleSelectMult = (m: number) => {
    setSelectedMult(m);
    sound.playCipherTick();
  };

  const handleSelectBS = (bs: 'Big' | 'Small') => {
    setActiveBS(bs);
    sound.playCipherTick();
  };

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl p-3 space-y-2.5 font-mono backdrop-blur-xl">
      {/* Color Filter Tabs */}
      <div className="grid grid-cols-3 gap-1.5">
        <button
          onClick={() => handleSelectColor('green')}
          className={`py-1.5 rounded-lg font-bold text-[11px] tracking-wide transition-all ${
            activeColor === 'green'
              ? 'bg-emerald-600 text-black shadow-md font-extrabold'
              : 'bg-emerald-950/30 text-emerald-400 border border-emerald-900/40 hover:bg-emerald-900/30'
          }`}
        >
          GREEN
        </button>

        <button
          onClick={() => handleSelectColor('violet')}
          className={`py-1.5 rounded-lg font-bold text-[11px] tracking-wide transition-all ${
            activeColor === 'violet'
              ? 'bg-rose-700 text-white shadow-md font-extrabold'
              : 'bg-rose-950/30 text-rose-300 border border-rose-900/40 hover:bg-rose-900/30'
          }`}
        >
          VIOLET
        </button>

        <button
          onClick={() => handleSelectColor('red')}
          className={`py-1.5 rounded-lg font-bold text-[11px] tracking-wide transition-all ${
            activeColor === 'red'
              ? 'bg-red-600 text-white shadow-md font-extrabold'
              : 'bg-red-950/30 text-red-400 border border-red-900/40 hover:bg-red-900/30'
          }`}
        >
          RED
        </button>
      </div>

      {/* Compact Numpad 0-9 Grid */}
      <div className="grid grid-cols-5 gap-1.5">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => {
          const isSelected = selectedNum === num;
          const isViolet = num === 0 || num === 5;
          const isRed = num % 2 === 0 && !isViolet;
          const isGreen = num % 2 !== 0 && !isViolet;

          let colorClasses = 'border-white/5 text-zinc-300';
          if (isViolet) colorClasses = 'text-rose-300 bg-rose-950/20';
          else if (isRed) colorClasses = 'text-red-400 bg-red-950/20';
          else if (isGreen) colorClasses = 'text-emerald-400 bg-emerald-950/20';

          return (
            <button
              key={num}
              onClick={() => handleSelectNum(num)}
              className={`h-9 rounded-xl font-['Orbitron'] font-black text-sm transition-all border ${colorClasses} ${
                isSelected
                  ? 'border-red-400 bg-red-600 text-white shadow-md scale-102'
                  : 'hover:border-zinc-600 active:scale-95'
              }`}
            >
              {num}
            </button>
          );
        })}
      </div>

      {/* Random and Multipliers Bar */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleRandom}
          className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-300 hover:text-white text-[11px] font-bold font-['Orbitron'] transition-all flex items-center gap-1 shrink-0"
        >
          <Shuffle className="w-3 h-3 text-amber-400" />
          <span>RANDOM</span>
        </button>

        <div className="flex items-center gap-1 flex-1 overflow-x-auto no-scrollbar">
          {[1, 5, 10, 20, 50, 100].map(mult => (
            <button
              key={mult}
              onClick={() => handleSelectMult(mult)}
              className={`flex-1 min-w-[32px] py-1.5 rounded-lg text-[10px] font-bold font-['Orbitron'] transition-all ${
                selectedMult === mult
                  ? 'bg-red-600 text-white shadow-sm border border-red-400'
                  : 'bg-white/5 text-zinc-400 hover:text-zinc-200 border border-white/5'
              }`}
            >
              X{mult}
            </button>
          ))}
        </div>
      </div>

      {/* Big / Small Interactive Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-0.5">
        <button
          onClick={() => handleSelectBS('Big')}
          className={`py-2 rounded-xl font-['Orbitron'] font-black text-xs tracking-wider transition-all ${
            activeBS === 'Big'
              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md border border-red-400'
              : 'bg-red-950/20 text-red-400 border border-red-900/30 hover:bg-red-950/40'
          }`}
        >
          BIG (11-18)
        </button>

        <button
          onClick={() => handleSelectBS('Small')}
          className={`py-2 rounded-xl font-['Orbitron'] font-black text-xs tracking-wider transition-all ${
            activeBS === 'Small'
              ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md border border-amber-400'
              : 'bg-amber-950/20 text-amber-400 border border-amber-900/30 hover:bg-amber-950/40'
          }`}
        >
          SMALL (3-10)
        </button>
      </div>
    </div>
  );
};
