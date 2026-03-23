import React, { useState } from 'react';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import CoinIcon from '../shared/CoinIcon';

const TABS = ['Positions', 'Pending', 'History', 'PnL', 'Funding', 'Signals', 'Copy'];

const MOCK_POSITIONS = [
  { id: 1, symbol: 'EURUSD-T', type: 'buy', volume: 2.5, entry: 1.0850, current: 1.0892, pnl: 105.00, margin: 217, sl: 1.0810, tp: 1.0950, swap: -1.20 },
  { id: 2, symbol: 'GOLD-T',   type: 'sell', volume: 1.0, entry: 2050.5, current: 2038.2, pnl: 123.00, margin: 102, sl: 2070.0, tp: 2010.0, swap: -0.45 },
  { id: 3, symbol: 'BTC-PERP', type: 'buy', volume: 0.1, entry: 65200, current: 67450, pnl: 225.00, margin: 1348, sl: 63000, tp: 72000, swap: 0.00 },
];

const MOCK_HISTORY = [
  { id: 1, symbol: 'SP500-T', type: 'buy', volume: 1.0, entry: 5180, exit: 5214, pnl: 34, openedAt: '2024-03-22 09:14', closedAt: '2024-03-22 16:30', fee: 3.5 },
  { id: 2, symbol: 'USDJPY-T', type: 'sell', volume: 2.0, entry: 151.20, exit: 149.82, pnl: 276, openedAt: '2024-03-21 14:05', closedAt: '2024-03-22 08:50', fee: 7.0 },
];

const MOCK_SIGNALS = [
  { id: 1, symbol: 'GOLD-T',   direction: 'buy',  confidence: 82, reason: 'Breakout above $2340 support', time: '12m ago' },
  { id: 2, symbol: 'EURUSD-T', direction: 'sell', confidence: 67, reason: 'ECB hawkish tone priced in', time: '34m ago' },
  { id: 3, symbol: 'BTC-PERP', direction: 'buy',  confidence: 74, reason: 'ETF inflow surge + bullish structure', time: '1h ago' },
];

function Badge({ type }) {
  return (
    <span className={`inline-flex items-center gap-0.5 text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${type === 'buy' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
      {type === 'buy' ? <TrendingUp className="w-2 h-2" /> : <TrendingDown className="w-2 h-2" />}
      {type}
    </span>
  );
}

function PnLBadge({ value }) {
  const pos = value >= 0;
  return <span className={`text-xs font-black ${pos ? 'text-emerald-400' : 'text-red-400'}`}>{pos ? '+' : ''}${value.toFixed(2)}</span>;
}

function PositionsTab({ onClose }) {
  const totalPnl = MOCK_POSITIONS.reduce((s, p) => s + p.pnl, 0);
  const totalMargin = MOCK_POSITIONS.reduce((s, p) => s + p.margin, 0);

  return (
    <div>
      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-3 px-3 py-2 border-b border-[rgba(148,163,184,0.06)] bg-[#0b0f1a]">
        <div><p className="text-[9px] text-slate-500">Float PnL</p><p className={`text-sm font-black ${totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>${totalPnl.toFixed(2)}</p></div>
        <div><p className="text-[9px] text-slate-500">Used Margin</p><p className="text-sm font-black text-[#00d4aa]">${totalMargin}</p></div>
        <div><p className="text-[9px] text-slate-500">Positions</p><p className="text-sm font-black text-white">{MOCK_POSITIONS.length}</p></div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[10px]">
          <thead>
            <tr className="bg-[#0b0f1a] border-b border-[rgba(148,163,184,0.06)]">
              {['Symbol', 'Side', 'Vol', 'Entry', 'Current', 'SL', 'TP', 'Swap', 'PnL', ''].map(h => (
                <th key={h} className="px-2 py-1.5 text-left font-bold text-slate-500 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_POSITIONS.map(p => (
              <tr key={p.id} className="border-b border-[rgba(148,163,184,0.04)] hover:bg-[#151c2e]/50 transition-colors">
                <td className="px-2 py-2">
                  <div className="flex items-center gap-1.5">
                    <CoinIcon symbol={p.symbol.replace(/-T$|-PERP$/, '')} size={16} />
                    <span className="font-bold text-white whitespace-nowrap">{p.symbol}</span>
                  </div>
                </td>
                <td className="px-2 py-2"><Badge type={p.type} /></td>
                <td className="px-2 py-2 font-mono text-slate-300">{p.volume}</td>
                <td className="px-2 py-2 font-mono text-slate-400">{p.entry}</td>
                <td className="px-2 py-2 font-mono text-[#00d4aa]">{p.current}</td>
                <td className="px-2 py-2 font-mono text-red-400">{p.sl}</td>
                <td className="px-2 py-2 font-mono text-emerald-400">{p.tp}</td>
                <td className="px-2 py-2 font-mono text-slate-500">${p.swap}</td>
                <td className="px-2 py-2"><PnLBadge value={p.pnl} /></td>
                <td className="px-2 py-2">
                  <button className="w-5 h-5 rounded bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-colors">
                    <X className="w-3 h-3 text-red-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HistoryTab() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[10px]">
        <thead>
          <tr className="bg-[#0b0f1a] border-b border-[rgba(148,163,184,0.06)]">
            {['Symbol', 'Side', 'Vol', 'Entry', 'Exit', 'Fee', 'PnL', 'Closed'].map(h => (
              <th key={h} className="px-2 py-1.5 text-left font-bold text-slate-500 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MOCK_HISTORY.map(h => (
            <tr key={h.id} className="border-b border-[rgba(148,163,184,0.04)] hover:bg-[#151c2e]/50">
              <td className="px-2 py-2 font-bold text-white">{h.symbol}</td>
              <td className="px-2 py-2"><Badge type={h.type} /></td>
              <td className="px-2 py-2 font-mono text-slate-300">{h.volume}</td>
              <td className="px-2 py-2 font-mono text-slate-400">{h.entry}</td>
              <td className="px-2 py-2 font-mono text-slate-300">{h.exit}</td>
              <td className="px-2 py-2 font-mono text-slate-500">${h.fee}</td>
              <td className="px-2 py-2"><PnLBadge value={h.pnl} /></td>
              <td className="px-2 py-2 text-slate-600 whitespace-nowrap">{h.closedAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PnLTab() {
  const totalRealized = MOCK_HISTORY.reduce((s, h) => s + h.pnl, 0);
  const totalFloat = MOCK_POSITIONS.reduce((s, p) => s + p.pnl, 0);
  return (
    <div className="p-3 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Realized PnL', value: totalRealized, color: totalRealized >= 0 ? 'text-emerald-400' : 'text-red-400' },
          { label: 'Floating PnL', value: totalFloat, color: totalFloat >= 0 ? 'text-emerald-400' : 'text-red-400' },
          { label: 'Total Fees', value: -MOCK_HISTORY.reduce((s, h) => s + h.fee, 0), color: 'text-red-400' },
          { label: 'Net PnL', value: totalRealized + totalFloat, color: (totalRealized + totalFloat) >= 0 ? 'text-emerald-400' : 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-[#0b0f1a] rounded-xl p-3 border border-[rgba(148,163,184,0.06)]">
            <p className="text-[9px] text-slate-500 mb-0.5">{s.label}</p>
            <p className={`text-base font-black ${s.color}`}>${s.value.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FundingTab() {
  return (
    <div className="p-3 space-y-2">
      {MOCK_POSITIONS.map(p => (
        <div key={p.id} className="flex items-center justify-between bg-[#0b0f1a] rounded-xl px-3 py-2 border border-[rgba(148,163,184,0.06)]">
          <div className="flex items-center gap-2">
            <CoinIcon symbol={p.symbol.replace(/-T$|-PERP$/, '')} size={16} />
            <span className="text-[10px] font-bold text-slate-300">{p.symbol}</span>
          </div>
          <span className={`text-[10px] font-mono ${p.swap < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            ${p.swap}/day
          </span>
        </div>
      ))}
    </div>
  );
}

function SignalsTab() {
  return (
    <div className="p-3 space-y-2">
      {MOCK_SIGNALS.map(s => (
        <div key={s.id} className="bg-[#0b0f1a] rounded-xl p-3 border border-[rgba(148,163,184,0.06)]">
          <div className="flex items-center gap-2 mb-1">
            <CoinIcon symbol={s.symbol.replace(/-T$|-PERP$/, '')} size={16} />
            <span className="text-xs font-bold text-white">{s.symbol}</span>
            <Badge type={s.direction} />
            <span className="ml-auto text-[9px] text-slate-600">{s.time}</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-snug">{s.reason}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-1 bg-[#1a2340] rounded-full h-1">
              <div className="h-1 rounded-full bg-[#00d4aa]" style={{ width: `${s.confidence}%` }} />
            </div>
            <span className="text-[9px] text-[#00d4aa] font-bold">{s.confidence}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function CopyTab() {
  return (
    <div className="p-3 flex flex-col items-center justify-center py-8 gap-2">
      <div className="w-10 h-10 rounded-2xl bg-purple-500/15 flex items-center justify-center">
        <TrendingUp className="w-5 h-5 text-purple-400" />
      </div>
      <p className="text-sm font-bold text-slate-300">Copy Trading</p>
      <p className="text-xs text-slate-600 text-center">Connect your account to copy top traders automatically</p>
      <button className="mt-2 px-4 py-2 rounded-xl bg-purple-500/15 text-purple-400 text-xs font-bold border border-purple-500/20 hover:bg-purple-500/25 transition-colors">
        Browse Traders
      </button>
    </div>
  );
}

export default function FuturesBottomPanel({ expanded, onToggle }) {
  const [tab, setTab] = useState('Positions');

  const totalPnl = MOCK_POSITIONS.reduce((s, p) => s + p.pnl, 0);

  return (
    <div className={`flex flex-col border-t border-[rgba(148,163,184,0.08)] bg-[#0f1525] transition-all ${expanded ? 'h-64' : 'h-10'}`}>
      {/* Tab bar */}
      <div className="flex items-center overflow-x-auto scrollbar-none border-b border-[rgba(148,163,184,0.06)] flex-shrink-0">
        {TABS.map(t => (
          <button key={t} onClick={() => { setTab(t); if (!expanded) onToggle(); }}
            className={`flex-shrink-0 px-3 py-2 text-[10px] font-bold transition-all whitespace-nowrap ${tab === t && expanded ? 'text-[#00d4aa] border-b-2 border-[#00d4aa]' : 'text-slate-500 hover:text-slate-300'}`}>
            {t === 'Positions' ? `Positions (${MOCK_POSITIONS.length})` : t}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 px-2 flex-shrink-0">
          <span className={`text-[10px] font-black ${totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
          </span>
          <button onClick={onToggle} className="text-[9px] text-slate-500 px-2 py-1 rounded bg-[#1a2340] hover:text-slate-300">
            {expanded ? '▾' : '▴'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="flex-1 overflow-y-auto scrollbar-none">
          {tab === 'Positions' && <PositionsTab />}
          {tab === 'Pending' && <div className="p-4 text-center text-slate-600 text-sm">No pending orders</div>}
          {tab === 'History' && <HistoryTab />}
          {tab === 'PnL' && <PnLTab />}
          {tab === 'Funding' && <FundingTab />}
          {tab === 'Signals' && <SignalsTab />}
          {tab === 'Copy' && <CopyTab />}
        </div>
      )}
    </div>
  );
}