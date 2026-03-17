import React, { useState } from 'react';
import { Copy, Check, Share2, TrendingUp, DollarSign, Users, Zap } from 'lucide-react';

export default function FuturesReferral() {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const referralCode = 'SOF-TRADER-82K9X';
  const referralLink = `https://solfort.io/futures?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Mock referral data
  const stats = {
    totalReferred: 42,
    activeTraders: 28,
    totalVolume: 4850000,
    estimatedCommission: 12125,
    totalEarned: 45820,
    availableBalance: 8675,
    withdrawn: 37145,
  };

  const referredTraders = [
    {
      id: 1,
      name: 'Trader #1',
      joinedAt: '2025-12-01',
      status: 'active',
      volume: 245000,
      commission: 612,
    },
    {
      id: 2,
      name: 'Trader #2',
      joinedAt: '2025-11-28',
      status: 'active',
      volume: 156000,
      commission: 390,
    },
    {
      id: 3,
      name: 'Trader #3',
      joinedAt: '2025-11-15',
      status: 'active',
      volume: 324000,
      commission: 810,
    },
    {
      id: 4,
      name: 'Trader #4',
      joinedAt: '2025-10-20',
      status: 'inactive',
      volume: 0,
      commission: 0,
    },
  ];

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00d4aa] to-[#06b6d4] bg-clip-text text-transparent">
          Futures Referral Program
        </h1>
        <p className="text-sm text-slate-400">
          Earn 25% commission on your referrals' trading volume
        </p>
      </div>

      {/* Referral Link Card */}
      <div className="glass-card rounded-2xl p-5 space-y-4 border border-[#00d4aa]/20 bg-gradient-to-br from-[#00d4aa]/10 to-transparent">
        <div>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">Your Referral Link</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 bg-[#1a2340] border border-[#00d4aa]/20 rounded-lg px-3 py-2.5 text-xs text-white font-mono truncate focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="w-10 h-10 rounded-lg bg-[#00d4aa]/20 border border-[#00d4aa]/30 flex items-center justify-center hover:bg-[#00d4aa]/30 transition-all flex-shrink-0"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-[#00d4aa]" />}
            </button>
          </div>
        </div>

        <div className="bg-[#1a2340] rounded-lg p-3">
          <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Your Referral Code</p>
          <p className="text-sm font-mono font-bold text-[#00d4aa]">{referralCode}</p>
        </div>

        <button className="w-full bg-[#00d4aa]/20 hover:bg-[#00d4aa]/30 border border-[#00d4aa]/30 text-[#00d4aa] font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 text-sm">
          <Share2 className="w-4 h-4" />
          Share Referral Link
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card rounded-xl p-4 space-y-1">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#00d4aa]" />
            <p className="text-[9px] font-bold text-slate-500 uppercase">Total Referred</p>
          </div>
          <p className="text-2xl font-bold text-white">{stats.totalReferred}</p>
          <p className="text-[8px] text-slate-500">{stats.activeTraders} active</p>
        </div>

        <div className="glass-card rounded-xl p-4 space-y-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#06b6d4]" />
            <p className="text-[9px] font-bold text-slate-500 uppercase">Total Volume</p>
          </div>
          <p className="text-2xl font-bold text-[#06b6d4]">${(stats.totalVolume / 1000000).toFixed(1)}M</p>
          <p className="text-[8px] text-slate-500">Commission eligible</p>
        </div>

        <div className="glass-card rounded-xl p-4 space-y-1">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <p className="text-[9px] font-bold text-slate-500 uppercase">Available</p>
          </div>
          <p className="text-2xl font-bold text-green-400">${stats.availableBalance.toLocaleString()}</p>
          <p className="text-[8px] text-slate-500">Ready to withdraw</p>
        </div>

        <div className="glass-card rounded-xl p-4 space-y-1">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#ec4899]" />
            <p className="text-[9px] font-bold text-slate-500 uppercase">Total Earned</p>
          </div>
          <p className="text-2xl font-bold text-[#ec4899]">${stats.totalEarned.toLocaleString()}</p>
          <p className="text-[8px] text-slate-500">All time</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button className="glass-card hover:border-[#00d4aa]/30 rounded-xl p-4 flex flex-col items-center gap-2 transition-all hover:bg-[#151c2e]">
          <Share2 className="w-5 h-5 text-[#00d4aa]" />
          <span className="text-xs font-semibold text-white text-center">Share on Telegram</span>
        </button>
        <button className="glass-card hover:border-[#00d4aa]/30 rounded-xl p-4 flex flex-col items-center gap-2 transition-all hover:bg-[#151c2e]">
          <DollarSign className="w-5 h-5 text-[#00d4aa]" />
          <span className="text-xs font-semibold text-white text-center">Withdraw</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="flex border-b border-[rgba(148,163,184,0.1)]">
          {['overview', 'traders', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-3 text-xs font-bold uppercase transition-all ${
                activeTab === tab
                  ? 'text-[#00d4aa] border-b-2 border-[#00d4aa] bg-[#1a2340]'
                  : 'text-slate-500 hover:text-slate-400'
              }`}
            >
              {tab === 'overview' && 'Overview'}
              {tab === 'traders' && 'Referred Traders'}
              {tab === 'history' && 'Commission History'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase mb-2">Commission Rate</p>
                <div className="bg-[#1a2340] rounded-lg p-3">
                  <p className="text-2xl font-bold text-[#00d4aa]">25%</p>
                  <p className="text-[9px] text-slate-500 mt-1">
                    On all trading fees and spreads from referred traders
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase mb-2">How It Works</p>
                <ol className="space-y-2">
                  {[
                    'Share your referral link with potential traders',
                    'New traders sign up using your link',
                    'They deposit and start trading',
                    'You earn 25% commission on their trading volume',
                    'Commission paid weekly to your wallet',
                  ].map((step, idx) => (
                    <li key={idx} className="flex gap-2 text-[9px] text-slate-400">
                      <span className="font-bold text-[#00d4aa] flex-shrink-0">{idx + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase mb-2">Commission Tiers</p>
                <div className="space-y-2">
                  {[
                    { vol: '$0 - $100K', rate: '20%' },
                    { vol: '$100K - $500K', rate: '25%' },
                    { vol: '$500K+', rate: '30%' },
                  ].map((tier, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-[#1a2340] rounded-lg p-2">
                      <span className="text-[9px] text-slate-400">{tier.vol} Volume</span>
                      <span className="text-xs font-bold text-green-400">{tier.rate}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'traders' && (
            <div className="space-y-2">
              {referredTraders.length > 0 ? (
                referredTraders.map((trader) => (
                  <div key={trader.id} className="bg-[#1a2340] rounded-lg p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-white">{trader.name}</p>
                      <span
                        className={`text-[8px] font-bold px-2 py-1 rounded ${
                          trader.status === 'active'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-slate-500/20 text-slate-400'
                        }`}
                      >
                        {trader.status.charAt(0).toUpperCase() + trader.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-[8px] text-slate-500">
                      Joined: {new Date(trader.joinedAt).toLocaleDateString()}
                    </p>
                    <div className="flex items-center justify-between pt-1 border-t border-[rgba(148,163,184,0.1)]">
                      <span className="text-[9px] text-slate-500">Volume: ${(trader.volume / 1000).toFixed(0)}K</span>
                      <span className="text-[9px] font-bold text-[#00d4aa]">${trader.commission}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-slate-400 py-4">No referrals yet. Start sharing to earn!</p>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-2">
              {[
                { date: '2026-03-10', amount: 312.50, type: 'commission' },
                { date: '2026-03-03', amount: 287.75, type: 'commission' },
                { date: '2026-02-24', amount: 425.00, type: 'commission' },
                { date: '2026-02-17', amount: 8675.00, type: 'withdrawal' },
              ].map((entry, idx) => (
                <div key={idx} className="bg-[#1a2340] rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-bold text-white">{entry.date}</p>
                    <p className="text-[8px] text-slate-500">
                      {entry.type === 'commission' ? 'Weekly Commission' : 'Withdrawal'}
                    </p>
                  </div>
                  <p
                    className={`text-xs font-bold ${
                      entry.type === 'withdrawal' ? 'text-red-400' : 'text-green-400'
                    }`}
                  >
                    {entry.type === 'withdrawal' ? '-' : '+'}${entry.amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Marketing Resources */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Marketing Resources</h3>

        <div className="space-y-2">
          {[
            { title: 'Referral Banner', desc: '300x600 promotional banner for your website' },
            { title: 'Social Post Templates', desc: 'Pre-designed Telegram & Twitter templates' },
            { title: 'Email Campaign', desc: 'Ready-to-send email templates for outreach' },
            { title: 'Educational Guide', desc: 'Futures trading guide PDF to share' },
          ].map((resource, idx) => (
            <button
              key={idx}
              className="w-full glass-card rounded-lg p-3 text-left hover:border-[#00d4aa]/30 transition-all"
            >
              <p className="text-xs font-bold text-white">{resource.title}</p>
              <p className="text-[8px] text-slate-500 mt-1">{resource.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Terms */}
      <div className="glass-card rounded-xl p-4">
        <p className="text-[9px] text-slate-500 space-y-1">
          <span className="block font-bold text-slate-400">Terms:</span>
          <span className="block">• Commission paid weekly for cumulative trading volume</span>
          <span className="block">• Minimum withdrawal: $100</span>
          <span className="block">• Commission tiers based on total volume (see above)</span>
          <span className="block">• Fraud detection applies to prevent abuse</span>
        </p>
      </div>
    </div>
  );
}