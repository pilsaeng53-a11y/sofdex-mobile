import React, { useState } from 'react';
import { MessageSquare, Heart, Plus, Pin, ChevronRight } from 'lucide-react';
import AssetSentimentVote from '../components/shared/AssetSentimentVote';
import CommentSection from '../components/community/CommentSection';

const CHANNELS = [
  { key: 'market', label: '📊 Market Discussion', desc: 'Price action, macro trends' },
  { key: 'governance', label: '🗳️ Governance', desc: 'DAO proposals, voting' },
  { key: 'rwa', label: '🏛️ RWA Assets', desc: 'Real world assets discussion' },
  { key: 'strategies', label: '⚡ Strategies', desc: 'Share trading strategies' },
];

const MOCK_POSTS = {
  market: [
    { id: 1, author: 'CryptoWhale99', avatar: 'CW', color: '#00d4aa', title: 'BTC approaching key resistance at $72k', body: 'Volume profile shows strong accumulation below. Watch for breakout or rejection this week.', likes: 47, replies: 12, time: '1h ago', pinned: true },
    { id: 2, author: 'SolanaKing', avatar: 'SK', color: '#9945ff', title: 'SOL ecosystem showing strong fundamentals', body: 'TVL up 40% month-over-month. New protocols launching Q2 could drive another leg up.', likes: 31, replies: 8, time: '3h ago' },
    { id: 3, author: 'RWAInvestor', avatar: 'RI', color: '#06b6d4', title: 'Macro headwinds — USD strengthening', body: 'DXY up 1.2% this week. Could create short-term pressure on risk assets. Position accordingly.', likes: 19, replies: 5, time: '5h ago' },
  ],
  governance: [
    { id: 4, author: 'DeFiQueen', avatar: 'DQ', color: '#f59e0b', title: 'PROP-12: Increase staking rewards to 15%', body: 'Current 10% rate is below market competition. Proposing increase to attract more long-term holders.', likes: 88, replies: 24, time: '2h ago', pinned: true },
    { id: 5, author: 'BearHunter', avatar: 'BH', color: '#ef4444', title: 'Discussion: Revenue sharing model for Q2', body: 'Should we allocate more of protocol revenue to stakers or buy back SOF tokens?', likes: 52, replies: 18, time: '6h ago' },
  ],
  rwa: [
    { id: 6, author: 'RWAInvestor', avatar: 'RI', color: '#06b6d4', title: 'Manhattan real estate token yield update', body: 'Q1 yield came in at 8.2% annualized. Higher than expected due to rent adjustments.', likes: 34, replies: 9, time: '4h ago', pinned: true },
    { id: 7, author: 'CryptoWhale99', avatar: 'CW', color: '#00d4aa', title: 'Gold RWA vs physical gold — comparison', body: 'Platform gold tokens provide same exposure with better liquidity. Here\'s my analysis...', likes: 28, replies: 7, time: '8h ago' },
  ],
  strategies: [
    { id: 8, author: 'SolanaKing', avatar: 'SK', color: '#9945ff', title: 'My breakout strategy explained step by step', body: '1. Wait for consolidation above key level 2. Volume confirmation 3. Enter on retest 4. TP at 1:3 R:R', likes: 126, replies: 34, time: '12h ago', pinned: true },
    { id: 9, author: 'DeFiQueen', avatar: 'DQ', color: '#f59e0b', title: 'Why I only trade during London/NY overlap', body: 'Liquidity is highest, spreads tightest, moves most reliable. Changed my win rate from 55% to 74%.', likes: 93, replies: 21, time: '1d ago' },
  ],
};

export default function Discussions() {
  const [channel, setChannel] = useState('market');
  const [likedIds, setLikedIds] = useState(new Set());
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');

  const posts = MOCK_POSTS[channel] || [];

  const toggleLike = (id) => {
    setLikedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">Discussions</h1>
          <p className="text-xs text-slate-400">Community channels & market talk</p>
        </div>
        <button onClick={() => setShowNew(true)} className="w-8 h-8 rounded-xl bg-[#00d4aa]/10 border border-[#00d4aa]/20 flex items-center justify-center">
          <Plus className="w-4 h-4 text-[#00d4aa]" />
        </button>
      </div>

      {/* Channels */}
      <div className="grid grid-cols-2 gap-2">
        {CHANNELS.map(c => (
          <button
            key={c.key}
            onClick={() => setChannel(c.key)}
            className={`p-3 rounded-xl text-left transition-all border ${channel === c.key ? 'bg-[#00d4aa]/10 border-[#00d4aa]/30' : 'bg-[#151c2e] border-[rgba(148,163,184,0.08)]'}`}
          >
            <p className={`text-xs font-semibold ${channel === c.key ? 'text-[#00d4aa]' : 'text-white'}`}>{c.label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{c.desc}</p>
          </button>
        ))}
      </div>

      {/* Sentiment Voting */}
      {channel === 'market' && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Community Sentiment</p>
          <div className="grid grid-cols-1 gap-2">
            {['BTC', 'ETH', 'SOL'].map(sym => (
              <AssetSentimentVote key={sym} symbol={sym} compact />
            ))}
          </div>
        </div>
      )}

      {/* Posts */}
      <div className="space-y-3">
        {posts.map(post => (
          <div key={post.id} className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.08)] p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: post.color }}>{post.avatar}</div>
                <div>
                  <p className="text-xs font-semibold text-white">{post.author}</p>
                  <p className="text-xs text-slate-500">{post.time}</p>
                </div>
              </div>
              {post.pinned && (
                <div className="flex items-center gap-1 text-xs text-amber-400">
                  <Pin className="w-3 h-3" />
                  <span>Pinned</span>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">{post.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{post.body}</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => toggleLike(post.id)} className={`flex items-center gap-1.5 text-xs transition-colors ${likedIds.has(post.id) ? 'text-red-400' : 'text-slate-400'}`}>
                  <Heart className="w-3.5 h-3.5" fill={likedIds.has(post.id) ? 'currentColor' : 'none'} />
                  {post.likes + (likedIds.has(post.id) ? 1 : 0)}
                </button>
              </div>
            </div>
            <CommentSection postId={post.id} />
          </div>
        ))}
      </div>

      {/* New Post Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end justify-center p-4">
          <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.1)] p-5 w-full max-w-sm space-y-3">
            <h3 className="text-base font-bold text-white">New Post</h3>
            <input
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Title..."
              className="w-full bg-[#0a0e1a] border border-[rgba(148,163,184,0.1)] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00d4aa]/40"
            />
            <textarea
              value={newBody}
              onChange={e => setNewBody(e.target.value)}
              placeholder="Share your thoughts..."
              rows={4}
              className="w-full bg-[#0a0e1a] border border-[rgba(148,163,184,0.1)] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00d4aa]/40 resize-none"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowNew(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-400 bg-[#1a2340] border border-[rgba(148,163,184,0.1)]">Cancel</button>
              <button onClick={() => setShowNew(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#00d4aa] to-[#06b6d4]">Post</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}