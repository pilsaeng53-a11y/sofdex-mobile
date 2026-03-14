import React from 'react';
import { Shield, AlertTriangle, TrendingDown, Activity, Target, Bell } from 'lucide-react';
import { useLang } from '../shared/LanguageContext';
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const exposureData = [
  { name: 'Crypto', value: 42, fill: '#00d4aa' },
  { name: 'RWA', value: 28, fill: '#3b82f6' },
  { name: 'Stablecoin', value: 18, fill: '#8b5cf6' },
  { name: 'xStocks', value: 12, fill: '#f59e0b' },
];

const riskAlerts = [
  { level: 'high', msg: 'risk_alert_concentration', asset: 'SOL/USDC' },
  { level: 'medium', msg: 'risk_alert_drawdown', asset: 'BTC' },
  { level: 'low', msg: 'risk_alert_limit', asset: 'ETH' },
];

const positionLimits = [
  { label: 'risk_max_single', value: '5%', status: 'ok' },
  { label: 'risk_max_sector', value: '25%', status: 'warn' },
  { label: 'risk_max_portfolio', value: '$50M', status: 'ok' },
  { label: 'risk_stop_loss', value: '15%', status: 'ok' },
];

const AlertBadge = ({ level }) => {
  const colors = { high: 'text-red-400 bg-red-500/10 border-red-500/20', medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20', low: 'text-[#00d4aa] bg-[#00d4aa]/10 border-[#00d4aa]/20' };
  return <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${colors[level]}`}>{level}</span>;
};

export default function RiskDashboard() {
  const { t } = useLang();
  const riskScore = 62;

  return (
    <div className="space-y-4">
      {/* Risk Score */}
      <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.06)] p-4">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-[#00d4aa]" />
          <span className="text-sm font-bold text-white">{t('risk_score_title')}</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={[{ value: riskScore }]} startAngle={90} endAngle={-270}>
                <RadialBar dataKey="value" fill={riskScore > 70 ? '#ef4444' : riskScore > 45 ? '#f59e0b' : '#00d4aa'} background={{ fill: '#1a2340' }} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-black text-white">{riskScore}</span>
              <span className="text-[9px] text-slate-500">/ 100</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-base font-bold text-amber-400 mb-1">{t('risk_level_moderate')}</p>
            <p className="text-xs text-slate-400">{t('risk_score_desc')}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[9px] font-bold border border-amber-500/20">{t('risk_concentration_high')}</span>
              <span className="px-2 py-0.5 rounded-full bg-[#00d4aa]/10 text-[#00d4aa] text-[9px] font-bold border border-[#00d4aa]/20">{t('risk_liquidity_ok')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Exposure by Asset Class */}
      <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.06)] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-[#3b82f6]" />
          <span className="text-sm font-bold text-white">{t('risk_exposure_title')}</span>
        </div>
        <div className="space-y-2.5">
          {exposureData.map(item => (
            <div key={item.name}>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-slate-400">{item.name}</span>
                <span className="text-xs font-bold text-white">{item.value}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#1a2340]">
                <div className="h-full rounded-full transition-all" style={{ width: `${item.value}%`, background: item.fill }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Position Limits / Stop-Loss Framework */}
      <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.06)] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-[#8b5cf6]" />
          <span className="text-sm font-bold text-white">{t('risk_limits_title')}</span>
        </div>
        <div className="space-y-2">
          {positionLimits.map(item => (
            <div key={item.label} className="flex items-center justify-between p-2.5 rounded-xl bg-[#1a2340]">
              <span className="text-xs text-slate-400">{t(item.label)}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">{item.value}</span>
                <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'ok' ? 'bg-[#00d4aa]' : 'bg-amber-400'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Concentration Risk */}
      <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.06)] p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingDown className="w-4 h-4 text-red-400" />
          <span className="text-sm font-bold text-white">{t('risk_concentration_title')}</span>
        </div>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={exposureData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 9, fill: '#64748b' }} />
              <Tooltip contentStyle={{ background: '#151c2e', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 8 }} labelStyle={{ color: '#94a3b8', fontSize: 10 }} itemStyle={{ color: '#fff', fontSize: 10 }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {exposureData.map((entry, i) => (
                  <rect key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[10px] text-slate-600 mt-2">{t('risk_concentration_note')}</p>
      </div>

      {/* Portfolio Risk Alerts */}
      <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.06)] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-bold text-white">{t('risk_alerts_title')}</span>
        </div>
        <div className="space-y-2">
          {riskAlerts.map((a, i) => (
            <div key={i} className="flex items-start justify-between p-2.5 rounded-xl bg-[#1a2340]">
              <div className="flex-1 mr-3">
                <p className="text-xs text-slate-300">{t(a.msg)} <span className="text-[#00d4aa]">{a.asset}</span></p>
              </div>
              <AlertBadge level={a.level} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}