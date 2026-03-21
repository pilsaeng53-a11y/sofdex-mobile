/**
 * CoinIcon — resolves and renders a coin's logo from CoinGecko.
 * Shows a styled placeholder while loading or if image not found.
 */

import { useState, useEffect } from 'react';
import { getCoinIcon } from '../../services/coinIconService';

const COLOR_MAP = {
  BTC:  '#f7931a', ETH:  '#627eea', SOL:  '#9945ff', BNB:  '#f0b90b',
  XRP:  '#00aae4', ARB:  '#12aaff', LINK: '#2a5ada', UNI:  '#ff007a',
  APT:  '#00c4a0', TON:  '#0088cc', DOGE: '#c2a633', AVAX: '#e84142',
  MATIC:'#8247e5', OP:   '#ff0420', ATOM: '#6f4cff', DOT:  '#e6007a',
  ADA:  '#0033ad', INJ:  '#00afe1', SUI:  '#6fbcf0', PEPE: '#4aab15',
  WIF:  '#c2a633', BONK: '#f7931a', SHIB: '#e2760b', ENA:  '#0f766e',
};

function getInitialColor(symbol) {
  return COLOR_MAP[symbol?.toUpperCase()] ?? '#00d4aa';
}

export default function CoinIcon({ symbol, size = 24, className = '' }) {
  const [url,     setUrl]     = useState(null);
  const [loaded,  setLoaded]  = useState(false);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    if (!symbol) return;
    let cancelled = false;
    setUrl(null);
    setLoaded(false);
    setErrored(false);

    getCoinIcon(symbol).then(resolved => {
      if (!cancelled) setUrl(resolved);
    });

    return () => { cancelled = true; };
  }, [symbol]);

  const initials = (symbol ?? '?').slice(0, 3).toUpperCase();
  const color    = getInitialColor(symbol);
  const s        = size;

  const showImage = url && !errored;

  return (
    <div
      className={`relative flex-shrink-0 rounded-full overflow-hidden flex items-center justify-center ${className}`}
      style={{
        width: s, height: s,
        background: showImage && loaded ? 'transparent' : color + '22',
        border: `1px solid ${color}44`,
      }}
    >
      {/* Placeholder / fallback initials */}
      {(!showImage || !loaded) && (
        <span
          style={{
            fontSize: s * 0.38,
            fontWeight: 800,
            color,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          {initials.length > 2 ? initials.slice(0, 2) : initials}
        </span>
      )}

      {/* Actual image */}
      {url && (
        <img
          src={url}
          alt={symbol}
          width={s}
          height={s}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.25s ease',
          }}
        />
      )}
    </div>
  );
}