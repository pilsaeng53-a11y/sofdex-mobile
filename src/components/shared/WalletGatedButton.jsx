/**
 * Wallet-Gated Action Button
 * 
 * Renders a button that requires wallet connection for restricted actions.
 * Opens modal automatically if user not connected.
 * 
 * Usage:
 *   <WalletGatedButton
 *     requiresWallet={true}
 *     onClick={handleBuy}
 *     walletMessage="Connect your wallet to place trades"
 *   >
 *     Buy
 *   </WalletGatedButton>
 */

import React from 'react';
import { useWalletGate } from '@/hooks/useWalletGate';

export default function WalletGatedButton({
  requiresWallet = false,
  onClick,
  walletMessage = 'Connect your wallet to access this feature',
  className = '',
  disabled = false,
  children,
  ...props
}) {
  const { gateAction, isConnected } = useWalletGate();

  const handleClick = () => {
    if (!requiresWallet || isConnected) {
      // Action allowed, execute directly
      onClick?.();
    } else {
      // Action requires wallet, gate it
      gateAction(onClick, walletMessage);
    }
  };

  // Visually indicate if action requires wallet and user isn't connected
  const needsWallet = requiresWallet && !isConnected;
  const buttonClassName = `${className} ${needsWallet ? 'opacity-70 cursor-pointer' : ''}`;

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={buttonClassName}
      title={needsWallet ? walletMessage : undefined}
      {...props}
    >
      {children}
    </button>
  );
}