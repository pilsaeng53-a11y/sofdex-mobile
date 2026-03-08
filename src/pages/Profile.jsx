import React, { useState } from 'react';
import { 
  User, Wallet, Globe, Bell, Moon, Shield, ChevronRight, 
  LogOut, ExternalLink, Copy, Check, Settings 
} from 'lucide-react';

export default function Profile() {
  const [copied, setCopied] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const settingsGroups = [
    {
      title: 'Account',
      items: [
        { label: 'Language', value: 'English', icon: Globe },
        { label: 'Notifications', icon: Bell, toggle: true, checked: notifications, onChange: () => setNotifications(!notifications) },
        { label: 'Dark Mode', icon: Moon, toggle: true, checked: darkMode, onChange: () => setDarkMode(!darkMode) },
      ]
    },
    {
      title: 'Security',
      items: [
        { label: 'Two-Factor Auth', value: 'Enabled', icon: Shield },
        { label: 'Session Management', icon: Settings },
      ]
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-xl font-bold text-white">Profile</h1>
      </div>

      {/* Profile card */}
      <div className="px-4 my-4">
        <div className="glass-card rounded-2xl p-5 glow-border">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00d4aa] to-[#06b6d4] flex items-center justify-center shadow-lg shadow-[#00d4aa]/20">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Trader</h2>
              <p className="text-[11px] text-slate-500">SOFDex Premium Member</p>
            </div>
          </div>

          {/* Wallet */}
          <div className="bg-[#0d1220] rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wallet className="w-3.5 h-3.5 text-[#00d4aa]" />
                <span className="text-[11px] text-slate-500 font-medium">Connected Wallet</span>
              </div>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono text-slate-300">7xKXtg...9mN4pQ</span>
              <div className="flex gap-1.5">
                <button onClick={handleCopy} className="w-7 h-7 rounded-lg bg-[#151c2e] flex items-center justify-center">
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                </button>
                <button className="w-7 h-7 rounded-lg bg-[#151c2e] flex items-center justify-center">
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trading tier */}
      <div className="px-4 mb-5">
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white">Trading Tier</h3>
            <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20">Gold</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-[10px] text-slate-500">Maker Fee</p>
              <p className="text-sm font-bold text-white">0.02%</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500">Taker Fee</p>
              <p className="text-sm font-bold text-white">0.05%</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500">Volume 30d</p>
              <p className="text-sm font-bold text-white">$1.2M</p>
            </div>
          </div>
          {/* Progress to next tier */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-[10px] mb-1">
              <span className="text-slate-500">Progress to Platinum</span>
              <span className="text-[#00d4aa] font-medium">60%</span>
            </div>
            <div className="h-1.5 rounded-full bg-[#0d1220]">
              <div className="h-full w-[60%] rounded-full bg-gradient-to-r from-[#f59e0b] to-[#00d4aa]" />
            </div>
          </div>
        </div>
      </div>

      {/* Settings */}
      {settingsGroups.map((group, gi) => (
        <div key={gi} className="px-4 mb-5">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">{group.title}</h3>
          <div className="glass-card rounded-2xl overflow-hidden divide-y divide-[rgba(148,163,184,0.06)]">
            {group.items.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="px-4 py-3.5 flex items-center justify-between hover:bg-[#1a2340] transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-white">{item.label}</span>
                  </div>
                  {item.toggle ? (
                    <button
                      onClick={item.onChange}
                      className={`w-10 h-5.5 rounded-full transition-all relative ${
                        item.checked ? 'bg-[#00d4aa]' : 'bg-slate-700'
                      }`}
                      style={{ height: '22px' }}
                    >
                      <div className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-all ${
                        item.checked ? 'left-[22px]' : 'left-0.5'
                      }`} style={{ width: '18px', height: '18px' }} />
                    </button>
                  ) : item.value ? (
                    <span className="text-xs text-slate-500">{item.value}</span>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Logout */}
      <div className="px-4 pb-8">
        <button className="w-full py-3 rounded-xl bg-red-500/10 border border-red-500/15 text-red-400 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-red-500/20 transition-all">
          <LogOut className="w-4 h-4" />
          Disconnect Wallet
        </button>

        {/* Version */}
        <div className="text-center mt-6">
          <p className="text-[10px] text-slate-600">SOFDex Mobile v1.0.0</p>
          <p className="text-[10px] text-slate-700">Powered by SolFort Ecosystem</p>
        </div>
      </div>
    </div>
  );
}