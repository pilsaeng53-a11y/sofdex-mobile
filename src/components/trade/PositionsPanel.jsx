import React, { useState } from 'react';
import { X } from 'lucide-react';

const mockPositions = [
  { symbol: 'SOL-PERP', side: 'Long', size: '$2,450', entry: '$182.40', mark: '$187.42', pnl: '+$126.80', pnlPercent: '+5.17%', leverage: '10x' },
  { symbol: 'BTC-PERP', side: 'Short', size: '$5,000', entry: '$99,100', mark: '$98,425', pnl: '+$340.50', pnlPercent: '+6.81%', leverage: '25x' },
  { symbol: 'ETH-PERP', side: 'Long', size: '$1,200', entry: '$3,780', mark: '$3,842', pnl: '+$19.68', pnlPercent: '+1.64%', leverage: '5x' },
];

const mockOrders = [
  { symbol: 'SOL-PERP', type: 'Limit Buy', price: '$175.00', amount: '$1,000', status: 'Open' },
  { symbol: 'JUP-PERP', type: 'Stop Sell', price: '$1.10', amount: '$500', status: 'Open' },
];

const mockHistory = [
  { symbol: 'RAY-PERP', side: 'Long', pnl: '+$89.20', date: '2h ago', closed: true },
  { symbol: 'SOL-PERP', side: 'Short', pnl: '-$45.60', date: '5h ago', closed: true },
  { symbol: 'BTC-PERP', side: 'Long', pnl: '+$234.10', date: '12h ago', closed: true },
];

export default function PositionsPanel() {
  const [tab, setTab] = useState('positions');

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-[rgba(148,163,184,0.06)]">
        {[
          { key: 'positions', label: 'Positions', count: mockPositions.length },
          { key: 'orders', label: 'Orders', count: mockOrders.length },
          { key: 'history', label: 'History' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-3 text-xs font-semibold transition-all relative ${
              tab === t.key ? 'text-[#00d4aa]' : 'text-slate-500'
            }`}
          >
            {t.label}
            {t.count && (
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] ${
                tab === t.key ? 'bg-[#00d4aa]/15 text-[#00d4aa]' : 'bg-slate-800 text-slate-500'
              }`}>
                {t.count}
              </span>
            )}
            {tab === t.key && <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-[#00d4aa] rounded-full" />}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="divide-y divide-[rgba(148,163,184,0.06)]">
        {tab === 'positions' && mockPositions.map((pos, i) => (
          <div key={i} className="p-3.5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">{pos.symbol}</span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                  pos.side === 'Long' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'
                }`}>
                  {pos.side} {pos.leverage}
                </span>
              </div>
              <button className="w-6 h-6 rounded-md bg-red-400/10 flex items-center justify-center">
                <X className="w-3 h-3 text-red-400" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div>
                <p className="text-slate-500">Size</p>
                <p className="text-white font-medium">{pos.size}</p>
              </div>
              <div>
                <p className="text-slate-500">Entry</p>
                <p className="text-white font-medium">{pos.entry}</p>
              </div>
              <div>
                <p className="text-slate-500">PnL</p>
                <p className={`font-semibold ${pos.pnl.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                  {pos.pnl} <span className="text-[10px]">({pos.pnlPercent})</span>
                </p>
              </div>
            </div>
          </div>
        ))}

        {tab === 'orders' && mockOrders.map((order, i) => (
          <div key={i} className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">{order.symbol}</p>
              <p className="text-[11px] text-slate-500">{order.type} · {order.price}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-white">{order.amount}</p>
              <p className="text-[10px] text-[#00d4aa]">{order.status}</p>
            </div>
          </div>
        ))}

        {tab === 'history' && mockHistory.map((trade, i) => (
          <div key={i} className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">{trade.symbol}</p>
              <p className="text-[11px] text-slate-500">{trade.side} · {trade.date}</p>
            </div>
            <p className={`text-xs font-semibold ${trade.pnl.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
              {trade.pnl}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}