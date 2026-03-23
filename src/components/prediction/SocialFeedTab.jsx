import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { SOCIAL_POSTS } from './mockData';

function PostCard({ post }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes);

  return (
    <div className="rounded-2xl p-4 border transition-all hover:border-[rgba(0,212,170,0.1)]"
      style={{ background: 'rgba(13,18,32,0.9)', borderColor: 'rgba(148,163,184,0.08)' }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0"
          style={{ background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.15)' }}>
          {post.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-white">{post.user}</span>
            {post.verified && <span className="text-[7px] bg-[#00d4aa]/15 text-[#00d4aa] px-1 rounded font-black">✓</span>}
            {post.boost && <span className="text-[7px] px-1.5 py-0.5 rounded font-black" style={{ background: 'rgba(249,115,22,0.1)', color: '#f97316', border: '1px solid rgba(249,115,22,0.2)' }}>⚡ BOOSTED</span>}
          </div>
          <span className="text-[9px] text-slate-500">{post.time}</span>
        </div>
        <button className="text-[9px] font-bold text-[#00d4aa] border border-[#00d4aa]/20 px-2 py-1 rounded-lg hover:bg-[#00d4aa]/08 transition-colors flex-shrink-0">
          Follow
        </button>
      </div>

      <div className="rounded-xl p-3 mb-3"
        style={{ background: post.side==='YES' ? 'rgba(34,197,94,0.05)' : 'rgba(239,68,68,0.05)', border: `1px solid ${post.side==='YES' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)'}` }}>
        <div className="flex items-center gap-1.5 mb-1.5">
          {post.side==='YES' ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : <TrendingDown className="w-3 h-3 text-red-400" />}
          <span className={`text-[9px] font-black ${post.side==='YES' ? 'text-emerald-400' : 'text-red-400'}`}>Bet {post.side}</span>
        </div>
        <p className="text-[11px] font-bold text-white mb-2">{post.market}</p>
        <div className="flex justify-between text-[9px]">
          <span className="text-slate-500">Stake: <span className="font-mono text-slate-300">${post.amount.toLocaleString()}</span></span>
          <span className="text-slate-500">Profit if win: <span className="font-mono text-emerald-400 font-bold">+${(post.payout-post.amount).toLocaleString()}</span></span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={() => { setLiked(v=>!v); setLikes(v => liked?v-1:v+1); }}
          className={`flex items-center gap-1.5 text-[10px] font-bold transition-colors ${liked ? 'text-red-400' : 'text-slate-500 hover:text-red-400'}`}>
          <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-red-400' : ''}`} />{likes}
        </button>
        <button className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-slate-300 transition-colors">
          <MessageCircle className="w-3.5 h-3.5" />{post.comments}
        </button>
        <button className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-[#00d4aa] ml-auto transition-colors">
          <Share2 className="w-3.5 h-3.5" />Share
        </button>
      </div>
    </div>
  );
}

export default function SocialFeedTab() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1 mb-1">
        <p className="text-xs font-black text-white">Live Bet Feed</p>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] text-slate-500">Live</span>
        </div>
      </div>
      {SOCIAL_POSTS.map(p => <PostCard key={p.id} post={p} />)}
    </div>
  );
}