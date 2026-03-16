import React, { useState } from 'react';
import { Building2, ChevronDown } from 'lucide-react';

const INSTITUTIONS = [
  {
    name: 'BlackRock',
    type: 'Asset Manager',
    aum: '$9.5T',
    crypto_aum: '$60.2B',
    badge: '🏛️',
    color: '#3b82f6',
    holdings: [
      { asset: 'BTC', label: 'iShares Bitcoin ETF', pct: '68%', value: '$40.9B' },
      { asset: 'ETH', label: 'Ethereum Strategy', pct: '22%', value: '$13.2B' },
      { asset: 'SOL', label: 'Solana Exposure', pct: '10%', value: '$6.1B' },
    ],
    note: 'Largest BTC ETF holder. Expanding Ethereum ETF. Exploring SOL institutional products.',
  },
  {
    name: 'ARK Invest',
    type: 'Innovation Fund',
    aum: '$14.8B',
    crypto_aum: '$3.1B',
    badge: '🚀',
    color: '#00d4aa',
    holdings: [
      { asset: 'BTC', label: 'ARKB Bitcoin ETF', pct: '72%', value: '$2.2B' },
      { asset: 'COIN', label: 'Coinbase Stock', pct: '18%', value: '$558M' },
      { asset: 'ETH', label: 'Ethereum Products', pct: '10%', value: '$310M' },
    ],
    note: 'Cathie Wood projects BTC at $1M by 2030. Deep conviction in Bitcoin as institutional asset.',
  },
  {
    name: 'Bridgewater',
    type: 'Macro Hedge Fund',
    aum: '$124B',
    crypto_aum: '$1.8B',
    badge: '🌊',
    color: '#9945ff',
    holdings: [
      { asset: 'BTC', label: 'Bitcoin Position', pct: '55%', value: '$990M' },
      { asset: 'Gold RWA', label: 'Tokenized Gold', pct: '30%', value: '$540M' },
      { asset: 'ETH', label: 'Ethereum Stake', pct: '15%', value: '$270M' },
    ],
    note: 'Inflation hedge diversification. Ray Dalio shifted stance, now views BTC as digital gold store of value.',
  },
  {
    name: 'Fidelity',
    type: 'Financial Services',
    aum: '$4.9T',
    crypto_aum: '$12.4B',
    badge: '🔐',
    color: '#f59e0b',
    holdings: [
      { asset: 'BTC', label: 'Wise Origin Bitcoin ETF', pct: '80%', value: '$9.9B' },
      { asset: 'ETH', label: 'Ethereum Fund', pct: '15%', value: '$1.9B' },
      { asset: 'SOL', label: 'Solana Index', pct: '5%', value: '$620M' },
    ],
    note: 'Second largest BTC ETF. First major institution to custody crypto for retail clients.',
  },
];

export default function InstitutionalPortfolios() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="space-y-2">
      {INSTITUTIONS.map((inst, i) => (
        <div key={i} className="bg-[#151c2e] rounded-xl border border-[rgba(148,163,184,0.08)] overflow-hidden">
          <button
            className="w-full p-3 flex items-center justify-between"
            onClick={() => setExpanded(expanded === i ? null : i)}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: `${inst.color}18` }}>
                {inst.badge}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white">{inst.name}</p>
                <p className="text-[10px] text-slate-500">{inst.type} · AUM {inst.aum}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-xs font-bold" style={{ color: inst.color }}>{inst.crypto_aum}</p>
                <p className="text-[10px] text-slate-500">Crypto AUM</p>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${expanded === i ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {expanded === i && (
            <div className="px-3 pb-3 border-t border-[rgba(148,163,184,0.06)] space-y-2.5 pt-2">
              {inst.holdings.map((h, j) => (
                <div key={j} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-xs font-bold text-white w-12">{h.asset}</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-0.5">
                        <p className="text-[10px] text-slate-500">{h.label}</p>
                        <p className="text-[10px] text-slate-400">{h.pct}</p>
                      </div>
                      <div className="w-full bg-[#0a0e1a] rounded-full h-1">
                        <div className="h-1 rounded-full" style={{ width: h.pct, background: inst.color }} />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-white ml-2 w-14 text-right">{h.value}</span>
                  </div>
                </div>
              ))}
              <p className="text-[10px] text-slate-400 leading-relaxed pt-1">{inst.note}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}