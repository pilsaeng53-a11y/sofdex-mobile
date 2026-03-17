import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Share2, TrendingUp, TrendingDown, Activity, BarChart3, Clock } from 'lucide-react';
import { getMarketBySymbol, formatPrice, formatChange } from '../components/shared/MarketData';
import { useChartPrice } from '../components/shared/useChartPrice';
import TradingViewChart from '../components/trade/TradingViewChart.jsx';

export default function MarketDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const symbol = urlParams.get('symbol') || 'SOL';
  const navigate = useNavigate();
  const asset = getMarketBySymbol(symbol);
  const [orderType, setOrderType] = useState('market');
  
  // **CHART PRICE IS MASTER**
  const { price, change24h } = useChartPrice(symbol);
  const displayPrice  = price ?? asset?.price;
  const displayChange = change24h ?? asset?.change;
  const isPositive = (displayChange ?? 0) >= 0;

  if (!asset) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500">Asset not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)]">
            <ArrowLeft className="w-4 h-4 text-slate-400" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">{asset.symbol}</h1>
            <p className="text-[11px] text-slate-500">{asset.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="w-9 h-9 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)]">
            <Star className="w-4 h-4 text-slate-400" />
          </button>
          <button className="w-9 h-9 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)]">
            <Share2 className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Price section */}
      <div className="px-4 mb-4">
        <div className="flex items-end gap-3 mb-1">
          {displayPrice != null ? (
            <span className="text-3xl font-bold text-white">${formatPrice(displayPrice)}</span>
          ) : (
            <span className="text-3xl font-bold text-slate-600 animate-pulse">Loading…</span>
          )}
          {displayPrice != null && (
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
              isPositive ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'
            }`}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {formatChange(displayChange ?? 0)}
            </div>
          )}
        </div>
        <p className="text-[11px] text-slate-500">
          {displayPrice != null ? <>Last updated · <span className="text-emerald-400">Live</span></> : 'Fetching live price…'}
        </p>
      </div>

      {/* TradingView Chart — always uses price chart, never market cap */}
      <div className="px-4 mb-5">
        <TradingViewChart symbol={symbol} height={320} />
      </div>

      {/* Stats grid */}
      <div className="px-4 mb-5">
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: 'Volume 24h', value: asset.volume, icon: Activity },
            { label: 'Market Cap', value: asset.mcap, icon: BarChart3 },
            { label: asset.leverage ? 'Max Leverage' : 'Type', value: asset.leverage || asset.type || '-', icon: Clock },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="glass-card rounded-xl p-3">
                <Icon className="w-3.5 h-3.5 text-slate-500 mb-1.5" />
                <p className="text-xs font-bold text-white">{stat.value}</p>
                <p className="text-[10px] text-slate-500">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Yield for RWA */}
      {asset.yield && (
        <div className="px-4 mb-5">
          <div className="glass-card rounded-2xl p-4 flex items-center justify-between glow-border">
            <div>
              <p className="text-[11px] text-slate-500 font-medium">Annual Yield</p>
              <p className="text-2xl font-bold text-[#00d4aa]">{asset.yield}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#00d4aa]/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[#00d4aa]" />
            </div>
          </div>
        </div>
      )}

      {/* Order type */}
      <div className="px-4 mb-4">
        <div className="flex gap-1.5 bg-[#0d1220] rounded-xl p-1">
          {['market', 'limit', 'stop'].map(type => (
            <button
              key={type}
              onClick={() => setOrderType(type)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                orderType === type
                  ? 'bg-[#151c2e] text-white border border-[rgba(148,163,184,0.1)]'
                  : 'text-slate-500'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Buy / Sell buttons */}
      <div className="px-4 flex gap-3">
        <button className="flex-1 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm transition-colors shadow-lg shadow-emerald-500/20">
          Buy / Long
        </button>
        <button className="flex-1 py-3.5 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-sm transition-colors shadow-lg shadow-red-500/20">
          Sell / Short
        </button>
      </div>

      {/* Asset overview */}
      <div className="px-4 mt-5">
        <div className="glass-card rounded-2xl p-4">
          <h3 className="text-sm font-bold text-white mb-3">About {asset.name}</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {asset.category === 'rwa' 
              ? `${asset.name} is a tokenized real-world asset available on SOFDex. Trade with institutional-grade execution, deep liquidity, and transparent pricing backed by verifiable on-chain assets.`
              : `${asset.name} (${asset.symbol}) perpetual futures are available on SOFDex with up to ${asset.leverage || '50x'} leverage. Access deep liquidity, tight spreads, and advanced order types on Solana's leading multi-asset exchange.`
            }
          </p>
        </div>
      </div>
    </div>
  );
}