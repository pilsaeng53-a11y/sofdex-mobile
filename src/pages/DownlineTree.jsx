import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Users, Crown } from 'lucide-react';

const TIER_COLORS = {
  Platinum: 'text-[#00d4aa] bg-[#00d4aa]/10',
  Gold: 'text-amber-400 bg-amber-400/10',
  Purple: 'text-purple-400 bg-purple-400/10',
  Green: 'text-emerald-400 bg-emerald-400/10',
};

const TREE = {
  id: 'root',
  name: 'You (K9QR)',
  wallet: '0x...K9QR',
  tier: 'Gold',
  joined: 'Jan 2024',
  isMe: true,
  children: [
    {
      id: 'a1', name: 'User ...aX4f', wallet: '0x...aX4f', tier: 'Green', joined: 'Feb 2024',
      children: [
        { id: 'a1a', name: 'User ...mQ2r', wallet: '0x...mQ2r', tier: 'Green', joined: 'Mar 2024', children: [] },
        { id: 'a1b', name: 'User ...Tp8k', wallet: '0x...Tp8k', tier: 'Green', joined: 'Mar 2024', children: [] },
      ]
    },
    {
      id: 'a2', name: 'User ...mN2q', wallet: '0x...mN2q', tier: 'Purple', joined: 'Feb 2024',
      children: [
        {
          id: 'a2a', name: 'User ...Lv5n', wallet: '0x...Lv5n', tier: 'Green', joined: 'Mar 2024',
          children: [
            { id: 'a2a1', name: 'User ...Bt9s', wallet: '0x...Bt9s', tier: 'Green', joined: 'Apr 2024', children: [] },
          ]
        },
        { id: 'a2b', name: 'User ...Wz3c', wallet: '0x...Wz3c', tier: 'Green', joined: 'Mar 2024', children: [] },
      ]
    },
    {
      id: 'a3', name: 'User ...Kp9r', wallet: '0x...Kp9r', tier: 'Gold', joined: 'Jan 2024',
      children: [
        { id: 'a3a', name: 'User ...Fx2d', wallet: '0x...Fx2d', tier: 'Purple', joined: 'Feb 2024', children: [] },
        { id: 'a3b', name: 'User ...Hn7y', wallet: '0x...Hn7y', tier: 'Green', joined: 'Mar 2024', children: [] },
        { id: 'a3c', name: 'User ...Jm4v', wallet: '0x...Jm4v', tier: 'Green', joined: 'Apr 2024', children: [] },
      ]
    },
  ]
};

function TreeNode({ node, depth = 0 }) {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = node.children && node.children.length > 0;
  const tierStyle = TIER_COLORS[node.tier] || TIER_COLORS.Green;

  return (
    <div className={`${depth > 0 ? 'ml-4 border-l border-[rgba(148,163,184,0.08)] pl-3' : ''}`}>
      <div
        className={`flex items-center gap-2 py-2.5 px-3 rounded-xl mb-1 transition-all ${node.isMe ? 'bg-[#00d4aa]/10 border border-[#00d4aa]/20' : 'bg-[#151c2e] border border-[rgba(148,163,184,0.06)] hover:border-[rgba(148,163,184,0.15)]'}`}
      >
        {hasChildren ? (
          <button onClick={() => setExpanded(!expanded)} className="w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:text-[#00d4aa] transition-colors flex-shrink-0">
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        ) : (
          <div className="w-5 h-5 flex-shrink-0" />
        )}

        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${node.isMe ? 'bg-gradient-to-br from-[#00d4aa] to-[#06b6d4]' : 'bg-[#1a2340]'}`}>
          {node.isMe ? <Crown className="w-3.5 h-3.5 text-white" /> : <Users className="w-3.5 h-3.5 text-slate-400" />}
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-xs font-semibold truncate ${node.isMe ? 'text-[#00d4aa]' : 'text-white'}`}>{node.name}</p>
          <p className="text-[10px] text-slate-500">{node.wallet} · {node.joined}</p>
        </div>

        <div className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${tierStyle}`}>
          {node.tier}
        </div>

        {hasChildren && (
          <span className="text-[10px] text-slate-600 flex-shrink-0">{node.children.length}</span>
        )}
      </div>

      {expanded && hasChildren && (
        <div>
          {node.children.map(child => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DownlineTree() {
  return (
    <div className="px-4 py-4 space-y-4">
      <div>
        <h1 className="text-lg font-bold text-white">Downline Tree</h1>
        <p className="text-xs text-slate-400">Your partner network hierarchy</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#151c2e] rounded-xl p-3 border border-[rgba(148,163,184,0.08)] text-center">
          <p className="text-lg font-black text-white">34</p>
          <p className="text-xs text-slate-500">Total Team</p>
        </div>
        <div className="bg-[#151c2e] rounded-xl p-3 border border-[rgba(148,163,184,0.08)] text-center">
          <p className="text-lg font-black text-white">12</p>
          <p className="text-xs text-slate-500">Direct</p>
        </div>
        <div className="bg-[#151c2e] rounded-xl p-3 border border-[rgba(148,163,184,0.08)] text-center">
          <p className="text-lg font-black text-white">4</p>
          <p className="text-xs text-slate-500">Levels</p>
        </div>
      </div>

      <div className="bg-[#0a0e1a] rounded-2xl border border-[rgba(148,163,184,0.06)] p-3">
        <TreeNode node={TREE} depth={0} />
      </div>
    </div>
  );
}