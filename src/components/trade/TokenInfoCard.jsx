/**
 * TokenInfoCard — token metadata only.
 *
 * This component is STRICTLY for token metadata:
 *   - Market Cap (from CoinGecko)
 *   - Circulating Supply
 *   - Token name / icon
 *
 * It must NEVER be used as a price source for the chart,
 * order panel, or any trading calculation.
 */

import { useState, useEffect } from 'react';
import CoinIcon from '../shared/CoinIcon';
import { Coins, CircleDollarSign, Info } from 'lucide-react';

function fmt(v) {
  if (v == null) return '—';
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9)  return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6)  return `$${(v / 1e6).toFixed(2)}M`;
  return `$${Number(v).toLocaleString()}`;
}
function fmtSupply(v) {
  if (v == null) return '—';
  if (v >= 1e9)  return `${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6)  return `${(v / 1e6).toFixed(2)}M`;
  if (v >= 1e3)  return `${(v / 1e3).toFixed(1)}K`;
  return String(v);
}

// Well-known CoinGecko IDs for fast lookup
const KNOWN_IDS = {
  BTC: 'bitcoin', ETH: 'ethereum', SOL: 'solana', BNB: 'binancecoin',
  XRP: 'ripple', ARB: 'arbitrum', LINK: 'chainlink', UNI: 'uniswap',
  APT: 'aptos', TON: 'the-open-network', DOGE: 'dogecoin', AVAX: 'avalanche-2',
  MATIC: 'matic-network', OP: 'optimism', ATOM: 'cosmos', DOT: 'polkadot',
  ADA: 'cardano', INJ: 'injective-protocol', SUI: 'sui', PEPE: 'pepe',
  WIF: 'dogwifcoin', BONK: 'bonk', ENA: 'ethena', NEAR: 'near',
  LTC: 'litecoin', BCH: 'bitcoin-cash', FIL: 'filecoin', ICP: 'internet-computer',
};

// Session cache: symbol → { marketCap, circulatingSupply, name }
const _metaCache = new Map();

async function fetchTokenMeta(base) {
  if (_metaCache.has(base)) return _metaCache.get(base);
  const id = KNOWN_IDS[base.toUpperCase()];
  if (!id) {
    _metaCache.set(base, null);
    return null;
  }
  try {
    const res  = await fetch(
      `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`
    );
    if (!res.ok) throw new Error('non-200');
    const json = await res.json();
    const meta = {
      name:              json.name ?? base,
      marketCap:         json.market_data?.market_cap?.usd         ?? null,
      circulatingSupply: json.market_data?.circulating_supply       ?? null,
      totalSupply:       json.market_data?.total_supply             ?? null,
      rank:              json.market_cap_rank                       ?? null,
    };
    _metaCache.set(base, meta);
    return meta;
  } catch {
    _metaCache.set(base, null);
    return null;
  }
}

function MetaRow({ label, value, Icon, color }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-1.5">
        <Icon className="w-2.5 h-2.5 flex-shrink-0" style={{ color: color ?? '#3d4f6b' }} />
        <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#3d4f6b' }}>
          {label}
        </span>
      </div>
      <span className="text-[10px] font-black font-mono" style={{ color: '#64748b' }}>
        {value}
      </span>
    </div>
  );
}

export default function TokenInfoCard({ base, quote = 'USDC' }) {
  const [meta,    setMeta]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!base) return;
    setMeta(null);
    setLoading(true);
    fetchTokenMeta(base).then(m => {
      setMeta(m);
      setLoading(false);
    });
  }, [base]);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(8,11,20,0.95)',
        border: '1px solid rgba(148,163,184,0.07)',
      }}
    >
      {/* Header — explicitly labeled as token metadata */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{ borderColor: 'rgba(148,163,184,0.055)' }}
      >
        <div className="flex items-center gap-2">
          <CoinIcon symbol={base} size={20} />
          <div>
            <span className="text-[11px] font-black text-white">{base}</span>
            <span className="text-[9px] text-slate-600 ml-1">/{quote}</span>
          </div>
          {meta?.rank && (
            <span
              className="text-[8px] font-black px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.12)' }}
            >
              #{meta.rank}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Info className="w-2.5 h-2.5" style={{ color: '#2a3348' }} />
          <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: '#2a3348' }}>
            Token Info
          </span>
        </div>
      </div>

      {/* Metadata rows — clearly separated from trading data */}
      <div className="px-3 py-1.5 divide-y" style={{ '--tw-divide-opacity': 1 }}>
        {loading ? (
          <div className="py-3 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full border-2 border-slate-700 border-t-transparent animate-spin" />
          </div>
        ) : meta ? (
          <>
            <MetaRow
              label="Market Cap"
              value={fmt(meta.marketCap)}
              Icon={CircleDollarSign}
              color="#8b5cf6"
            />
            <MetaRow
              label="Circ. Supply"
              value={meta.circulatingSupply ? `${fmtSupply(meta.circulatingSupply)} ${base}` : '—'}
              Icon={Coins}
              color="#06b6d4"
            />
            {meta.totalSupply && (
              <MetaRow
                label="Total Supply"
                value={`${fmtSupply(meta.totalSupply)} ${base}`}
                Icon={Coins}
                color="#3d4f6b"
              />
            )}
          </>
        ) : (
          <div className="py-2.5 text-center">
            <span className="text-[9px]" style={{ color: '#2a3348' }}>No metadata available</span>
          </div>
        )}
      </div>

      {/* Disclaimer footer — reinforces separation */}
      <div
        className="px-3 py-1.5 border-t"
        style={{ borderColor: 'rgba(148,163,184,0.04)', background: 'rgba(4,6,14,0.4)' }}
      >
        <p className="text-[7.5px] font-semibold" style={{ color: '#1e293b' }}>
          Token metadata only · Not used for chart pricing or order calculations
        </p>
      </div>
    </div>
  );
}