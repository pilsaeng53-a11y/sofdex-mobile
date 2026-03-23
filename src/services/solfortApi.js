/**
 * solfortApi.js
 * Centralized client for the SolFort live backend API.
 * Base URL: https://solfort-api.onrender.com
 *
 * All frontend data must flow through this module.
 * No mock data, no local JSON, no hardcoded prices.
 */

const BASE_URL = 'https://solfort-api.onrender.com';

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`API ${path} failed: HTTP ${res.status}`);
  return res.json();
}

// ─── Market Data ─────────────────────────────────────────────
/**
 * GET /market-data
 * Returns normalized array: [{symbol, normalizedSymbol, liveTradingPrice}]
 */
export async function getMarketData() {
  const res = await apiFetch('/market-data');
  // Unwrap { success, data: [...] } envelope
  return Array.isArray(res) ? res : (res.data ?? []);
}

/** GET /symbols — all tradable symbol definitions */
export async function getSymbols() {
  return apiFetch('/symbols');
}

/** GET /coin-icons — symbol → icon URL map */
export async function getCoinIcons() {
  return apiFetch('/coin-icons');
}

// ─── Sales Submission ─────────────────────────────────────────
/**
 * POST /sales/submit
 * @param {object} payload
 * @param {string} payload.customerName
 * @param {string} payload.walletAddress
 * @param {number} payload.sales         - USDT매출
 * @param {number} payload.quantity      - 수량
 * @param {number} payload.price         - SOF 단가
 * @param {number} payload.promotion     - 프로모션 비율 (%)
 * @param {number} payload.sofAmount     - 최종 SOF 수량
 */
export async function submitSale(payload) {
  return apiFetch('/sales/submit', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ─── Price resolver ──────────────────────────────────────────
/**
 * Resolve canonical trading price from any API ticker object.
 * Priority: liveTradingPrice → markPrice → lastPrice → indexPrice
 * NEVER use market cap, fdv, metadata, or summary price.
 */
export function resolveTradingPrice(ticker) {
  if (!ticker) return { price: 0, source: 'none' };
  const live  = Number(ticker.liveTradingPrice ?? 0);
  const mark  = Number(ticker.markPrice  ?? 0);
  const last  = Number(ticker.lastPrice  ?? 0);
  const index = Number(ticker.indexPrice ?? 0);
  if (live  > 0) return { price: live,  source: 'live'  };
  if (mark  > 0) return { price: mark,  source: 'mark'  };
  if (last  > 0) return { price: last,  source: 'last'  };
  if (index > 0) return { price: index, source: 'index' };
  return             { price: 0,     source: 'none'  };
}

// ─── Symbol normalizer ────────────────────────────────────────
/**
 * Extract base symbol from any exchange format.
 * ETH-PERP → ETH | PERP_ETH_USDC → ETH | ETH-USDT → ETH
 */
export function normalizeSymbol(raw) {
  if (!raw) return '';
  let s = String(raw).toUpperCase();
  // Remove common suffixes/prefixes
  s = s.replace(/^PERP_/, '').replace(/-PERP$/, '').replace(/-USDT$/, '').replace(/-USDC$/, '').replace(/_USDT$/, '').replace(/_USDC$/, '');
  // For PERP_ETH_USDC format: take first segment after removing prefix
  const parts = s.split(/[-_]/);
  // Return first part that isn't a stablecoin/suffix
  const stables = new Set(['USDT', 'USDC', 'BUSD', 'DAI', 'PERP', 'SWAP', 'FUTURES']);
  return parts.find(p => !stables.has(p)) ?? parts[0];
}