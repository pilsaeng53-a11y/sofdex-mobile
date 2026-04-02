/**
 * Runtime Binding Debug System
 * Traces exact data sources, component names, and binding chains
 * 
 * Usage:
 * - logPriceSource(componentName, symbol, sourceObj, field, finalValue)
 * - logIconRender(componentName, originalSymbol, baseSymbol, iconUrl, fallbackUsed)
 * - logComponentRender(componentName, props)
 * - clearAllCaches()
 */

const IS_DEV = import.meta.env.DEV;
const DEBUG_KEY = '__DEBUG_TRADING_UI__';

// ─── Price Source Logging ────────────────────────────────────────────────────
export function logPriceSource(componentName, symbol, sourceObj, field, finalValue) {
  if (!IS_DEV) return;

  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const sourceType = (() => {
    if (field === 'mark' || field === 'markPrice') return 'MARK';
    if (field === 'last' || field === 'lastPrice') return 'LAST';
    if (field === 'index' || field === 'indexPrice') return 'INDEX';
    if (field === 'marketCap') return '❌ MARKET CAP (WRONG)';
    if (field === 'currentPrice' || field === 'price') return '⚠️ METADATA/SUMMARY';
    return `OTHER: ${field}`;
  })();

  const log = {
    timestamp,
    component: componentName,
    symbol,
    field,
    sourceType,
    value: finalValue,
    sourceKeys: sourceObj ? Object.keys(sourceObj).slice(0, 5) : null,
    sourceObjectType: sourceObj?.constructor?.name || typeof sourceObj,
  };

  console.group(`🔍 [PRICE SOURCE] ${componentName} / ${symbol}`);
  console.log(`📍 Field: ${field}`);
  console.log(`📊 Source Type: ${sourceType}`);
  console.log(`💰 Value: ${finalValue}`);
  console.log(`🔑 Available Keys: ${log.sourceKeys?.join(', ')}`);
  console.log(`🏗️ Source Object:`, sourceObj);
  console.table(log);
  console.groupEnd();

  // Store in window for inspection
  if (!window[DEBUG_KEY]) window[DEBUG_KEY] = {};
  if (!window[DEBUG_KEY].prices) window[DEBUG_KEY].prices = [];
  window[DEBUG_KEY].prices.push(log);
}

// ─── Icon Render Logging ─────────────────────────────────────────────────────
export function logIconRender(componentName, originalSymbol, baseSymbol, iconUrl, fallbackUsed) {
  if (!IS_DEV) return;

  const log = {
    timestamp: new Date().toISOString().split('T')[1].split('.')[0],
    component: componentName,
    originalSymbol,
    baseSymbol,
    iconUrl: iconUrl ? '✅' : '❌',
    urlValue: iconUrl || 'FALLBACK',
    fallbackUsed,
  };

  console.group(`🎨 [ICON RENDER] ${componentName} / ${originalSymbol}`);
  console.log(`📦 Base Symbol: ${baseSymbol}`);
  console.log(`🖼️  Icon URL: ${iconUrl ? '✅ LOADED' : '❌ FALLBACK'}`);
  if (iconUrl) console.log(`   ${iconUrl}`);
  if (fallbackUsed) console.warn(`⚠️  Fallback used: ${fallbackUsed}`);
  console.table(log);
  console.groupEnd();

  // Store in window for inspection
  if (!window[DEBUG_KEY]) window[DEBUG_KEY] = {};
  if (!window[DEBUG_KEY].icons) window[DEBUG_KEY].icons = [];
  window[DEBUG_KEY].icons.push(log);
}

// ─── Component Render Logging ────────────────────────────────────────────────
export function logComponentRender(componentName, props = {}) {
  if (!IS_DEV) return;

  const propsKeys = Object.keys(props || {});
  const log = {
    timestamp: new Date().toISOString().split('T')[1].split('.')[0],
    component: componentName,
    propsCount: propsKeys.length,
    props: propsKeys.slice(0, 8),
  };

  console.group(`⚙️  [COMPONENT RENDER] ${componentName}`);
  console.log(`📋 Props:`, props);
  console.table(log);
  console.groupEnd();

  if (!window[DEBUG_KEY]) window[DEBUG_KEY] = {};
  if (!window[DEBUG_KEY].components) window[DEBUG_KEY].components = [];
  window[DEBUG_KEY].components.push(log);
}

// ─── Icon Map Source Verification ───────────────────────────────────────────
export function logIconMapSource(endpoint, responseSize, keys) {
  if (!IS_DEV) return;

  const log = {
    timestamp: new Date().toISOString().split('T')[1].split('.')[0],
    endpoint,
    responseSize,
    keyCount: keys?.length || 0,
    sampleKeys: keys?.slice(0, 10),
  };

  console.group(`📡 [ICON MAP SOURCE]`);
  console.log(`🌐 Endpoint: ${endpoint}`);
  console.log(`📦 Response Size: ${responseSize} bytes`);
  console.log(`🔑 Total Keys: ${keys?.length || 0}`);
  console.table(log);
  console.groupEnd();

  if (!window[DEBUG_KEY]) window[DEBUG_KEY] = {};
  window[DEBUG_KEY].iconMap = log;
}

// ─── Cache Clearing ─────────────────────────────────────────────────────────
export function clearAllCaches() {
  console.warn('🧹 [CACHE CLEAR] Clearing all caches...');

  // LocalStorage caches
  const cacheKeys = [
    'sofdex_market_data',
    'sofdex_symbol_metadata',
    'sofdex_coin_icons',
    'sofdex_ticker_cache',
    'sofdex_orderly_symbols',
  ];

  cacheKeys.forEach(key => {
    localStorage.removeItem(key);
    console.log(`  ✅ Cleared: ${key}`);
  });

  // React Query caches (if available)
  const queryClient = window.__REACT_QUERY_CLIENT__;
  if (queryClient) {
    queryClient.clear();
    console.log('  ✅ Cleared React Query cache');
  }

  // Service worker caches (if available)
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        caches.delete(cacheName);
        console.log(`  ✅ Cleared SW cache: ${cacheName}`);
      });
    });
  }

  console.log('🧹 Cache clear complete. Hard refresh (Ctrl+Shift+R) recommended.');
}

// ─── Debug Report ───────────────────────────────────────────────────────────
export function generateDebugReport() {
  if (!window[DEBUG_KEY]) {
    console.log('No debug data collected yet.');
    return null;
  }

  const report = {
    timestamp: new Date().toISOString(),
    priceSourceCount: window[DEBUG_KEY].prices?.length || 0,
    iconRenderCount: window[DEBUG_KEY].icons?.length || 0,
    componentRenderCount: window[DEBUG_KEY].components?.length || 0,
    badPriceSources: window[DEBUG_KEY].prices?.filter(p => 
      p.sourceType.includes('WRONG') || p.sourceType.includes('METADATA')
    ) || [],
    missingIcons: window[DEBUG_KEY].icons?.filter(i => i.fallbackUsed) || [],
  };

  console.group('📊 [DEBUG REPORT]');
  console.log('Price Sources:', report.priceSourceCount);
  console.log('Icon Renders:', report.iconRenderCount);
  console.log('Component Renders:', report.componentRenderCount);
  if (report.badPriceSources.length > 0) {
    console.warn('❌ Bad Price Sources Found:', report.badPriceSources);
  }
  if (report.missingIcons.length > 0) {
    console.warn('❌ Missing Icons:', report.missingIcons);
  }
  console.table(report);
  console.groupEnd();

  return report;
}

// ─── Expose debug functions globally ─────────────────────────────────────────
if (IS_DEV && typeof window !== 'undefined') {
  window.__DEBUG_TRADING = {
    logPriceSource,
    logIconRender,
    logComponentRender,
    logIconMapSource,
    clearAllCaches,
    generateDebugReport,
    getData: () => window[DEBUG_KEY],
  };
  console.log('🔧 Debug system loaded. Use window.__DEBUG_TRADING for access.');
}