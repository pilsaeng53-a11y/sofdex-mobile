import React, { useState } from 'react';
import { Bell, Plus, Trash2, TrendingUp, TrendingDown, Newspaper, Vote, Building2, Zap, Activity, CheckCircle2 } from 'lucide-react';
import { useLang } from '../components/shared/LanguageContext';

const ALERT_TYPE_DEFS = [
  { id: 'price_up',    labelKey: 'alerts_priceUp',    icon: TrendingUp,  color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { id: 'price_down',  labelKey: 'alerts_priceDown',  icon: TrendingDown,color: 'text-red-400',     bg: 'bg-red-400/10' },
  { id: 'pct_move',    labelKey: 'alerts_pctMove',    icon: Activity,    color: 'text-[#00d4aa]',   bg: 'bg-[#00d4aa]/10' },
  { id: 'news',        labelKey: 'alerts_breakingNews',icon: Newspaper,  color: 'text-amber-400',   bg: 'bg-amber-400/10' },
  { id: 'governance',  labelKey: 'alerts_governance', icon: Vote,        color: 'text-violet-400',  bg: 'bg-violet-400/10' },
  { id: 'rwa',         labelKey: 'alerts_rwaAlert',   icon: Building2,   color: 'text-purple-400',  bg: 'bg-purple-400/10' },
  { id: 'liquidation', labelKey: 'alerts_liqSpike',   icon: Zap,         color: 'text-orange-400',  bg: 'bg-orange-400/10' },
  { id: 'whale',       labelKey: 'alerts_whaleActivity',icon: Activity,  color: 'text-blue-400',    bg: 'bg-blue-400/10' },
];

const ASSETS = ['BTC', 'ETH', 'SOL', 'JUP', 'RAY', 'RNDR', 'BONK', 'HNT'];

const DEMO_ALERTS = [
  { id: 1, type: 'price_up',    asset: 'BTC',  condition: 'above $105,000',  active: true,  triggered: false },
  { id: 2, type: 'price_down',  asset: 'ETH',  condition: 'below $3,200',    active: true,  triggered: false },
  { id: 3, type: 'pct_move',    asset: 'SOL',  condition: '±10% in 24h',     active: true,  triggered: true  },
  { id: 4, type: 'whale',       asset: 'BTC',  condition: '>$10M transfer',   active: true,  triggered: false },
  { id: 5, type: 'news',        asset: 'ALL',  condition: 'Major events',     active: false, triggered: false },
  { id: 6, type: 'liquidation', asset: 'ALL',  condition: '>$50M in 1h',      active: true,  triggered: false },
];

const RECENT_NOTIFICATIONS = [
  { icon: TrendingUp,  color: 'text-emerald-400', title: 'SOL price alert triggered',     body: 'SOL moved +11.3% — target reached', time: '4m ago' },
  { icon: Activity,    color: 'text-blue-400',    title: 'Whale detected',                body: '$13.9M BTC accumulation by wallet 1AaBb…', time: '12m ago' },
  { icon: Newspaper,   color: 'text-amber-400',   title: 'Breaking: SEC approves ETF',    body: 'New Ethereum spot ETF greenlit by SEC', time: '1h ago' },
  { icon: Zap,         color: 'text-orange-400',  title: 'Liquidation spike',             body: '$89M long liquidations in 15 minutes', time: '2h ago' },
  { icon: Vote,        color: 'text-violet-400',  title: 'New governance proposal',       body: 'Proposal #6: Increase SOFD emissions', time: '4h ago' },
  { icon: TrendingDown,color: 'text-red-400',     title: 'ETH approaching target',        body: 'ETH at $3,310 — threshold is $3,200', time: '6h ago' },
];

function AlertTypeIcon({ typeId }) {
  const def = ALERT_TYPE_DEFS.find(a => a.id === typeId) || ALERT_TYPE_DEFS[0];
  const Icon = def.icon;
  return (
    <div className={`w-8 h-8 rounded-xl ${def.bg} flex items-center justify-center flex-shrink-0`}>
      <Icon className={`w-3.5 h-3.5 ${def.color}`} />
    </div>
  );
}

export default function Alerts() {
  const { t } = useLang();
  const ALERT_TYPES = ALERT_TYPE_DEFS.map(d => ({ ...d, label: t(d.labelKey) }));
  const [tab, setTab] = useState('active');
  const [alerts, setAlerts] = useState(DEMO_ALERTS);
  const [showCreate, setShowCreate] = useState(false);
  const [newType, setNewType] = useState('price_up');
  const [newAsset, setNewAsset] = useState('BTC');
  const [newValue, setNewValue] = useState('');

  const toggleAlert = (id) => setAlerts(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a));
  const deleteAlert = (id) => setAlerts(prev => prev.filter(a => a.id !== id));

  const createAlert = () => {
    if (!newValue) return;
    const type = ALERT_TYPES.find(t => t.id === newType);
    setAlerts(prev => [...prev, {
      id: Date.now(), type: newType, asset: newAsset,
      condition: `${type.label}: ${newValue}`, active: true, triggered: false
    }]);
    setNewValue('');
    setShowCreate(false);
  };

  return (
    <div className="min-h-screen pb-6">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#00d4aa]" />
            <h1 className="text-xl font-bold text-white">{t('page_alerts')}</h1>
          </div>
          <button onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00d4aa]/10 border border-[#00d4aa]/20 text-[#00d4aa] text-xs font-semibold hover:bg-[#00d4aa]/20 transition-all">
            <Plus className="w-3.5 h-3.5" /> {t('alerts_newAlert')}
          </button>
        </div>
        <p className="text-[11px] text-slate-500">{t('alerts_subtitle')}</p>
      </div>

      {/* Create alert form */}
      {showCreate && (
        <div className="px-4 mb-4">
          <div className="glass-card rounded-2xl p-4 border border-[#00d4aa]/10 space-y-3">
            <p className="text-xs font-bold text-white">{t('alerts_createTitle')}</p>
            <div>
              <p className="text-[10px] text-slate-500 mb-1.5">{t('alerts_alertType')}</p>
              <div className="grid grid-cols-2 gap-1.5">
                {ALERT_TYPES.slice(0, 6).map(at => (
                  <button key={at.id} onClick={() => setNewType(at.id)}
                    className={`p-2 rounded-xl text-[10px] font-semibold text-left transition-all border ${
                      newType === at.id ? 'border-[#00d4aa]/30 bg-[#00d4aa]/10 text-[#00d4aa]' : 'border-[rgba(148,163,184,0.06)] text-slate-400'
                    }`}>
                    {at.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[10px] text-slate-500 mb-1.5">{t('alerts_asset')}</p>
                <select value={newAsset} onChange={e => setNewAsset(e.target.value)}
                  className="w-full bg-[#0d1220] border border-[rgba(148,163,184,0.08)] rounded-xl px-3 py-2 text-xs text-white outline-none">
                  {ASSETS.map(a => <option key={a} value={a}>{a}</option>)}
                  <option value="ALL">All Assets</option>
                </select>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 mb-1.5">{t('alerts_valueThreshold')}</p>
                <input
                  type="text" placeholder="e.g. $105,000 or 10%"
                  value={newValue} onChange={e => setNewValue(e.target.value)}
                  className="w-full bg-[#0d1220] border border-[rgba(148,163,184,0.08)] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-[#00d4aa]/30"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowCreate(false)}
                className="flex-1 py-2.5 rounded-xl border border-[rgba(148,163,184,0.1)] text-xs font-semibold text-slate-400">
                {t('alerts_cancel')}
              </button>
              <button onClick={createAlert}
                className="flex-1 py-2.5 rounded-xl bg-[#00d4aa] text-white text-xs font-bold hover:bg-[#00bfa3] transition-all">
                {t('alerts_createBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1.5 px-4 mb-4">
        {['active', 'notifications'].map(tabKey => (
          <button key={tabKey} onClick={() => setTab(tabKey)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
              tab === tabKey ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20' : 'text-slate-500 border border-transparent'
            }`}>
            {tabKey === 'active' ? `${t('alerts_activeTab')} (${alerts.filter(a => a.active).length})` : t('alerts_notificationsTab')}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-2">
        {tab === 'active' && alerts.map(alert => (
          <div key={alert.id} className={`glass-card rounded-2xl p-3.5 flex items-center gap-3 ${alert.triggered ? 'border border-[#00d4aa]/20' : ''}`}>
            <AlertTypeIcon typeId={alert.type} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-xs font-bold text-white">{alert.asset}</span>
                {alert.triggered && (
                  <span className="flex items-center gap-0.5 text-[9px] font-bold text-[#00d4aa] bg-[#00d4aa]/10 px-1.5 py-0.5 rounded-lg border border-[#00d4aa]/20">
                    <CheckCircle2 className="w-2.5 h-2.5" /> {t('alerts_triggered')}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 truncate">{alert.condition}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => toggleAlert(alert.id)}
                className={`w-9 h-5 rounded-full transition-all ${alert.active ? 'bg-[#00d4aa]' : 'bg-slate-700'}`}>
                <div className={`w-4 h-4 rounded-full bg-white mx-auto transition-all ${alert.active ? 'translate-x-2' : '-translate-x-2'}`} style={{ transform: alert.active ? 'translateX(4px)' : 'translateX(-4px)' }} />
              </button>
              <button onClick={() => deleteAlert(alert.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-all">
                <Trash2 className="w-3.5 h-3.5 text-slate-600 hover:text-red-400" />
              </button>
            </div>
          </div>
        ))}

        {tab === 'notifications' && RECENT_NOTIFICATIONS.map((n, i) => {
          const Icon = n.icon;
          return (
            <div key={i} className="glass-card rounded-2xl p-3.5 flex items-start gap-3">
              <div className={`w-8 h-8 rounded-xl bg-[#1a2340] flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <Icon className={`w-3.5 h-3.5 ${n.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white mb-0.5">{n.title}</p>
                <p className="text-[10px] text-slate-500 leading-snug">{n.body}</p>
              </div>
              <span className="text-[10px] text-slate-600 flex-shrink-0">{n.time}</span>
            </div>
          );
        })}
      </div>

      {/* Alert types reference */}
      {tab === 'active' && (
        <div className="px-4 mt-5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">{t('alerts_availableTypes')}</p>
          <div className="grid grid-cols-2 gap-2">
            {ALERT_TYPE_DEFS.map(atype => {
              const Icon = atype.icon;
              return (
                <div key={atype.id} className={`glass-card rounded-xl p-3 flex items-center gap-2 border border-[rgba(148,163,184,0.04)]`}>
                  <div className={`w-7 h-7 rounded-lg ${atype.bg} flex items-center justify-center`}>
                    <Icon className={`w-3.5 h-3.5 ${atype.color}`} />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-300">{t(atype.labelKey)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}