/**
 * AISentimentCard — Summary card on the Home page.
 * Reads from the shared useOverallAISignal hook — same source as AIIntelligence detail page.
 * No hardcoded values. No local state for the signal.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, ChevronRight } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { useLang } from '../shared/LanguageContext';
import { useOverallAISignal } from '../../services/aiSignalResolver';

const SIGNAL_COLORS = {
  Bullish: 'text-emerald-400',
  Bearish: 'text-red-400',
  Neutral: 'text-slate-400',
};

const BADGE_STYLES = {
  Bullish: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
  Bearish: 'bg-red-400/10 text-red-400 border-red-400/20',
  Neutral: 'bg-slate-400/10 text-slate-400 border-slate-400/20',
};

export default function AISentimentCard() {
  const { t }   = useLang();
  const signal  = useOverallAISignal();

  const labelColor  = SIGNAL_COLORS[signal.label] ?? 'text-slate-400';
  const badgeStyle  = BADGE_STYLES[signal.label]  ?? BADGE_STYLES.Neutral;
  const barWidth    = `${signal.score}%`;

  return (
    <Link to={createPageUrl('AIIntelligence')}>
      <div className="mx-4 mb-5">
        <div className="relative overflow-hidden glass-card rounded-2xl p-4 border border-[#00d4aa]/10 hover:border-[#00d4aa]/20 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00d4aa]/5 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-[#00d4aa]" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {t('ai_marketSentiment')}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </div>

            <div className="flex items-center justify-between mb-2">
              <div>
                <p className={`text-xl font-black ${labelColor}`}>{signal.label}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {signal.confidence} {t('ai_confidence')} · Score {signal.score}/100
                </p>
              </div>
              <div className="text-right">
                <div className="flex gap-1.5">
                  <span className={`px-2 py-1 rounded-lg text-[9px] font-bold border ${badgeStyle}`}>
                    AI {t('ai_tab_signals')}: {signal.bullishCount} {t('sentiment_bullish')}
                  </span>
                </div>
              </div>
            </div>

            <div className="h-1.5 rounded-full bg-[#0d1220] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: barWidth }}
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}