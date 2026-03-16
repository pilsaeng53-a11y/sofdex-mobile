import React, { useState } from 'react';
import { MessageSquare, Heart, ChevronDown, ChevronUp, Send, Reply } from 'lucide-react';

const MOCK_COMMENTS = {
  1: [
    { id: 'c1', author: 'TradePro99', avatar: 'TP', color: '#00d4aa', text: 'Textbook setup! Held through the FUD like a pro.', likes: 12, time: '1h ago', replies: [
      { id: 'r1', author: 'LunarWave', avatar: 'LW', color: '#9945ff', text: 'Agreed, the volume confirmed the breakout early.', likes: 4, time: '45m ago' },
    ]},
    { id: 'c2', author: 'CryptoNomad', avatar: 'CN', color: '#f59e0b', text: 'What was your stop loss on this?', likes: 3, time: '50m ago', replies: [] },
  ],
  2: [
    { id: 'c3', author: 'SolFan', avatar: 'SF', color: '#9945ff', text: 'SOL momentum has been insane this week. Good catch!', likes: 8, time: '3h ago', replies: [] },
  ],
  3: [],
  4: [
    { id: 'c4', author: 'WhaleWatch', avatar: 'WW', color: '#06b6d4', text: 'I saw this accumulation too, jumped in a bit late though.', likes: 17, time: '7h ago', replies: [
      { id: 'r2', author: 'DeFiQueen', avatar: 'DQ', color: '#f59e0b', text: 'Better late than never! Still caught most of the move.', likes: 6, time: '6h ago' },
    ]},
  ],
  5: [],
};

export default function CommentSection({ postId }) {
  const initial = (MOCK_COMMENTS[postId] || []).map(c => ({ ...c, replies: c.replies || [] }));
  const [comments, setComments] = useState(initial);
  const [open, setOpen] = useState(false);
  const [newText, setNewText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [likedComments, setLikedComments] = useState(new Set());

  const totalCount = comments.reduce((s, c) => s + 1 + (c.replies?.length || 0), 0);

  const addComment = () => {
    if (!newText.trim()) return;
    const c = {
      id: `c_${Date.now()}`,
      author: 'You',
      avatar: 'ME',
      color: '#00d4aa',
      text: newText.trim(),
      likes: 0,
      time: 'just now',
      replies: [],
    };
    setComments(prev => [c, ...prev]);
    setNewText('');
  };

  const addReply = (commentId) => {
    if (!replyText.trim()) return;
    const r = {
      id: `r_${Date.now()}`,
      author: 'You',
      avatar: 'ME',
      color: '#00d4aa',
      text: replyText.trim(),
      likes: 0,
      time: 'just now',
    };
    setComments(prev => prev.map(c =>
      c.id === commentId ? { ...c, replies: [...(c.replies || []), r] } : c
    ));
    setReplyText('');
    setReplyingTo(null);
  };

  const toggleLike = (id) => {
    setLikedComments(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-[#00d4aa] transition-colors"
      >
        <MessageSquare className="w-4 h-4" />
        <span>{totalCount}</span>
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {/* Input */}
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-[#00d4aa] flex items-center justify-center text-[10px] font-bold text-black flex-shrink-0">ME</div>
            <div className="flex-1 flex gap-2">
              <input
                value={newText}
                onChange={e => setNewText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addComment()}
                placeholder="Add a comment..."
                className="flex-1 bg-[#0a0e1a] border border-[rgba(148,163,184,0.08)] rounded-xl px-3 py-2 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-[#00d4aa]/30"
              />
              <button onClick={addComment} className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#00d4aa]/20 text-[#00d4aa] hover:bg-[#00d4aa]/30 transition-all flex-shrink-0">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Comments */}
          {comments.length === 0 && (
            <p className="text-xs text-slate-600 text-center py-2">No comments yet. Be the first!</p>
          )}
          {comments.map(comment => (
            <div key={comment.id} className="space-y-2">
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0" style={{ background: comment.color }}>{comment.avatar}</div>
                <div className="flex-1 bg-[#0a0e1a] rounded-xl p-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-white">{comment.author}</span>
                    <span className="text-[10px] text-slate-600">{comment.time}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{comment.text}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <button onClick={() => toggleLike(comment.id)} className={`flex items-center gap-1 text-[10px] transition-colors ${likedComments.has(comment.id) ? 'text-red-400' : 'text-slate-500 hover:text-red-400'}`}>
                      <Heart className="w-3 h-3" fill={likedComments.has(comment.id) ? 'currentColor' : 'none'} />
                      {comment.likes + (likedComments.has(comment.id) ? 1 : 0)}
                    </button>
                    <button onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)} className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-[#00d4aa] transition-colors">
                      <Reply className="w-3 h-3" /> Reply
                    </button>
                  </div>
                </div>
              </div>

              {/* Replies */}
              {comment.replies?.map(reply => (
                <div key={reply.id} className="ml-9 flex gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0" style={{ background: reply.color }}>{reply.avatar}</div>
                  <div className="flex-1 bg-[#0a0e1a] rounded-xl p-2">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] font-semibold text-white">{reply.author}</span>
                      <span className="text-[10px] text-slate-600">{reply.time}</span>
                    </div>
                    <p className="text-[10px] text-slate-400">{reply.text}</p>
                  </div>
                </div>
              ))}

              {/* Reply input */}
              {replyingTo === comment.id && (
                <div className="ml-9 flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#00d4aa] flex items-center justify-center text-[9px] font-bold text-black flex-shrink-0">ME</div>
                  <div className="flex-1 flex gap-1.5">
                    <input
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addReply(comment.id)}
                      placeholder="Reply..."
                      className="flex-1 bg-[#0a0e1a] border border-[#00d4aa]/20 rounded-xl px-3 py-1.5 text-[10px] text-slate-300 placeholder-slate-600 focus:outline-none"
                    />
                    <button onClick={() => addReply(comment.id)} className="w-7 h-7 flex items-center justify-center rounded-xl bg-[#00d4aa]/20 text-[#00d4aa] flex-shrink-0">
                      <Send className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}