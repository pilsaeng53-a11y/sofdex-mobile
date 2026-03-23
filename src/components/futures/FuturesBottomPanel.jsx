import React, { useState } from 'react';
import { X, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import CoinIcon from '../shared/CoinIcon';

const TABS = ['Positions', 'Pending', 'Orders', 'Trades', 'PnL'];

function Badge({ side }) {
  return (
    <span className={`inline-flex items-center gap-0.5 text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${side === 'buy' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
      {side === 'buy' ? <TrendingUp className="w-2 h-2" /> : <TrendingDown className="w-2 h-2" />}
      {side}
    </span>
  );
}

function Pnl({ value }) {
  const pos = value >= 0;
  return <span className={`text-xs font-black font-mono ${pos ? 'text-emerald-400' : 'text-red-400'}`}>{pos ? '+' : ''}${value.toFixed(2)}</span>;
}

function fmt(n, dec = 4) {
  return n != null ? Number(n).toFixed(dec) : '—';
}

function PositionsTab({ positions, onClose }) {
  const unrealized = positions.reduce((s, p) => {
    const diff = p.side === 'buy' ? p.currentPrice - p.entryPrice : p.entryPrice - p.currentPrice;
    return s + diff * p.volume * (p.lotSize ?? 100000);
  }, 0);
  const totalMargin = positions.reduce((s, p) => s + (p.volume * (p.lotSize ?? 100000) * p.entryPrice / p.leverage), 0);

  if (!positions.length) return <Empty text="No open positions" />;

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 px-3 py-2 border-b border-[rgba(148,163,184,0.06)] bg-[#0b0f1a]">
        <Stat label="Float PnL" value={`${unrealized >= 0 ? '+' : ''}$${unrealized.toFixed(2)}`} color={unrealized >= 0 ? 'text-emerald-400' : 'text-red-400'} />
        <Stat label="Used Margin" value={`$${totalMargin.toFixed(2)}`} color="text-[#00d4aa]" />
        <Stat label="Positions" value={positions.length} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[10px]">
          <thead>
            <tr className="bg-[#0b0f1a] border-b border-[rgba(148,163,184,0.06)]">
              {['Symbol','Side','Vol','Entry','Current','SL','TP','PnL',''].map(h => (
                <th key={h} className="px-2 py-1.5 text-left font-bold text-slate-500 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {positions.map(p => {
              const diff = p.side === 'buy' ? p.currentPrice - p.entryPrice : p.entryPrice - p.currentPrice;
              const pnl  = diff * p.volume * (p.lotSize ?? 100000);
              const dec  = p.entryPrice > 100 ? 2 : 4;
              return (
                <tr key={p.id} className="border-b border-[rgba(148,163,184,0.04)] hover:bg-[#151c2e]/50 transition-colors">
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-1.5">
                      <CoinIcon symbol={p.symbol.replace(/-T$|-PERP$/,'')} size={14} />
                      <span className="font-bold text-white whitespace-nowrap">{p.symbol}</span>
                    </div>
                  </td>
                  <td className="px-2 py-2"><Badge side={p.side} /></td>
                  <td className="px-2 py-2 font-mono text-slate-300">{p.volume}</td>
                  <td className="px-2 py-2 font-mono text-slate-400">{fmt(p.entryPrice, dec)}</td>
                  <td className="px-2 py-2 font-mono text-[#00d4aa]">{fmt(p.currentPrice, dec)}</td>
                  <td className="px-2 py-2 font-mono text-red-400">{p.sl ? fmt(p.sl, dec) : '—'}</td>
                  <td className="px-2 py-2 font-mono text-emerald-400">{p.tp ? fmt(p.tp, dec) : '—'}</td>
                  <td className="px-2 py-2"><Pnl value={pnl} /></td>
                  <td className="px-2 py-2">
                    <button onClick={() => onClose(p.id, p.currentPrice)}
                      className="w-5 h-5 rounded bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-colors">
                      <X className="w-3 h-3 text-red-400" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PendingTab({ pendingOrders, onCancel }) {
  if (!pendingOrders.length) return <Empty text="No pending orders" />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[10px]">
        <thead>
          <tr className="bg-[#0b0f1a] border-b border-[rgba(148,163,184,0.06)]">
            {['Symbol','Side','Type','Vol','Limit Price','SL','TP','Submitted',''].map(h => (
              <th key={h} className="px-2 py-1.5 text-left font-bold text-slate-500 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pendingOrders.map(o => (
            <tr key={o.id} className="border-b border-[rgba(148,163,184,0.04)] hover:bg-[#151c2e]/50">
              <td className="px-2 py-2 font-bold text-white">{o.symbol}</td>
              <td className="px-2 py-2"><Badge side={o.side} /></td>
              <td className="px-2 py-2 text-slate-400">{o.orderType}</td>
              <td className="px-2 py-2 font-mono text-slate-300">{o.volume}</td>
              <td className="px-2 py-2 font-mono text-amber-400">{o.limitPrice ? fmt(o.limitPrice, 4) : '—'}</td>
              <td className="px-2 py-2 font-mono text-red-400">{o.sl ? fmt(o.sl, 4) : '—'}</td>
              <td className="px-2 py-2 font-mono text-emerald-400">{o.tp ? fmt(o.tp, 4) : '—'}</td>
              <td className="px-2 py-2 text-slate-600 whitespace-nowrap">{o.submittedAt?.slice(11,16)}</td>
              <td className="px-2 py-2">
                <button onClick={() => onCancel(o.id)}
                  className="w-5 h-5 rounded bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-colors">
                  <X className="w-3 h-3 text-red-400" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrdersTab({ orderHistory }) {
  if (!orderHistory.length) return <Empty text="No order history" />;
  const STATUS_COLOR = { filled: 'text-emerald-400', pending: 'text-amber-400', cancelled: 'text-slate-500', submitted: 'text-blue-400' };
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[10px]">
        <thead>
          <tr className="bg-[#0b0f1a] border-b border-[rgba(148,163,184,0.06)]">
            {['Symbol','Side','Type','Vol','Price','Status','Time'].map(h => (
              <th key={h} className="px-2 py-1.5 text-left font-bold text-slate-500 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orderHistory.map(o => (
            <tr key={o.id} className="border-b border-[rgba(148,163,184,0.04)] hover:bg-[#151c2e]/50">
              <td className="px-2 py-2 font-bold text-white">{o.symbol}</td>
              <td className="px-2 py-2"><Badge side={o.side} /></td>
              <td className="px-2 py-2 text-slate-400">{o.orderType}</td>
              <td className="px-2 py-2 font-mono text-slate-300">{o.volume}</td>
              <td className="px-2 py-2 font-mono text-slate-400">{o.filledPrice ? fmt(o.filledPrice, 4) : o.limitPrice ? fmt(o.limitPrice, 4) : 'Market'}</td>
              <td className={`px-2 py-2 font-bold ${STATUS_COLOR[o.status] ?? 'text-slate-400'}`}>{o.status}</td>
              <td className="px-2 py-2 text-slate-600 whitespace-nowrap">{o.submittedAt?.slice(11,16)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TradesTab({ tradeHistory }) {
  if (!tradeHistory.length) return <Empty text="No closed trades yet" />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[10px]">
        <thead>
          <tr className="bg-[#0b0f1a] border-b border-[rgba(148,163,184,0.06)]">
            {['Symbol','Side','Vol','Entry','Exit','Fee','PnL','Closed'].map(h => (
              <th key={h} className="px-2 py-1.5 text-left font-bold text-slate-500 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tradeHistory.map(t => {
            const dec = t.entryPrice > 100 ? 2 : 4;
            return (
              <tr key={t.id} className="border-b border-[rgba(148,163,184,0.04)] hover:bg-[#151c2e]/50">
                <td className="px-2 py-2 font-bold text-white">{t.symbol}</td>
                <td className="px-2 py-2"><Badge side={t.side} /></td>
                <td className="px-2 py-2 font-mono text-slate-300">{t.volume}</td>
                <td className="px-2 py-2 font-mono text-slate-400">{fmt(t.entryPrice, dec)}</td>
                <td className="px-2 py-2 font-mono text-slate-300">{fmt(t.exitPrice, dec)}</td>
                <td className="px-2 py-2 font-mono text-slate-500">${t.fee.toFixed(2)}</td>
                <td className="px-2 py-2"><Pnl value={t.pnl} /></td>
                <td className="px-2 py-2 text-slate-600 whitespace-nowrap">{t.closedAt?.slice(11,16)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function PnLTab({ unrealizedPnl, realizedPnl, totalFees }) {
  const net = unrealizedPnl + realizedPnl - totalFees;
  return (
    <div className="p-3 grid grid-cols-2 gap-3">
      {[
        { label: 'Unrealized PnL', value: unrealizedPnl },
        { label: 'Realized PnL',   value: realizedPnl },
        { label: 'Total Fees',     value: -totalFees },
        { label: 'Net PnL',        value: net },
      ].map(s => (
        <div key={s.label} className="bg-[#0b0f1a] rounded-xl p-3 border border-[rgba(148,163,184,0.06)]">
          <p className="text-[9px] text-slate-500 mb-0.5">{s.label}</p>
          <p className={`text-base font-black ${s.value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {s.value >= 0 ? '+' : ''}${s.value.toFixed(2)}
          </p>
        </div>
      ))}
    </div>
  );
}

function Empty({ text }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-2">
      <Clock className="w-6 h-6 text-slate-700" />
      <p className="text-[11px] text-slate-600">{text}</p>
    </div>
  );
}

function Stat({ label, value, color = 'text-white' }) {
  return (
    <div>
      <p className="text-[9px] text-slate-500">{label}</p>
      <p className={`text-sm font-black ${color}`}>{value}</p>
    </div>
  );
}

export default function FuturesBottomPanel({
  expanded, onToggle,
  positions, pendingOrders, orderHistory, tradeHistory,
  unrealizedPnl, realizedPnl, totalFees,
  onClosePosition, onCancelOrder,
}) {
  const [tab, setTab] = useState('Positions');

  return (
    <div className={`flex flex-col border-t border-[rgba(148,163,184,0.08)] bg-[#0f1525] transition-all duration-200 ${expanded ? 'h-64' : 'h-10'}`}>
      {/* Tab bar */}
      <div className="flex items-center overflow-x-auto scrollbar-none border-b border-[rgba(148,163,184,0.06)] flex-shrink-0 h-10">
        {TABS.map(t => {
          const count = t === 'Positions' ? positions.length
                      : t === 'Pending'   ? pendingOrders.length
                      : null;
          return (
            <button key={t} onClick={() => { setTab(t); if (!expanded) onToggle(); }}
              className={`flex-shrink-0 px-3 h-full text-[10px] font-bold transition-all whitespace-nowrap flex items-center gap-1 ${tab === t && expanded ? 'text-[#00d4aa] border-b-2 border-[#00d4aa]' : 'text-slate-500 hover:text-slate-300'}`}>
              {t}
              {count != null && count > 0 && (
                <span className="bg-[#00d4aa]/20 text-[#00d4aa] text-[8px] font-black px-1 rounded">{count}</span>
              )}
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-2 px-2 flex-shrink-0">
          <span className={`text-[10px] font-black ${unrealizedPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {unrealizedPnl >= 0 ? '+' : ''}${unrealizedPnl.toFixed(2)}
          </span>
          <button onClick={onToggle} className="text-[9px] text-slate-500 px-2 py-1 rounded bg-[#1a2340] hover:text-slate-300">
            {expanded ? '▾' : '▴'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="flex-1 overflow-y-auto scrollbar-none">
          {tab === 'Positions' && <PositionsTab positions={positions} onClose={onClosePosition} />}
          {tab === 'Pending'   && <PendingTab pendingOrders={pendingOrders} onCancel={onCancelOrder} />}
          {tab === 'Orders'    && <OrdersTab orderHistory={orderHistory} />}
          {tab === 'Trades'    && <TradesTab tradeHistory={tradeHistory} />}
          {tab === 'PnL'       && <PnLTab unrealizedPnl={unrealizedPnl} realizedPnl={realizedPnl} totalFees={totalFees} />}
        </div>
      )}
    </div>
  );
}