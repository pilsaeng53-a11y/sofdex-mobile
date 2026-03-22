/**
 * CoinIcon — renders a coin logo for any symbol format.
 *
 * Resolution order:
 *   1. GitHub CDN (spothq/cryptocurrency-icons via jsDelivr) — instant URL, no async
 *   2. coinIconService (CryptoCompare → CoinGecko) — for unknowns, async
 *   3. Colored initials fallback — always renders
 *
 * Accepts: "BTC" | "PERP_BTC_USDC" | "BTC-USDT" | "BTC/USDC"
 */

import { useState, useEffect } from 'react';
import { extractBase, getIconUrl } from '../../data/coinIconMap';
import { getCoinIcon, getCachedIcon, subscribeIcon } from '../../services/coinIconService';

const BRAND_COLORS = {
  BTC: '#f7931a', ETH: '#627eea', SOL: '#9945ff', BNB: '#f0b90b',
  XRP: '#00aae4', ARB: '#12aaff', LINK: '#2a5ada', UNI: '#ff007a',
  APT: '#00c4a0', TON: '#0088cc', DOGE: '#c2a633', AVAX: '#e84142',
  MATIC: '#8247e5', POL: '#8247e5', OP: '#ff0420', ATOM: '#6f4cff',
  DOT: '#e6007a', ADA: '#0033ad', INJ: '#00afe1', SUI: '#6fbcf0',
  PEPE: '#4aab15', NEAR: '#00c08b', LTC: '#bfbbbb', BCH: '#4cca41',
  DYDX: '#6966ff', WIF: '#c2a633', BONK: '#f7931a', SHIB: '#e2760b',
};

function brandColor(base) {
  return BRAND_COLORS[base?.toUpperCase()] ?? '#00d4aa';
}

export default function CoinIcon({ symbol, size = 24, className = '' }) {
  const base = extractBase(symbol);

  // Try CDN map first (synchronous)
  const cdnUrl = getIconUrl(base);

  const [url,    setUrl]    = useState(cdnUrl);
  const [loaded, setLoaded] = useState(false);
  const [error,  setError]  = useState(false);

  useEffect(() => {
    const b = extractBase(symbol);
    const cdn = getIconUrl(b);

    if (cdn) {
      setUrl(cdn);
      setLoaded(false);
      setError(false);
      return;
    }

    // Not in CDN map → try async service
    const cached = getCachedIcon(b);
    setUrl(cached ?? null);
    setLoaded(false);
    setError(false);

    if (cached === undefined) {
      // Kick off resolution and subscribe to result
      getCoinIcon(b);
      const unsub = subscribeIcon(b, () => {
        const resolved = getCachedIcon(b) ?? null;
        console.debug('[CoinIcon] service resolved', b, resolved);
        setUrl(resolved);
        setError(false);
      });
      return unsub;
    }
  }, [symbol]);

  const color    = brandColor(base);
  const initials = base.slice(0, 2) || '?';
  const showImg  = !!url && !error;

  return (
    <div
      className={`relative flex-shrink-0 rounded-full overflow-hidden flex items-center justify-center select-none ${className}`}
      style={{
        width:      size,
        height:     size,
        background: showImg && loaded ? 'transparent' : `${color}1a`,
        border:     `1px solid ${color}33`,
      }}
    >
      {/* Colored initials — visible until image loads */}
      {(!showImg || !loaded) && (
        <span style={{
          fontSize:      size * 0.37,
          fontWeight:    800,
          color,
          letterSpacing: '-0.03em',
          lineHeight:    1,
          pointerEvents: 'none',
        }}>
          {initials}
        </span>
      )}

      {showImg && (
        <img
          src={url}
          alt={base}
          width={size}
          height={size}
          onLoad={()  => { setLoaded(true); }}
          onError={() => {
            console.warn('[CoinIcon] img failed', base, url);
            setError(true);
          }}
          style={{
            position:   'absolute',
            inset:      0,
            width:      '100%',
            height:     '100%',
            objectFit:  'cover',
            opacity:    loaded ? 1 : 0,
            transition: 'opacity 0.2s ease',
          }}
        />
      )}
    </div>
  );
}