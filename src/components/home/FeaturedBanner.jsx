import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight, Shield, Gem } from 'lucide-react';

export default function FeaturedBanner() {
  return (
    <div className="px-4 mb-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f1a2e] via-[#0d1f3c] to-[#0a1628] border border-[#00d4aa]/15 p-5">
        {/* Decorative */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-[#00d4aa]/10 to-transparent rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#3b82f6]/8 to-transparent rounded-full blur-xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Gem className="w-4 h-4 text-[#00d4aa]" />
            <span className="text-[10px] font-semibold tracking-widest uppercase text-[#00d4aa]">New on SOFDex</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Real-World Assets</h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-4 max-w-[240px]">
            Trade tokenized real estate, commodities, and equities with institutional-grade execution.
          </p>
          <Link to={createPageUrl('RWAExplore')}>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00d4aa]/10 border border-[#00d4aa]/20 text-[#00d4aa] text-xs font-semibold hover:bg-[#00d4aa]/20 transition-all">
              Explore RWA Markets
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>

        {/* Shield icon decoration */}
        <div className="absolute right-4 bottom-4 opacity-5">
          <Shield className="w-24 h-24 text-[#00d4aa]" />
        </div>
      </div>
    </div>
  );
}