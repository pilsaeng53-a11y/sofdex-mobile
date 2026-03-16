import React, { useState } from 'react';
import { ChevronDown, Lock, Shield, Info, X } from 'lucide-react';
import { COLLATERAL_ASSETS, getCollateralValue, getGroupedCollateral } from './CollateralEngine';

const GROUP_ORDER = ['Stablecoins', 'Crypto', 'SOF', 'RWA'];
const GROUP_COLORS = {
  Stablecoins: 'text-emerald-400',
  Crypto: 'text-amber-400',
  SOF: 'text-[#00d4aa]',
  RWA: 'text-purple-400',
};

function HaircutBadge({ haircut }) {
  if (haircut === 0) return <span className="text-[9px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">100%</span>;
  return <span className="text-[9px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">{((1 - haircut) * 100).toFixed(0)}%</span>;
}

export default function CollateralSelector({ selected, onSelect, amount = 0 }) {
  const [open, setOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const groups = getGroupedCollateral();
  const asset = selected;
  const { nominalUSD, effectiveUSD, haircutUSD } = getCollateralValue(asset, amount || asset.balance);

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
          Collateral Asset
          <button onClick={() => setShowInfo(v => !v)}>
            <Info className="w-3 h-3 text-slate-600 hover:text-slate-400" />
          </button>
        </label>
        {asset.locked && (
          <span className="flex items-center gap-1 text-[10px] text-red-400">
            <Lock className="w-3 h-3" /> Locked
          </span>
        )}
      </div>

      {/* Info tooltip */}
      {showInfo && (
        <div className="mb-2 p-2.5 rounded-xl bg-[#0d1220] border border-[rgba(148,163,184,0.08)] text-[10px] text-slate-400 leading-relaxed">
          Collateral value is adjusted with a <span className="text-amber-400 font-semibold">haircut</span> based on liquidity and volatility.
          Stablecoins = 100%. Volatile assets have reduced margin value. Locked RWA cannot be used as collateral.
        </div>
      )}

      {/* Selector button */}
      <button
        onClick={() => !asset.locked && setOpen(v => !v)}
        className={`w-full flex items-center gap-3 h-12 px-3.5 rounded-xl border transition-all ${
          asset.locked
            ? 'bg-[#0d1220] border-red-400/20 cursor-not-allowed opacity-60'
            : 'bg-[#0d1220] border-[rgba(148,163,184,0.08)] hover:border-[#00d4aa]/30'
        }`}
      >
        <div className={`w-7 h-7 rounded-lg ${asset.iconBg} flex items-center justify-center text-sm font-black ${asset.iconColor} flex-shrink-0`}>
          {asset.icon}
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-bold text-white">{asset.symbol}</p>
          <p className="text-[10px] text-slate-500">{asset.name}</p>
        </div>
        <div className="text-right mr-1">
          <HaircutBadge haircut={asset.haircut} />
        </div>
        {asset.locked ? <Lock className="w-3.5 h-3.5 text-red-400" /> : <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />}
      </button>

      {/* Collateral metrics */}
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        <div className="bg-[#0d1220] rounded-xl p-2 text-center">
          <p className="text-[9px] text-slate-600 mb-0.5">Balance</p>
          <p className="text-[11px] font-bold text-slate-300">{asset.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })} {asset.symbol}</p>
        </div>
        <div className="bg-[#0d1220] rounded-xl p-2 text-center">
          <p className="text-[9px] text-slate-600 mb-0.5">Nominal</p>
          <p className="text-[11px] font-bold text-slate-300">${nominalUSD.toFixed(0)}</p>
        </div>
        <div className={`bg-[#0d1220] rounded-xl p-2 text-center border ${asset.haircut > 0 ? 'border-amber-400/15' : 'border-emerald-400/15'}`}>
          <p className="text-[9px] text-slate-600 mb-0.5">Margin Value</p>
          <p className={`text-[11px] font-bold ${asset.haircut > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>${effectiveUSD.toFixed(0)}</p>
        </div>
      </div>

      {/* Haircut detail */}
      {asset.haircut > 0 && !asset.locked && (
        <div className="mt-1.5 flex items-start gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-400/5 border border-amber-400/10">
          <Shield className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-400/80">{asset.note}</p>
        </div>
      )}
      {asset.locked && (
        <div className="mt-1.5 flex items-start gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-400/5 border border-red-400/10">
          <Lock className="w-3 h-3 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-red-400/80">{asset.note}</p>
        </div>
      )}

      {/* Dropdown panel */}
      {open && (
        <div className="mt-2 bg-[#0d1220] rounded-2xl border border-[rgba(148,163,184,0.08)] overflow-hidden z-50 relative">
          <div className="flex items-center justify-between px-3 pt-3 pb-2 border-b border-[rgba(148,163,184,0.06)]">
            <span className="text-[11px] font-bold text-white">Select Collateral</span>
            <button onClick={() => setOpen(false)}><X className="w-3.5 h-3.5 text-slate-500" /></button>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {GROUP_ORDER.map(group => {
              const items = groups[group];
              if (!items) return null;
              return (
                <div key={group}>
                  <div className="px-3 pt-2.5 pb-1">
                    <span className={`text-[10px] font-black uppercase tracking-wider ${GROUP_COLORS[group]}`}>{group}</span>
                  </div>
                  {items.map(a => {
                    const val = getCollateralValue(a, a.balance);
                    const isActive = a.symbol === selected.symbol;
                    return (
                      <button
                        key={a.symbol}
                        onClick={() => { if (!a.locked) { onSelect(a); setOpen(false); } }}
                        disabled={a.locked}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 transition-all ${
                          isActive ? 'bg-[#00d4aa]/8' : 'hover:bg-[#151c2e]'
                        } ${a.locked ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className={`w-8 h-8 rounded-lg ${a.iconBg} flex items-center justify-center text-sm font-black ${a.iconColor} flex-shrink-0`}>
                          {a.icon}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white">{a.symbol}</span>
                            {a.locked && <Lock className="w-3 h-3 text-red-400" />}
                            <HaircutBadge haircut={a.haircut} />
                          </div>
                          <p className="text-[10px] text-slate-500 truncate">{a.name}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-[11px] font-bold text-white">${val.effectiveUSD.toFixed(0)}</p>
                          <p className={`text-[9px] ${a.riskColor}`}>{a.riskLevel}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}