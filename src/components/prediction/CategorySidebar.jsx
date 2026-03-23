import React, { useState } from 'react';
import { ChevronRight, Loader2 } from 'lucide-react';

// Fallback static tree used while backend data loads
const STATIC_TREE = [
  { id: 'explore',   label: '🔥 Explore',       subs: [], count: 0 },
  { id: 'crypto',    label: '₿ Crypto',          subs: ['BTC Price','ETH Price','SOL Price','XRP','ETH ETF','Altcoin Season','DeFi','NFTs'], count: 0 },
  { id: 'sports',    label: '🏆 Sports',          subs: ['Soccer','Basketball','Baseball','Tennis','Golf','UFC/MMA','Hockey','Cricket','NFL','Formula 1'], count: 0 },
  { id: 'elections', label: '🗳️ Elections',       subs: ['US 2026','EU Elections','UK Politics','Asia Pacific','Latin America'], count: 0 },
  { id: 'politics',  label: '🏛️ Politics',        subs: ['US Policy','Foreign Policy','Trade Wars','Sanctions','NATO','War & Conflict'], count: 0 },
  { id: 'economics', label: '📊 Economics',       subs: ['Interest Rates','CPI / Inflation','GDP','Jobs Report','Oil','Gold','Stocks','Recession'], count: 0 },
  { id: 'companies', label: '🏢 Companies',       subs: ['Apple','Tesla','Nvidia','Meta','Amazon','Google','SpaceX','OpenAI','IPOs','M&A'], count: 0 },
  { id: 'financials',label: '💹 Financials',      subs: ['S&P 500','Nasdaq','Fed Policy','Bonds','Currencies','Commodities'], count: 0 },
  { id: 'tech',      label: '🤖 Tech & Science',  subs: ['AI','Space','Biotech','Climate Tech','Quantum','EVs','Semiconductors'], count: 0 },
  { id: 'culture',   label: '🎬 Culture',         subs: ['Entertainment','Awards','Gaming','Social Media','Celebrity'], count: 0 },
  { id: 'climate',   label: '🌍 Climate',         subs: ['Carbon Targets','Extreme Weather','Renewables','COP Outcomes'], count: 0 },
  { id: 'global',    label: '🌐 Global',          subs: ['Geopolitics','Pandemics','Demographics','Migration'], count: 0 },
];

function mergeWithStatic(dynamic) {
  if (!dynamic.length) return STATIC_TREE;
  // Enrich static tree with backend counts, append any new backend-only categories
  const staticMap = Object.fromEntries(STATIC_TREE.map(c => [c.id, c]));
  const dynamicMap = Object.fromEntries(dynamic.map(c => [c.id, c]));
  const merged = STATIC_TREE.map(s => ({
    ...s,
    count: dynamicMap[s.id]?.count ?? 0,
    subs: dynamicMap[s.id]?.subs?.length ? dynamicMap[s.id].subs : s.subs,
  }));
  // Add any backend categories not in static tree
  dynamic.forEach(d => {
    if (!staticMap[d.id]) merged.push(d);
  });
  return merged;
}

export default function CategorySidebar({ active, activeSub, onSelect, dynamicCategories = [], loading = false }) {
  const [expanded, setExpanded] = useState({ crypto: true, [active]: true });
  const tree = mergeWithStatic(dynamicCategories);

  return (
    <div className="h-full w-full overflow-y-auto scrollbar-none py-2"
      style={{ background: '#080b14', borderRight: '1px solid rgba(148,163,184,0.06)' }}>

      {loading && (
        <div className="flex items-center gap-2 px-3.5 py-2 text-[9px] text-slate-600">
          <Loader2 className="w-3 h-3 animate-spin" />Loading categories...
        </div>
      )}

      {tree.map(cat => {
        const isActive   = active === cat.id;
        const isExpanded = !!expanded[cat.id];

        return (
          <div key={cat.id}>
            <button
              onClick={() => {
                onSelect(cat.id, '');
                if (cat.subs.length) setExpanded(e => ({ ...e, [cat.id]: !e[cat.id] }));
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2 text-[11px] font-bold transition-all text-left gap-1 ${isActive && !activeSub ? 'text-[#00d4aa]' : 'text-slate-400 hover:text-slate-200 hover:bg-[#151c2e]/40'}`}
              style={isActive && !activeSub ? { background: 'rgba(0,212,170,0.07)' } : {}}>
              <span className="flex-1 truncate">{cat.label}</span>
              <div className="flex items-center gap-1 flex-shrink-0">
                {cat.count > 0 && <span className="text-[7px] text-slate-600 font-normal">{cat.count}</span>}
                {cat.subs.length > 0 && <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />}
              </div>
            </button>

            {isExpanded && cat.subs.length > 0 && (
              <div className="ml-2 border-l border-[rgba(148,163,184,0.06)] mb-0.5">
                {cat.subs.map(sub => {
                  const subStr    = typeof sub === 'string' ? sub : sub.label ?? '';
                  const subActive = isActive && activeSub === subStr;
                  return (
                    <button key={subStr} onClick={() => onSelect(cat.id, subStr)}
                      className={`w-full text-left px-3.5 py-1.5 text-[10px] transition-all block ${subActive ? 'font-bold' : 'text-slate-500 hover:text-slate-300'}`}
                      style={subActive ? { color: '#00d4aa', background: 'rgba(0,212,170,0.05)' } : {}}>
                      {subStr}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}