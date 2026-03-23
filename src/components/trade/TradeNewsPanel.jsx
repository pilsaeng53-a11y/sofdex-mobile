import React, { useState, useEffect, useCallback } from 'react';
import { ExternalLink, RefreshCw, Newspaper } from 'lucide-react';
import { getNews, normalizeSymbol } from '../../services/solfortApi';

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

export default function TradeNewsPanel({ symbol = 'BTC' }) {
  const baseSymbol = normalizeSymbol(symbol);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNews(baseSymbol);
      setArticles(data);
    } catch {
      setError('Failed to load news');
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [baseSymbol]);

  useEffect(() => {
    fetchNews();
    const timer = setInterval(fetchNews, 30_000);
    return () => clearInterval(timer);
  }, [fetchNews]);

  if (loading && articles.length === 0) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-[#0f1525] rounded-2xl p-4 space-y-2">
            <div className="skeleton h-2.5 w-24 rounded" />
            <div className="skeleton h-3.5 w-full rounded" />
            <div className="skeleton h-3 w-4/5 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#0f1525] rounded-2xl p-6 text-center">
        <p className="text-slate-500 text-sm">{error}</p>
        <button onClick={fetchNews} className="mt-3 text-[#00d4aa] text-xs font-semibold flex items-center gap-1.5 mx-auto">
          <RefreshCw className="w-3 h-3" /> Retry
        </button>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="bg-[#0f1525] rounded-2xl p-6 text-center">
        <Newspaper className="w-8 h-8 text-slate-700 mx-auto mb-2" />
        <p className="text-slate-500 text-sm">No news found for {baseSymbol}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] text-slate-500">{articles.length} articles · {baseSymbol}</span>
        {loading && <RefreshCw className="w-3 h-3 text-slate-600 animate-spin" />}
      </div>
      {articles.map((article, i) => (
        <a
          key={i}
          href={article.url || article.link || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-[#0f1525] rounded-2xl p-4 border border-[rgba(148,163,184,0.06)] hover:border-[#00d4aa]/20 transition-all"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold text-[#00d4aa]">
                  {article.source?.name || article.source || 'News'}
                </span>
                <span className="text-[10px] text-slate-600">
                  {timeAgo(article.publishedAt || article.published_at)}
                </span>
              </div>
              <p className="text-[12px] font-semibold text-slate-200 leading-snug mb-1.5">
                {article.title}
              </p>
              {(article.summary || article.description) && (
                <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-3">
                  {article.summary || article.description}
                </p>
              )}
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-600 flex-shrink-0 mt-0.5" />
          </div>
        </a>
      ))}
    </div>
  );
}