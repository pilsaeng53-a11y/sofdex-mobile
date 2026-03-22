/**
 * Runtime Debug Panel
 * Displays all collected debug data in a user-accessible panel
 * 
 * Shows:
 * 1. Price source history
 * 2. Icon render attempts
 * 3. Component lifecycle
 * 4. Cache status
 * 5. One-click cache clear
 */

import React, { useState, useEffect } from 'react';
import { X, RotateCcw, Download } from 'lucide-react';

export default function DebugRuntimePanel() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('prices');
  const [debugData, setDebugData] = useState(null);

  // Update debug data every 1s
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && window.__DEBUG_TRADING) {
        const data = window.__DEBUG_TRADING.getData?.();
        setDebugData(data);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center font-black"
        style={{
          background: 'rgba(251,191,36,0.15)',
          border: '2px solid rgba(251,191,36,0.4)',
          color: '#fbbf24',
          fontSize: '20px',
        }}
        title="Open debug panel"
      >
        🔧
      </button>
    );
  }

  const priceIssues = debugData?.prices?.filter(p => p.sourceType.includes('WRONG') || p.sourceType.includes('METADATA')) || [];
  const iconIssues = debugData?.icons?.filter(i => i.fallbackUsed) || [];

  return (
    <div
      className="fixed bottom-6 right-6 z-50 rounded-2xl overflow-hidden flex flex-col"
      style={{
        width: '420px',
        height: '520px',
        background: 'rgba(10,14,26,0.98)',
        border: '1px solid rgba(251,191,36,0.2)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: 'rgba(251,191,36,0.1)', background: 'rgba(251,191,36,0.03)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🔧</span>
          <span className="font-black text-yellow-400 text-sm">RUNTIME DEBUG</span>
        </div>
        <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-300">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 px-3 py-2 border-b flex-shrink-0 overflow-x-auto"
        style={{ borderColor: 'rgba(148,163,184,0.06)' }}
      >
        {[
          { id: 'prices', label: `Prices (${debugData?.prices?.length || 0})`, count: priceIssues.length },
          { id: 'icons', label: `Icons (${debugData?.icons?.length || 0})`, count: iconIssues.length },
          { id: 'components', label: `Components (${debugData?.components?.length || 0})` },
          { id: 'actions', label: 'Actions' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-3 py-1.5 text-[10px] font-bold whitespace-nowrap rounded transition-all relative"
            style={activeTab === tab.id ? {
              background: 'rgba(251,191,36,0.1)',
              color: '#fbbf24',
              border: '1px solid rgba(251,191,36,0.2)',
            } : { color: '#3d4f6b' }}
          >
            {tab.label}
            {tab.count ? (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black"
                style={{ background: '#ef4444', color: 'white' }}>
                {tab.count}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 text-[10px] font-mono">
        {activeTab === 'prices' && (
          <>
            {priceIssues.length > 0 && (
              <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', padding: '8px', borderRadius: '6px' }}>
                <p className="font-black text-red-400 mb-1">❌ {priceIssues.length} Issues Found:</p>
                {priceIssues.map((p, i) => (
                  <div key={i} className="mb-1 text-slate-400">
                    <p>• {p.component} ({p.symbol})</p>
                    <p className="text-red-400">  ❌ Field: {p.field}</p>
                  </div>
                ))}
              </div>
            )}
            {debugData?.prices && debugData.prices.slice(0, 8).map((p, i) => (
              <div key={i} style={{ background: 'rgba(100,150,255,0.05)', padding: '6px', borderRadius: '4px' }}>
                <p style={{ color: p.sourceType.includes('MARK') ? '#4ade80' : '#f87171' }}>
                  {p.sourceType} · {p.component}
                </p>
                <p className="text-slate-600">{p.symbol}: {p.value}</p>
              </div>
            ))}
          </>
        )}

        {activeTab === 'icons' && (
          <>
            {iconIssues.length > 0 && (
              <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', padding: '8px', borderRadius: '6px' }}>
                <p className="font-black text-red-400 mb-1">⚠️  {iconIssues.length} Fallbacks Used:</p>
                {iconIssues.map((i, idx) => (
                  <div key={idx} className="mb-1 text-slate-400">
                    <p>• {i.component} ({i.originalSymbol})</p>
                    <p className="text-yellow-400">  ⚠️  {i.fallbackUsed}</p>
                  </div>
                ))}
              </div>
            )}
            {debugData?.icons && debugData.icons.slice(0, 8).map((i, idx) => (
              <div key={idx} style={{ background: 'rgba(100,200,255,0.05)', padding: '6px', borderRadius: '4px' }}>
                <p style={{ color: i.iconUrl === '✅' ? '#4ade80' : '#f87171' }}>
                  {i.component}
                </p>
                <p className="text-slate-600">{i.originalSymbol} → {i.baseSymbol}</p>
              </div>
            ))}
          </>
        )}

        {activeTab === 'components' && (
          <>
            {debugData?.components && debugData.components.slice(0, 10).map((c, i) => (
              <div key={i} style={{ background: 'rgba(100,255,200,0.05)', padding: '6px', borderRadius: '4px' }}>
                <p style={{ color: '#00d4aa' }}>{c.component}</p>
                <p className="text-slate-600">{c.propsCount} props</p>
              </div>
            ))}
          </>
        )}

        {activeTab === 'actions' && (
          <div className="space-y-2">
            <button
              onClick={() => window.__DEBUG_TRADING?.clearAllCaches?.()}
              className="w-full px-3 py-2 rounded font-black text-white flex items-center justify-center gap-2 transition-all"
              style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)' }}
            >
              <RotateCcw className="w-3 h-3" />
              Clear All Caches
            </button>
            <button
              onClick={() => {
                const report = window.__DEBUG_TRADING?.generateDebugReport?.();
                console.log('Full Report:', report);
                alert('Debug report logged to console');
              }}
              className="w-full px-3 py-2 rounded font-black text-white flex items-center justify-center gap-2"
              style={{ background: 'rgba(100,200,255,0.15)', border: '1px solid rgba(100,200,255,0.3)' }}
            >
              <Download className="w-3 h-3" />
              Generate Report
            </button>
            <div style={{ background: 'rgba(148,163,184,0.05)', padding: '8px', borderRadius: '6px' }}>
              <p className="font-black text-slate-400 mb-1">Console Commands:</p>
              <code style={{ color: '#00d4aa', display: 'block', lineHeight: 1.4 }}>
                window.__DEBUG_TRADING.getData()
                <br />
                window.__DEBUG_TRADING.generateDebugReport()
                <br />
                window.__DEBUG_TRADING.clearAllCaches()
              </code>
            </div>
          </div>
        )}
      </div>

      {/* Footer stats */}
      <div
        className="flex items-center justify-between px-3 py-2 border-t text-[9px]"
        style={{ borderColor: 'rgba(148,163,184,0.06)', background: 'rgba(5,7,13,0.8)' }}
      >
        <span style={{ color: '#2a3348' }}>
          Issues: {priceIssues.length + iconIssues.length}
        </span>
        <span style={{ color: '#2a3348' }}>
          {new Date().toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}