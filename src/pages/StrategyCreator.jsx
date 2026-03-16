import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { TrendingUp, Plus, DollarSign, Users, Award, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StrategyCreator() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [strategies, setStrategies] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [formData, setFormData] = useState({
    name: '',
    roi: '',
    win_rate: '',
    max_drawdown: '',
    risk_level: 'medium',
    pricing_1day: '',
    pricing_1week: '',
    pricing_1month: '',
    backtest_trades: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Load creator earnings
      const creatorEarnings = await base44.entities.CreatorEarnings.filter({
        creator_id: currentUser.id
      });
      if (creatorEarnings.length > 0) {
        setEarnings(creatorEarnings[0]);
      } else {
        // Create initial earnings record
        const newEarnings = await base44.entities.CreatorEarnings.create({
          creator_id: currentUser.id,
          creator_name: currentUser.full_name || currentUser.email,
        });
        setEarnings(newEarnings);
      }

      // Load creator's strategies
      const creatorStrategies = await base44.entities.Strategy.filter({
        creator_id: currentUser.id
      });
      setStrategies(creatorStrategies);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStrategy = async (e) => {
    e.preventDefault();
    try {
      const pricing_plans = [];
      if (formData.pricing_1day) pricing_plans.push({ duration: '1day', price: parseFloat(formData.pricing_1day) });
      if (formData.pricing_1week) pricing_plans.push({ duration: '1week', price: parseFloat(formData.pricing_1week) });
      if (formData.pricing_1month) pricing_plans.push({ duration: '1month', price: parseFloat(formData.pricing_1month) });

      const strategy = await base44.entities.Strategy.create({
        creator_id: user.id,
        creator_name: user.full_name || user.email,
        name: formData.name,
        roi: parseFloat(formData.roi),
        win_rate: parseFloat(formData.win_rate),
        max_drawdown: parseFloat(formData.max_drawdown),
        risk_level: formData.risk_level,
        pricing_plans,
        backtest_data: {
          trade_count: parseInt(formData.backtest_trades) || 0,
        },
        is_private: true,
      });

      setStrategies([...strategies, strategy]);
      setFormData({
        name: '',
        roi: '',
        win_rate: '',
        max_drawdown: '',
        risk_level: 'medium',
        pricing_1day: '',
        pricing_1week: '',
        pricing_1month: '',
        backtest_trades: '',
      });
      setActiveTab('dashboard');
    } catch (error) {
      console.error('Error creating strategy:', error);
    }
  };

  const handleWithdraw = async () => {
    if (!earnings || earnings.withdrawable_balance <= 0) return;
    try {
      await base44.entities.CreatorEarnings.update(earnings.id, {
        total_withdrawn: earnings.total_withdrawn + earnings.withdrawable_balance,
        withdrawable_balance: 0,
        pending_balance: 0,
      });
      await loadUserData();
    } catch (error) {
      console.error('Error withdrawing earnings:', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading...</div>;
  }

  return (
    <div className="min-h-screen px-4 pt-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-[#00d4aa]" />
        <h1 className="text-xl font-bold text-white">Strategy Creator Dashboard</h1>
      </div>

      {/* Earnings Overview */}
      {earnings && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)]">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <p className="text-[10px] text-slate-500">Total Earned</p>
            </div>
            <p className="text-lg font-bold text-white">${earnings.total_earned.toFixed(2)}</p>
          </div>
          <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)]">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-[#00d4aa]" />
              <p className="text-[10px] text-slate-500">Withdrawable</p>
            </div>
            <p className="text-lg font-bold text-[#00d4aa]">${earnings.withdrawable_balance.toFixed(2)}</p>
          </div>
          <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)]">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-400" />
              <p className="text-[10px] text-slate-500">Total Subscribers</p>
            </div>
            <p className="text-lg font-bold text-white">{earnings.total_subscribers}</p>
          </div>
          <div className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)]">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-amber-400" />
              <p className="text-[10px] text-slate-500">Strategies</p>
            </div>
            <p className="text-lg font-bold text-white">{earnings.strategies_count}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-[rgba(148,163,184,0.08)]">
        {['dashboard', 'create'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
              activeTab === tab ? 'text-[#00d4aa] border-[#00d4aa]' : 'text-slate-500 border-transparent'
            }`}>
            {tab === 'dashboard' ? 'My Strategies' : 'Create Strategy'}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-3">
          {strategies.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>No strategies yet. Create your first strategy to start earning!</p>
            </div>
          ) : (
            strategies.map(strategy => (
              <div key={strategy.id} className="glass-card rounded-2xl p-4 border border-[rgba(148,163,184,0.08)]">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-white">{strategy.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] text-slate-500">ROI: <span className="text-emerald-400 font-semibold">+{strategy.roi.toFixed(1)}%</span></span>
                      <span className="text-[9px] text-slate-500">Subscribers: <span className="text-white font-semibold">{strategy.subscriber_count}</span></span>
                      <span className="text-[9px] text-slate-500">Revenue: <span className="text-[#00d4aa] font-semibold">${strategy.total_revenue.toFixed(2)}</span></span>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 bg-blue-400/10 border border-blue-400/20 text-blue-400 text-[10px] font-semibold rounded-xl hover:bg-blue-400/20 transition-all">
                    Edit
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Tab */}
      {activeTab === 'create' && (
        <form onSubmit={handleCreateStrategy} className="space-y-4">
          <div className="space-y-3">
            <input type="text" placeholder="Strategy Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2.5 bg-[#151c2e] border border-[rgba(148,163,184,0.08)] rounded-xl text-white text-sm placeholder-slate-500 outline-none" required />
            
            <div className="grid grid-cols-2 gap-3">
              <input type="number" step="0.1" placeholder="ROI %" value={formData.roi} onChange={(e) => setFormData({...formData, roi: e.target.value})}
                className="px-4 py-2.5 bg-[#151c2e] border border-[rgba(148,163,184,0.08)] rounded-xl text-white text-sm placeholder-slate-500 outline-none" required />
              <input type="number" step="0.1" placeholder="Win Rate %" value={formData.win_rate} onChange={(e) => setFormData({...formData, win_rate: e.target.value})}
                className="px-4 py-2.5 bg-[#151c2e] border border-[rgba(148,163,184,0.08)] rounded-xl text-white text-sm placeholder-slate-500 outline-none" required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input type="number" step="0.1" placeholder="Max Drawdown %" value={formData.max_drawdown} onChange={(e) => setFormData({...formData, max_drawdown: e.target.value})}
                className="px-4 py-2.5 bg-[#151c2e] border border-[rgba(148,163,184,0.08)] rounded-xl text-white text-sm placeholder-slate-500 outline-none" required />
              <select value={formData.risk_level} onChange={(e) => setFormData({...formData, risk_level: e.target.value})}
                className="px-4 py-2.5 bg-[#151c2e] border border-[rgba(148,163,184,0.08)] rounded-xl text-white text-sm outline-none">
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
              </select>
            </div>

            <div className="border-t border-[rgba(148,163,184,0.08)] pt-4">
              <p className="text-sm font-semibold text-white mb-2">Pricing Plans</p>
              <div className="space-y-2">
                <input type="number" step="0.01" placeholder="1 Day Price ($)" value={formData.pricing_1day} onChange={(e) => setFormData({...formData, pricing_1day: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[#151c2e] border border-[rgba(148,163,184,0.08)] rounded-xl text-white text-sm placeholder-slate-500 outline-none" />
                <input type="number" step="0.01" placeholder="1 Week Price ($)" value={formData.pricing_1week} onChange={(e) => setFormData({...formData, pricing_1week: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[#151c2e] border border-[rgba(148,163,184,0.08)] rounded-xl text-white text-sm placeholder-slate-500 outline-none" />
                <input type="number" step="0.01" placeholder="1 Month Price ($)" value={formData.pricing_1month} onChange={(e) => setFormData({...formData, pricing_1month: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[#151c2e] border border-[rgba(148,163,184,0.08)] rounded-xl text-white text-sm placeholder-slate-500 outline-none" />
              </div>
            </div>

            <input type="number" placeholder="Backtest Trade Count" value={formData.backtest_trades} onChange={(e) => setFormData({...formData, backtest_trades: e.target.value})}
              className="w-full px-4 py-2.5 bg-[#151c2e] border border-[rgba(148,163,184,0.08)] rounded-xl text-white text-sm placeholder-slate-500 outline-none" />
          </div>

          <button type="submit" className="w-full px-4 py-3 bg-[#00d4aa]/10 border border-[#00d4aa]/20 text-[#00d4aa] font-semibold rounded-xl hover:bg-[#00d4aa]/20 transition-all flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            Publish Strategy
          </button>
        </form>
      )}

      {/* Withdraw Button */}
      {earnings && earnings.withdrawable_balance > 0 && (
        <button onClick={handleWithdraw} className="w-full mt-6 px-4 py-3 bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 font-semibold rounded-xl hover:bg-emerald-400/20 transition-all">
          Withdraw ${earnings.withdrawable_balance.toFixed(2)}
        </button>
      )}
    </div>
  );
}