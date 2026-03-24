import React, { useState } from 'react';
import { ChevronRight, Loader2 } from 'lucide-react';

// Fallback while backend loads — IDs match exact backend values
const STATIC_TREE = [
  { id: 'explore',        label: '🔥 Explore' },
  { id: 'Crypto',         label: '₿ Crypto' },
  { id: 'Sports',         label: '🏆 Sports' },
  { id: 'Elections',      label: '🗳️ Elections' },
  { id: 'Politics',       label: '🏛️ Politics' },
  { id: 'Economics',      label: '📊 Economics' },
  { id: 'Companies',      label: '🏢 Companies' },
  { id: 'Financials',     label: '💹 Financials' },
  { id: 'Tech & Science', label: '🤖 Tech & Science' },
  { id: 'Culture',        label: '🎬 Culture' },
  { id: 'Climate',        label: '🌍 Climate' },
  { id: 'Global',         label: '🌐 Global' },
];

const EMOJI_MAP = {
  'Crypto': '₿', 'Sports': '🏆', 'Elections': '🗳️', 'Politics': '🏛️',
  'Economics': '📊', 'Companies': '🏢', 'Financials': '💹',
  'Tech & Science': '🤖', 'Culture': '🎬', 'Climate': '🌍', 'Global': '🌐',
  'Trending': '🔥',
};

function buildTree(dynamic) {
  const explore = { id: 'explore', label: '🔥 Explore', subs: [], count: 0 };
  if (!dynamic.length) return [explore, ...STATIC_TREE.slice(1)];

  // dynamic.id = exact backend category string
  const items = dynamic.map(d => ({
    ...d,
    label: `${EMOJI_MAP[d.id] ?? ''} ${d.id}`.trim(),
  }));
  return [explore, ...items];
}

export default function CategorySidebar({ active, activeSub, onSelect, dynamicCategories = [], loading = false }) {
  const [expanded, setExpanded] = useState({ Crypto: true, [active]: true });
  const tree = buildTree(dynamicCategories);

  return (
    <div className="h-full w-full overflow-y-auto scrollbar-none py-2"
      style={{ background: '#080b14', borderRight: '1px solid rgba(148,163,184,0.06)' }}>

      {loading && (
        <div className="flex items-center gap-2 px-3.5 py-2 text-[9px] text-slate-600">
          <Loader2 className="w-3 h-3 animate-spin" />Loading categories...
        </div>
      )}

      {tree.map(cat => {
        const isActive   = active === cat.id;
        const isExpanded = !!expanded[cat.id];
        const subs       = cat.subs ?? [];

        return (
          <div key={cat.id}>
            <button
              onClick={() => {
                onSelect(cat.id, '');
                if (subs.length) setExpanded(e => ({ ...e, [cat.id]: !e[cat.id] }));
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold transition-all text-left gap-1.5 ${isActive && !activeSub ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
              style={isActive && !activeSub
                ? { background: 'linear-gradient(90deg, rgba(0,212,170,0.12) 0%, rgba(0,212,170,0.04) 100%)', borderLeft: '2px solid #00d4aa', paddingLeft: '10px' }
                : { borderLeft: '2px solid transparent' }}>
              <span className="flex-1 truncate">{cat.label}</span>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {cat.count > 0 && (
                  <span className="text-[7px] font-bold px-1 py-0.5 rounded"
                    style={isActive && !activeSub
                      ? { background: 'rgba(0,212,170,0.15)', color: '#00d4aa' }
                      : { background: 'rgba(148,163,184,0.08)', color: '#64748b' }}>{cat.count}</span>
                )}
                {subs.length > 0 && <ChevronRight className={`w-3 h-3 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''} ${isActive ? 'text-[#00d4aa]' : 'text-slate-600'}`} />}
              </div>
            </button>

            {isExpanded && subs.length > 0 && (
              <div className="ml-3 border-l border-[rgba(148,163,184,0.07)] mb-0.5 pl-0.5">
                {subs.map(sub => {
                  const subStr    = typeof sub === 'string' ? sub : sub.label ?? '';
                  const subActive = isActive && activeSub === subStr;
                  return (
                    <button key={subStr} onClick={() => onSelect(cat.id, subStr)}
                      className={`w-full text-left px-3 py-1.5 text-[10px] transition-all block rounded-r-lg ${subActive ? 'font-bold' : 'text-slate-500 hover:text-slate-300 hover:bg-[#151c2e]/30'}`}
                      style={subActive ? { color: '#00d4aa', background: 'rgba(0,212,170,0.07)', borderRight: '2px solid #00d4aa' } : {}}>
                      {subStr}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}