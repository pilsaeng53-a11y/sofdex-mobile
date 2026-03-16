import React, { useState } from 'react';
import { MapPin, Users, TrendingUp, Wallet, ChevronDown, ChevronUp } from 'lucide-react';

const TIER_COLORS = {
  Platinum: { text: 'text-[#00d4aa]', bg: 'bg-[#00d4aa]/10', border: 'border-[#00d4aa]/20' },
  Gold:     { text: 'text-amber-400',  bg: 'bg-amber-400/10',  border: 'border-amber-400/20' },
  Purple:   { text: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
  Green:    { text: 'text-emerald-400',bg: 'bg-emerald-400/10',border: 'border-emerald-400/20' },
};

const MAP_REGIONS = [
  {
    id: 'east-asia',
    label: 'East Asia',
    flag: '🇰🇷🇯🇵🇨🇳',
    x: 75, y: 30,
    distributor: 'CryptoKing_Asia',
    wallet: '0xA1B2...K9QR',
    tier: 'Platinum',
    volume: '$14.2M',
    teamSize: 842,
    cities: [
      { name: 'Seoul', wallet: '0x...SEL1', tier: 'Gold', vol: '$4.1M' },
      { name: 'Tokyo', wallet: '0x...TKY2', tier: 'Gold', vol: '$3.8M' },
      { name: 'Shanghai', wallet: '0x...SHA3', tier: 'Purple', vol: '$2.9M' },
    ],
  },
  {
    id: 'southeast-asia',
    label: 'SE Asia',
    flag: '🇸🇬🇹🇭🇻🇳',
    x: 72, y: 48,
    distributor: 'SEALeader',
    wallet: '0xC3D4...mN9s',
    tier: 'Platinum',
    volume: '$9.8M',
    teamSize: 614,
    cities: [
      { name: 'Singapore', wallet: '0x...SGP1', tier: 'Gold', vol: '$3.2M' },
      { name: 'Bangkok', wallet: '0x...BKK2', tier: 'Purple', vol: '$1.9M' },
      { name: 'Ho Chi Minh', wallet: '0x...HCM3', tier: 'Green', vol: '$1.1M' },
    ],
  },
  {
    id: 'europe',
    label: 'Europe',
    flag: '🇩🇪🇬🇧🇫🇷',
    x: 45, y: 22,
    distributor: 'EuroBlock',
    wallet: '0xE5F6...Lv5p',
    tier: 'Gold',
    volume: '$7.1M',
    teamSize: 421,
    cities: [
      { name: 'London', wallet: '0x...LON1', tier: 'Gold', vol: '$2.4M' },
      { name: 'Berlin', wallet: '0x...BER2', tier: 'Purple', vol: '$1.7M' },
      { name: 'Paris', wallet: '0x...PAR3', tier: 'Green', vol: '$1.3M' },
    ],
  },
  {
    id: 'north-america',
    label: 'N. America',
    flag: '🇺🇸🇨🇦',
    x: 18, y: 28,
    distributor: 'AmericanDeFi',
    wallet: '0xG7H8...Wz8c',
    tier: 'Gold',
    volume: '$6.4M',
    teamSize: 389,
    cities: [
      { name: 'New York', wallet: '0x...NYC1', tier: 'Gold', vol: '$2.8M' },
      { name: 'Los Angeles', wallet: '0x...LAX2', tier: 'Purple', vol: '$1.6M' },
      { name: 'Toronto', wallet: '0x...TOR3', tier: 'Green', vol: '$0.9M' },
    ],
  },
  {
    id: 'middle-east',
    label: 'Middle East',
    flag: '🇦🇪🇸🇦',
    x: 55, y: 38,
    distributor: 'GulfTrader',
    wallet: '0xI9J0...Rx3k',
    tier: 'Purple',
    volume: '$2.8M',
    teamSize: 187,
    cities: [
      { name: 'Dubai', wallet: '0x...DXB1', tier: 'Purple', vol: '$1.4M' },
      { name: 'Riyadh', wallet: '0x...RUH2', tier: 'Green', vol: '$0.8M' },
    ],
  },
  {
    id: 'latin-america',
    label: 'LatAm',
    flag: '🇧🇷🇲🇽',
    x: 25, y: 58,
    distributor: 'LatAmCrypto',
    wallet: '0xK1L2...Bt7n',
    tier: 'Purple',
    volume: '$2.1M',
    teamSize: 143,
    cities: [
      { name: 'São Paulo', wallet: '0x...SAO1', tier: 'Purple', vol: '$0.9M' },
      { name: 'Mexico City', wallet: '0x...MEX2', tier: 'Green', vol: '$0.7M' },
    ],
  },
];

export default function DistributorMap() {
  const [selected, setSelected] = useState(null);

  const selectedRegion = MAP_REGIONS.find(r => r.id === selected);
  const tc = selectedRegion ? TIER_COLORS[selectedRegion.tier] : null;

  return (
    <div className="space-y-3">
      {/* SVG World Map (simplified) */}
      <div className="relative bg-[#0a0e1a] rounded-2xl border border-[rgba(148,163,184,0.08)] overflow-hidden" style={{ paddingTop: '56%' }}>
        <div className="absolute inset-0 p-3">
          {/* Grid lines */}
          <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
            {[20,40,60,80].map(x => <line key={x} x1={x} y1="0" x2={x} y2="100" stroke="#00d4aa" strokeWidth="0.3"/>)}
            {[25,50,75].map(y => <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#00d4aa" strokeWidth="0.3"/>)}
            {/* Simplified continents outline */}
            <path d="M10,20 Q20,15 30,22 Q25,35 15,32 Z" fill="#1a2340" stroke="#00d4aa" strokeWidth="0.5" opacity="0.6"/>
            <path d="M35,20 Q55,15 70,22 Q75,40 65,50 Q55,55 45,48 Q38,38 35,20 Z" fill="#1a2340" stroke="#00d4aa" strokeWidth="0.5" opacity="0.6"/>
            <path d="M62,20 Q80,18 88,30 Q85,45 78,48 Q68,45 62,32 Z" fill="#1a2340" stroke="#00d4aa" strokeWidth="0.5" opacity="0.6"/>
            <path d="M50,52 Q60,50 65,62 Q60,72 52,70 Q46,62 50,52 Z" fill="#1a2340" stroke="#00d4aa" strokeWidth="0.5" opacity="0.6"/>
            <path d="M15,52 Q28,48 35,60 Q30,72 20,70 Q12,62 15,52 Z" fill="#1a2340" stroke="#00d4aa" strokeWidth="0.5" opacity="0.6"/>
          </svg>

          {/* Region Pins */}
          {MAP_REGIONS.map(region => (
            <button
              key={region.id}
              onClick={() => setSelected(selected === region.id ? null : region.id)}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
              style={{ left: `${region.x}%`, top: `${region.y}%` }}
            >
              <div className={`w-3 h-3 rounded-full border-2 transition-all ${
                selected === region.id
                  ? 'bg-[#00d4aa] border-[#00d4aa] scale-150 shadow-[0_0_8px_rgba(0,212,170,0.8)]'
                  : TIER_COLORS[region.tier]?.bg + ' border-[#00d4aa]/40'
              }`} />
              <span className="text-[8px] text-slate-400 mt-0.5 whitespace-nowrap font-semibold hidden sm:block">{region.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 flex-wrap px-1">
        {Object.entries(TIER_COLORS).map(([tier, c]) => (
          <div key={tier} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${c.bg} border ${c.border}`} />
            <span className={`text-[10px] ${c.text}`}>{tier}</span>
          </div>
        ))}
      </div>

      {/* Selected Region Detail */}
      {selectedRegion && tc && (
        <div className={`bg-[#151c2e] rounded-2xl border ${tc.border} p-4 space-y-3`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{selectedRegion.flag}</span>
              <div>
                <p className="text-sm font-bold text-white">{selectedRegion.label}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tc.bg} ${tc.border} ${tc.text}`}>{selectedRegion.tier}</span>
              </div>
            </div>
            <button onClick={() => setSelected(null)} className="text-slate-500 text-xs">✕</button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#0a0e1a] rounded-xl p-2.5 text-center">
              <p className="text-sm font-bold text-[#00d4aa]">{selectedRegion.volume}</p>
              <p className="text-[10px] text-slate-500">Volume</p>
            </div>
            <div className="bg-[#0a0e1a] rounded-xl p-2.5 text-center">
              <p className="text-sm font-bold text-white">{selectedRegion.teamSize}</p>
              <p className="text-[10px] text-slate-500">Team Size</p>
            </div>
            <div className="bg-[#0a0e1a] rounded-xl p-2.5 text-center">
              <p className="text-xs font-bold text-slate-300 truncate">{selectedRegion.distributor}</p>
              <p className="text-[10px] text-slate-500">Lead</p>
            </div>
          </div>

          <div>
            <p className="text-[10px] text-slate-500 mb-0.5">Lead Wallet</p>
            <p className="text-xs font-mono text-slate-300">{selectedRegion.wallet}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-400 mb-2">City Distributors</p>
            <div className="space-y-2">
              {selectedRegion.cities.map((city, i) => {
                const cc = TIER_COLORS[city.tier];
                return (
                  <div key={i} className="flex items-center justify-between bg-[#0a0e1a] rounded-xl p-2.5">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span className="text-xs font-semibold text-white">{city.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${cc.bg} ${cc.border} ${cc.text}`}>{city.tier}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-[#00d4aa]">{city.vol}</p>
                      <p className="text-[10px] font-mono text-slate-500">{city.wallet}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}