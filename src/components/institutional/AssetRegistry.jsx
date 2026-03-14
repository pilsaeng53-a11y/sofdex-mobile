import React, { useState } from 'react';
import { Database, CheckCircle, Clock, XCircle, ChevronRight } from 'lucide-react';
import { useLang } from '../shared/LanguageContext';

const REGISTRY = [
  {
    id: 'RWA-RE-001',
    nameKey: 'reg_asset_re1',
    assetClass: 'Real Estate',
    classKey: 'reg_class_realestate',
    status: 'verified',
    custody: 'Fireblocks MPC + SPV (Cayman Islands)',
    tokenStructure: 'ERC-3643 / SPL Token',
    docRef: 'DocTokenStructure',
  },
  {
    id: 'RWA-RE-002',
    nameKey: 'reg_asset_re2',
    assetClass: 'Real Estate',
    classKey: 'reg_class_realestate',
    status: 'verified',
    custody: 'BitGo Qualified Custodian + US LLC',
    tokenStructure: 'SPL Token (Solana)',
    docRef: 'DocTokenStructure',
  },
  {
    id: 'RWA-ART-001',
    nameKey: 'reg_asset_art1',
    assetClass: 'Art / Collectibles',
    classKey: 'reg_class_art',
    status: 'pending',
    custody: 'Freeport Art Storage + Geneva Bonded Warehouse',
    tokenStructure: 'SPL Token — Fractional NFT',
    docRef: 'DocAssetOverview',
  },
  {
    id: 'RWA-GOLD-001',
    nameKey: 'reg_asset_gold1',
    assetClass: 'Gold',
    classKey: 'reg_class_gold',
    status: 'verified',
    custody: 'Brinks Switzerland + LBMA Approved Vault',
    tokenStructure: 'SPL Token — 1:1 physical backing',
    docRef: 'DocAssetOverview',
  },
  {
    id: 'RWA-COMM-001',
    nameKey: 'reg_asset_comm1',
    assetClass: 'Commodities',
    classKey: 'reg_class_commodities',
    status: 'verified',
    custody: 'CME Group Certified Warehouse',
    tokenStructure: 'SPL Token — Warehouse Receipt',
    docRef: 'DocAssetOverview',
  },
  {
    id: 'RWA-STK-001',
    nameKey: 'reg_asset_stk1',
    assetClass: 'Tokenized Stocks / ETFs',
    classKey: 'reg_class_stocks',
    status: 'verified',
    custody: 'IBKR Prime Brokerage + DTC Participant',
    tokenStructure: 'SPL Token — Mirror Protocol',
    docRef: 'DocTokenStructure',
  },
  {
    id: 'RWA-STK-002',
    nameKey: 'reg_asset_stk2',
    assetClass: 'Tokenized Stocks / ETFs',
    classKey: 'reg_class_stocks',
    status: 'pending',
    custody: 'Apex Clearing + SEC-Registered Broker',
    tokenStructure: 'SPL Token — T+0 Settlement',
    docRef: 'DocTokenStructure',
  },
];

const STATUS_ICON = {
  verified: <CheckCircle className="w-3.5 h-3.5 text-[#00d4aa]" />,
  pending: <Clock className="w-3.5 h-3.5 text-amber-400" />,
  rejected: <XCircle className="w-3.5 h-3.5 text-red-400" />,
};

const CLASS_COLORS = {
  'Real Estate': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  'Art / Collectibles': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  'Gold': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  'Commodities': 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  'Tokenized Stocks / ETFs': 'text-[#00d4aa] bg-[#00d4aa]/10 border-[#00d4aa]/20',
};

export default function AssetRegistry({ onSelectAsset }) {
  const { t } = useLang();
  const [filter, setFilter] = useState('All');
  const classes = ['All', 'Real Estate', 'Art / Collectibles', 'Gold', 'Commodities', 'Tokenized Stocks / ETFs'];
  const filtered = filter === 'All' ? REGISTRY : REGISTRY.filter(r => r.assetClass === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Database className="w-4 h-4 text-[#00d4aa]" />
        <span className="text-sm font-bold text-white">{t('reg_title')}</span>
        <span className="ml-auto text-[10px] text-slate-600">{REGISTRY.length} {t('reg_total_assets')}</span>
      </div>

      {/* Filter pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {classes.map(c => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${filter === c ? 'bg-[#00d4aa]/10 text-[#00d4aa] border-[#00d4aa]/30' : 'bg-[#151c2e] text-slate-500 border-[rgba(148,163,184,0.06)]'}`}
          >
            {c === 'All' ? t('reg_filter_all') : c}
          </button>
        ))}
      </div>

      {/* Registry entries */}
      <div className="space-y-2">
        {filtered.map(asset => (
          <button
            key={asset.id}
            onClick={() => onSelectAsset && onSelectAsset(asset)}
            className="w-full text-left bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.06)] p-4 hover:border-[#00d4aa]/20 transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-bold text-white">{t(asset.nameKey)}</p>
                <p className="text-[10px] text-slate-600 mt-0.5">{asset.id}</p>
              </div>
              <div className="flex items-center gap-1.5">
                {STATUS_ICON[asset.status]}
                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${CLASS_COLORS[asset.assetClass]}`}>{asset.assetClass}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <p className="text-[9px] text-slate-600 uppercase">{t('reg_custody')}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{asset.custody}</p>
              </div>
              <div>
                <p className="text-[9px] text-slate-600 uppercase">{t('reg_token_structure')}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{asset.tokenStructure}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}