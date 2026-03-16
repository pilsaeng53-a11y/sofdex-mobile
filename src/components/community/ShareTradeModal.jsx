import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Share2, X } from 'lucide-react';

export default function ShareTradeModal({ trade, onClose, onShare }) {
  const [note, setNote] = useState('');

  if (!trade) return null;

  const roi = ((trade.exit_price - trade.entry_price) / trade.entry_price * 100 * (trade.direction === 'short' ? -1 : 1));

  const handleShare = () => {
    onShare({ ...trade, roi, note });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-end justify-center p-4">
      <div className="bg-[#151c2e] rounded-2xl border border-[rgba(148,163,184,0.12)] p-5 w-full max-w-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Position Closed</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-[#1a2340] flex items-center justify-center">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Trade Result */}
        <div className="bg-[#0a0e1a] rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            {trade.direction === 'long'
              ? <TrendingUp className="w-5 h-5 text-green-400" />
              : <TrendingDown className="w-5 h-5 text-red-400" />}
            <span className="text-base font-bold text-white">{trade.asset}</span>
            <span className={`text-sm font-semibold ${trade.direction === 'long' ? 'text-green-400' : 'text-red-400'}`}>
              {trade.direction.toUpperCase()}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-slate-500">Entry Price</p>
              <p className="text-sm font-semibold text-white">${trade.entry_price?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Exit Price</p>
              <p className="text-sm font-semibold text-white">${trade.exit_price?.toLocaleString()}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500">ROI</p>
            <p className={`text-3xl font-black ${roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {roi >= 0 ? '+' : ''}{roi.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Add a note (optional)</label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Share your analysis..."
            rows={2}
            className="w-full bg-[#0a0e1a] border border-[rgba(148,163,184,0.1)] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00d4aa]/40 resize-none"
          />
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-400 bg-[#1a2340] border border-[rgba(148,163,184,0.1)]">
            Cancel
          </button>
          <button onClick={handleShare} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#00d4aa] to-[#06b6d4] flex items-center justify-center gap-2">
            <Share2 className="w-4 h-4" />
            Share to Feed
          </button>
        </div>
      </div>
    </div>
  );
}