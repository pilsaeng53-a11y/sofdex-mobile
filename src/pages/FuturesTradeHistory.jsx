import React from 'react';

export default function FuturesTradeHistory() {
  const trades = [
    {
      id: 1,
      symbol: 'EURUSD-T',
      type: 'buy',
      volume: 2.5,
      entry: 1.0850,
      exit: 1.0892,
      pnl: 105,
      fee: 5,
      netPnL: 100,
      date: '2026-03-15',
      duration: '2.5 hours',
    },
    {
      id: 2,
      symbol: 'GOLD-T',
      type: 'sell',
      volume: 1.0,
      entry: 2050.5,
      exit: 2038.2,
      pnl: 123,
      fee: 3,
      netPnL: 120,
      date: '2026-03-14',
      duration: '5.2 hours',
    },
  ];

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-4 pb-20">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Trade History</h1>
        <p className="text-xs text-slate-400">View all closed positions and historical trades</p>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-[#151c2e] border-b border-[rgba(148,163,184,0.1)]">
              <tr>
                <th className="px-3 py-2 text-left font-bold text-slate-400">Symbol</th>
                <th className="px-3 py-2 text-left font-bold text-slate-400">Type</th>
                <th className="px-3 py-2 text-right font-bold text-slate-400">Volume</th>
                <th className="px-3 py-2 text-right font-bold text-slate-400">PnL</th>
                <th className="px-3 py-2 text-right font-bold text-slate-400">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(148,163,184,0.06)]">
              {trades.map((trade) => (
                <tr key={trade.id} className="hover:bg-[#1a2340]/50">
                  <td className="px-3 py-2 font-bold text-white">{trade.symbol}</td>
                  <td className={`px-3 py-2 font-bold ${trade.type === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                    {trade.type.toUpperCase()}
                  </td>
                  <td className="px-3 py-2 text-right">{trade.volume}</td>
                  <td className={`px-3 py-2 text-right font-bold ${trade.netPnL > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${trade.netPnL}
                  </td>
                  <td className="px-3 py-2 text-right text-slate-400">{trade.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}