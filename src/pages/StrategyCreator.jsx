import React, { useState } from 'react';
import { TrendingUp, Plus, DollarSign, Users, Award, Wallet, ArrowUpRight } from 'lucide-react';
import { useWallet } from '../components/shared/WalletContext';
import WalletGatedButton from '../components/shared/WalletGatedButton';

export default function StrategyCreator() {
  const { isConnected, requireWallet } = useWallet();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'quantitative',
    risk_level: 'medium',
    pricing_1day: '9.99',
    pricing_1week: '29.99',
    pricing_1month: '79.99',
  });

  // Example creator data (only shown when wallet connected)
  const creatorData = {
    id: 'creator-1',
    name: 'Sarah Patel',
    totalEarned: 24850,
    withdrawable: 5240,
    pending: 1200,
    strategiesCount: 3,
    totalSubscribers: 2180,
    strategies: [
      { id: 'strat-2', name: 'Quant Breakout Pro', subscribers: 892, revenue: 16200, status: 'Active' },
      { id: 'strat-4', name: 'Market Neutral Core', subscribers: 721, revenue: 12840, status: 'Active' },
      { id: 'strat-additional', name: 'Emerging Pair Arbitrage', subscribers: 567, revenue: 10350, status: 'Active' },
    ],
    payoutHistory: [
      { date: 'March 10, 2026', amount: 3500, method: 'Bank Transfer', status: 'Completed' },
      { date: 'February 28, 2026', amount: 4200, method: 'Bank Transfer', status: 'Completed' },
      { date: 'February 14, 2026', amount: 2850, method: 'Bank Transfer', status: 'Completed' },
    ]
  };

  const handleCreateStrategy = (e) => {
    e.preventDefault();
    // Simulated creation
    alert('Strategy published! (Demo mode)');
  };

  // Disconnected state
  if (!isConnected) {
    return (
      <div className="min-h-screen px-4 pt-4 pb-8 flex items-center justify-center">
        <div className="w-full max-w-sm text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-[#00d4aa]/10 border border-[#00d4aa]/20 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-[#00d4aa]" />
            </div>
          </div>

          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">My Strategies</h1>
            <p className="text-sm text-slate-400">Connect your wallet to view and manage your strategies.</p>
          </div>

          {/* Empty State Message */}
          <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)] space-y-3">
            <p className="text-sm text-slate-300">
              Access your strategy dashboard, view earnings, create new strategies, and manage subscriptions.
            </p>
            <div className="h-px bg-[rgba(148,163,184,0.08)]" />
            <p className="text-xs text-slate-500">
              Your strategies, earnings, and subscriber data will appear here once connected.
            </p>
          </div>

          {/* Connect Button */}
          <button
            onClick={() => requireWallet()}
            className="w-full px-4 py-3 bg-gradient-to-r from-[#00d4aa] to-[#06b6d4] text-[#05070d] font-bold rounded-xl hover:shadow-lg hover:shadow-[#00d4aa]/20 transition-all"
          >
            <div className="flex items-center justify-center gap-2">
              <Wallet className="w-4 h-4" />
              Connect Wallet
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pt-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-[#00d4aa]" />
        <div>
          <h1 className="text-xl font-bold text-white">Creator Dashboard</h1>
          <p className="text-xs text-slate-500">Manage strategies, earnings, and payouts</p>
        </div>
      </div>

      {/* Earnings Overview */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)]">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <p className="text-[10px] text-slate-500">Total Earned</p>
          </div>
          <p className="text-lg font-bold text-white">${creatorData.totalEarned.toFixed(2)}</p>
          <p className="text-[9px] text-slate-500 mt-1">70% of subscriptions</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)]">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-[#00d4aa]" />
            <p className="text-[10px] text-slate-500">Withdrawable</p>
          </div>
          <p className="text-lg font-bold text-[#00d4aa]">${creatorData.withdrawable.toFixed(2)}</p>
          <p className="text-[9px] text-slate-500 mt-1">Ready to payout</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)]">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-400" />
            <p className="text-[10px] text-slate-500">Total Subscribers</p>
          </div>
          <p className="text-lg font-bold text-white">{creatorData.totalSubscribers}</p>
          <p className="text-[9px] text-slate-500 mt-1">Active subscriptions</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)]">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-amber-400" />
            <p className="text-[10px] text-slate-500">Strategies</p>
          </div>
          <p className="text-lg font-bold text-white">{creatorData.strategiesCount}</p>
          <p className="text-[9px] text-slate-500 mt-1">Published</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-[rgba(148,163,184,0.08)]">
        {['strategies', 'create', 'earnings'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
              activeTab === tab ? 'text-[#00d4aa] border-[#00d4aa]' : 'text-slate-500 border-transparent'
            }`}>
            {tab === 'strategies' ? 'My Strategies' : tab === 'create' ? 'Create Strategy' : 'Earnings & Payout'}
          </button>
        ))}
      </div>

      {/* Strategies Tab */}
      {activeTab === 'strategies' && (
        <div className="space-y-3">
          {creatorData.strategies.map(strat => (
            <div key={strat.id} className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)]">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-white">{strat.name}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-slate-500">Subscribers: <span className="text-white font-semibold">{strat.subscribers}</span></span>
                    <span className="text-[10px] text-slate-500">Revenue: <span className="text-emerald-400 font-semibold">${strat.revenue.toFixed(2)}</span></span>
                    <span className={`text-[9px] font-semibold px-2 py-1 rounded-lg ${strat.status === 'Active' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-slate-400/10 text-slate-400'}`}>
                      {strat.status}
                    </span>
                  </div>
                </div>
                <WalletGatedButton
                  className="px-3 py-1.5 bg-blue-400/10 border border-blue-400/20 text-blue-400 text-[10px] font-semibold rounded-xl hover:bg-blue-400/20"
                  requireWallet={true}
                  onClick={() => {}}
                >
                  Manage
                </WalletGatedButton>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Tab */}
      {activeTab === 'create' && (
        <form onSubmit={handleCreateStrategy} className="space-y-4">
          <div className="space-y-3">
            <input type="text" placeholder="Strategy Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2.5 bg-[#151c2e] border border-[rgba(148,163,184,0.08)] rounded-xl text-white text-sm placeholder-slate-500 outline-none" />
            
            <textarea placeholder="Strategy Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-2.5 bg-[#151c2e] border border-[rgba(148,163,184,0.08)] rounded-xl text-white text-sm placeholder-slate-500 outline-none h-20 resize-none" />

            <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full px-4 py-2.5 bg-[#151c2e] border border-[rgba(148,163,184,0.08)] rounded-xl text-white text-sm outline-none">
              <option value="quantitative">Quantitative</option>
              <option value="ai-generated">AI-Generated</option>
              <option value="momentum">Momentum</option>
              <option value="rwa">RWA</option>
              <option value="hedged">Hedged</option>
            </select>

            <select value={formData.risk_level} onChange={(e) => setFormData({...formData, risk_level: e.target.value})}
              className="w-full px-4 py-2.5 bg-[#151c2e] border border-[rgba(148,163,184,0.08)] rounded-xl text-white text-sm outline-none">
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
            </select>

            <div className="border-t border-[rgba(148,163,184,0.08)] pt-4">
              <p className="text-sm font-semibold text-white mb-2">Subscription Pricing</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input type="number" step="0.01" placeholder="1 Day" value={formData.pricing_1day} onChange={(e) => setFormData({...formData, pricing_1day: e.target.value})}
                    className="flex-1 px-4 py-2.5 bg-[#151c2e] border border-[rgba(148,163,184,0.08)] rounded-xl text-white text-sm outline-none" />
                  <span className="text-slate-500">$</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" step="0.01" placeholder="1 Week" value={formData.pricing_1week} onChange={(e) => setFormData({...formData, pricing_1week: e.target.value})}
                    className="flex-1 px-4 py-2.5 bg-[#151c2e] border border-[rgba(148,163,184,0.08)] rounded-xl text-white text-sm outline-none" />
                  <span className="text-slate-500">$</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" step="0.01" placeholder="1 Month" value={formData.pricing_1month} onChange={(e) => setFormData({...formData, pricing_1month: e.target.value})}
                    className="flex-1 px-4 py-2.5 bg-[#151c2e] border border-[rgba(148,163,184,0.08)] rounded-xl text-white text-sm outline-none" />
                  <span className="text-slate-500">$</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
           <WalletGatedButton
             type="submit"
             className="flex-1 px-4 py-3 bg-[#00d4aa]/10 border border-[#00d4aa]/20 text-[#00d4aa] font-semibold rounded-xl hover:bg-[#00d4aa]/20 transition-all flex items-center justify-center gap-2"
             requireWallet={true}
           >
             <Plus className="w-4 h-4" />
             Publish
           </WalletGatedButton>
           <button type="button" className="flex-1 px-4 py-3 bg-[#151c2e] border border-[rgba(148,163,184,0.08)] text-slate-300 font-semibold rounded-xl hover:border-[#00d4aa]/30 transition-all">
             Save Draft
           </button>
          </div>
        </form>
      )}

      {/* Earnings Tab */}
      {activeTab === 'earnings' && (
        <div className="space-y-4">
          {/* Revenue Breakdown */}
          <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)]">
            <p className="text-sm font-bold text-white mb-3">Revenue Breakdown (Current Month)</p>
            <div className="space-y-3">
              {creatorData.strategies.map((strat, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[11px] text-white">{strat.name}</p>
                    <p className="text-[11px] font-bold text-emerald-400">+${(strat.revenue * 0.7).toFixed(2)}</p>
                  </div>
                  <div className="h-2 bg-[#0d1220] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#00d4aa] to-[#06b6d4]" style={{ width: (strat.revenue / 16200 * 100) + '%' }} />
                  </div>
                  <p className="text-[9px] text-slate-500 mt-1">30% Platform Fee: -${(strat.revenue * 0.3).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Payout History */}
          <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)]">
            <p className="text-sm font-bold text-white mb-3">Payout History</p>
            <div className="space-y-2">
              {creatorData.payoutHistory.map((payout, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-[rgba(148,163,184,0.06)] last:border-0">
                  <div>
                    <p className="text-[11px] text-white font-semibold">${payout.amount.toFixed(2)}</p>
                    <p className="text-[9px] text-slate-500">{payout.date} • {payout.method}</p>
                  </div>
                  <span className="text-[9px] font-semibold px-2 py-1 rounded-lg bg-emerald-400/10 text-emerald-400">{payout.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Withdraw */}
          {creatorData.withdrawable > 0 && (
            <WalletGatedButton
              className="w-full px-4 py-3 bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 font-semibold rounded-xl hover:bg-emerald-400/20 transition-all flex items-center justify-center gap-2"
              requireWallet={true}
              onClick={() => {}}
            >
              <ArrowUpRight className="w-4 h-4" />
              Withdraw ${creatorData.withdrawable.toFixed(2)}
            </WalletGatedButton>
          )}
        </div>
      )}

    </div>
  );
}