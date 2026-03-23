import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { CATEGORY_TREE } from './mockData';

export default function CategorySidebar({ active, activeSub, onSelect }) {
  const [expanded, setExpanded] = useState({ crypto: true });

  return (
    <div className="h-full overflow-y-auto scrollbar-none py-3"
      style={{ background: '#080b14', borderRight: '1px solid rgba(148,163,184,0.06)' }}>
      {CATEGORY_TREE.map(cat => {
        const isActive  = active === cat.id;
        const isExpanded= !!expanded[cat.id];

        return (
          <div key={cat.id}>
            <button
              onClick={() => {
                onSelect(cat.id, '');
                if (cat.subs.length) setExpanded(e => ({ ...e, [cat.id]: !e[cat.id] }));
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2 text-[11px] font-bold transition-all text-left ${isActive && !activeSub ? 'text-[#00d4aa] bg-[#00d4aa]/08' : 'text-slate-400 hover:text-slate-200 hover:bg-[#151c2e]/50'}`}>
              <span>{cat.label}</span>
              {cat.subs.length > 0 && (
                <ChevronRight className={`w-3 h-3 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              )}
            </button>

            {isExpanded && cat.subs.length > 0 && (
              <div className="ml-2 border-l border-[rgba(148,163,184,0.07)] mb-1">
                {cat.subs.map(sub => {
                  const subActive = isActive && activeSub === sub;
                  return (
                    <button key={sub}
                      onClick={() => onSelect(cat.id, sub)}
                      className={`w-full text-left px-3.5 py-1.5 text-[10px] transition-all block ${subActive ? 'text-[#00d4aa] font-bold bg-[#00d4aa]/06' : 'text-slate-500 hover:text-slate-300'}`}>
                      {sub}
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