/**
 * CoinIcon — renders a coin logo.
 *
 * Priority:
 *   1. Local map (data/coinIconMap.js) — instant, no network
 *   2. coinIconService (CryptoCompare CDN → CoinGecko) — async fallback
 *   3. Colored initials — always works offline
 *
 * Accepts any symbol format: "BTC", "PERP_BTC_USDC", "BTC-USDT"
 */

import { useState, useEffect } from 'react';
import { extractBase, getIconUrl } from '../../data/coinIconMap';
import { getCoinIcon, getCachedIcon, subscribeIcon } from '../../services/coinIconService';

// Brand colors per base symbol
const BRAND_COLORS = {
  BTC:  '#f7931a', ETH:  '#627eea', SOL:  '#9945ff', BNB:  '#f0b90b',
  XRP:  '#00aae4', ARB:  '#12aaff', LINK: '#2a5ada', UNI:  '#ff007a',
  APT:  '#00c4a0', TON:  '#0088cc', DOGE: '#c2a633', AVAX: '#e84142',
  MATIC:'#8247e5', POL:  '#8247e5', OP:   '#ff0420', ATOM: '#6f4cff',
  DOT:  '#e6007a', ADA:  '#0033ad', INJ:  '#00afe1', SUI:  '#6fbcf0',
  PEPE: '#4aab15', WIF:  '#c2a633', BONK: '#f7931a', SHIB: '#e2760b',
  ENA:  '#0f766e', SEI:  '#c21e56', NEAR: '#00c08b', FIL:  '#0090ff',
  LTC:  '#bfbbbb', BCH:  '#4cca41', ICP:  '#f15a24', STRK: '#ec796b',
};

function getBrandColor(base) {
  return BRAND_COLORS[base?.toUpperCase()] ?? '#00d4aa';
}

export default function CoinIcon({ symbol, size = 24, className = '' }) {
  // Always normalise to base symbol first
  const base = extractBase(symbol) || '';

  // Resolve URL: local map first, then service cache
  function resolveUrl(b) {
    const local = getIconUrl(b);
    if (local) return local;
    const cached = getCachedIcon(b);
    return cached ?? null;
  }

  const [url,    setUrl]    = useState(() => resolveUrl(base));
  const [imgOk,  setImgOk]  = useState(false);
  const [imgErr, setImgErr] = useState(false);

  useEffect(() => {
    if (!base) return;

    console.debug('[CoinIcon] mount', {
      symbol,
      base,
      resolvedUrl: resolveUrl(base),
    });

    // 1. Local map — synchronous, no network
    const local = getIconUrl(base);
    if (local) {
      setUrl(local);
      setImgOk(false);
      setImgErr(false);
      return;
    }

    // 2. Async service — CryptoCompare / CoinGecko
    const cached = getCachedIcon(base);
    setUrl(cached ?? null);
    setImgOk(false);
    setImgErr(false);

    if (cached === undefined) {
      getCoinIcon(base);
      const unsub = subscribeIcon(base, () => {
        const resolved = getCachedIcon(base) ?? null;
        console.debug('[CoinIcon] service resolved', { base, resolved });
        setUrl(resolved);
      });
      return unsub;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base]);

  const color    = getBrandColor(base);
  const initials = base.slice(0, 2) || '?';
  const showImg  = !!url && !imgErr;

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
      {/* Colored initials — shown while loading or on error */}
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

      {/* Coin image */}
      {showImg && (
        <img
          src={url}
          alt={base}
          width={size}
          height={size}
          onLoad={() => {
            console.debug('[CoinIcon] image loaded', { base, url });
            setImgOk(true);
          }}
          onError={() => {
            console.warn('[CoinIcon] image failed', { base, url });
            setImgErr(true);
          }}
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