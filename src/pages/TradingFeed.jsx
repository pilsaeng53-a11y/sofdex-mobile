import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Heart, UserPlus, Copy, MessageSquare, Filter, Search } from 'lucide-react';

const MOCK_POSTS = [
  { id: 1, trader_name: 'CryptoWhale99', avatar: 'CW', color: '#00d4aa', asset: 'BTC/USDT', direction: 'long', entry_price: 61200, exit_price: 67800, roi: 10.78, likes: 142, comments: 23, followers_copied: 18, time: '2h ago', note: 'Held through the dip, textbook breakout.' },
  { id: 2, trader_name: 'SolanaKing', avatar: 'SK', color: '#9945ff', asset: 'SOL/USDT', direction: 'long', entry_price: 142, exit_price: 168, roi: 18.31, likes: 87, comments: 11, followers_copied: 34, time: '4h ago', note: 'SOL momentum strong, held 2 days.' },
  { id: 3, trader_name: 'BearHunter', avatar: 'BH', color: '#ef4444', asset: 'ETH/USDT', direction: 'short', entry_price: 3820, exit_price: 3440, roi: 9.95, likes: 65, comments: 9, followers_copied: 12, time: '6h ago', note: 'Shorted the resistance, clean R:R.' },
  { id: 4, trader_name: 'DeFiQueen', avatar: 'DQ', color: '#f59e0b', asset: 'SOL/USDT', direction: 'long', entry_price: 155, exit_price: 171, roi: 10.32, likes: 203, comments: 41, followers_copied: 56, time: '8h ago', note: 'Followed whale accumulation pattern.' },
  { id: 5, trader_name: 'RWAInvestor', avatar: 'RI', color: '#06b6d4', asset: 'BTC/USDT', direction: 'short', entry_price: 70100, exit_price: 64500, roi: -7.99, likes: 22, comments: 6, followers_copied: 3, time: '12h ago', note: 'Stop loss hit, market moved against me.' },
];

export default function TradingFeed() {
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [likedIds, setLikedIds] = useState(new Set());
  const [followedIds, setFollowedIds] = useState(new Set());
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const toggleLike = (id) => {
    setLikedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + (likedIds.has(id) ? -1 : 1) } : p));
  };

  const toggleFollow = (id) => {
    setFollowedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered = posts.filter(p => {
    if (filter === 'long' && p.direction !== 'long') return false;
    if (filter === 'short' && p.direction !== 'short') return false;
    if (filter === 'profit' && p.roi <= 0) return false;
    if (search && !p.asset.toLowerCase().includes(search.toLowerCase()) && !p.trader_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">Trading Feed</h1>
          <p className="text-xs text-slate-400">Shared trade results from the community</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search traders or assets..."
          className="w-full bg-[#151c2e] border border-[rgba(148,163,184,0.08)] rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:border-[#00d4aa]/40"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['all','long','short','profit'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${filter === f ? 'bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30' : 'bg-[#151c2e] text-slate-400 border border-[rgba(148,163,184,0.08)]'}`}
          >
            {f === 'all' ? 'All Trades' : f === 'long' ? '📈 Longs' : f === 'short' ? '📉 Shorts' : '💰 Profitable'}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="space-y-3">
        {filtered.map(post => (
          <div key={post.id} className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] p-4 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: post.color }}>
                  {post.avatar}
                </div>
                <div>
                  <Link to={`/TraderProfile?id=${post.id}`} className="text-sm font-semibold text-white hover:text-[#00d4aa] transition-colors">{post.trader_name}</Link>
                  <p className="text-xs text-slate-500">{post.time}</p>
                </div>
              </div>
              <button
                onClick={() => toggleFollow(post.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${followedIds.has(post.id) ? 'bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30' : 'bg-[#1a2340] text-slate-400 border border-[rgba(148,163,184,0.1)]'}`}
              >
                <UserPlus className="w-3 h-3" />
                {followedIds.has(post.id) ? 'Following' : 'Follow'}
              </button>
            </div>

            {/* Trade Card */}
            <div className="bg-[#0a0e1a] rounded-xl p-3 grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-slate-500">Asset</p>
                <p className="text-sm font-bold text-white">{post.asset}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Direction</p>
                <div className="flex items-center gap-1">
                  {post.direction === 'long' ? <TrendingUp className="w-3.5 h-3.5 text-green-400" /> : <TrendingDown className="w-3.5 h-3.5 text-red-400" />}
                  <span className={`text-sm font-bold ${post.direction === 'long' ? 'text-green-400' : 'text-red-400'}`}>{post.direction.toUpperCase()}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500">Entry</p>
                <p className="text-sm font-semibold text-slate-200">${post.entry_price.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Exit</p>
                <p className="text-sm font-semibold text-slate-200">${post.exit_price.toLocaleString()}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-500">ROI</p>
                <p className={`text-xl font-black ${post.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {post.roi >= 0 ? '+' : ''}{post.roi.toFixed(2)}%
                </p>
              </div>
            </div>

            {post.note && (
              <p className="text-sm text-slate-400 italic">"{post.note}"</p>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-4">
                <button onClick={() => toggleLike(post.id)} className={`flex items-center gap-1.5 text-sm transition-colors ${likedIds.has(post.id) ? 'text-red-400' : 'text-slate-400 hover:text-red-400'}`}>
                  <Heart className="w-4 h-4" fill={likedIds.has(post.id) ? 'currentColor' : 'none'} />
                  <span>{post.likes}</span>
                </button>
                <button className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-[#00d4aa] transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  <span>{post.comments}</span>
                </button>
              </div>
              <Link to={`/TraderProfile?id=${post.id}`}>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00d4aa]/10 border border-[#00d4aa]/20 rounded-lg text-xs font-semibold text-[#00d4aa] hover:bg-[#00d4aa]/20 transition-all">
                  <Copy className="w-3 h-3" />
                  Copy Trader
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}