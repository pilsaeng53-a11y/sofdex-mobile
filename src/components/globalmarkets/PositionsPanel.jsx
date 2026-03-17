import React, { useState } from 'react';
import { X } from 'lucide-react';

const EXAMPLE_POSITIONS = [
  {
    id: 'pos-1',
    symbol: 'EURUSD-T',
    type: 'buy',
    amount: 50000,
    entryPrice: 1.0812,
    currentPrice: 1.0852,
    leverage: 10,
    pnl: 200.0,
    pnlPercent: 1.85,
    marginUsed: 5406,
  },
  {
    id: 'pos-2',
    symbol: 'GOLD-T',
    type: 'sell',
    amount: 10,
    entryPrice: 2045.20,
    currentPrice: 2048.50,
    leverage: 5,
    pnl: -165.0,
    pnlPercent: -0.82,
    marginUsed: 4094,
  },
];

const EXAMPLE_ORDERS = [
  {
    id: 'order-1',
    symbol: 'SP500-T',
    type: 'buy',
    amount: 100,
    limitPrice: 5240.00,
    status: 'pending',
  },
];

export default function PositionsPanel() {
  const [activeTab, setActiveTab] = useState('positions'); // positions, orders, history

  return (
    <div className="h-48 bg-[#0f1525] border-t border-[rgba(148,163,184,0.08)] flex flex-col">
      {/* Tabs */}
      <div className="flex gap-0 border-b border-[rgba(148,163,184,0.08)]">
        {['positions', 'orders', 'history'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-3 text-sm font-semibold transition-all border-b-2 ${
              activeTab === tab
                ? 'text-[#00d4aa] border-[#00d4aa]'
                : 'text-slate-500 border-transparent hover:text-white'
            }`}
          >
            {tab === 'positions' ? 'Positions' : tab === 'orders' ? 'Open Orders' : 'History'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'positions' && (
          <div className="space-y-2 p-3">
            {EXAMPLE_POSITIONS.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No open positions</p>
            ) : (
              EXAMPLE_POSITIONS.map(pos => (
                <div key={pos.id} className="bg-[#151c2e] rounded-lg p-3 border border-[rgba(148,163,184,0.08)]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-xs font-bold text-white">{pos.symbol} {pos.type.toUpperCase()}</p>
                      <p className="text-[9px] text-slate-500">{pos.amount.toLocaleString()} @ {pos.entryPrice.toFixed(4)}</p>
                    </div>
                    <button className="text-slate-500 hover:text-red-400 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[9px]">
                    <div>
                      <p className="text-slate-600">Current</p>
                      <p className="text-white font-semibold">{pos.currentPrice.toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Leverage</p>
                      <p className="text-white font-semibold">{pos.leverage}x</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-600">P&L</p>
                      <p className={`font-semibold ${pos.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        ${pos.pnl.toFixed(2)} ({pos.pnlPercent > 0 ? '+' : ''}{pos.pnlPercent.toFixed(2)}%)
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-2 p-3">
            {EXAMPLE_ORDERS.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No open orders</p>
            ) : (
              EXAMPLE_ORDERS.map(order => (
                <div key={order.id} className="bg-[#151c2e] rounded-lg p-3 border border-[rgba(148,163,184,0.08)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">{order.symbol} {order.type.toUpperCase()}</p>
                      <p className="text-[9px] text-slate-500">{order.amount} @ ${order.limitPrice.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-amber-400 font-semibold">PENDING</p>
                      <button className="text-slate-500 hover:text-red-400 transition-colors mt-1">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-3">
            <p className="text-xs text-slate-500 text-center py-4">No recent history</p>
          </div>
        )}
      </div>
    </div>
  );
}