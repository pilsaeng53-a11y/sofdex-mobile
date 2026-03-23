/**
 * ExecutionToasts — shared execution feedback overlay.
 * Used by both FuturesTrade and CryptoTerminal.
 */
import React, { useState, useCallback } from 'react';

const TYPE_STYLES = {
  success: 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300',
  danger:  'bg-red-950/90 border-red-500/30 text-red-300',
  pending: 'bg-amber-950/90 border-amber-500/30 text-amber-300',
  info:    'bg-[#0f1525]/90 border-[rgba(148,163,184,0.15)] text-slate-300',
};

export default function ExecutionToasts({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-24 right-3 z-50 flex flex-col gap-1.5 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          className={`px-3 py-2 rounded-xl text-[11px] font-bold shadow-2xl border backdrop-blur-md fade-in ${TYPE_STYLES[t.type] ?? TYPE_STYLES.info}`}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

/**
 * useExecutionToasts — hook to manage toast state.
 * Returns [toasts, addToast]
 */
export function useExecutionToasts() {
  const [toasts, setToasts] = React.useState([]);
  const addToast = React.useCallback((msg, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev.slice(-4), { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);
  return [toasts, addToast];
}