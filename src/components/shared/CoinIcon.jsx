/**
 * CoinIcon — renders a coin logo from the dedicated icon service.
 *
 * Data flow:
 *   coinIconService (CryptoCompare CDN → CryptoCompare API → CoinGecko)
 *     → getCachedIcon() (sync, immediate)
 *     → subscribeIcon()  (notified when async resolution finishes)
 *
 * Never touches Orderly or any trading/price data.
 * Shows branded colored initials as placeholder while loading or on failure.
 */

import { useState, useEffect, useCallback } from 'react';
import { getCoinIcon, getCachedIcon, subscribeIcon } from '../../services/coinIconService';

// Brand colors per symbol (used for placeholder + border tint)
const BRAND_COLORS = {
  BTC:  '#f7931a', ETH:  '#627eea', SOL:  '#9945ff', BNB:  '#f0b90b',
  XRP:  '#00aae4', ARB:  '#12aaff', LINK: '#2a5ada', UNI:  '#ff007a',
  APT:  '#00c4a0', TON:  '#0088cc', DOGE: '#c2a633', AVAX: '#e84142',
  MATIC:'#8247e5', POL:  '#8247e5', OP:   '#ff0420', ATOM: '#6f4cff',
  DOT:  '#e6007a', ADA:  '#0033ad', INJ:  '#00afe1', SUI:  '#6fbcf0',
  PEPE: '#4aab15', WIF:  '#c2a633', BONK: '#f7931a', SHIB: '#e2760b',
  ENA:  '#0f766e', SEI:  '#c21e56', NEAR: '#00c08b', FIL:  '#0090ff',
  LTC:  '#bfbbbb', BCH:  '#4cca41', ICP:  '#f15a24', STRK: '#ec796b',
  BLUR: '#ff7700', GMX:  '#2d42fc', DYDX: '#6966ff', ZK:   '#1755f4',
  TIA:  '#7b2bf9', JUP:  '#c7f284', PYTH: '#e5294c', WLD:  '#000000',
};

function getBrandColor(symbol) {
  return BRAND_COLORS[symbol?.toUpperCase()] ?? '#00d4aa';
}

export default function CoinIcon({ symbol, size = 24, className = '' }) {
  const key = symbol?.toUpperCase() ?? '';

  // Initialize from sync cache immediately — no flicker on re-renders
  const [url,     setUrl]     = useState(() => getCachedIcon(key) ?? null);
  const [imgOk,   setImgOk]   = useState(false);
  const [imgErr,  setImgErr]  = useState(false);

  // When symbol changes, reset image state and re-read cache
  useEffect(() => {
    if (!key) return;
    const cached = getCachedIcon(key);
    setUrl(cached ?? null);
    setImgOk(false);
    setImgErr(false);

    // If not cached yet, trigger resolution and subscribe to completion
    if (cached === undefined) {
      getCoinIcon(key); // fire-and-forget
      const unsub = subscribeIcon(key, () => {
        setUrl(getCachedIcon(key) ?? null);
      });
      return unsub;
    }
  }, [key]);

  const color    = getBrandColor(symbol);
  const initials = key.slice(0, 2) || '?';
  const showImg  = url && !imgErr;

  return (
    <div
      className={`relative flex-shrink-0 rounded-full overflow-hidden flex items-center justify-center select-none ${className}`}
      style={{
        width:      size,
        height:     size,
        background: showImg && imgOk ? 'transparent' : `${color}1a`,
        border:     `1px solid ${color}33`,
        transition: 'background 0.2s ease',
      }}
    >
      {/* Colored initials — visible while loading or on error */}
      {(!showImg || !imgOk) && (
        <span
          style={{
            fontSize:      size * 0.37,
            fontWeight:    800,
            color,
            letterSpacing: '-0.03em',
            lineHeight:    1,
          }}
        >
          {initials}
        </span>
      )}

      {/* Actual coin image */}
      {showImg && (
        <img
          src={url}
          alt={symbol}
          width={size}
          height={size}
          onLoad={() => setImgOk(true)}
          onError={() => setImgErr(true)}
          style={{
            position:   'absolute',
            inset:      0,
            width:      '100%',
            height:     '100%',
            objectFit:  'cover',
            opacity:    imgOk ? 1 : 0,
            transition: 'opacity 0.2s ease',
          }}
        />
      )}
    </div>
  );
}