import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Heart, MessageSquare, Settings, Award } from 'lucide-react';

const MY_TRADES = [
  { id: 1, asset: 'SOL/USDT', direction: 'long', entry: 142, exit: 168, roi: 18.31, likes: 23, comments: 5, shared: true, time: '4h ago' },
  { id: 2, asset: 'BTC/USDT', direction: 'short', entry: 70100, exit: 67800, roi: 3.28, likes: 8, comments: 2, shared: true, time: '2d ago' },
];

export default function MyPosts() {
  const [tab, setTab] = useState('posts');
  const [profitShare, setProfitShare] = useState(10);
  const [publicHistory, setPublicHistory] = useState(true);
  const [visiblePositions, setVisiblePositions] = useState(false);
  const [strategy, setStrategy] = useState('Momentum trading with on-chain signals. Focus on high-liquidity assets.');
  const [isLeadTrader, setIsLeadTrader] = useState(false);

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">My Posts</h1>
          <p className="text-xs text-slate-400">Your shared trades & lead trader settings</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#00d4aa] to-[#06b6d4] flex items-center justify-center text-sm font-black text-white">ME</div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#151c2e] rounded-xl p-3 text-center border border-[rgba(148,163,184,0.08)]">
          <p className="text-lg font-black text-green-400">+24.3%</p>
          <p className="text-xs text-slate-500">30d ROI</p>
        </div>
        <div className="bg-[#151c2e] rounded-xl p-3 text-center border border-[rgba(148,163,184,0.08)]">
          <p className="text-lg font-black text-white">68%</p>
          <p className="text-xs text-slate-500">Win Rate</p>
        </div>
        <div className="bg-[#151c2e] rounded-xl p-3 text-center border border-[rgba(148,163,184,0.08)]">
          <p className="text-lg font-black text-white">127</p>
          <p className="text-xs text-slate-500">Followers</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#151c2e] rounded-xl p-1">
        {['posts', 'settings'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${tab === t ? 'bg-[#00d4aa]/20 text-[#00d4aa]' : 'text-slate-400'}`}>
            {t === 'posts' ? 'My Shared Trades' : 'Lead Trader Settings'}
          </button>
        ))}
      </div>

      {tab === 'posts' ? (
        <div className="space-y-3">
          {MY_TRADES.map(trade => (
            <div key={trade.id} className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {trade.direction === 'long' ? <TrendingUp className="w-4 h-4 text-green-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />}
                  <span className="text-sm font-bold text-white">{trade.asset}</span>
                  <span className={`text-xs font-semibold ${trade.direction === 'long' ? 'text-green-400' : 'text-red-400'}`}>{trade.direction.toUpperCase()}</span>
                </div>
                <span className="text-xs text-slate-500">{trade.time}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-[#0a0e1a] rounded-lg p-2 text-center">
                  <p className="text-xs text-slate-500">Entry</p>
                  <p className="text-xs font-semibold text-white">${trade.entry}</p>
                </div>
                <div className="bg-[#0a0e1a] rounded-lg p-2 text-center">
                  <p className="text-xs text-slate-500">Exit</p>
                  <p className="text-xs font-semibold text-white">${trade.exit}</p>
                </div>
                <div className="bg-[#0a0e1a] rounded-lg p-2 text-center">
                  <p className="text-xs text-slate-500">ROI</p>
                  <p className={`text-sm font-black ${trade.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>+{trade.roi}%</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" />{trade.likes}</div>
                <div className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" />{trade.comments}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Lead Trader Toggle */}
          <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#00d4aa]" />
                <span className="text-sm font-semibold text-white">Lead Trader Status</span>
              </div>
              <button
                onClick={() => setIsLeadTrader(!isLeadTrader)}
                className={`w-11 h-6 rounded-full transition-all relative ${isLeadTrader ? 'bg-[#00d4aa]' : 'bg-[#1a2340]'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isLeadTrader ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
            <p className="text-xs text-slate-400">Enable to appear in Traders list and allow copy trading</p>
          </div>

          {/* Profit Share */}
          <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] p-4">
            <p className="text-sm font-semibold text-white mb-3">Profit Share Rate</p>
            <div className="flex gap-2">
              {[5, 10, 20].map(r => (
                <button
                  key={r}
                  onClick={() => setProfitShare(r)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${profitShare === r ? 'bg-gradient-to-r from-[#00d4aa] to-[#06b6d4] text-white' : 'bg-[#0a0e1a] text-slate-400 border border-[rgba(148,163,184,0.1)]'}`}
                >
                  {r}%
                </button>
              ))}
            </div>
            <div className="mt-3 bg-[#0a0e1a] rounded-xl p-3 text-xs space-y-1">
              <div className="flex justify-between"><span className="text-slate-400">Example: Follower earns 100 USDT</span></div>
              <div className="flex justify-between"><span className="text-slate-400">You receive</span><span className="text-[#00d4aa] font-bold">{profitShare} USDT</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Follower keeps</span><span className="text-green-400 font-bold">{100 - profitShare} USDT</span></div>
            </div>
          </div>

          {/* Visibility Settings */}
          <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] p-4 space-y-3">
            <p className="text-sm font-semibold text-white">Visibility Settings</p>
            {[
              { key: 'history', label: 'Public Trade History', val: publicHistory, set: setPublicHistory },
              { key: 'positions', label: 'Visible Open Positions', val: visiblePositions, set: setVisiblePositions },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between">
                <span className="text-sm text-slate-300">{item.label}</span>
                <button
                  onClick={() => item.set(!item.val)}
                  className={`w-11 h-6 rounded-full transition-all relative ${item.val ? 'bg-[#00d4aa]' : 'bg-[#1a2340]'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${item.val ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            ))}
          </div>

          {/* Strategy Description */}
          <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] p-4">
            <p className="text-sm font-semibold text-white mb-2">Strategy Description</p>
            <textarea
              value={strategy}
              onChange={e => setStrategy(e.target.value)}
              rows={4}
              className="w-full bg-[#0a0e1a] border border-[rgba(148,163,184,0.1)] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00d4aa]/40 resize-none"
            />
          </div>

          <button className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#00d4aa] to-[#06b6d4]">
            Save Settings
          </button>
        </div>
      )}
    </div>
  );
}