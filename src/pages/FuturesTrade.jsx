import React, { useState } from 'react';
import { TRADING_ASSETS, LEVERAGE_TIERS, ACCOUNT_TYPES } from '@/data/futuresTradingAssets';
import { TrendingUp, TrendingDown, Settings, X, Plus, Minus, Send } from 'lucide-react';
import { useLang } from '../components/shared/LanguageContext';
import CoinIcon from '../components/shared/CoinIcon';

export default function FuturesTrade() {
  const { t } = useLang();
  const [selectedSymbol, setSelectedSymbol] = useState('EURUSD-T');
  const [selectedCategory, setSelectedCategory] = useState('FOREX');
  const [orderType, setOrderType] = useState('market');
  const [direction, setDirection] = useState('buy');
  const [volume, setVolume] = useState('1.0');
  const [leverage, setLeverage] = useState(50);
  const [slPrice, setSlPrice] = useState('');
  const [tpPrice, setTpPrice] = useState('');
  const [showOrderPanel, setShowOrderPanel] = useState(true);

  const positions = [
    { symbol: 'EURUSD-T', type: 'buy', volume: 2.5, entry: 1.0850, current: 1.0892, pnl: 105, pnlPercent: 0.39, margin: 217 },
    { symbol: 'GOLD-T', type: 'sell', volume: 1.0, entry: 2050.5, current: 2038.2, pnl: 123, pnlPercent: 0.60, margin: 102 },
  ];

  const currentAsset = Object.values(TRADING_ASSETS).flat().find((a) => a.symbol === selectedSymbol) || { symbol: 'EURUSD-T', name: 'EUR/USD', spread: 1.2 };
  const categories = Object.keys(TRADING_ASSETS);

  const handleTrade = () => {
    if (!volume || parseFloat(volume) <= 0) return;
  };

  return (
    <div className="flex h-screen bg-[#05070d] text-slate-100 overflow-hidden pt-16 pb-20">
      {/* Left Panel: Market Watch */}
      <div className="w-32 border-r border-[rgba(148,163,184,0.1)] bg-[#0b0f1a] overflow-y-auto scrollbar-none flex flex-col">
        <div className="sticky top-0 bg-[#0b0f1a] border-b border-[rgba(148,163,184,0.1)] p-2">
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{t('ft_instruments')}</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {categories.map((category) => (
            <div key={category} className="space-y-1 p-2 border-b border-[rgba(148,163,184,0.05)]">
              <p className="text-[8px] font-bold text-slate-600 uppercase">{category}</p>
              {TRADING_ASSETS[category].map((asset) => (
                <button key={asset.symbol} onClick={() => { setSelectedSymbol(asset.symbol); setSelectedCategory(category); }}
                  className={`w-full text-left text-[9px] px-2 py-1.5 rounded-md transition-all ${selectedSymbol === asset.symbol ? 'bg-[#00d4aa]/20 border border-[#00d4aa]/30 font-semibold text-[#00d4aa]' : 'text-slate-400 hover:bg-[#151c2e]'}`}>
                  <div className="font-mono">{asset.symbol.substring(0, 6)}</div>
                  <div className="text-[7px] text-slate-500">{t('futures_spread')} {asset.spread}</div>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Center Panel: Chart */}
      <div className="flex-1 flex flex-col bg-[#05070d] border-r border-[rgba(148,163,184,0.1)]">
        <div className="border-b border-[rgba(148,163,184,0.1)] p-3 flex items-center justify-between bg-[#0f1525]">
          <div className="flex items-center gap-2.5">
            {(() => {
              // Extract base symbol: EURUSD-T → EURUSD, GOLD-T → GOLD, BTC → BTC
              const base = selectedSymbol.replace(/-T$/, '').split(/[/-]/)[0];
              console.log('[FuturesTrade] header icon', { original: selectedSymbol, base });
              return <CoinIcon symbol={base} size={28} debugLabel="FuturesTrade" />;
            })()}
            <div>
              <h2 className="text-sm font-bold text-white">{selectedSymbol}</h2>
              <p className="text-xs text-slate-500">{currentAsset.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              {/* DEBUG: Force mark price only — no market cap */}
              <p className="text-lg font-bold text-[#00d4aa]">{currentAsset.currentPrice ?? '—'}</p>
              <p className="text-xs text-green-400">{currentAsset.change24h ?? '—'}</p>
              {process.env.NODE_ENV === 'development' && (
                <p className="text-[7px] text-yellow-400 font-mono">PRICE: MARK</p>
              )}
            </div>
            <button className="w-8 h-8 rounded-lg bg-[#151c2e] flex items-center justify-center hover:border-[#00d4aa]/20 border border-[rgba(148,163,184,0.1)]">
              <Settings className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-[#0f1525] to-[#0b0f1a]">
          <div className="text-center space-y-2">
            <TrendingUp className="w-12 h-12 text-[#00d4aa]/30 mx-auto" />
            <p className="text-sm text-slate-400">{t('ft_chart')}</p>
          </div>
        </div>

        <div className="border-t border-[rgba(148,163,184,0.1)] p-2 grid grid-cols-4 gap-2 bg-[#0f1525] text-[9px]">
          <div><p className="text-slate-500 mb-0.5">Bid</p><p className="font-bold text-white">{currentAsset.bid ?? '—'}</p></div>
          <div><p className="text-slate-500 mb-0.5">Ask</p><p className="font-bold text-white">{currentAsset.ask ?? '—'}</p></div>
          <div><p className="text-slate-500 mb-0.5">{t('ft_high24h')}</p><p className="font-bold text-white">{currentAsset.high24h ?? '—'}</p></div>
          <div><p className="text-slate-500 mb-0.5">{t('ft_low24h')}</p><p className="font-bold text-white">{currentAsset.low24h ?? '—'}</p></div>
        </div>
      </div>

      {/* Right Panel: Order Entry */}
      {showOrderPanel && (
        <div className="w-56 border-l border-[rgba(148,163,184,0.1)] bg-[#0f1525] flex flex-col overflow-hidden">
          <div className="border-b border-[rgba(148,163,184,0.1)] p-3 flex items-center justify-between bg-[#151c2e]">
            <h3 className="text-xs font-bold text-white uppercase">{t('trade_order')}</h3>
            <button onClick={() => setShowOrderPanel(false)} className="w-6 h-6 rounded hover:bg-[#1a2340] flex items-center justify-center">
              <X className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          <div className="grid grid-cols-2 border-b border-[rgba(148,163,184,0.1)] p-2 gap-2">
            {['market', 'limit'].map((type) => (
              <button key={type} onClick={() => setOrderType(type)}
                className={`text-xs font-semibold py-2 rounded transition-all ${orderType === type ? 'bg-[#00d4aa]/20 text-[#00d4aa]' : 'bg-[#1a2340] text-slate-400 hover:bg-[#1f2a3f]'}`}>
                {type === 'market' ? t('order_market') : t('order_limit')}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setDirection('buy')}
                className={`py-2.5 rounded-lg font-bold text-xs transition-all ${direction === 'buy' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-[#1a2340] text-slate-400 border border-[rgba(148,163,184,0.1)]'}`}>
                ↑ {t('common_buy')}
              </button>
              <button onClick={() => setDirection('sell')}
                className={`py-2.5 rounded-lg font-bold text-xs transition-all ${direction === 'sell' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-[#1a2340] text-slate-400 border border-[rgba(148,163,184,0.1)]'}`}>
                ↓ {t('common_sell')}
              </button>
            </div>

            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block">{t('trade_volume')} (Lots)</label>
              <div className="flex items-center gap-2">
                <button onClick={() => setVolume(v => Math.max(0.1, parseFloat(v) - 0.1).toFixed(1))} className="w-7 h-7 rounded bg-[#1a2340] hover:bg-[#1f2a3f] flex items-center justify-center text-slate-400">
                  <Minus className="w-3 h-3" />
                </button>
                <input type="number" value={volume} onChange={(e) => setVolume(e.target.value)}
                  className="flex-1 bg-[#1a2340] border border-[rgba(148,163,184,0.1)] rounded px-2 py-1.5 text-xs text-white text-center" step="0.1" />
                <button onClick={() => setVolume(v => (parseFloat(v) + 0.1).toFixed(1))} className="w-7 h-7 rounded bg-[#1a2340] hover:bg-[#1f2a3f] flex items-center justify-center text-slate-400">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase mb-2 block">
                {t('futures_leverage')}: 1:{leverage}
              </label>
              <input type="range" min="1" max="100" value={leverage} onChange={(e) => setLeverage(parseInt(e.target.value))} className="w-full" />
              <div className="grid grid-cols-4 gap-1 mt-2">
                {[10, 25, 50, 100].map((lev) => (
                  <button key={lev} onClick={() => setLeverage(lev)}
                    className={`text-[8px] font-bold py-1 rounded ${leverage === lev ? 'bg-[#00d4aa]/20 text-[#00d4aa]' : 'bg-[#1a2340] text-slate-400 hover:bg-[#1f2a3f]'}`}>
                    1:{lev}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <input type="number" placeholder={t('order_stopPrice')} value={slPrice} onChange={(e) => setSlPrice(e.target.value)}
                className="w-full bg-[#1a2340] border border-[rgba(148,163,184,0.1)] rounded px-2 py-2 text-xs text-white placeholder-slate-500" />
              <input type="number" placeholder={t('order_limitPrice')} value={tpPrice} onChange={(e) => setTpPrice(e.target.value)}
                className="w-full bg-[#1a2340] border border-[rgba(148,163,184,0.1)] rounded px-2 py-2 text-xs text-white placeholder-slate-500" />
            </div>

            <div className="text-[8px] space-y-1 bg-[#1a2340] rounded p-2">
              <div className="flex justify-between">
                <span className="text-slate-500">{t('futures_spread')}:</span>
                <span className="text-slate-300 font-mono">{currentAsset.spread} pips</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t('trade_funding')}:</span>
                <span className="text-slate-300 font-mono">0.02% daily</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t('pos_margin')}:</span>
                <span className="text-slate-300 font-mono">${(10000 / leverage).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-[rgba(148,163,184,0.1)] p-3">
            <button onClick={handleTrade}
              className={`w-full py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${direction === 'buy' ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}>
              <Send className="w-4 h-4" />
              {direction === 'buy' ? t('common_buy') : t('common_sell')} {volume} LOTS
            </button>
          </div>
        </div>
      )}

      {/* Bottom Panel: Positions */}
      <div className="fixed bottom-20 left-0 right-0 bg-[#0f1525] border-t border-[rgba(148,163,184,0.1)]">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-[#151c2e] border-b border-[rgba(148,163,184,0.1)]">
              <tr>
                <th className="px-3 py-2 text-left font-bold text-slate-400">{t('markets_colAsset')}</th>
                <th className="px-3 py-2 text-left font-bold text-slate-400">{t('trade_order')}</th>
                <th className="px-3 py-2 text-right font-bold text-slate-400">{t('trade_volume')}</th>
                <th className="px-3 py-2 text-right font-bold text-slate-400">{t('pos_entry')}</th>
                <th className="px-3 py-2 text-right font-bold text-slate-400">{t('pos_current')}</th>
                <th className="px-3 py-2 text-right font-bold text-slate-400">PnL</th>
                <th className="px-3 py-2 text-right font-bold text-slate-400">{t('pos_margin')}</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((pos, idx) => (
                <tr key={idx} className="border-b border-[rgba(148,163,184,0.05)] hover:bg-[#1a2340]">
                  <td className="px-3 py-2 font-bold text-white">{pos.symbol}</td>
                  <td className={`px-3 py-2 font-bold ${pos.type === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                    {pos.type === 'buy' ? t('common_buy') : t('common_sell')}
                  </td>
                  <td className="px-3 py-2 text-right">{pos.volume.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right text-slate-300">{pos.entry.toFixed(4)}</td>
                  <td className="px-3 py-2 text-right text-[#00d4aa]">{pos.current.toFixed(4)}</td>
                  <td className={`px-3 py-2 text-right font-bold ${pos.pnl > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${pos.pnl} ({pos.pnlPercent.toFixed(2)}%)
                  </td>
                  <td className="px-3 py-2 text-right text-slate-300">${pos.margin.toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}