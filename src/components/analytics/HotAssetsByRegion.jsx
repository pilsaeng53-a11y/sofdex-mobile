import React, { useState } from 'react';
import { Flame, TrendingUp, Brain } from 'lucide-react';

const REGIONS = [
  {
    region: 'East Asia', flag: '🌏',
    asset: 'SOL', reason: 'Korean exchange inflows surging',
    volume: '$890M', change: '+12.4%',
    ai: 'Institutional accumulation in Seoul and Tokyo. Solana DeFi adoption +40% WoW. Whale wallets added 180K SOL.',
  },
  {
    region: 'North America', flag: '🌎',
    asset: 'BTC', reason: 'ETF inflows hit weekly record',
    volume: '$2.1B', change: '+8.2%',
    ai: 'BlackRock and Fidelity ETF combined AUM exceeded $60B. Institutional demand driving spot price action.',
  },
  {
    region: 'Europe', flag: '🌍',
    asset: 'ETH', reason: 'Layer-2 ecosystem growth',
    volume: '$540M', change: '+6.1%',
    ai: 'Arbitrum and Base TVL at all-time highs. European institutional DeFi adoption accelerating post-regulation clarity.',
  },
  {
    region: 'Middle East', flag: '🕌',
    asset: 'USDT', reason: 'USD alternative demand high',
    volume: '$320M', change: '+3.8%',
    ai: 'Dollar-pegged assets in high demand as regional currencies face pressure. Crypto as wealth preservation tool.',
  },
  {
    region: 'SE Asia', flag: '🌏',
    asset: 'BNB', reason: 'Binance P2P volume record',
    volume: '$410M', change: '+9.7%',
    ai: 'Unbanked population driving P2P crypto adoption. BNB utility for fees creating sustained demand in Vietnam and Philippines.',
  },
  {
    region: 'Latin America', flag: '🌎',
    asset: 'BTC', reason: 'Inflation hedge buying',
    volume: '$180M', change: '+5.3%',
    ai: 'Argentina and Brazil leading regional adoption. BTC used as savings vehicle. Remittance use-case driving demand.',
  },
];

export default function HotAssetsByRegion() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="space-y-2">
      {REGIONS.map((r, i) => (
        <div key={i} className="bg-[#151c2e] rounded-xl border border-[rgba(148,163,184,0.08)] overflow-hidden">
          <button
            className="w-full p-3 flex items-center justify-between"
            onClick={() => setExpanded(expanded === i ? null : i)}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{r.flag}</span>
              <div className="text-left">
                <p className="text-xs font-bold text-white">{r.region}</p>
                <p className="text-[10px] text-slate-500">{r.reason}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-400" />
                  <p className="text-xs font-bold text-orange-400">{r.asset}</p>
                </div>
                <p className="text-[10px] text-emerald-400">{r.change}</p>
              </div>
            </div>
          </button>
          {expanded === i && (
            <div className="px-3 pb-3 border-t border-[rgba(148,163,184,0.06)] space-y-2 pt-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">24h Volume</span>
                <span className="font-bold text-white">{r.volume}</span>
              </div>
              <div className="flex items-start gap-2 bg-[#00d4aa]/5 rounded-xl p-2.5 border border-[#00d4aa]/10">
                <Brain className="w-3.5 h-3.5 text-[#00d4aa] mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-slate-400 leading-relaxed">{r.ai}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}