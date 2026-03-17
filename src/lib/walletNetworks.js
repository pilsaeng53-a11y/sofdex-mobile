// Network configuration for wallet system
export const NETWORKS = {
  solana: {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    icon: '◎',
    color: 'from-purple-500 to-pink-500',
    active: true,
    rpc: 'https://api.mainnet-beta.solana.com',
    explorer: 'https://solscan.io',
    fees: {
      transfer: 0.00025,
      deposit: 0,
      withdrawal: 0.00025,
    },
  },
  ethereum: {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    icon: '⟠',
    color: 'from-blue-500 to-blue-600',
    active: false,
    rpc: 'https://eth.llamarpc.com',
    explorer: 'https://etherscan.io',
    fees: {
      transfer: 0.001,
      deposit: 0,
      withdrawal: 0.001,
    },
  },
  tron: {
    id: 'tron',
    name: 'Tron',
    symbol: 'TRX',
    icon: '✦',
    color: 'from-red-500 to-red-600',
    active: false,
    rpc: 'https://api.trongrid.io',
    explorer: 'https://tronscan.org',
    fees: {
      transfer: 1,
      deposit: 0,
      withdrawal: 1,
    },
  },
  bsc: {
    id: 'bsc',
    name: 'BNB Chain',
    symbol: 'BNB',
    icon: '⬡',
    color: 'from-yellow-500 to-orange-500',
    active: false,
    rpc: 'https://bsc-rpc.publicnode.com',
    explorer: 'https://bscscan.com',
    fees: {
      transfer: 0.0005,
      deposit: 0,
      withdrawal: 0.0005,
    },
  },
};

// Asset configuration per network
export const ASSETS_BY_NETWORK = {
  solana: [
    { symbol: 'SOL', name: 'Solana', decimals: 9, mint: 'So11111111111111111111111111111111111111112' },
    { symbol: 'USDC', name: 'USD Coin', decimals: 6, mint: 'EPjFWaLb3hyccqaKfV8FppqaXm8EVPvnfr9sNNfMmqw' },
    { symbol: 'USDT', name: 'Tether USD', decimals: 6, mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenEsp' },
  ],
  ethereum: [
    { symbol: 'ETH', name: 'Ethereum', decimals: 18, address: '0x0000000000000000000000000000000000000000' },
    { symbol: 'USDC', name: 'USD Coin', decimals: 6, address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
    { symbol: 'USDT', name: 'Tether USD', decimals: 6, address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' },
  ],
  tron: [
    { symbol: 'TRX', name: 'Tron', decimals: 6, address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t' },
    { symbol: 'USDC', name: 'USD Coin', decimals: 6, address: 'TEkxrTeW1dspVnqYjLyvDVjmPjSMdLQy6b' },
    { symbol: 'USDT', name: 'Tether USD', decimals: 6, address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t' },
  ],
  bsc: [
    { symbol: 'BNB', name: 'Binance Coin', decimals: 18, address: '0x0000000000000000000000000000000000000000' },
    { symbol: 'USDC', name: 'USD Coin', decimals: 18, address: '0x8AC76a51cc950d9822D68b83FE1Ad97B32Cd580d' },
    { symbol: 'USDT', name: 'Tether USD', decimals: 18, address: '0x55d398326f99059fF775485246999027B3197955' },
  ],
};

export function getNetworkFee(network, type = 'transfer') {
  return NETWORKS[network]?.fees[type] || 0;
}

export function getAssetsForNetwork(network) {
  return ASSETS_BY_NETWORK[network] || [];
}

export function getNetworkByAsset(asset) {
  // For assets that exist on multiple networks, return primary
  if (asset === 'SOL') return 'solana';
  if (asset === 'USDT' || asset === 'USDC') return 'solana'; // Default to Solana
  if (asset === 'ETH') return 'ethereum';
  if (asset === 'TRX') return 'tron';
  if (asset === 'BNB') return 'bsc';
  return 'solana';
}