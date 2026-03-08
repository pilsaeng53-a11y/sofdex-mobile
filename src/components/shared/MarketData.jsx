// Shared mock market data for the app
export const CRYPTO_MARKETS = [
  { symbol: "SOL", name: "Solana", price: 187.42, change: 5.23, volume: "2.8B", mcap: "82.1B", category: "crypto", leverage: "50x" },
  { symbol: "BTC", name: "Bitcoin", price: 98425.50, change: 2.14, volume: "38.2B", mcap: "1.93T", category: "crypto", leverage: "100x" },
  { symbol: "ETH", name: "Ethereum", price: 3842.18, change: -1.32, volume: "15.6B", mcap: "462B", category: "crypto", leverage: "75x" },
  { symbol: "JUP", name: "Jupiter", price: 1.24, change: 8.71, volume: "890M", mcap: "1.7B", category: "crypto", leverage: "20x" },
  { symbol: "RAY", name: "Raydium", price: 5.83, change: -2.45, volume: "245M", mcap: "1.1B", category: "crypto", leverage: "20x" },
  { symbol: "RNDR", name: "Render", price: 8.92, change: 12.34, volume: "412M", mcap: "4.6B", category: "crypto", leverage: "25x" },
  { symbol: "BONK", name: "Bonk", price: 0.0000234, change: -4.12, volume: "156M", mcap: "1.5B", category: "crypto", leverage: "10x" },
  { symbol: "HNT", name: "Helium", price: 8.45, change: 3.67, volume: "89M", mcap: "1.4B", category: "crypto", leverage: "15x" },
];

export const RWA_MARKETS = [
  { symbol: "GOLD-T", name: "Tokenized Gold", price: 2341.80, change: 0.87, volume: "124M", mcap: "18.2B", category: "rwa", yield: "0.0%", type: "Commodity" },
  { symbol: "TBILL", name: "US Treasury Bill", price: 100.24, change: 0.02, volume: "892M", mcap: "45.1B", category: "rwa", yield: "5.12%", type: "Treasury" },
  { symbol: "RE-NYC", name: "NYC Real Estate Fund", price: 52.40, change: 1.24, volume: "34M", mcap: "2.1B", category: "rwa", yield: "7.8%", type: "Real Estate" },
  { symbol: "SP500-T", name: "S&P 500 Tokenized", price: 5842.30, change: 0.45, volume: "234M", mcap: "12.4B", category: "rwa", yield: "1.2%", type: "Equity" },
  { symbol: "CRUDE-T", name: "Crude Oil Token", price: 78.92, change: -1.23, volume: "67M", mcap: "3.2B", category: "rwa", yield: "0.0%", type: "Commodity" },
  { symbol: "RE-DXB", name: "Dubai RE Portfolio", price: 124.50, change: 2.15, volume: "18M", mcap: "890M", category: "rwa", yield: "9.2%", type: "Real Estate" },
  { symbol: "EURO-B", name: "Euro Bond Token", price: 98.75, change: 0.11, volume: "156M", mcap: "8.4B", category: "rwa", yield: "3.8%", type: "Treasury" },
  { symbol: "TSLA-T", name: "Tesla Tokenized", price: 248.90, change: 3.45, volume: "89M", mcap: "5.6B", category: "rwa", yield: "0.0%", type: "Equity" },
];

export const TRADFI_MARKETS = [
  { symbol: "AAPL-T", name: "Apple Tokenized", price: 227.50, change: 1.23, volume: "156M", mcap: "8.2B", category: "tradfi" },
  { symbol: "MSFT-T", name: "Microsoft Token", price: 445.20, change: 0.89, volume: "112M", mcap: "6.1B", category: "tradfi" },
  { symbol: "NVDA-T", name: "NVIDIA Token", price: 892.40, change: 4.56, volume: "234M", mcap: "12.4B", category: "tradfi" },
];

export const ALL_MARKETS = [...CRYPTO_MARKETS, ...RWA_MARKETS, ...TRADFI_MARKETS];

export const GOVERNANCE_PROPOSALS = [
  { id: 1, title: "Increase SOFDex Staking Rewards to 12% APY", status: "active", yesPercent: 72, noPercent: 28, totalVotes: 1247892, endDate: "2026-03-15", description: "Proposal to increase staking rewards for SOFD token holders from 8% to 12% APY to incentivize long-term holding." },
  { id: 2, title: "Launch Tokenized Real Estate Market - Phase 2", status: "active", yesPercent: 89, noPercent: 11, totalVotes: 892341, endDate: "2026-03-20", description: "Expand RWA offerings to include European commercial real estate portfolios." },
  { id: 3, title: "Reduce Trading Fees for High Volume Traders", status: "passed", yesPercent: 94, noPercent: 6, totalVotes: 2341567, endDate: "2026-02-28", description: "Implement tiered fee structure reducing fees by up to 40% for institutional traders." },
  { id: 4, title: "Treasury Diversification into RWA Bonds", status: "passed", yesPercent: 67, noPercent: 33, totalVotes: 567234, endDate: "2026-02-15", description: "Allocate 15% of DAO treasury into tokenized government bonds for yield." },
  { id: 5, title: "Add Cross-Chain Bridge Support", status: "rejected", yesPercent: 38, noPercent: 62, totalVotes: 1123456, endDate: "2026-02-01", description: "Enable cross-chain asset transfers from Ethereum and Arbitrum." },
];

export function getMarketBySymbol(symbol) {
  return ALL_MARKETS.find(m => m.symbol === symbol);
}

export function formatPrice(price) {
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toFixed(2);
  if (price >= 0.01) return price.toFixed(4);
  return price.toFixed(8);
}

export function formatChange(change) {
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(2)}%`;
}