import React, { useState, useEffect } from 'react';
import { Eye, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';

const ASSETS = ['BTC', 'ETH', 'SOL', 'USDC', 'USDT', 'BNB', 'JUP', 'RNDR'];
const WALLETS = [
  'Sol7xKpQ...nXk4', 'Eth0xAb12...9Fc2', 'Sol9rMnP...wQ41',
  'Binance Hot Wallet', 'Coinbase Cold Storage', 'FTX Estate',
  'Jump Trading', 'Alameda Research', 'Galaxy Digital',
];
const TYPES = ['Transfer', 'Exchange Inflow', 'Exchange Outflow', 'Whale Accumulation', 'Large Sell'];

function genWhale() {
  const asset = ASSETS[Math.floor(Math.random() * ASSETS.length)];
  const type = TYPES[Math.floor(Math.random() * TYPES.length)];
  const isIn = type.includes('Inflow') || type.includes('Accumulation') || type === 'Transfer';
  const amount = Math.floor(Math.random() * 9000 + 500);
  const price = asset === 'BTC' ? 98425 : asset === 'ETH' ? 3842 : asset === 'SOL' ? 187 : asset === 'USDC' || asset === 'USDT' ? 1 : 10;
  const usdValue = amount * price;
  return {
    asset,
    type,
    direction: isIn ? 'in' : 'out',
    amount: `${amount.toLocaleString()} ${asset}`,
    usdValue,
    from: WALLETS[Math.floor(Math.random() * WALLETS.length)],
    to: WALLETS[Math.floor(Math.random() * WALLETS.length)],
    time: `${Math.floor(Math.random() * 59)}m ago`,
  };
}

function formatUSD(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

export default function WhaleTracker() {
  const [txs, setTxs] = useState(() => Array.from({ length: 20 }, genWhale));
  const [loading, setLoading] = useState(false);

  function refresh() {
    setLoading(true);
    setTimeout(() => {
      setTxs(Array.from({ length: 20 }, genWhale));
      setLoading(false);
    }, 600);
  }

  useEffect(() => {
    const id = setInterval(() => {
      setTxs(prev => [genWhale(), ...prev.slice(0, 29)]);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const totalFlow = txs.reduce((acc, t) => acc + t.usdValue, 0);

  return (
    <div className="min-h-screen px-4 pt-4 pb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-[#00d4aa]" />
          <h1 className="text-xl font-bold text-white">Whale Tracker</h1>
        </div>
        <button
          onClick={refresh}
          className="w-8 h-8 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)] hover:border-[#00d4aa]/20 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-sm font-bold text-white">{formatUSD(totalFlow)}</p>
          <p className="text-[10px] text-slate-500">Total Flow</p>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-sm font-bold text-[#00d4aa]">{txs.filter(t => t.usdValue >= 1_000_000).length}</p>
          <p className="text-[10px] text-slate-500">Mega Txs</p>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-sm font-bold text-white">{txs.length}</p>
          <p className="text-[10px] text-slate-500">Tracked</p>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-2.5">
        {txs.map((tx, i) => (
          <div key={i} className="glass-card rounded-xl p-3.5">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  tx.direction === 'in' ? 'bg-emerald-400/10' : 'bg-red-400/10'
                }`}>
                  {tx.direction === 'in'
                    ? <ArrowDownRight className="w-4 h-4 text-emerald-400" />
                    : <ArrowUpRight className="w-4 h-4 text-red-400" />}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">{tx.type}</span>
                    <span className="text-[10px] text-slate-500">· {tx.asset}</span>
                  </div>
                  <p className="text-[10px] text-slate-500">{tx.time}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-xs font-bold ${tx.usdValue >= 1_000_000 ? 'text-orange-400' : 'text-white'}`}>
                  {formatUSD(tx.usdValue)}
                </p>
                <p className="text-[10px] text-slate-500">{tx.amount}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-600">
              <span className="truncate max-w-[90px]">{tx.from}</span>
              <ArrowUpRight className="w-3 h-3 flex-shrink-0" />
              <span className="truncate max-w-[90px]">{tx.to}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}