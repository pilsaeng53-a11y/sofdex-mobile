import React, { useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Zap } from 'lucide-react';

export default function TradingPanel({ asset }) {
  const [orderType, setOrderType] = useState('market'); // market, limit
  const [tradeType, setTradeType] = useState('buy'); // buy, sell
  const [amount, setAmount] = useState('1.0');
  const [leverage, setLeverage] = useState('1');
  const [limitPrice, setLimitPrice] = useState('');

  if (!asset) {
    return (
      <div className="w-72 bg-[#0f1525] border-l border-[rgba(148,163,184,0.08)] p-4 flex items-center justify-center">
        <p className="text-xs text-slate-500 text-center">Select an asset to trade</p>
      </div>
    );
  }

  // Calculate values
  const leverageNum = parseInt(leverage);
  const tradeValue = parseFloat(amount) * asset.bid * leverageNum;
  const fee = (tradeValue * 0.001).toFixed(2); // 0.1% fee
  const liquidationPrice = tradeType === 'buy'
    ? (asset.bid * (1 - 1 / leverageNum)).toFixed(4)
    : (asset.bid * (1 + 1 / leverageNum)).toFixed(4);

  return (
    <div className="w-72 bg-[#0f1525] border-l border-[rgba(148,163,184,0.08)] flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[rgba(148,163,184,0.08)]">
        <h2 className="text-sm font-bold text-white">{asset.symbol}</h2>
        <p className="text-[10px] text-slate-500 mt-1">{asset.name}</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Current Price */}
        <div className="glass-card rounded-xl p-3 border border-[rgba(148,163,184,0.08)]">
          <p className="text-[10px] text-slate-500 mb-1">Current Price</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-white">{asset.bid.toFixed(4)}</p>
            <p className="text-xs text-emerald-400">+{asset.change24h}%</p>
          </div>
        </div>

        {/* Order Type Toggle */}
        <div>
          <p className="text-[10px] text-slate-500 mb-2 uppercase font-semibold">Order Type</p>
          <ToggleGroup type="single" value={orderType} onValueChange={setOrderType} className="w-full">
            <ToggleGroupItem value="market" className="flex-1 rounded-lg border border-[rgba(148,163,184,0.1)]">Market</ToggleGroupItem>
            <ToggleGroupItem value="limit" className="flex-1 rounded-lg border border-[rgba(148,163,184,0.1)]">Limit</ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Trade Type (Buy/Sell) */}
        <div>
          <p className="text-[10px] text-slate-500 mb-2 uppercase font-semibold">Trade Type</p>
          <div className="flex gap-2">
            <button
              onClick={() => setTradeType('buy')}
              className={`flex-1 px-3 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                tradeType === 'buy'
                  ? 'bg-emerald-400/10 border border-emerald-400/30 text-emerald-400'
                  : 'bg-[#151c2e] border border-[rgba(148,163,184,0.08)] text-slate-400 hover:border-emerald-400/20'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setTradeType('sell')}
              className={`flex-1 px-3 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                tradeType === 'sell'
                  ? 'bg-red-400/10 border border-red-400/30 text-red-400'
                  : 'bg-[#151c2e] border border-[rgba(148,163,184,0.08)] text-slate-400 hover:border-red-400/20'
              }`}
            >
              Sell
            </button>
          </div>
        </div>

        {/* Amount */}
        <div>
          <p className="text-[10px] text-slate-500 mb-2 uppercase font-semibold">Amount ({asset.symbol})</p>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 bg-[#151c2e] border border-[rgba(148,163,184,0.08)] rounded-lg text-white text-sm placeholder-slate-600 outline-none focus:border-[#00d4aa]/30"
            placeholder="0.0"
            step="0.01"
          />
          <p className="text-[9px] text-slate-600 mt-1">Value: ${tradeValue.toFixed(2)}</p>
        </div>

        {/* Leverage */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] text-slate-500 uppercase font-semibold">Leverage</p>
            <p className="text-xs font-bold text-[#00d4aa]">{leverage}x</p>
          </div>
          <div className="flex gap-1">
            {['1', '2', '5', '10', '20', '50'].map(lev => (
              <button
                key={lev}
                onClick={() => setLeverage(lev)}
                className={`flex-1 px-2 py-1.5 rounded text-[10px] font-semibold transition-all ${
                  leverage === lev
                    ? 'bg-[#00d4aa]/10 border border-[#00d4aa]/30 text-[#00d4aa]'
                    : 'bg-[#151c2e] border border-[rgba(148,163,184,0.08)] text-slate-400 hover:border-[#00d4aa]/20'
                }`}
              >
                {lev}x
              </button>
            ))}
          </div>
        </div>

        {/* Limit Price (if Limit order) */}
        {orderType === 'limit' && (
          <div>
            <p className="text-[10px] text-slate-500 mb-2 uppercase font-semibold">Limit Price</p>
            <input
              type="number"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              className="w-full px-3 py-2 bg-[#151c2e] border border-[rgba(148,163,184,0.08)] rounded-lg text-white text-sm placeholder-slate-600 outline-none focus:border-[#00d4aa]/30"
              placeholder={asset.bid.toFixed(4)}
              step="0.0001"
            />
          </div>
        )}

        {/* Fee & Liquidation */}
        <div className="space-y-2 pt-2 border-t border-[rgba(148,163,184,0.08)]">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-slate-500">Trading Fee (0.1%)</p>
            <p className="text-[10px] font-semibold text-white">${fee}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-slate-500">Liquidation Price</p>
            <p className={`text-[10px] font-semibold ${tradeType === 'buy' ? 'text-red-400' : 'text-emerald-400'}`}>
              {liquidationPrice}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-slate-500">Margin Used</p>
            <p className="text-[10px] font-semibold text-white">${(tradeValue / leverageNum).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="px-4 py-3 border-t border-[rgba(148,163,184,0.08)]">
        <button
          className={`w-full px-4 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
            tradeType === 'buy'
              ? 'bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/20'
              : 'bg-red-400/10 border border-red-400/30 text-red-400 hover:bg-red-400/20'
          }`}
        >
          <Zap className="w-4 h-4" />
          {tradeType === 'buy' ? 'Buy' : 'Sell'} {amount} {asset.symbol}
        </button>
      </div>
    </div>
  );
}