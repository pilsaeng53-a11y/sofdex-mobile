import React, { useState, useEffect } from 'react';
import { Building2, MapPin } from 'lucide-react';
import { LANDMARK_RE } from '../components/shared/RWAData';
import PropertyCard from '../components/rwa/PropertyCard';
import RWAPropertyCard from '../components/rwa/RWAPropertyCard';
import { getPropertyList } from '@/services/rwaPropertyService';

const SUBCATS = ['All', 'Landmark', 'Commercial', 'Residential', 'Hospitality'];

export default function RealEstate() {
  const [subcat, setSubcat] = useState('All');
  const [importedProps, setImportedProps] = useState([]);

  useEffect(() => {
    getPropertyList('published').then(list => {
      // Only include external/imported assets (not native LANDMARK_RE)
      setImportedProps(list.filter(p => p.sourcePlatform !== 'manual' || p.id?.startsWith('seed')));
    }).catch(() => {});
  }, []);

  // Normalize LANDMARK_RE subcategory to lowercase for unified filtering
  const filtered = LANDMARK_RE.filter(p => {
    if (subcat === 'All') return true;
    return p.subcategory?.toLowerCase() === subcat.toLowerCase();
  });

  // Filter imported assets by category (already lowercase)
  const filteredImported = importedProps.filter(p => {
    if (subcat === 'All') return true;
    return p.category?.toLowerCase() === subcat.toLowerCase();
  });

  const totalCount = filtered.length + filteredImported.length;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 mb-0.5">
          <Building2 className="w-5 h-5 text-[#8b5cf6]" />
          <h1 className="text-xl font-bold text-white">Real Estate</h1>
        </div>
        <p className="text-xs text-slate-500">Tokenized landmark & commercial properties</p>
      </div>

      {/* Hero Banner */}
      <div className="px-4 my-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a103c] via-[#15112e] to-[#0d1220] border border-[#8b5cf6]/15 p-5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#8b5cf6]/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#3b82f6]/8 rounded-full blur-xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-[#8b5cf6]" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#8b5cf6]">Global Portfolio</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Landmark Properties</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-[280px]">
              Fractional ownership in trophy commercial real estate across New York, Dubai, London, Singapore, and Tokyo. Institutional grade. Blockchain settled.
            </p>
            <div className="flex gap-5 mt-4">
              <div>
                <p className="text-lg font-bold text-white">{LANDMARK_RE.length}</p>
                <p className="text-[10px] text-slate-500">Properties</p>
              </div>
              <div className="w-px bg-slate-700" />
              <div>
                <p className="text-lg font-bold text-white">$9.2B</p>
                <p className="text-[10px] text-slate-500">Total Value</p>
              </div>
              <div className="w-px bg-slate-700" />
              <div>
                <p className="text-lg font-bold text-[#00d4aa]">5.9%</p>
                <p className="text-[10px] text-slate-500">Avg Yield</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subcategory filter */}
      <div className="flex gap-1.5 px-4 mb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {SUBCATS.map(cat => (
          <button
            key={cat}
            onClick={() => setSubcat(cat)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              subcat === cat
                ? 'bg-[#8b5cf6]/15 text-[#8b5cf6] border border-[#8b5cf6]/20'
                : 'text-slate-500 border border-transparent'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Properties grid */}
      <div className="px-4 space-y-4 pb-8">
        {totalCount === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-400">More properties coming soon</p>
            <p className="text-xs text-slate-600 mt-1">This subcategory is currently in curation.</p>
          </div>
        ) : (
          <>
            {filteredImported.length > 0 && (
              <>
                <p className="text-[9px] font-black text-purple-400 uppercase tracking-wider px-1">SolFort 등록 자산</p>
                {filteredImported.map((p, i) => <RWAPropertyCard key={p.id || i} property={p} />)}
                {filtered.length > 0 && <div className="h-px bg-[rgba(148,163,184,0.08)] my-1" />}
              </>
            )}
            {filtered.map(p => <PropertyCard key={p.symbol} property={p} />)}
          </>
        )}
      </div>
    </div>
  );
}