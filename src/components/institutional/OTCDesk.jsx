import React, { useState } from 'react';
import { Briefcase, ArrowRightLeft, Clock, CheckCircle, ExternalLink, ChevronRight } from 'lucide-react';
import { useLang } from '../shared/LanguageContext';

const OTC_PAIRS = [
  { pair: 'BTC / USDC', minSize: '$500K', spread: '0.08%', settlement: 'T+0', status: 'live' },
  { pair: 'ETH / USDC', minSize: '$250K', spread: '0.10%', settlement: 'T+0', status: 'live' },
  { pair: 'SOL / USDC', minSize: '$100K', spread: '0.12%', settlement: 'T+0', status: 'live' },
  { pair: 'Gold RWA / USDC', minSize: '$1M', spread: '0.15%', settlement: 'T+1', status: 'live' },
  { pair: 'RE Token / USDC', minSize: '$5M', spread: '0.25%', settlement: 'T+2', status: 'inquiry' },
];

const RECENT_TRADES = [
  { id: 'OTC-2892', pair: 'BTC/USDC', size: '$2.4M', status: 'settled', time: '2h ago' },
  { id: 'OTC-2891', pair: 'ETH/USDC', size: '$890K', status: 'settled', time: '5h ago' },
  { id: 'OTC-2890', pair: 'SOL/USDC', size: '$340K', status: 'pending', time: '8h ago' },
];

export default function OTCDesk() {
  const { t } = useLang();
  const [tab, setTab] = useState('pairs');

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-[#151c2e] to-[#1a2340] rounded-2xl border border-[rgba(148,163,184,0.06)] p-4">
        <div className="flex items-center gap-2 mb-1">
          <Briefcase className="w-4 h-4 text-[#3b82f6]" />
          <span className="text-sm font-bold text-white">{t('otc_title')}</span>
          <span className="ml-auto flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00d4aa] pulse-dot" />
            <span className="text-[10px] text-[#00d4aa]">{t('otc_desk_live')}</span>
          </span>
        </div>
        <p className="text-xs text-slate-500">{t('otc_desc')}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {['pairs', 'recent', 'contact'].map(tab2 => (
          <button
            key={tab2}
            onClick={() => setTab(tab2)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${tab === tab2 ? 'bg-[#00d4aa]/10 text-[#00d4aa] border-[#00d4aa]/20' : 'bg-[#151c2e] text-slate-500 border-[rgba(148,163,184,0.06)]'}`}
          >
            {t(`otc_tab_${tab2}`)}
          </button>
        ))}
      </div>

      {tab === 'pairs' && (
        <div className="space-y-2">
          {OTC_PAIRS.map(p => (
            <div key={p.pair} className="bg-[#151c2e] rounded-xl border border-[rgba(148,163,184,0.06)] p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white">{p.pair}</span>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${p.status === 'live' ? 'text-[#00d4aa] bg-[#00d4aa]/10 border-[#00d4aa]/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20'}`}>{p.status}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div><p className="text-[9px] text-slate-600">{t('otc_min_size')}</p><p className="text-[11px] font-bold text-white mt-0.5">{p.minSize}</p></div>
                <div><p className="text-[9px] text-slate-600">{t('otc_spread')}</p><p className="text-[11px] font-bold text-white mt-0.5">{p.spread}</p></div>
                <div><p className="text-[9px] text-slate-600">{t('otc_settlement')}</p><p className="text-[11px] font-bold text-white mt-0.5">{p.settlement}</p></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'recent' && (
        <div className="space-y-2">
          {RECENT_TRADES.map(t2 => (
            <div key={t2.id} className="bg-[#151c2e] rounded-xl border border-[rgba(148,163,184,0.06)] p-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">{t2.pair}</p>
                <p className="text-[10px] text-slate-500">{t2.id} · {t2.time}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-white">{t2.size}</p>
                <span className={`text-[9px] font-bold uppercase ${t2.status === 'settled' ? 'text-[#00d4aa]' : 'text-amber-400'}`}>{t2.status}</span>
              </div>
            </div>
          ))}
          <p className="text-center text-[10px] text-slate-700">{t('otc_demo_data_note')}</p>
        </div>
      )}

      {tab === 'contact' && (
        <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.06)] p-5 text-center space-y-4">
          <ArrowRightLeft className="w-8 h-8 text-[#3b82f6] mx-auto" />
          <div>
            <p className="text-sm font-bold text-white mb-1">{t('otc_contact_title')}</p>
            <p className="text-xs text-slate-400">{t('otc_contact_desc')}</p>
          </div>
          <a
            href="https://solfort.foundation"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] text-sm font-bold text-white"
          >
            {t('otc_contact_cta')}
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  );
}