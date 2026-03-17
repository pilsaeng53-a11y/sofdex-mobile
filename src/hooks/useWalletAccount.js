import { useWallet } from '../components/shared/WalletContext';
import { useSolanaBalances } from './useSolanaBalances';
import { useState, useEffect } from 'react';

/**
 * useWalletAccount
 * 
 * Provides a unified account context for the connected wallet.
 * - Returns wallet identity, balances, and account metadata
 * - Ensures Wallet and Portfolio use the same data source
 * - Handles multi-network future support
 */
export function useWalletAccount() {
  const { isConnected, address, shortAddress, walletName, disconnect } = useWallet();
  const { balances, prices, loading, error } = useSolanaBalances(isConnected ? address : null);
  const [accountData, setAccountData] = useState(null);

  // Calculate total portfolio value
  const calculateTotalValue = () => {
    if (!balances) return 0;
    return (
      balances.SOL.value +
      balances.USDC.value +
      balances.USDT.value +
      (balances.SOF?.value || 0)
    );
  };

  // Build account data object
  useEffect(() => {
    if (!isConnected || !balances) {
      setAccountData(null);
      return;
    }

    setAccountData({
      // Wallet Identity
      walletAddress: address,
      walletAddressShort: shortAddress,
      walletProvider: walletName,
      isConnected: true,
      network: 'solana', // Current active network

      // Balances
      balances: {
        SOL: balances.SOL.balance,
        USDC: balances.USDC.balance,
        USDT: balances.USDT.balance,
        SOF: balances.SOF?.balance || 0,
      },

      // Values (USD)
      values: {
        SOL: balances.SOL.value,
        USDC: balances.USDC.value,
        USDT: balances.USDT.value,
        SOF: balances.SOF?.value || 0,
      },

      // Prices
      prices: {
        SOL: prices.SOL,
        USDC: prices.USDC,
        USDT: prices.USDT,
        SOF: prices.SOF,
      },

      // Summary
      totalValue: calculateTotalValue(),
      assetCount: [balances.SOL, balances.USDC, balances.USDT, balances.SOF].filter(b => b.balance > 0).length,

      // Status
      loading,
      error,
      lastUpdated: new Date().toISOString(),
    });
  }, [isConnected, address, shortAddress, walletName, balances, prices, loading, error]);

  return {
    // Account data
    account: accountData,
    isConnected,
    
    // For disconnecting
    disconnect,
    
    // Raw balances
    balances,
    prices,
    loading,
    error,
  };
}