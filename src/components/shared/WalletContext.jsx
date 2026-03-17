import React, { createContext, useContext, useState, useCallback } from 'react';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [isConnected, setIsConnected] = useState(() => {
    try { return !!localStorage.getItem('sofdex_wallet_connected'); } catch { return false; }
  });
  const [showModal, setShowModal] = useState(false);

  const connect = useCallback((walletName = 'wallet') => {
    try { localStorage.setItem('sofdex_wallet_connected', '1'); } catch {}
    setIsConnected(true);
    setShowModal(false);
  }, []);

  const disconnect = useCallback(() => {
    try { localStorage.removeItem('sofdex_wallet_connected'); } catch {}
    setIsConnected(false);
  }, []);

  /** Call this when user tries a gated action while not connected. */
  const requireWallet = useCallback(() => {
    if (isConnected) return true;
    setShowModal(true);
    return false;
  }, [isConnected]);

  return (
    <WalletContext.Provider value={{ isConnected, connect, disconnect, requireWallet, showModal, setShowModal }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside WalletProvider');
  return ctx;
}