import React from 'react';
import { TrendingUp, TrendingDown, X } from 'lucide-react';

export default function FuturesPositions() {
  const positions = [
    {
      id: 1,
      symbol: 'EURUSD-T',
      type: 'buy',
      volume: 2.5,
      entry: 1.0850,
      current: 1.0892,
      pnl: 105,
      pnlPercent: 0.39,
      margin: 217,
      opened: '2026-03-15 14:32:15',
    },
    {
      id: 2,
      symbol: 'GOLD-T',
      type: 'sell',
      volume: 1.0,
      entry: 2050.5,
      current: 2038.2,
      pnl: 123,
      pnlPercent: 0.60,
      margin: 102,
      opened: '2026-03-14 09:15:42',
    },
  ];

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-4 pb-20">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Open Positions</h1>
        <p className="text-xs text-slate-400">Monitor your active trading positions</p>
      </div>

      {positions.length > 0 ? (
        <div className="space-y-3">
          {positions.map((pos) => (
            <div key={pos.id} className="glass-card rounded-xl p-4 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-white">{pos.symbol}</p>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        pos.type === 'buy'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {pos.type.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-500">
                    Opened: {pos.opened}
                  </p>
                </div>
                <button className="w-6 h-6 rounded hover:bg-[#1a2340] flex items-center justify-center">
                  <X className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#151c2e] rounded p-2">
                  <p className="text-[8px] text-slate-500">Volume</p>
                  <p className="font-bold text-white">{pos.volume} lots</p>
                </div>
                <div className="bg-[#151c2e] rounded p-2">
                  <p className="text-[8px] text-slate-500">Entry Price</p>
                  <p className="font-bold text-white">{pos.entry.toFixed(4)}</p>
                </div>
                <div className="bg-[#151c2e] rounded p-2">
                  <p className="text-[8px] text-slate-500">Current Price</p>
                  <p className="font-bold text-[#00d4aa]">{pos.current.toFixed(4)}</p>
                </div>
                <div className="bg-[#151c2e] rounded p-2">
                  <p className="text-[8px] text-slate-500">Margin Used</p>
                  <p className="font-bold text-white">${pos.margin}</p>
                </div>
              </div>

              {/* PnL */}
              <div
                className={`rounded p-3 text-center ${
                  pos.pnl > 0
                    ? 'bg-green-500/10 border border-green-500/20'
                    : 'bg-red-500/10 border border-red-500/20'
                }`}
              >
                <p className="text-[9px] text-slate-500 mb-1">Unrealized PnL</p>
                <p className={`text-lg font-bold ${pos.pnl > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${pos.pnl} ({pos.pnlPercent.toFixed(2)}%)
                </p>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button className="bg-[#00d4aa]/20 hover:bg-[#00d4aa]/30 border border-[#00d4aa]/30 text-[#00d4aa] text-xs font-bold py-2 rounded transition-all">
                  Close
                </button>
                <button className="bg-[#151c2e] hover:bg-[#1a2340] border border-[rgba(148,163,184,0.1)] text-slate-300 text-xs font-bold py-2 rounded transition-all">
                  Modify
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-8 text-center">
          <p className="text-sm text-slate-400">No open positions</p>
        </div>
      )}
    </div>
  );
}