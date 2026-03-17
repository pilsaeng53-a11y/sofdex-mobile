import React, { useState } from 'react';
import {
  User, Wallet, Globe, Bell, Moon, Shield, ChevronRight,
  LogOut, ExternalLink, Copy, Check, Settings, X
} from 'lucide-react';
import { useLang } from '../components/shared/LanguageContext';
import { useWallet } from '../components/shared/WalletContext';

export default function Profile() {
  const { t, lang, setLang, LANGUAGES } = useLang();
  const { isConnected, address, shortAddress, walletName, disconnect } = useWallet();
  const [copied, setCopied] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [showLangPicker, setShowLangPicker] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  return (
    <div className="min-h-screen">
      {/* Language picker modal */}
      {showLangPicker && (
        <div className="fixed inset-0 z-[200] flex items-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLangPicker(false)} />
          <div className="relative w-full max-w-lg mx-auto bg-[#0d1220] rounded-t-3xl border-t border-[rgba(148,163,184,0.08)] max-h-[75vh] flex flex-col">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[rgba(148,163,184,0.06)]">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#00d4aa]" />
                <h3 className="text-sm font-bold text-white">{t('common_selectLanguage')}</h3>
              </div>
              <button onClick={() => setShowLangPicker(false)} className="w-7 h-7 rounded-lg bg-[#151c2e] flex items-center justify-center">
                <X className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-3 py-3">
              <div className="grid grid-cols-1 gap-1">
                {LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code); setShowLangPicker(false); }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                      lang === l.code
                        ? 'bg-[#00d4aa]/10 border border-[#00d4aa]/20'
                        : 'hover:bg-[#151c2e] border border-transparent'
                    }`}
                  >
                    <span className="text-xl leading-none">{l.flag}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${lang === l.code ? 'text-[#00d4aa]' : 'text-white'}`}>{l.nativeName}</p>
                      <p className="text-[10px] text-slate-500">{l.name}</p>
                    </div>
                    {lang === l.code && (
                      <Check className="w-4 h-4 text-[#00d4aa] flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-xl font-bold text-white">{t('profile_title')}</h1>
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
              <p className="text-[11px] text-slate-500">{t('profile_premiumMember')}</p>
            </div>
          </div>
          <div className="bg-[#0d1220] rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wallet className="w-3.5 h-3.5 text-[#00d4aa]" />
                <span className="text-[11px] text-slate-500 font-medium">{t('profile_connectedWallet')}</span>
              </div>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {t('profile_active')}
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
            <h3 className="text-sm font-bold text-white">{t('profile_tradingTier')}</h3>
            <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20">Gold</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-[10px] text-slate-500">{t('profile_makerFee')}</p>
              <p className="text-sm font-bold text-white">0.02%</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500">{t('profile_takerFee')}</p>
              <p className="text-sm font-bold text-white">0.05%</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500">{t('profile_volume30d')}</p>
              <p className="text-sm font-bold text-white">$1.2M</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-[10px] mb-1">
              <span className="text-slate-500">{t('profile_progressToPlatinum')}</span>
              <span className="text-[#00d4aa] font-medium">60%</span>
            </div>
            <div className="h-1.5 rounded-full bg-[#0d1220]">
              <div className="h-full w-[60%] rounded-full bg-gradient-to-r from-[#f59e0b] to-[#00d4aa]" />
            </div>
          </div>
        </div>
      </div>

      {/* Settings — Account */}
      <div className="px-4 mb-5">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">{t('profile_account')}</h3>
        <div className="glass-card rounded-2xl overflow-hidden divide-y divide-[rgba(148,163,184,0.06)]">
          {/* Language row — opens picker */}
          <button
            onClick={() => setShowLangPicker(true)}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#1a2340] transition-colors"
          >
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-white">{t('profile_language')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg leading-none">{currentLang.flag}</span>
              <span className="text-xs text-slate-500">{currentLang.nativeName}</span>
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </div>
          </button>

          {/* Notifications */}
          <div className="px-4 py-3.5 flex items-center justify-between hover:bg-[#1a2340] transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-white">{t('profile_notifications')}</span>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`w-10 rounded-full transition-all relative ${notifications ? 'bg-[#00d4aa]' : 'bg-slate-700'}`}
              style={{ height: '22px' }}
            >
              <div
                className={`absolute top-0.5 rounded-full bg-white shadow transition-all ${notifications ? 'left-[22px]' : 'left-0.5'}`}
                style={{ width: '18px', height: '18px' }}
              />
            </button>
          </div>

          {/* Dark mode */}
          <div className="px-4 py-3.5 flex items-center justify-between hover:bg-[#1a2340] transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <Moon className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-white">{t('profile_darkMode')}</span>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-10 rounded-full transition-all relative ${darkMode ? 'bg-[#00d4aa]' : 'bg-slate-700'}`}
              style={{ height: '22px' }}
            >
              <div
                className={`absolute top-0.5 rounded-full bg-white shadow transition-all ${darkMode ? 'left-[22px]' : 'left-0.5'}`}
                style={{ width: '18px', height: '18px' }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Settings — Security */}
      <div className="px-4 mb-5">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">{t('profile_security')}</h3>
        <div className="glass-card rounded-2xl overflow-hidden divide-y divide-[rgba(148,163,184,0.06)]">
          <div className="px-4 py-3.5 flex items-center justify-between hover:bg-[#1a2340] transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-white">{t('profile_twoFactor')}</span>
            </div>
            <span className="text-xs text-emerald-400">Enabled</span>
          </div>
          <div className="px-4 py-3.5 flex items-center justify-between hover:bg-[#1a2340] transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <Settings className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-white">{t('profile_sessionMgmt')}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="px-4 pb-8">
        <button className="w-full py-3 rounded-xl bg-red-500/10 border border-red-500/15 text-red-400 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-red-500/20 transition-all">
          <LogOut className="w-4 h-4" />
          {t('profile_disconnectWallet')}
        </button>
        <div className="text-center mt-6">
          <p className="text-[10px] text-slate-600">{t('common_version')}</p>
          <p className="text-[10px] text-slate-700">Powered by SolFort Ecosystem</p>
        </div>
      </div>
    </div>
  );
}