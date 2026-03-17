import { useState, useEffect } from 'react';

// Solana mainnet RPC endpoint
const RPC_URL = 'https://api.mainnet-beta.solana.com';

// SPL Token mint addresses on Solana mainnet
const TOKEN_MINTS = {
  SOL: 'SOL', // Native SOL (special case)
  USDC: 'EPjFWaJgt5XujHYrLmq6TPB3UjCChZ735W5PD7jneperry', // USDC on Solana
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenErt', // USDT on Solana (Tether)
  SOF: 'Safes1Tik6Nyvka66MF684zWond3d3iMgnq4XwKcqWn', // SOF token (if exists)
};

const PRICE_API = 'https://api.coingecko.com/api/v3';

async function fetchSolBalance(address) {
  try {
    const response = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getBalance',
        params: [address],
      }),
    });
    const data = await response.json();
    if (data.result) {
      return data.result.value / 1e9; // Convert lamports to SOL
    }
    return 0;
  } catch (err) {
    console.error('Failed to fetch SOL balance:', err);
    return 0;
  }
}

async function fetchSplTokenBalance(address, mintAddress) {
  try {
    const response = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'getTokenAccountsByOwner',
        params: [
          address,
          { mint: mintAddress },
          { encoding: 'jsonParsed' },
        ],
      }),
    });
    const data = await response.json();
    if (data.result && data.result.value.length > 0) {
      const account = data.result.value[0];
      const amount = account.account.data.parsed.info.tokenAmount.uiAmount;
      return amount || 0;
    }
    return 0;
  } catch (err) {
    console.error(`Failed to fetch SPL token balance for ${mintAddress}:`, err);
    return 0;
  }
}

async function fetchTokenPrices() {
  try {
    const response = await fetch(
      `${PRICE_API}/simple/price?ids=solana,usd-coin,tether&vs_currencies=usd`
    );
    const data = await response.json();
    return {
      SOL: data.solana?.usd || 0,
      USDC: data['usd-coin']?.usd || 1,
      USDT: data.tether?.usd || 1,
      SOF: 0, // Will be 0 if not available
    };
  } catch (err) {
    console.error('Failed to fetch token prices:', err);
    return { SOL: 0, USDC: 1, USDT: 1, SOF: 0 };
  }
}

export function useSolanaBalances(walletAddress) {
  const [balances, setBalances] = useState(null);
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!walletAddress) {
      setBalances(null);
      return;
    }

    const fetchBalances = async () => {
      setLoading(true);
      setError(null);
      try {
        const [solBal, usdcBal, usdtBal, prices] = await Promise.all([
          fetchSolBalance(walletAddress),
          fetchSplTokenBalance(walletAddress, TOKEN_MINTS.USDC),
          fetchSplTokenBalance(walletAddress, TOKEN_MINTS.USDT),
          fetchTokenPrices(),
        ]);

        setPrices(prices);
        setBalances({
          SOL: { balance: solBal, value: solBal * (prices.SOL || 0) },
          USDC: { balance: usdcBal, value: usdcBal * (prices.USDC || 1) },
          USDT: { balance: usdtBal, value: usdtBal * (prices.USDT || 1) },
          SOF: { balance: 0, value: 0 },
        });
      } catch (err) {
        setError(err.message || 'Failed to fetch balances');
        setBalances({
          SOL: { balance: 0, value: 0 },
          USDC: { balance: 0, value: 0 },
          USDT: { balance: 0, value: 0 },
          SOF: { balance: 0, value: 0 },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
    // Refresh every 30 seconds
    const interval = setInterval(fetchBalances, 30000);
    return () => clearInterval(interval);
  }, [walletAddress]);

  return { balances, prices, loading, error };
}