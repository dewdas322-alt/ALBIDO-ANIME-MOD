import React, { useState, useMemo } from 'react';
import { K3Issue } from '../types/k3';
import { getBS, getOE } from '../utils/engine';
import { Search, ChevronDown } from 'lucide-react';

interface HistoryTabProps {
  history: K3Issue[];
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ history }) => {
  const [visibleCount, setVisibleCount] = useState(30);
  const [filterSize, setFilterSize] = useState<'all' | 'Big' | 'Small'>('all');
  const [filterParity, setFilterParity] = useState<'all' | 'Even' | 'Odd'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      const bs = getBS(item.sum);
      const oe = getOE(item.sum);
      if (filterSize !== 'all' && bs !== filterSize) return false;
      if (filterParity !== 'all' && oe !== filterParity) return false;
      if (searchQuery && !item.issueNumber.includes(searchQuery)) return false;
      return true;
    });
  }, [history, filterSize, filterParity, searchQuery]);

  const displayedItems = filteredHistory.slice(0, visibleCount);
  const hasMore = visibleCount < filteredHistory.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 40);
  };

  return (
    <div className="space-y-2.5 font-mono">
      {/* Search and Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 p-2.5 bg-black/40 border border-white/10 rounded-2xl backdrop-blur-xl">
        <div className="relative flex-1 min-w-[130px]">
          <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search #..."
            className="w-full pl-7 pr-2.5 py-1 bg-white/5 border border-white/5 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-red-400 transition-colors"
          />
        </div>

        {/* Filter Size */}
        <div className="flex items-center gap-0.5 bg-white/5 p-0.5 rounded-lg border border-white/5">
          {(['all', 'Big', 'Small'] as const).map(option => (
            <button
              key={option}
              onClick={() => setFilterSize(option)}
              className={`px-2 py-0.5 text-[10px] rounded transition-colors ${
                filterSize === option
                  ? 'bg-red-600 text-white font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {option.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Filter Parity */}
        <div className="flex items-center gap-0.5 bg-white/5 p-0.5 rounded-lg border border-white/5">
          {(['all', 'Even', 'Odd'] as const).map(option => (
            <button
              key={option}
              onClick={() => setFilterParity(option)}
              className={`px-2 py-0.5 text-[10px] rounded transition-colors ${
                filterParity === option
                  ? 'bg-cyan-700 text-white font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {option.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Infinite Scrolling Table */}
      <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/40 backdrop-blur-xl">
        <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="sticky top-0 z-10 bg-zinc-950/90 text-zinc-400 text-[10px] border-b border-white/5">
              <tr>
                <th className="py-2 px-3">PERIOD</th>
                <th className="py-2 px-3 text-center">DICE</th>
                <th className="py-2 px-3 text-center">SUM</th>
                <th className="py-2 px-3 text-center">SIZE</th>
                <th className="py-2 px-3 text-center">PARITY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-300">
              {displayedItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-zinc-500">
                    No matching records found.
                  </td>
                </tr>
              ) : (
                displayedItems.map((item, idx) => {
                  const sum = item.sum;
                  const bs = getBS(sum);
                  const oe = getOE(sum);
                  const dice = item.dice && item.dice.length === 3 ? item.dice : [3, 4, 3];

                  return (
                    <tr 
                      key={item.issueNumber + idx}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="py-2 px-3 font-semibold text-zinc-200">
                        {item.issueNumber.slice(-7)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {dice.map((d, dIdx) => (
                            <span 
                              key={dIdx}
                              className="inline-flex items-center justify-center w-5 h-5 rounded bg-white text-zinc-950 font-black font-['Orbitron'] text-[10px]"
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-white">
                        {sum}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span 
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            bs === 'Big'
                              ? 'bg-red-950/80 text-red-400 border border-red-500/30'
                              : 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {bs}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span 
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            oe === 'Even'
                              ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-500/30'
                              : 'bg-purple-950/80 text-purple-300 border border-purple-500/30'
                          }`}
                        >
                          {oe}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="p-2.5 text-center border-t border-white/5 bg-white/5">
            <button
              onClick={handleLoadMore}
              className="px-3 py-1.5 text-xs text-red-400 hover:text-white bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 rounded-lg transition-colors inline-flex items-center gap-1.5"
            >
              <ChevronDown className="w-3.5 h-3.5" />
              <span>LOAD MORE ({filteredHistory.length - visibleCount} REMAINING)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
