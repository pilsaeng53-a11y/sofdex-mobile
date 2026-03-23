import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ExternalLink, RefreshCw, Newspaper, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getNews, normalizeSymbol } from '../../services/solfortApi';

// ─── Helpers ──────────────────────────────────────────────────
function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function isNew(dateStr) {
  if (!dateStr) return false;
  return Date.now() - new Date(dateStr).getTime() < 30 * 60 * 1000;
}

function getSentiment(article) {
  const s = (article.sentiment || article.impact || '').toLowerCase();
  if (s === 'bullish' || s === 'positive') return 'bullish';
  if (s === 'bearish' || s === 'negative') return 'bearish';
  if (s === 'neutral') return 'neutral';
  return null;
}

function getRegion(article) {
  const r = (article.region || '').toLowerCase();
  if (r === 'ko' || r === 'korean' || r === 'kr') return 'KR';
  if (r === 'global' || r === 'en') return 'Global';
  return null;
}

const SENTIMENT_STYLES = {
  bullish: { label: 'Bullish', cls: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', icon: TrendingUp },
  bearish: { label: 'Bearish', cls: 'text-red-400 bg-red-400/10 border-red-400/20', icon: TrendingDown },
  neutral: { label: 'Neutral', cls: 'text-amber-400 bg-amber-400/10 border-amber-400/20', icon: Minus },
};

const FILTER_OPTS = ['All', 'Bullish', 'Bearish', 'Neutral', 'Korean', 'Global'];
const SORT_OPTS   = ['Latest', 'Relevance'];

// Filter → region query param for API
const REGION_PARAM = { Korean: 'ko', Global: 'global' };
// Filter → sort param for API
const SORT_PARAM = { Relevance: 'relevance', Latest: undefined };

// ─── Article Card ─────────────────────────────────────────────
function ArticleCard({ article }) {
  const sentiment  = getSentiment(article);
  const region     = getRegion(article);
  const sentStyle  = sentiment ? SENTIMENT_STYLES[sentiment] : null;
  const pubDate    = article.publishedAt || article.published_at;
  const isNewItem  = isNew(pubDate);
  const source     = article.source?.name || article.source || 'News';
  const SentIcon   = sentStyle?.icon;

  return (
    <a
      href={article.url || article.link || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-[#0f1525] rounded-2xl p-4 border border-[rgba(148,163,184,0.06)] hover:border-[#00d4aa]/20 transition-all group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Meta */}
          <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
            <span className="text-[10px] font-bold text-[#00d4aa]">{source}</span>
            <span className="text-[10px] text-slate-600">{timeAgo(pubDate)}</span>
            {isNewItem && (
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-[#00d4aa]/15 text-[#00d4aa] border border-[#00d4aa]/20 uppercase tracking-wide">New</span>
            )}
            {region && (
              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${
                region === 'KR'
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
              }`}>{region}</span>
            )}
            {sentStyle && (
              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border flex items-center gap-0.5 ${sentStyle.cls}`}>
                <SentIcon className="w-2.5 h-2.5" /> {sentStyle.label}
              </span>
            )}
          </div>

          {/* Title */}
          <p className="text-[12px] font-semibold text-slate-200 leading-snug mb-1.5">{article.title}</p>

          {/* Summary */}
          {(article.summary || article.description) && (
            <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
              {article.summary || article.description}
            </p>
          )}
        </div>
        <ExternalLink className="w-3.5 h-3.5 text-slate-700 group-hover:text-slate-400 flex-shrink-0 mt-0.5 transition-colors" />
      </div>
    </a>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function TradeNewsPanel({ symbol = 'BTC' }) {
  const baseSymbol = normalizeSymbol(symbol);
  const [articles, setArticles] = useState([]);
  const [sentimentCounts, setSentimentCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');
  const [sort, setSort] = useState('Latest');
  const timerRef = useRef(null);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const regionParam = REGION_PARAM[filter] || undefined;
      const sortParam   = SORT_PARAM[sort];
      const { articles: data, sentimentCounts: sc } = await getNews(baseSymbol, { region: regionParam, sort: sortParam });
      setArticles(data);
      setSentimentCounts(sc);
    } catch (e) {
      setError(e.message || 'Failed to load news');
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [baseSymbol, filter, sort]);

  useEffect(() => {
    fetchNews();
    clearInterval(timerRef.current);
    timerRef.current = setInterval(fetchNews, 30_000);
    return () => clearInterval(timerRef.current);
  }, [fetchNews]);

  // Client-side filter (fallback when API doesn't support region/sentiment filtering)
  const filtered = articles.filter(a => {
    if (filter === 'All') return true;
    const s = getSentiment(a);
    if (filter === 'Bullish') return s === 'bullish';
    if (filter === 'Bearish') return s === 'bearish';
    if (filter === 'Neutral') return s === 'neutral';
    const r = (a.region || '').toLowerCase();
    if (filter === 'Korean') return r === 'ko' || r === 'kr' || r === 'korean' || /[\uAC00-\uD7AF]/.test(a.title || '');
    if (filter === 'Global') return !r || r === 'global' || r === 'en';
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'Latest') {
      return new Date(b.publishedAt || b.published_at || 0) - new Date(a.publishedAt || a.published_at || 0);
    }
    // Relevance: backend handles it; client fallback: bullish first
    const sa = getSentiment(a) === 'bullish' ? 1 : 0;
    const sb = getSentiment(b) === 'bullish' ? 1 : 0;
    return sb - sa;
  });

  return (
    <div className="space-y-3">
      {/* Sentiment counts (if backend provides them) */}
      {sentimentCounts && (
        <div className="grid grid-cols-3 gap-2">
          {[['Bullish', 'bullish', 'text-emerald-400 bg-emerald-400/08'], ['Bearish', 'bearish', 'text-red-400 bg-red-400/08'], ['Neutral', 'neutral', 'text-amber-400 bg-amber-400/08']].map(([label, key, cls]) => (
            <div key={key} className={`rounded-xl p-2 text-center bg-[#0f1525] border border-[rgba(148,163,184,0.06)]`}>
              <p className="text-[9px] text-slate-600 uppercase tracking-wide">{label}</p>
              <p className={`text-sm font-black ${cls.split(' ')[0]}`}>{sentimentCounts[key] ?? 0}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
        {FILTER_OPTS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
              filter === f
                ? 'bg-[#00d4aa]/15 text-[#00d4aa] border border-[#00d4aa]/25'
                : 'bg-[#0f1525] text-slate-500 border border-transparent hover:text-slate-300'
            }`}>
            {f}
          </button>
        ))}
        <div className="flex-shrink-0 ml-auto flex gap-1">
          {SORT_OPTS.map(s => (
            <button key={s} onClick={() => setSort(s)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                sort === s
                  ? 'bg-[#151c2e] text-white border border-[rgba(148,163,184,0.15)]'
                  : 'text-slate-600 border border-transparent hover:text-slate-400'
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Count + refresh */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] text-slate-500">{sorted.length} article{sorted.length !== 1 ? 's' : ''} · {baseSymbol}</span>
        <button onClick={fetchNews} className="flex items-center gap-1 text-[10px] text-slate-600 hover:text-slate-400 transition-colors">
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Loading */}
      {loading && articles.length === 0 && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#0f1525] rounded-2xl p-4 space-y-2">
              <div className="skeleton h-2 w-20 rounded" />
              <div className="skeleton h-3.5 w-full rounded" />
              <div className="skeleton h-3 w-4/5 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="bg-[#0f1525] rounded-2xl p-6 text-center">
          <p className="text-slate-500 text-sm">{error}</p>
          <button onClick={fetchNews} className="mt-3 text-[#00d4aa] text-xs font-semibold flex items-center gap-1.5 mx-auto">
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && sorted.length === 0 && (
        <div className="bg-[#0f1525] rounded-2xl p-6 text-center">
          <Newspaper className="w-8 h-8 text-slate-700 mx-auto mb-2" />
          <p className="text-slate-500 text-sm">No articles match this filter</p>
        </div>
      )}

      {/* Articles */}
      {sorted.map((article, i) => (
        <ArticleCard key={i} article={article} />
      ))}
    </div>
  );
}