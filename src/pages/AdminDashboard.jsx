import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, ShoppingCart, Users, Newspaper, Bell, Settings,
  RefreshCw, CheckCircle2, XCircle, Loader2, ExternalLink, Clock,
  TrendingUp, Activity, Globe, AlertTriangle, Shield
} from 'lucide-react';
import FoundationControlPanel from '../components/sofpartner/FoundationControlPanel';
import { getNews, getMarketData, checkEndpoint, normalizeSymbol, submitSale } from '../services/solfortApi';

const API_BASE = 'https://solfort-api.onrender.com';
const TABS = [
  { id: 'overview',    label: 'Overview',    icon: LayoutDashboard },
  { id: 'foundation',  label: '재단 관리',    icon: Shield },
  { id: 'sales',       label: 'Sales',       icon: ShoppingCart },
  { id: 'partners',    label: 'Partners',    icon: Users },
  { id: 'news',        label: 'News Monitor', icon: Newspaper },
  { id: 'alerts',      label: 'Alerts',      icon: Bell },
  { id: 'settings',    label: 'Settings',    icon: Settings },
];

const NEWS_SYMBOLS = ['BTC', 'ETH', 'SOL', 'XRP'];
const ENDPOINTS = [
  { label: 'Root',         path: '/' },
  { label: 'Health',       path: '/health' },
  { label: 'Market Data',  path: '/market-data' },
  { label: 'News (BTC)',   path: '/news?symbol=BTC' },
  { label: 'Sales Submit', path: '/sales/submit' },
];

// ─── Shared UI ────────────────────────────────────────────────
function Card({ children, className = '' }) {
  return (
    <div className={`bg-[#0f1525] rounded-2xl border border-[rgba(148,163,184,0.07)] p-4 ${className}`}>
      {children}
    </div>
  );
}

function Label({ children }) {
  return <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{children}</p>;
}

function StatusDot({ ok }) {
  return ok
    ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
    : <XCircle className="w-4 h-4 text-red-400" />;
}

// ─── Overview Tab ─────────────────────────────────────────────
function OverviewTab() {
  const [marketStatus, setMarketStatus] = useState(null);
  const [newsCount, setNewsCount] = useState(null);
  const [marketCount, setMarketCount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const [mh, nd, md] = await Promise.allSettled([
          checkEndpoint('/market-data'),
          getNews('BTC'),
          getMarketData(),
        ]);
        setMarketStatus(mh.status === 'fulfilled' ? mh.value : { ok: false });
        setNewsCount(nd.status === 'fulfilled' ? nd.value.articles.length : 0);
        setMarketCount(md.status === 'fulfilled' ? md.value.length : 0);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const stats = [
    { label: 'Market Pairs', value: marketCount ?? '—', color: 'text-[#00d4aa]' },
    { label: 'BTC News Items', value: newsCount ?? '—', color: 'text-purple-400' },
    { label: 'Backend', value: marketStatus?.ok ? 'Online' : 'Offline', color: marketStatus?.ok ? 'text-emerald-400' : 'text-red-400' },
    { label: 'Market Data', value: marketStatus?.ok ? `${marketStatus.latencyMs}ms` : '—', color: 'text-amber-400' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {stats.map(s => (
          <Card key={s.label}>
            <Label>{s.label}</Label>
            {loading ? (
              <div className="skeleton h-6 w-16 rounded mt-1" />
            ) : (
              <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            )}
          </Card>
        ))}
      </div>

      <Card>
        <Label>System Status</Label>
        <div className="flex items-center gap-2 mt-1">
          {loading ? <Loader2 className="w-4 h-4 text-slate-500 animate-spin" /> : <StatusDot ok={marketStatus?.ok} />}
          <span className="text-sm text-slate-300">{loading ? 'Checking…' : marketStatus?.ok ? 'All systems operational' : 'Backend unreachable'}</span>
        </div>
        <p className="text-[11px] text-slate-600 mt-1">{API_BASE}</p>
      </Card>
    </div>
  );
}

// ─── Sales Tab ────────────────────────────────────────────────
function SalesTab() {
  const EMPTY = { customerName: '', walletAddress: '', sales: '', price: '', promotion: '' };
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errMsg, setErrMsg] = useState('');
  const [history, setHistory] = useState([]);

  const validate = () => {
    const e = {};
    if (!form.customerName.trim()) e.customerName = 'Required';
    if (!form.walletAddress.trim()) e.walletAddress = 'Required';
    if (!form.sales || isNaN(Number(form.sales)) || Number(form.sales) <= 0) e.sales = 'Valid number required';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) e.price = 'Valid number required';
    if (form.promotion !== '' && (isNaN(Number(form.promotion)) || Number(form.promotion) < 0 || Number(form.promotion) > 100)) e.promotion = '0–100';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStatus('loading');
    setErrMsg('');
    const promo = Number(form.promotion) || 0;
    const price = Number(form.price);
    const sales = Number(form.sales);
    const quantity = sales / price;
    const sofAmount = quantity * (1 + promo / 100);
    const payload = { customerName: form.customerName, walletAddress: form.walletAddress, sales, price, promotion: promo, quantity, sofAmount };
    try {
      await submitSale(payload);
      setHistory(h => [{ ...payload, submittedAt: new Date().toISOString() }, ...h].slice(0, 10));
      setStatus('success');
      setTimeout(() => { setForm(EMPTY); setStatus('idle'); }, 3000);
    } catch (err) {
      setErrMsg(err.message || 'Submission failed');
      setStatus('error');
    }
  };

  const Field = ({ name, label, placeholder, type = 'text' }) => (
    <div>
      <label className="block text-[11px] text-slate-500 mb-1">{label}</label>
      <input
        type={type}
        value={form[name]}
        onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
        placeholder={placeholder}
        className="w-full bg-[#0a0e1a] border border-[rgba(148,163,184,0.1)] rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#00d4aa]/40"
      />
      {errors[name] && <p className="text-[10px] text-red-400 mt-0.5">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="space-y-4">
      <Card>
        <Label>Submit Sale</Label>
        {status === 'success' ? (
          <div className="flex flex-col items-center py-6 gap-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            <p className="text-sm font-semibold text-emerald-400">Sale submitted successfully</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 mt-2">
            <Field name="customerName" label="Customer Name" placeholder="John Doe" />
            <Field name="walletAddress" label="Wallet Address" placeholder="Solana address" />
            <div className="grid grid-cols-2 gap-3">
              <Field name="sales" label="USDT Amount" placeholder="1000" type="number" />
              <Field name="price" label="SOF Price (USD)" placeholder="0.05" type="number" />
            </div>
            <Field name="promotion" label="Promotion %" placeholder="0" type="number" />
            {status === 'error' && <p className="text-xs text-red-400 bg-red-400/10 rounded-xl px-3 py-2">{errMsg}</p>}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#00d4aa,#06b6d4)' }}
            >
              {status === 'loading' ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : 'Submit Sale'}
            </button>
          </form>
        )}
      </Card>

      {history.length > 0 && (
        <Card>
          <Label>Recent Submissions (this session)</Label>
          <div className="space-y-2 mt-2">
            {history.map((h, i) => (
              <div key={i} className="flex items-center justify-between text-xs border-b border-[rgba(148,163,184,0.05)] pb-2 last:border-0 last:pb-0">
                <div>
                  <p className="text-slate-300 font-semibold">{h.customerName}</p>
                  <p className="text-slate-600 font-mono text-[10px]">{h.walletAddress.slice(0, 12)}…</p>
                </div>
                <div className="text-right">
                  <p className="text-[#00d4aa] font-bold">${h.sales} USDT</p>
                  <p className="text-slate-500">{new Date(h.submittedAt).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Partners Tab ─────────────────────────────────────────────
function PartnersTab() {
  const placeholders = [
    { name: 'Partner A', tier: 'Gold', volume: '—', children: 3, rank: 1 },
    { name: 'Partner B', tier: 'Silver', volume: '—', children: 1, rank: 2 },
    { name: 'Partner C', tier: 'Bronze', volume: '—', children: 0, rank: 3 },
  ];
  const TIER_COLOR = { Gold: 'text-yellow-400', Silver: 'text-slate-300', Bronze: 'text-amber-600' };

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <p className="text-xs text-amber-400 font-semibold">Placeholder data — awaiting Neon DB integration</p>
        </div>
        <div className="space-y-3">
          {placeholders.map((p, i) => (
            <div key={i} className="flex items-center gap-3 bg-[#0a0e1a] rounded-xl p-3">
              <div className="w-8 h-8 rounded-xl bg-[#151c2e] flex items-center justify-center text-sm font-black text-slate-500">#{p.rank}</div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-200">{p.name}</p>
                <p className="text-[11px] text-slate-600">{p.children} sub-partners · Vol: {p.volume}</p>
              </div>
              <span className={`text-xs font-bold ${TIER_COLOR[p.tier]}`}>{p.tier}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <Label>Hierarchy</Label>
        <div className="h-24 flex items-center justify-center text-slate-700 text-sm">
          Tree view — ready for Neon DB
        </div>
      </Card>
    </div>
  );
}

// ─── News Monitor Tab ─────────────────────────────────────────
function NewsMonitorTab() {
  const [activeSymbol, setActiveSymbol] = useState('BTC');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (sym) => {
    setLoading(true);
    try { const { articles: a } = await getNews(sym); setArticles(a); }
    catch { setArticles([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(activeSymbol); }, [activeSymbol, load]);

  const getSent = (a) => (a.sentiment || a.impact || '').toLowerCase();
  const bullish = articles.filter(a => getSent(a) === 'bullish' || getSent(a) === 'positive').length;
  const bearish = articles.filter(a => getSent(a) === 'bearish' || getSent(a) === 'negative').length;
  const neutral = articles.filter(a => getSent(a) === 'neutral').length;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {NEWS_SYMBOLS.map(s => (
          <button key={s} onClick={() => setActiveSymbol(s)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${activeSymbol === s ? 'bg-[#00d4aa]/15 text-[#00d4aa] border border-[#00d4aa]/25' : 'bg-[#0f1525] text-slate-500 border border-transparent'}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[['Bullish', bullish, 'text-emerald-400'], ['Bearish', bearish, 'text-red-400'], ['Neutral', neutral, 'text-amber-400']].map(([label, val, color]) => (
          <Card key={label} className="text-center">
            <p className="text-[10px] text-slate-500">{label}</p>
            <p className={`text-xl font-black ${color}`}>{loading ? '—' : val}</p>
          </Card>
        ))}
      </div>

      <Card>
        <Label>Articles ({loading ? '…' : articles.length})</Label>
        {loading ? (
          <div className="flex items-center gap-2 py-4">
            <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />
            <span className="text-sm text-slate-500">Loading…</span>
          </div>
        ) : (
          <div className="space-y-2 mt-2 max-h-72 overflow-y-auto">
            {articles.slice(0, 20).map((a, i) => (
              <a key={i} href={a.url || a.link || '#'} target="_blank" rel="noopener noreferrer"
                className="flex items-start gap-2 py-2 border-b border-[rgba(148,163,184,0.05)] last:border-0 hover:opacity-80 transition-opacity">
                <ExternalLink className="w-3 h-3 text-slate-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-300 leading-snug">{a.title}</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">{a.source?.name || a.source}</p>
                </div>
              </a>
            ))}
            {articles.length === 0 && <p className="text-sm text-slate-600 py-3 text-center">No articles</p>}
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── Alerts Tab ───────────────────────────────────────────────
function AlertsTab() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const runChecks = useCallback(async () => {
    setLoading(true);
    const checks = await Promise.allSettled(ENDPOINTS.map(ep => checkEndpoint(ep.path)));
    const r = {};
    ENDPOINTS.forEach((ep, i) => {
      r[ep.label] = checks[i].status === 'fulfilled' ? checks[i].value : { ok: false, latencyMs: null, error: 'Network error' };
    });
    setResults(r);
    setLoading(false);
  }, []);

  useEffect(() => { runChecks(); }, [runChecks]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-300">API Health</p>
        <button onClick={runChecks} disabled={loading} className="flex items-center gap-1.5 text-xs text-[#00d4aa] font-semibold disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Recheck
        </button>
      </div>

      {ENDPOINTS.map(ep => {
        const r = results[ep.label];
        return (
          <Card key={ep.label}>
            <div className="flex items-center gap-3">
              {!r || loading ? <Loader2 className="w-4 h-4 text-slate-500 animate-spin" /> : <StatusDot ok={r.ok} />}
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-200">{ep.label}</p>
                <p className="text-[11px] font-mono text-slate-600">{API_BASE}{ep.path}</p>
              </div>
              {r && !loading && (
                <div className="text-right">
                  <p className={`text-xs font-bold ${r.ok ? 'text-emerald-400' : 'text-red-400'}`}>{r.ok ? 'OK' : 'FAIL'}</p>
                  {r.latencyMs != null && <p className="text-[10px] text-slate-600">{r.latencyMs}ms</p>}
                </div>
              )}
            </div>
            {r?.error && !r.ok && <p className="text-[10px] text-red-400/70 mt-1 ml-7">{r.error}</p>}
          </Card>
        );
      })}
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────
function SettingsTab() {
  const [pollInterval, setPollInterval] = useState(30);
  const [defaultFilter, setDefaultFilter] = useState('All');
  const filters = ['All', 'Bullish', 'Bearish', 'Neutral', 'Korean', 'Global'];

  return (
    <div className="space-y-4">
      <Card>
        <Label>API Base URL</Label>
        <div className="flex items-center gap-2 bg-[#0a0e1a] rounded-xl px-3 py-2 mt-1">
          <Globe className="w-3.5 h-3.5 text-[#00d4aa] flex-shrink-0" />
          <p className="text-xs font-mono text-slate-300 break-all">{API_BASE}</p>
        </div>
      </Card>

      <Card>
        <Label>News Polling Interval (seconds)</Label>
        <div className="flex items-center gap-3 mt-2">
          <input
            type="range" min={10} max={120} step={5} value={pollInterval}
            onChange={e => setPollInterval(Number(e.target.value))}
            className="flex-1 accent-[#00d4aa]"
          />
          <span className="text-sm font-bold text-[#00d4aa] w-10 text-right">{pollInterval}s</span>
        </div>
        <p className="text-[10px] text-slate-600 mt-1">Auto-refresh interval for news panels</p>
      </Card>

      <Card>
        <Label>Default News Filter</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {filters.map(f => (
            <button key={f} onClick={() => setDefaultFilter(f)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${defaultFilter === f ? 'bg-[#00d4aa]/15 text-[#00d4aa] border border-[#00d4aa]/25' : 'bg-[#0a0e1a] text-slate-500 border border-transparent'}`}>
              {f}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <Label>Integration Status</Label>
        <div className="space-y-2 mt-1">
          {[['Neon DB', false], ['Orderly Network', true], ['SolFort API', true]].map(([name, ready]) => (
            <div key={name} className="flex items-center gap-2">
              <StatusDot ok={ready} />
              <span className="text-sm text-slate-300">{name}</span>
              <span className={`ml-auto text-[10px] font-semibold ${ready ? 'text-emerald-400' : 'text-amber-400'}`}>{ready ? 'Connected' : 'Pending'}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');

  const TAB_CONTENT = {
    overview:   <OverviewTab />,
    foundation: <FoundationControlPanel />,
    sales:      <SalesTab />,
    partners:   <PartnersTab />,
    news:       <NewsMonitorTab />,
    alerts:     <AlertsTab />,
    settings:   <SettingsTab />,
  };

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-[rgba(148,163,184,0.06)]">
        <div className="flex items-center gap-2 mb-0.5">
          <Activity className="w-5 h-5 text-[#00d4aa]" />
          <h1 className="text-lg font-black text-white">Admin Dashboard</h1>
        </div>
        <p className="text-xs text-slate-500">Pre-database monitoring & management</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 px-4 pt-3 pb-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                tab === t.id
                  ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20'
                  : 'text-slate-500 bg-[#151c2e] border border-transparent hover:text-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="px-4 pt-2">
        {TAB_CONTENT[tab]}
      </div>
    </div>
  );
}