/**
 * PRICE ENGINE INITIALIZER
 * 
 * Starts the centralized Price Engine at app startup.
 * Continuously fetches real-time prices for all assets.
 * 
 * Call this in the root app component (Layout or App.jsx)
 */

import PriceEngine from './PriceEngine';
import { loadIconMap } from './coinIconMapService';

const CRITICAL_SYMBOLS = [
  // Crypto - top assets
  'BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'PEPE',
  // SOF - must always be live
  'SOF',
  // RWA - key commodities
  'GOLD-T', 'SILVER-T', 'CRUDE-T', 'SP500-T',
  // TradFi - major stocks
  'AAPLx', 'MSFTx', 'NVDAx', 'TSLAx',
];

const SECONDARY_SYMBOLS = [
  'AVAX', 'DOT', 'LINK', 'MATIC', 'LTC', 'ATOM', 'UNI', 'OP', 'ARB', 'SUI',
  'NEAR', 'FTM', 'AAVE', 'JUP', 'RNDR', 'INJ', 'TIA', 'SEI', 'APT', 'BONK',
  'HNT', 'RAY', 'GOOGLx', 'AMZNx', 'METAx', 'SPYx', 'QQQx',
];

let isInitialized = false;
let refreshIntervalId = null;

/**
 * Initialize Price Engine
 * - Fetch critical symbols immediately
 * - Set up auto-refresh for all symbols
 * - Call once at app startup
 */
export async function initializePriceEngine() {
  if (isInitialized) {
    console.log('[PriceEngine] Already initialized, skipping...');
    return;
  }

  try {
    console.log('[PriceEngine] Initializing...');

    // Load backend icon map in parallel with price fetch (non-blocking)
    loadIconMap(); // fire-and-forget — icons update reactively via listeners

    // Fetch critical symbols first (parallel)
    await PriceEngine.updatePrices(CRITICAL_SYMBOLS);
    console.log('[PriceEngine] Critical symbols loaded');

    // Fetch secondary symbols (parallel)
    await PriceEngine.updatePrices(SECONDARY_SYMBOLS);
    console.log('[PriceEngine] Secondary symbols loaded');

    // Set up auto-refresh: critical symbols every 10s, secondary every 30s
    startAutoRefresh();

    isInitialized = true;
    console.log('[PriceEngine] Ready');
  } catch (err) {
    console.error('[PriceEngine] Initialization failed:', err);
    // Still mark as initialized so we don't retry infinitely
    isInitialized = true;
  }
}

/**
 * Start auto-refresh cycles
 */
function startAutoRefresh() {
  if (refreshIntervalId) clearInterval(refreshIntervalId);

  // Refresh critical symbols every 10 seconds
  refreshIntervalId = setInterval(() => {
    PriceEngine.updatePrices(CRITICAL_SYMBOLS).catch(err => {
      console.warn('[PriceEngine] Critical refresh failed:', err.message);
    });
  }, 10000);

  // Refresh secondary symbols every 30 seconds
  setInterval(() => {
    PriceEngine.updatePrices(SECONDARY_SYMBOLS).catch(err => {
      console.warn('[PriceEngine] Secondary refresh failed:', err.message);
    });
  }, 30000);
}

/**
 * Stop auto-refresh (for cleanup)
 */
export function stopPriceEngineRefresh() {
  if (refreshIntervalId) {
    clearInterval(refreshIntervalId);
    refreshIntervalId = null;
  }
}

export { initializePriceEngine as default };