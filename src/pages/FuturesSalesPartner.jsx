import React, { useState } from 'react';
import { Users, TrendingUp, Gift, Briefcase, CheckCircle, ArrowRight } from 'lucide-react';

export default function FuturesSalesPartner() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    telegram: '',
    wallet: '',
    region: '',
    experience: '',
    source: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.telegram || !formData.wallet || !formData.region || !formData.experience) {
      alert('Please fill in all required fields');
      return;
    }
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', telegram: '', wallet: '', region: '', experience: '', source: '' });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#8b5cf6] via-[#ec4899] to-[#f59e0b] bg-clip-text text-transparent">
          Sales Partner Program
        </h1>
        <p className="text-sm text-slate-400">
          Build your own business managing traders and earning commissions
        </p>
      </div>

      {/* Program Overview */}
      {!submitted ? (
        <>
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Program Benefits</h3>

            <div className="space-y-2">
              {[
                {
                  icon: <TrendingUp className="w-5 h-5 text-[#00d4aa]" />,
                  title: 'Volume-Based Commissions',
                  desc: 'Earn 25-30% commission on trading volume from your managed accounts',
                },
                {
                  icon: <Briefcase className="w-5 h-5 text-[#8b5cf6]" />,
                  title: 'Account Management Tools',
                  desc: 'Dedicated dashboard to manage clients, track volume, and monitor commissions',
                },
                {
                  icon: <Gift className="w-5 h-5 text-[#ec4899]" />,
                  title: 'Marketing Materials',
                  desc: 'Pre-built promotional assets, landing pages, and trading education materials',
                },
                {
                  icon: <Users className="w-5 h-5 text-[#f59e0b]" />,
                  title: 'Dedicated Support',
                  desc: '24/7 support team to help with client onboarding and retention',
                },
              ].map((benefit, idx) => (
                <div key={idx} className="glass-card rounded-xl p-4 flex gap-3">
                  {benefit.icon}
                  <div>
                    <p className="text-xs font-bold text-white">{benefit.title}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expected Earnings */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Earning Potential</h3>

            <div className="glass-card rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { vol: '$1M', comm: '$2,500-$3,000' },
                  { vol: '$5M', comm: '$12,500-$15,000' },
                  { vol: '$10M+', comm: '$25,000+' },
                ].map((item, idx) => (
                  <div key={idx} className="bg-[#1a2340] rounded-lg p-3 text-center">
                    <p className="text-[9px] text-slate-500 mb-0.5">Monthly Volume</p>
                    <p className="text-xs font-bold text-[#00d4aa]">{item.vol}</p>
                    <p className="text-[8px] text-slate-400 mt-1">Commission</p>
                    <p className="text-[9px] font-semibold text-green-400">{item.comm}</p>
                  </div>
                ))}
              </div>
              <p className="text-[9px] text-slate-500 text-center">
                Commissions calculated on total trading volume from managed accounts
              </p>
            </div>
          </div>

          {/* Eligibility */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Requirements</h3>

            <div className="glass-card rounded-xl p-4 space-y-2">
              {[
                'Valid business registration or self-employed status',
                'Minimum 2+ years trading experience',
                'Active social media presence (Telegram, Twitter, etc.)',
                'Commitment to promote SolFort Futures professionally',
                'KYC/AML verification required',
                'Solana wallet for commission payouts',
              ].map((req, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00d4aa] flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-300">{req}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Application Form */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Application Form</h3>

            <form onSubmit={handleSubmit} className="glass-card rounded-xl p-5 space-y-3">
              {/* Name */}
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full legal name"
                  className="w-full bg-[#1a2340] border border-[rgba(148,163,184,0.1)] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-[#00d4aa]/30 outline-none transition-all"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full bg-[#1a2340] border border-[rgba(148,163,184,0.1)] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-[#00d4aa]/30 outline-none transition-all"
                  required
                />
              </div>

              {/* Telegram */}
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Telegram Handle *</label>
                <input
                  type="text"
                  name="telegram"
                  value={formData.telegram}
                  onChange={handleChange}
                  placeholder="@your_telegram_handle"
                  className="w-full bg-[#1a2340] border border-[rgba(148,163,184,0.1)] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-[#00d4aa]/30 outline-none transition-all"
                  required
                />
              </div>

              {/* Wallet */}
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Solana Wallet Address *</label>
                <input
                  type="text"
                  name="wallet"
                  value={formData.wallet}
                  onChange={handleChange}
                  placeholder="Your Solana wallet for payouts"
                  className="w-full bg-[#1a2340] border border-[rgba(148,163,184,0.1)] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-[#00d4aa]/30 outline-none transition-all font-mono"
                  required
                />
              </div>

              {/* Region */}
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Primary Region *</label>
                <select
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  className="w-full bg-[#1a2340] border border-[rgba(148,163,184,0.1)] rounded-lg px-3 py-2 text-xs text-white focus:border-[#00d4aa]/30 outline-none transition-all"
                  required
                >
                  <option value="">Select your region</option>
                  <option value="asia">Asia</option>
                  <option value="europe">Europe</option>
                  <option value="americas">Americas</option>
                  <option value="mena">Middle East & Africa</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Experience */}
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Trading Experience *</label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="w-full bg-[#1a2340] border border-[rgba(148,163,184,0.1)] rounded-lg px-3 py-2 text-xs text-white focus:border-[#00d4aa]/30 outline-none transition-all"
                  required
                >
                  <option value="">Select experience level</option>
                  <option value="intermediate">2-5 years</option>
                  <option value="advanced">5-10 years</option>
                  <option value="professional">10+ years / Professional</option>
                </select>
              </div>

              {/* Referral Source */}
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">How did you hear about us?</label>
                <input
                  type="text"
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  placeholder="Telegram, Twitter, Friend, etc."
                  className="w-full bg-[#1a2340] border border-[rgba(148,163,184,0.1)] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-[#00d4aa]/30 outline-none transition-all"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] hover:from-[#8b5cf6]/90 hover:to-[#ec4899]/90 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Briefcase className="w-4 h-4" />
                Submit Application
              </button>

              <p className="text-[8px] text-slate-500 text-center">
                Applications are reviewed manually. You'll receive a response within 3-5 business days.
              </p>
            </form>
          </div>
        </>
      ) : (
        /* Success Message */
        <div className="space-y-4 py-8">
          <div className="glass-card rounded-2xl p-8 text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
            <div>
              <h3 className="text-xl font-bold text-white">Application Submitted!</h3>
              <p className="text-sm text-slate-400 mt-2">
                Thank you for your interest. Our team will review your application within 3-5 business days.
              </p>
            </div>
          </div>

          <div className="glass-card rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-300 mb-3">Next Steps:</p>
            <ol className="space-y-2">
              {[
                'Application review by our partnership team',
                'Email verification and KYC submission',
                'Partner portal activation',
                'Commission tracking setup',
                'Start recruiting and earning',
              ].map((step, idx) => (
                <li key={idx} className="flex gap-2 text-[9px] text-slate-400">
                  <span className="font-bold text-[#00d4aa]">{idx + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* FAQ Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Frequently Asked Questions</h3>

        <div className="space-y-2">
          {[
            {
              q: 'How are commissions calculated?',
              a: 'Commissions are 25-30% of net trading fees and spreads from your managed accounts.',
            },
            {
              q: 'When are payouts issued?',
              a: 'Weekly payouts to your Solana wallet, minimum $100 per payout.',
            },
            {
              q: 'Can I manage my own accounts?',
              a: 'Yes, you can trade personally while also managing client accounts separately.',
            },
            {
              q: 'What if my application is rejected?',
              a: 'You can reapply after 90 days with additional trading history or experience.',
            },
          ].map((item, idx) => (
            <details key={idx} className="glass-card rounded-lg p-3 cursor-pointer group">
              <summary className="font-semibold text-xs text-white flex items-center justify-between">
                {item.q}
                <span className="text-slate-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-[9px] text-slate-400 mt-2">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}