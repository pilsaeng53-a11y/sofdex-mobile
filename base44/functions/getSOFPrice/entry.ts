/**
 * getSOFPrice — Fetch real SOF token price from on-chain Raydium liquidity
 *
 * Flow:
 * 1. Try DexScreener (fastest, if pair indexed)
 * 2. Try Raydium direct API (on-chain liquidity)
 * 3. Try Jupiter aggregator (protocol swap price)
 * 4. Return error state (no liquidity)
 *
 * No placeholder values — always real or error state.
 */

const SOF_MINT = '4qNEbbP5b3sEAxPxnzGzVtjvEjP2e4raGWJnyRm3z9A3';
const USDC_MINT = 'EPjFWaLb3odccccLg9PgL4uCccV1EUK97ikCh5UYUR9e';

async function fetchFromDexScreener() {
  try {
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${SOF_MINT}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) throw new Error('DexScreener not available');
    const json = await res.json();
    const pairs = json?.pairs || [];
    
    // Find SOF/USDC or SOF/SOL pair with best liquidity
    const pair = pairs
      .filter(p => {
        const base = p.baseToken?.address;
        const quote = p.quoteToken?.address;
        return (
          (base === SOF_MINT && (quote === USDC_MINT || quote === '11111111111111111111111111111111')) ||
          (quote === SOF_MINT && (base === USDC_MINT || base === '11111111111111111111111111111111'))
        );
      })
      .sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];

    if (pair && pair.priceUsd && parseFloat(pair.priceUsd) > 0) {
      return {
        price: parseFloat(pair.priceUsd),
        change24h: pair.priceChange?.h24 ?? 0,
        liquidity: pair.liquidity?.usd || 0,
        volume24h: pair.volume?.h24 || 0,
        source: 'dexscreener',
      };
    }
  } catch (err) {
    console.log('DexScreener error:', err.message);
  }
  return null;
}

async function fetchFromRaydium() {
  try {
    // Raydium's amminfo API for SOF pools
    const res = await fetch(
      'https://api.raydium.io/v2/main/pairs',
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) throw new Error('Raydium API error');
    const data = await res.json();
    
    // Find SOF/USDC pool
    const sofPool = data.find(pool => {
      const tokens = [pool.baseMint, pool.quoteMint].map(m => m?.toLowerCase());
      const hasSof = tokens.includes(SOF_MINT.toLowerCase());
      const hasUsdc = tokens.includes(USDC_MINT.toLowerCase());
      return hasSof && hasUsdc;
    });

    if (sofPool) {
      // Calculate price from pool reserves
      const baseMint = sofPool.baseMint?.toLowerCase();
      const baseReserve = parseFloat(sofPool.baseReserve || 0);
      const quoteReserve = parseFloat(sofPool.quoteReserve || 0);

      let price = 0;
      if (baseMint === SOF_MINT.toLowerCase()) {
        price = quoteReserve / baseReserve; // Quote per base (USDC per SOF)
      } else {
        price = baseReserve / quoteReserve; // Base per quote (SOF per USDC)
        price = 1 / price;
      }

      if (price > 0) {
        return {
          price,
          change24h: 0,
          liquidity: sofPool.liquidityUsd || 0,
          volume24h: sofPool.volume24h || 0,
          source: 'raydium',
        };
      }
    }
  } catch (err) {
    console.log('Raydium error:', err.message);
  }
  return null;
}

async function fetchFromJupiter() {
  try {
    // Jupiter price API
    const res = await fetch(
      `https://price.jup.ag/v6/price?ids=${SOF_MINT}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) throw new Error('Jupiter API error');
    const json = await res.json();
    
    const priceData = json?.data?.[SOF_MINT];
    if (priceData && priceData.price > 0) {
      return {
        price: priceData.price,
        change24h: 0,
        liquidity: 0,
        volume24h: 0,
        source: 'jupiter',
      };
    }
  } catch (err) {
    console.log('Jupiter error:', err.message);
  }
  return null;
}

async function fetchFromBirdeye() {
  try {
    // Birdeye API (no auth key needed for basic quote)
    const res = await fetch(
      `https://public-api.birdeye.so/public/token/${SOF_MINT}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) throw new Error('Birdeye API error');
    const json = await res.json();
    
    if (json?.data?.price > 0) {
      return {
        price: json.data.price,
        change24h: json.data?.priceChange24h || 0,
        liquidity: 0,
        volume24h: json.data?.volume24h || 0,
        source: 'birdeye',
      };
    }
  } catch (err) {
    console.log('Birdeye error:', err.message);
  }
  return null;
}

Deno.serve(async (req) => {
  // Accept both GET and POST
  if (!['GET', 'POST'].includes(req.method)) {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    // Try sources in priority order
    console.log('[SOF Price] Attempting DexScreener...');
    let result = await fetchFromDexScreener();
    
    if (!result) {
      console.log('[SOF Price] DexScreener failed, trying Jupiter...');
      result = await fetchFromJupiter();
    }
    
    if (!result) {
      console.log('[SOF Price] Jupiter failed, trying Birdeye...');
      result = await fetchFromBirdeye();
    }
    
    if (!result) {
      console.log('[SOF Price] Birdeye failed, trying Raydium...');
      result = await fetchFromRaydium();
    }

    // If still no result, return error (not placeholder price)
    if (!result) {
      console.log('[SOF Price] All sources failed');
      return Response.json({
        success: false,
        price: null,
        change24h: null,
        liquidity: null,
        volume24h: null,
        error: 'No liquidity / price unavailable',
        source: 'none',
      }, { status: 200 });
    }

    console.log(`[SOF Price] Success from ${result.source}: $${result.price}`);
    return Response.json({
      success: true,
      price: result.price,
      change24h: result.change24h,
      liquidity: result.liquidity,
      volume24h: result.volume24h,
      error: null,
      source: result.source,
    }, { status: 200 });
  } catch (err) {
    console.error('[SOF Price] Error:', err.message);
    return Response.json({
      success: false,
      price: null,
      change24h: null,
      liquidity: null,
      volume24h: null,
      error: err.message,
      source: 'none',
    }, { status: 200 });
  }
});