import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

const WalletContext = createContext(null);

// Detect installed wallets from window providers
function detectWallets() {
  const detected = {};
  if (typeof window === 'undefined') return detected;
  if (window.phantom?.solana?.isPhantom) detected.phantom = window.phantom.solana;
  if (window.solflare?.isSolflare) detected.solflare = window.solflare;
  if (window.backpack?.isBackpack) detected.backpack = window.backpack;
  // Also check window.solana for older Phantom versions
  if (!detected.phantom && window.solana?.isPhantom) detected.phantom = window.solana;
  return detected;
}

function shortenAddress(addr) {
  if (!addr) return '';
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

export function WalletProvider({ children }) {
  const [walletState, setWalletState] = useState(() => {
    // Try to restore from session
    try {
      const saved = sessionStorage.getItem('sofdex_wallet');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { isConnected: false, address: null, walletName: null };
  });

  const [showModal, setShowModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const onConnectRef = useRef(null);

  const { isConnected, address, walletName } = walletState;

  // Persist to session
  useEffect(() => {
    try { sessionStorage.setItem('sofdex_wallet', JSON.stringify(walletState)); } catch {}
  }, [walletState]);

  // Watch for wallet disconnect events
  useEffect(() => {
    if (!isConnected || !walletName) return;
    const wallets = detectWallets();
    const provider = wallets[walletName.toLowerCase()];
    if (!provider) return;

    const handleDisconnect = () => {
      setWalletState({ isConnected: false, address: null, walletName: null });
      try { sessionStorage.removeItem('sofdex_wallet'); } catch {}
    };

    provider.on?.('disconnect', handleDisconnect);
    return () => provider.off?.('disconnect', handleDisconnect);
  }, [isConnected, walletName]);

  // Re-validate connection on mount (wallet may have been disconnected externally)
  useEffect(() => {
    if (!walletState.isConnected || !walletState.walletName) return;
    const wallets = detectWallets();
    const provider = wallets[walletState.walletName.toLowerCase()];
    // If wallet provider not found (extension not installed), clear state
    if (!provider) {
      setWalletState({ isConnected: false, address: null, walletName: null });
      try { sessionStorage.removeItem('sofdex_wallet'); } catch {}
    }
  }, []);

  const connect = useCallback(async (name) => {
    const wallets = detectWallets();
    const key = name.toLowerCase();
    const provider = wallets[key];

    if (!provider) {
      // Wallet not installed — throw error without redirect
      throw new Error(`${name} wallet is not installed. Please install the ${name} extension and try again.`);
    }

    try {
      let resp;
      let addr;

      // Handle Backpack specific connection flow
      if (key === 'backpack' && window.backpack) {
        try {
          resp = await window.backpack.connect();
          addr = resp?.publicKey?.toString();
        } catch (backpackErr) {
          // If connect fails, try the provider method
          if (provider.connect) {
            resp = await provider.connect();
            addr = resp?.publicKey?.toString();
          } else {
            throw backpackErr;
          }
        }
      } else {
        // Standard wallet connection for Phantom, Solflare
        resp = await provider.connect();
        addr = resp?.publicKey?.toString() || provider.publicKey?.toString();
      }

      if (!addr) throw new Error(`${name} did not return a wallet address`);

      const newState = { isConnected: true, address: addr, walletName: name };
      setWalletState(newState);
      setShowModal(false);

      // Execute pending action if any
      if (onConnectRef.current) {
        onConnectRef.current();
        onConnectRef.current = null;
        setPendingAction(null);
      }

      return addr;
    } catch (err) {
      if (err.code === 4001 || err.message?.includes('rejected')) {
        throw new Error('Connection rejected by user');
      }
      throw err;
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (walletName) {
      const wallets = detectWallets();
      const provider = wallets[walletName.toLowerCase()];
      try { await provider?.disconnect?.(); } catch {}
    }
    setWalletState({ isConnected: false, address: null, walletName: null });
    try { sessionStorage.removeItem('sofdex_wallet'); } catch {}
  }, [walletName]);

  /**
   * Call this when a gated action is triggered.
   * If connected → returns true immediately.
   * If not → opens modal. Pass a callback to auto-resume after connect.
   */
  const requireWallet = useCallback((onConnectedCallback = null) => {
    if (isConnected) return true;
    onConnectRef.current = onConnectedCallback;
    setPendingAction(onConnectedCallback ? 'pending' : null);
    setShowModal(true);
    return false;
  }, [isConnected]);

  const installedWallets = detectWallets();

  return (
    <WalletContext.Provider value={{
      isConnected,
      address,
      shortAddress: shortenAddress(address),
      walletName,
      connect,
      disconnect,
      requireWallet,
      showModal,
      setShowModal,
      installedWallets,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside WalletProvider');
  return ctx;
}