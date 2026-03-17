/**
 * Wallet Gate Hook
 * 
 * Use this hook to require wallet connection for specific actions.
 * Handles modal opening, action callback, and wallet state management.
 * 
 * Usage:
 *   const { gateAction } = useWalletGate();
 *   const handleBuyClick = () => {
 *     gateAction(() => { executeBuy(); }, 'Connect your wallet to place trades');
 *   };
 */

import { useCallback } from 'react';
import { useWallet } from '@/components/shared/WalletContext';

/**
 * Action-level wallet gating
 * 
 * Returns: { 
 *   gateAction(callback, message?, title?) -> triggers action only if wallet connected
 *   isConnected -> wallet connection status
 * }
 */
export function useWalletGate() {
  const { isConnected, requireWallet } = useWallet();

  /**
   * Gate an action behind wallet connection
   * 
   * @param {function} callback - Function to execute after wallet connect
   * @param {string} message - Custom message for modal (optional)
   * @param {string} title - Custom title for modal (optional)
   */
  const gateAction = useCallback((callback, message = null, title = null) => {
    if (isConnected) {
      // Wallet already connected, execute immediately
      callback?.();
      return true;
    }

    // Not connected, show modal with callback
    const result = requireWallet(callback);
    
    // If modal needs custom message, it would be passed via context
    // For now, default modal is shown
    return result;
  }, [isConnected, requireWallet]);

  return {
    gateAction,
    isConnected,
    requireWallet,
  };
}

export default useWalletGate;