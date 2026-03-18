import React, { useState, useEffect } from 'react';
import { useWallet } from '@/components/shared/WalletContext';
import { base44 } from '@/api/base44Client';
import { calcSalesReward, calcSOFFromUSDT } from '@/services/FeeEngine';
import { useMarketData } from '@/components/shared/MarketDataProvider';
import {
  TrendingUp, DollarSign, PlusCircle, Filter,
  CheckCircle, AlertCircle, Coins, Users, Shield
} from 'lucide-react';

const TIER_CONFIG = {
  bronze: { label: 'Bronze', reward_pct: 25, color: '#cd7f32' },
  silver: { label: 'Silver', reward_pct: 30, color: '#94a3b8' },
  gold:   { label: 'Gold',   reward_pct: 40, color: '#f59e0b' },
  platinum: { label: 'Platinum', reward_pct: 50, color: '#a78bfa' },
};

function StatCard({ label, value, sub, color }) {
  return (
    <div className="glass-card rounded-xl p-4 space-y-1">
      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-lg font-bold" style={{ color }}>{value}</p>
      {sub && <p className="text-[8px] text-slate-500">{sub}</p>}
    </div>
  );
}

export default function SalesDashboard() {
  const { isConnected, address, requireWallet } = useWallet();
  const { getLiveAsset } = useMarketData();

  const [partnerNode, setPartnerNode] = useState(null);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filter, setFilter] = useState('all'); // all | daily | monthly | yearly

  // New sale form
  const [form, setForm] = useState({ customer_name: '', customer_wallet: '', usdt_amount: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState(null);

  // Live SOF price — use a fallback of $4.00
  const sofAsset = getLiveAsset('SOF');
  const sofPrice = sofAsset?.price > 0 ? sofAsset.price : 4.00;

  useEffect(() => {
    if (!isConnected || !address) { setLoading(false); return; }
    loadData();
  }, [isConnected, address]);

  async function loadData() {
    setLoading(true);
    try {
      const [nodes, saleRecords] = await Promise.all([
        base44.entities.PartnerNode.filter({ user_id: address }),
        base44.entities.SaleRecord.filter({ partner_id: address }, '-created_date', 200),
      ]);
      if (nodes.length > 0) setPartnerNode(nodes[0]);
      setSales(saleRecords);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  // Filter sales by time
  function filterSales(records) {
    if (filter === 'all') return records;
    const now = new Date();
    return records.filter(r => {
      const d = new Date(r.sale_date || r.created_date);
      if (filter === 'daily') return d.toDateString() === now.toDateString();
      if (filter === 'monthly') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      if (filter === 'yearly') return d.getFullYear() === now.getFullYear();
      return true;
    });
  }

  const filteredSales = filterSales(sales);
  const totalUSDT = filteredSales.reduce((s, r) => s + (r.usdt_amount || 0), 0);
  const totalSOF = filteredSales.reduce((s, r) => s + (r.sof_quantity || 0), 0);
  const totalRewardUSDT = filteredSales.reduce((s, r) => s + (r.reward_usdt || 0), 0);
  const totalRewardSOF = filteredSales.reduce((s, r) => s + (r.reward_sof || 0), 0);
  const pendingCount = filteredSales.filter(r => r.status === 'pending').length;

  // Calculated preview for form
  const usdtNum = parseFloat(form.usdt_amount) || 0;
  const preview = usdtNum > 0 && sofPrice > 0 ? calcSalesReward(usdtNum, sofPrice) : null;
  const sofQty = calcSOFFromUSDT(usdtNum, sofPrice);
  const tier = partnerNode?.tier || 'bronze';
  const tierCfg = TIER_CONFIG[tier] || TIER_CONFIG.bronze;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.customer_name || !form.customer_wallet || !usdtNum) {
      setSubmitMsg({ type: 'error', text: 'Please fill all fields.' });
      return;
    }
    setSubmitting(true);
    setSubmitMsg(null);
    try {
      const reward = calcSalesReward(usdtNum, sofPrice);
      await base44.entities.SaleRecord.create({
        partner_id: address,
        partner_wallet: partnerNode?.wallet_address || address,
        customer_name: form.customer_name,
        customer_wallet: form.customer_wallet,
        usdt_amount: usdtNum,
        sof_price_at_sale: sofPrice,
        sof_quantity: sofQty,
        reward_usdt: reward.usdt,
        reward_sof: reward.sof_amount,
        reward_sof_usd: reward.sof_usd_value,
        status: 'pending',
        sale_date: new Date().toISOString(),
      });
      setForm({ customer_name: '', customer_wallet: '', usdt_amount: '' });
      setSubmitMsg({ type: 'success', text: 'Sale recorded successfully!' });
      loadData();
    } catch (err) {
      setSubmitMsg({ type: 'error', text: 'Failed to record sale.' });
    }
    setSubmitting(false);
  }

  // ─── Not connected ─────────────────────────────────────────────────────────
  if (!isConnected) {
    return (
      <div className="px-4 py-10 max-w-lg mx-auto text-center space-y-4">
        <Shield className="w-12 h-12 text-[#f59e0b] mx-auto" />
        <h2 className="text-xl font-bold text-white">Sales Dashboard</h2>
        <p className="text-sm text-slate-400">Connect your wallet to access your sales dashboard</p>
        <button onClick={() => requireWallet()} className="btn-solana px-6 py-3 text-sm font-bold rounded-xl">
          Connect Wallet
        </button>
      </div>
    );
  }

  // ─── Not a sales partner ────────────────────────────────────────────────────
  if (!loading && (!partnerNode || !partnerNode.is_sales_partner)) {
    return (
      <div className="px-4 py-10 max-w-lg mx-auto text-center space-y-4">
        <Coins className="w-12 h-12 text-[#f59e0b] mx-auto" />
        <h2 className="text-xl font-bold text-white">Sales Partner Access Required</h2>
        <p className="text-sm text-slate-400">Only approved sales partners can access this dashboard. Apply via the Sales Partner program.</p>
        <a href="/FuturesSalesPartner" className="inline-block btn-purple px-6 py-3 text-sm font-bold rounded-xl">
          Apply Now →
        </a>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-5 pb-20">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#f59e0b] to-[#ec4899] bg-clip-text text-transparent">
            Sales Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Tier: <span className="font-bold" style={{ color: tierCfg.color }}>{tierCfg.label}</span>
            {' · '}Reward: <span className="font-bold text-green-400">{tierCfg.reward_pct}%</span>
          </p>
        </div>
        <div className="flex gap-1 bg-[#0f1525] rounded-lg p-1">
          {['all', 'daily', 'monthly', 'yearly'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-2 py-1 text-[9px] font-bold rounded capitalize transition-all ${
                filter === f ? 'bg-[#f59e0b]/20 text-[#f59e0b]' : 'text-slate-500'
              }`}
            >{f}</button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total Sales" value={`$${totalUSDT.toLocaleString()}`} sub="USDT volume" color="#f59e0b" />
        <StatCard label="USDT Earned" value={`$${totalRewardUSDT.toFixed(2)}`} sub="Partner reward" color="#00d4aa" />
        <StatCard label="SOF Earned" value={`${totalRewardSOF.toFixed(2)}`} sub={`≈ $${(totalRewardSOF * sofPrice).toFixed(2)}`} color="#8b5cf6" />
        <StatCard label="Pending Sales" value={pendingCount} sub="Awaiting confirmation" color="#ec4899" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 glass-card rounded-xl p-1">
        {['dashboard', 'new sale', 'history'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg capitalize transition-all ${
              activeTab === tab ? 'bg-[#f59e0b]/20 text-[#f59e0b]' : 'text-slate-500 hover:text-slate-300'
            }`}
          >{tab}</button>
        ))}
      </div>

      {/* Tab: Dashboard */}
      {activeTab === 'dashboard' && (
        <div className="space-y-3">
          <div className="glass-card rounded-xl p-4 space-y-3">
            <p className="text-xs font-bold text-slate-400 uppercase">SOF Live Price</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-[#00d4aa]">${sofPrice.toFixed(4)}</span>
              <span className="text-[10px] text-slate-500">Used for all sale calculations</span>
            </div>
          </div>

          <div className="glass-card rounded-xl p-4 space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase">Your Reward Structure ({tierCfg.label})</p>
            <div className="space-y-1.5 text-[10px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Total reward on sale:</span>
                <span className="text-white font-bold">{tierCfg.reward_pct}% of USDT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">USDT portion:</span>
                <span className="text-[#00d4aa] font-bold">50% of reward</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">SOF portion:</span>
                <span className="text-[#8b5cf6] font-bold">50% of reward (converted at live price)</span>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-4">
            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Recent Sales</p>
            {filteredSales.slice(0, 5).map(s => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-[rgba(148,163,184,0.06)] last:border-0">
                <div>
                  <p className="text-[10px] font-semibold text-white">{s.customer_name}</p>
                  <p className="text-[8px] text-slate-500">{new Date(s.sale_date || s.created_date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-[#00d4aa]">${s.usdt_amount?.toFixed(0)}</p>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${
                    s.status === 'confirmed' || s.status === 'paid' ? 'bg-green-500/10 text-green-400' :
                    s.status === 'cancelled' ? 'bg-red-500/10 text-red-400' :
                    'bg-yellow-500/10 text-yellow-400'
                  }`}>{s.status}</span>
                </div>
              </div>
            ))}
            {filteredSales.length === 0 && <p className="text-xs text-slate-500 text-center py-3">No sales for this period.</p>}
          </div>
        </div>
      )}

      {/* Tab: New Sale */}
      {activeTab === 'new sale' && (
        <div className="glass-card rounded-xl p-5 space-y-4">
          <p className="text-sm font-bold text-white flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-[#f59e0b]" />
            Record New Sale
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Customer Name</label>
              <input
                value={form.customer_name}
                onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))}
                placeholder="Customer full name"
                className="w-full bg-[#1a2340] border border-[rgba(148,163,184,0.1)] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-[#f59e0b]/30 outline-none"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Customer Wallet Address</label>
              <input
                value={form.customer_wallet}
                onChange={e => setForm(f => ({ ...f, customer_wallet: e.target.value }))}
                placeholder="Solana wallet address"
                className="w-full bg-[#1a2340] border border-[rgba(148,163,184,0.1)] rounded-lg px-3 py-2 text-xs text-white font-mono placeholder-slate-600 focus:border-[#f59e0b]/30 outline-none"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Deposit Amount (USDT)</label>
              <input
                type="number"
                min="1"
                value={form.usdt_amount}
                onChange={e => setForm(f => ({ ...f, usdt_amount: e.target.value }))}
                placeholder="e.g. 1000"
                className="w-full bg-[#1a2340] border border-[rgba(148,163,184,0.1)] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-[#f59e0b]/30 outline-none"
              />
            </div>

            {/* Auto-calculated preview */}
            {preview && (
              <div className="bg-[#1a2340] rounded-lg p-3 space-y-1.5 border border-[#f59e0b]/10">
                <p className="text-[9px] font-bold text-slate-500 uppercase">Calculation Preview</p>
                <div className="grid grid-cols-2 gap-2 text-[9px]">
                  <div>
                    <p className="text-slate-500">SOF to Customer</p>
                    <p className="font-bold text-white">{sofQty.toFixed(4)} SOF</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Total Reward ({tierCfg.reward_pct}%)</p>
                    <p className="font-bold text-[#f59e0b]">${preview.totalRewardUSD.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Your USDT</p>
                    <p className="font-bold text-[#00d4aa]">${preview.usdt.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Your SOF</p>
                    <p className="font-bold text-[#8b5cf6]">{preview.sof_amount.toFixed(4)} SOF</p>
                  </div>
                </div>
                <p className="text-[8px] text-slate-600">SOF price at calculation: ${sofPrice.toFixed(4)}</p>
              </div>
            )}

            {submitMsg && (
              <div className={`flex items-center gap-2 text-[10px] ${submitMsg.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                {submitMsg.type === 'error' ? <AlertCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                {submitMsg.text}
              </div>
            )}

            <button type="submit" disabled={submitting}
              className="w-full py-3 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #ec4899)' }}>
              {submitting ? 'Recording…' : 'Record Sale'}
            </button>
          </form>
        </div>
      )}

      {/* Tab: History */}
      {activeTab === 'history' && (
        <div className="space-y-2">
          {filteredSales.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No sales for this period.</p>
          ) : filteredSales.map(s => (
            <div key={s.id} className="glass-card rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-xs font-bold text-white">{s.customer_name}</p>
                  <p className="text-[8px] text-slate-500 font-mono">{s.customer_wallet?.slice(0, 12)}…</p>
                </div>
                <span className={`text-[8px] px-2 py-0.5 rounded font-bold ${
                  s.status === 'confirmed' || s.status === 'paid' ? 'bg-green-500/10 text-green-400' :
                  s.status === 'cancelled' ? 'bg-red-500/10 text-red-400' :
                  'bg-yellow-500/10 text-yellow-400'
                }`}>{s.status}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[8px]">
                <div><p className="text-slate-500">Paid</p><p className="font-bold text-white">${s.usdt_amount?.toFixed(0)}</p></div>
                <div><p className="text-slate-500">SOF</p><p className="font-bold text-[#8b5cf6]">{s.sof_quantity?.toFixed(2)}</p></div>
                <div><p className="text-slate-500">Reward</p><p className="font-bold text-[#00d4aa]">${s.reward_usdt?.toFixed(2)}</p></div>
              </div>
              <p className="text-[7px] text-slate-600 mt-1">{new Date(s.sale_date || s.created_date).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}