import React, { useState, useEffect } from 'react';
import { Newspaper, RefreshCw, ExternalLink, TrendingUp, BookOpen, Clock, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const CATEGORIES = ['All', 'Bitcoin', 'Ethereum', 'Solana', 'DeFi', 'RWA', 'Regulation', 'NFT', 'AI'];

const MOCK_ARTICLES = [
  {
    id: 1, category: 'Bitcoin', title: 'Bitcoin Breaks $100,000 — Institutional FOMO Fuels Historic Rally',
    summary: 'Bitcoin has crossed the six-figure milestone as spot ETF inflows accelerate and MicroStrategy doubles its position.',
    body: 'The world\'s largest cryptocurrency surpassed $100,000 for the first time as institutional demand reached record levels. Spot Bitcoin ETFs recorded their largest single-day inflows of $1.8B while MicroStrategy announced an additional $2B purchase.',
    source: 'CoinDesk', time: '12 min ago', readTime: '3 min', hot: true,
    image: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400&q=80',
  },
  {
    id: 2, category: 'Regulation', title: 'SEC Approves Spot Ethereum ETF — Landmark Decision for Crypto',
    summary: 'The SEC has approved the first spot Ethereum ETF applications from major asset managers, marking a regulatory turning point.',
    body: 'In a landmark decision, the U.S. Securities and Exchange Commission has approved spot Ethereum ETFs from BlackRock, Fidelity, and four other applicants. Trading is expected to begin within days.',
    source: 'Reuters', time: '38 min ago', readTime: '4 min', hot: true,
    image: 'https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?w=400&q=80',
  },
  {
    id: 3, category: 'Solana', title: 'Solana DeFi TVL Hits $18B — SOL Ecosystem Overtakes Ethereum L2s',
    summary: 'Total value locked in Solana DeFi protocols has surpassed $18 billion, with Jupiter leading activity.',
    body: 'Solana\'s decentralized finance ecosystem has reached a new all-time high in total value locked, driven by strong activity on Jupiter, Raydium, and Kamino. The network processed 1.2 billion transactions in February.',
    source: 'The Block', time: '1h ago', readTime: '3 min', hot: false,
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&q=80',
  },
  {
    id: 4, category: 'RWA', title: 'BlackRock BUIDL Fund Crosses $5B — Tokenized Treasury Demand Surges',
    summary: 'BlackRock\'s tokenized money market fund has surpassed $5 billion in AUM, validating the RWA market thesis.',
    body: 'BlackRock\'s BUIDL fund, which tokenizes U.S. Treasury bills on the Ethereum blockchain, has crossed the $5 billion assets under management milestone. The growth signals mainstream institutional appetite for blockchain-based yield products.',
    source: 'Bloomberg', time: '2h ago', readTime: '4 min', hot: false,
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80',
  },
  {
    id: 5, category: 'DeFi', title: 'DeFi Total Value Locked Reaches $180B — New All-Time High',
    summary: 'Decentralized finance protocols now secure over $180 billion in assets as adoption continues to grow across all chains.',
    body: 'The total value locked in DeFi protocols has reached a new all-time high of $180 billion. Ethereum leads with $95B, followed by Solana at $18B and BNB Chain at $12B.',
    source: 'DeFiLlama', time: '3h ago', readTime: '2 min', hot: false,
    image: 'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=400&q=80',
  },
  {
    id: 6, category: 'AI', title: 'AI Agent Tokens Rally 40% as Autonomous DeFi Trading Goes Mainstream',
    summary: 'AI-powered trading agents are executing billions in on-chain transactions, sending AI token valuations to record highs.',
    body: 'The AI token sector gained over 40% this week as autonomous trading agents powered by large language models gained traction. Leading protocols reported over $2B in AI-initiated trades.',
    source: 'CoinTelegraph', time: '4h ago', readTime: '3 min', hot: false,
    image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400&q=80',
  },
];

function ArticleCard({ article, onSelect }) {
  return (
    <div
      onClick={() => onSelect(article)}
      className="glass-card rounded-2xl overflow-hidden hover:bg-[#1a2340] transition-all cursor-pointer"
    >
      {article.image && (
        <div className="h-36 overflow-hidden">
          <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-3.5">
        <div className="flex items-center gap-2 mb-2">
          {article.hot && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-orange-400 bg-orange-400/10 px-1.5 py-0.5 rounded">
              <Zap className="w-2.5 h-2.5" />Hot
            </span>
          )}
          <span className="text-[10px] font-semibold text-[#00d4aa] bg-[#00d4aa]/10 px-1.5 py-0.5 rounded">{article.category}</span>
          <span className="text-[10px] text-slate-500">{article.source}</span>
        </div>
        <h3 className="text-sm font-bold text-white leading-snug mb-2">{article.title}</h3>
        <p className="text-[11px] text-slate-500 leading-relaxed mb-2">{article.summary}</p>
        <div className="flex items-center justify-between text-[10px] text-slate-600">
          <div className="flex items-center gap-1"><Clock className="w-3 h-3" />{article.time}</div>
          <div className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{article.readTime} read</div>
        </div>
      </div>
    </div>
  );
}

function ArticleDetail({ article, onBack }) {
  const [translation, setTranslation] = useState('');
  const [translating, setTranslating] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [summarizing, setSummarizing] = useState(false);

  async function getAiSummary() {
    setSummarizing(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Summarize this article in exactly 3 bullet points, each one sentence max:\n\nTitle: ${article.title}\n\n${article.body}`,
    });
    setAiSummary(res);
    setSummarizing(false);
  }

  async function translate() {
    setTranslating(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Translate the following into Korean. Return only the translation:\n\n${article.title}\n\n${article.body}`,
    });
    setTranslation(res);
    setTranslating(false);
  }

  return (
    <div className="min-h-screen px-4 pt-4 pb-6">
      <button onClick={onBack} className="flex items-center gap-2 text-[#00d4aa] text-xs font-semibold mb-4">
        ← Back to News
      </button>
      {article.image && (
        <img src={article.image} alt={article.title} className="w-full h-48 object-cover rounded-2xl mb-4" />
      )}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-semibold text-[#00d4aa] bg-[#00d4aa]/10 px-1.5 py-0.5 rounded">{article.category}</span>
        <span className="text-[10px] text-slate-500">{article.source} · {article.time}</span>
      </div>
      <h1 className="text-lg font-bold text-white leading-snug mb-3">{article.title}</h1>
      <p className="text-sm text-slate-400 leading-relaxed mb-5">{article.body}</p>

      {/* AI Summary */}
      <div className="glass-card rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-white">AI Summary</p>
          {!aiSummary && (
            <button
              onClick={getAiSummary}
              disabled={summarizing}
              className="text-[11px] text-[#00d4aa] font-semibold hover:opacity-80 transition-opacity"
            >
              {summarizing ? 'Generating...' : 'Generate'}
            </button>
          )}
        </div>
        {aiSummary
          ? <p className="text-[11px] text-slate-400 leading-relaxed whitespace-pre-line">{aiSummary}</p>
          : <p className="text-[11px] text-slate-600">Click Generate to create a 3-point AI summary.</p>}
      </div>

      {/* Korean translation */}
      <div className="glass-card rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-white">한국어 번역</p>
          {!translation && (
            <button
              onClick={translate}
              disabled={translating}
              className="text-[11px] text-[#00d4aa] font-semibold hover:opacity-80 transition-opacity"
            >
              {translating ? 'Translating...' : 'Translate'}
            </button>
          )}
        </div>
        {translation
          ? <p className="text-[11px] text-slate-400 leading-relaxed">{translation}</p>
          : <p className="text-[11px] text-slate-600">Click Translate for Korean version.</p>}
      </div>

      <a
        href="#"
        target="_blank"
        className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-[#151c2e] border border-[rgba(148,163,184,0.1)] text-slate-300 text-xs font-semibold hover:border-[#00d4aa]/20 transition-all"
      >
        <ExternalLink className="w-3.5 h-3.5" />Read Original Article on {article.source}
      </a>
    </div>
  );
}

export default function News() {
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState(null);

  const filtered = category === 'All'
    ? MOCK_ARTICLES
    : MOCK_ARTICLES.filter(a => a.category === category);

  const mostRead = [...MOCK_ARTICLES].sort(() => Math.random() - 0.5).slice(0, 4);

  if (selected) return <ArticleDetail article={selected} onBack={() => setSelected(null)} />;

  return (
    <div className="min-h-screen px-4 pt-4 pb-6">
      <div className="flex items-center gap-2 mb-1">
        <Newspaper className="w-5 h-5 text-[#00d4aa]" />
        <h1 className="text-xl font-bold text-white">Crypto Intelligence</h1>
      </div>
      <p className="text-xs text-slate-500 mb-4">Real-time news with AI insights</p>

      {/* Breaking strip */}
      <div className="flex items-center gap-2 bg-orange-400/10 border border-orange-400/20 rounded-xl px-3 py-2 mb-5 overflow-hidden">
        <span className="flex-shrink-0 text-[10px] font-black text-orange-400 bg-orange-400/20 px-1.5 py-0.5 rounded">LIVE</span>
        <p className="text-[11px] text-orange-300 truncate">BTC BREAKS $100K · ETH ETF APPROVED · SOLANA DeFi TVL HITS $18B</p>
      </div>

      {/* Categories */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              category === c ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20' : 'text-slate-500 border border-transparent'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Most read */}
      <div className="glass-card rounded-2xl p-4 mb-5">
        <p className="text-xs font-bold text-white mb-3">Most Read</p>
        <div className="space-y-2.5">
          {mostRead.map((a, i) => (
            <button key={a.id} onClick={() => setSelected(a)} className="w-full flex items-start gap-2.5 text-left hover:opacity-80 transition-opacity">
              <span className="text-lg font-black text-slate-700 w-5 flex-shrink-0">{i + 1}</span>
              <p className="text-[11px] text-slate-300 leading-snug">{a.title}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Article feed */}
      <div className="space-y-4">
        {filtered.map(a => <ArticleCard key={a.id} article={a} onSelect={setSelected} />)}
      </div>
    </div>
  );
}