import React, { useState, useEffect, useCallback } from 'react';
import { Newspaper, ArrowRight, ExternalLink, RefreshCw, Zap } from 'lucide-react';
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

export default function NewsPreview({ symbol = 'BTC' }) {
  const baseSymbol = normalizeSymbol(symbol);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNews(baseSymbol);
      setArticles(data.slice(0, 5));
    } catch (e) {
      setError('Failed to load news');
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [baseSymbol]);

  // Refetch on symbol change + every 30s
  useEffect(() => {
    fetchNews();
    const timer = setInterval(fetchNews, 30_000);
    return () => clearInterval(timer);
  }, [fetchNews]);

  return (
    <div className="px-4 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-[#00d4aa]" />
          <span className="text-sm font-bold text-white">
            {baseSymbol} News
          </span>
          {loading && (
            <RefreshCw className="w-3 h-3 text-slate-500 animate-spin" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500">Live · 30s</span>
        </div>
      </div>

      {/* Articles */}
      <div className="glass-card rounded-2xl overflow-hidden divide-y divide-[rgba(148,163,184,0.05)]">
        {loading && articles.length === 0 && (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="px-3.5 py-3 space-y-2">
              <div className="skeleton h-2.5 w-20 rounded" />
              <div className="skeleton h-3 w-full rounded" />
              <div className="skeleton h-3 w-4/5 rounded" />
            </div>
          ))
        )}

        {error && (
          <div className="px-3.5 py-4 text-center text-[11px] text-slate-500">
            {error}
          </div>
        )}

        {!loading && !error && articles.length === 0 && (
          <div className="px-3.5 py-4 text-center text-[11px] text-slate-500">
            No news found for {baseSymbol}
          </div>
        )}

        {articles.map((article, i) => (
          <a
            key={i}
            href={article.url || article.link || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-3.5 py-3 hover:bg-[#1a2340] transition-colors"
          >
            <div className="flex items-start gap-2.5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  {i === 0 && <Zap className="w-3 h-3 text-orange-400 flex-shrink-0" />}
                  <span className="text-[10px] font-semibold text-[#00d4aa] truncate">
                    {article.source?.name || article.source || 'News'}
                  </span>
                  <span className="text-[10px] text-slate-600 flex-shrink-0">
                    · {timeAgo(article.publishedAt || article.published_at)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">
                  {article.title}
                </p>
                {article.summary || article.description ? (
                  <p className="text-[10px] text-slate-500 leading-snug mt-1 line-clamp-2">
                    {article.summary || article.description}
                  </p>
                ) : null}
              </div>
              <ExternalLink className="w-3 h-3 text-slate-600 flex-shrink-0 mt-0.5" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}