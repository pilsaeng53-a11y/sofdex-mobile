import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, TrendingUp, TrendingDown, ShieldCheck, Building2, Star, MapPin, Navigation, ChevronRight } from 'lucide-react';
import { getPropertyBySymbol, formatAssetValue } from '../components/shared/RWAData';
import PropertyMap from '../components/rwa/PropertyMap';
import PropertyChart from '../components/rwa/PropertyChart';
import AssetDocuments from '../components/rwa/AssetDocuments';

const TABS = ['Overview', 'Location', 'Documents'];

export default function RealEstateDetail() {
  const [activeTab, setActiveTab] = useState('Overview');

  const urlParams = new URLSearchParams(window.location.search);
  const symbol = urlParams.get('symbol');
  const property = getPropertyBySymbol(symbol);

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <Building2 className="w-12 h-12 text-slate-600 mb-4" />
        <p className="text-white font-semibold mb-2">Property not found</p>
        <Link to={createPageUrl('RealEstate')}>
          <span className="text-[#00d4aa] text-sm">← Back to Real Estate</span>
        </Link>
      </div>
    );
  }

  const isPositive = property.change24h >= 0;

  return (
    <div className="min-h-screen">
      {/* Back button */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-3">
        <Link to={createPageUrl('RealEstate')}>
          <button className="w-8 h-8 rounded-xl bg-[#151c2e] flex items-center justify-center border border-[rgba(148,163,184,0.08)]">
            <ArrowLeft className="w-4 h-4 text-slate-400" />
          </button>
        </Link>
        <div>
          <p className="text-[11px] text-slate-500">{property.flag} {property.city}, {property.country}</p>
          <p className="text-sm font-bold text-white">{property.shortName}</p>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative h-52 overflow-hidden mx-4 rounded-2xl mb-4">
        <img
          src={property.image}
          alt={property.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a]/80 via-transparent to-transparent" />

        {/* Trust badges overlay */}
        <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap">
          {property.verified && (
            <div className="flex items-center gap-1 bg-[#00d4aa]/25 backdrop-blur-sm border border-[#00d4aa]/40 rounded-lg px-2 py-0.5">
              <ShieldCheck className="w-2.5 h-2.5 text-[#00d4aa]" />
              <span className="text-[9px] font-bold text-[#00d4aa]">VERIFIED</span>
            </div>
          )}
          {property.audited && (
            <div className="flex items-center gap-1 bg-blue-400/20 backdrop-blur-sm border border-blue-400/30 rounded-lg px-2 py-0.5">
              <Building2 className="w-2.5 h-2.5 text-blue-400" />
              <span className="text-[9px] font-bold text-blue-400">AUDITED</span>
            </div>
          )}
          {property.institutional && (
            <div className="flex items-center gap-1 bg-amber-400/20 backdrop-blur-sm border border-amber-400/30 rounded-lg px-2 py-0.5">
              <Star className="w-2.5 h-2.5 text-amber-400" />
              <span className="text-[9px] font-bold text-amber-400">INSTITUTIONAL</span>
            </div>
          )}
        </div>
      </div>

      {/* Property name + price */}
      <div className="px-4 mb-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-lg font-bold text-white leading-tight mb-1">{property.name}</h1>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <MapPin className="w-3 h-3" />
              <span>{property.city}, {property.country}</span>
              <span className="text-slate-700">·</span>
              <Navigation className="w-3 h-3" />
              <span>{property.coordinates.lat.toFixed(4)}°, {property.coordinates.lng.toFixed(4)}°</span>
            </div>
          </div>
          <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold ${isPositive ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'}`}>
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {isPositive ? '+' : ''}{property.change24h.toFixed(2)}%
          </div>
        </div>

        {/* Key stats row */}
        <div className="glass-card rounded-2xl p-3.5">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <p className="text-base font-bold text-white">${property.tokenPrice.toFixed(2)}</p>
              <p className="text-[10px] text-slate-500">Token Price</p>
            </div>
            <div>
              <p className="text-base font-bold text-[#00d4aa]">{property.yield.toFixed(1)}%</p>
              <p className="text-[10px] text-slate-500">Est. Yield</p>
            </div>
            <div>
              <p className="text-sm font-bold text-white">{formatAssetValue(property.totalValue)}</p>
              <p className="text-[10px] text-slate-500">Asset Value</p>
            </div>
            <div>
              <p className="text-sm font-bold text-white">{formatAssetValue(property.volume24h)}</p>
              <p className="text-[10px] text-slate-500">24h Volume</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1.5 px-4 mb-4">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab
                ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20'
                : 'text-slate-500 bg-[#151c2e] border border-transparent'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="px-4 pb-8">

        {activeTab === 'Overview' && (
          <div className="space-y-5">
            {/* Description */}
            <div className="glass-card rounded-2xl p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">About This Asset</p>
              <p className="text-sm text-slate-300 leading-relaxed">{property.description}</p>
            </div>

            {/* Performance chart */}
            <div className="glass-card rounded-2xl p-4">
              <PropertyChart series={property.series} />
              <p className="text-[9px] text-slate-600 mt-2 leading-relaxed">{property.benchmarkNote}</p>
            </div>

            {/* Investment merits */}
            <div className="glass-card rounded-2xl p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Investment Merits</p>
              <div className="space-y-2">
                {property.merits.map((m, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00d4aa] mt-1.5 flex-shrink-0" />
                    <p className="text-sm text-slate-300">{m}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Highlights */}
            <div className="glass-card rounded-2xl p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Investment Highlights</p>
              <div className="grid grid-cols-2 gap-2">
                {property.highlights.map((h, i) => (
                  <div key={i} className="bg-[#0d1220] rounded-xl p-2.5">
                    <p className="text-[11px] font-semibold text-slate-300 leading-tight">{h}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Token structure */}
            <div className="glass-card rounded-2xl p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Token Structure</p>
              <div className="space-y-2">
                {[
                  ['Token Supply', property.tokenSupply],
                  ['Token Price', `$${property.tokenPrice.toFixed(2)}`],
                  ['Total Asset Value', formatAssetValue(property.totalValue)],
                  ['Blockchain', 'Solana'],
                  ['Token Standard', 'SPL Token'],
                  ['Custody', 'Institutional Grade'],
                  ['Distribution', 'Quarterly / Annual'],
                  ['Jurisdiction', property.country],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm py-1.5 border-b border-[rgba(148,163,184,0.05)] last:border-0">
                    <span className="text-slate-500">{label}</span>
                    <span className="text-white font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Location' && (
          <div className="space-y-5">
            {/* Map */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Property Location</p>
              <PropertyMap property={property} />
              <p className="text-[11px] text-slate-600 mt-2 px-1">
                Coordinates: {property.coordinates.lat.toFixed(6)}°N, {property.coordinates.lng.toFixed(6)}°{property.coordinates.lng >= 0 ? 'E' : 'W'}
              </p>
            </div>

            {/* Location description */}
            <div className="glass-card rounded-2xl p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Location Overview</p>
              <p className="text-sm text-slate-300 leading-relaxed">{property.location}</p>
            </div>

            {/* Region stats */}
            <div className="glass-card rounded-2xl p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Market Context</p>
              <div className="space-y-2.5">
                {[
                  ['Region', property.region],
                  ['City', property.city],
                  ['Country', `${property.flag} ${property.country}`],
                  ['Asset Class', property.subcategory],
                  ['Lat / Long', `${property.coordinates.lat.toFixed(4)}°, ${property.coordinates.lng.toFixed(4)}°`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-slate-500">{label}</span>
                    <span className="text-white font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Documents' && (
          <AssetDocuments property={property} />
        )}
      </div>
    </div>
  );
}