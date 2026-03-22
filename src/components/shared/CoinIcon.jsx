/**
 * CoinIcon — renders a coin logo for any symbol format.
 *
 * Source: bundled COIN_ICON_MAP (data/coinIconMap.js) via coinIconMapService
 * Fallback: colored initials (shown on image error or unknown symbol)
 *
 * Accepts any format: "BTC" | "PERP_BTC_USDC" | "BTC-USDT" | "BTC/USDC" | "MATIC" (→POL)
 * No async, no network fetch — icons resolve instantly from bundled map.
 */

import { useState } from 'react';
import { getIconForSymbol, extractBase } from '../../services/coinIconMapService';

const BRAND_COLORS = {
  BTC: '#f7931a', ETH: '#627eea', SOL: '#9945ff', BNB: '#f0b90b',
  XRP: '#00aae4', ARB: '#12aaff', LINK: '#2a5ada', UNI: '#ff007a',
  APT: '#00c4a0', TON: '#0088cc', DOGE: '#c2a633', AVAX: '#e84142',
  POL: '#8247e5', OP: '#ff0420', ATOM: '#6f4cff', DOT: '#e6007a',
  ADA: '#0033ad', INJ: '#00afe1', SUI: '#6fbcf0', PEPE: '#4aab15',
  NEAR: '#00c08b', LTC: '#bfbbbb', SHIB: '#f0b90b', TRX: '#ef0027',
  FTM: '#1969ff', AAVE: '#b6509e', SEI: '#9c5ff7', ZEC: '#ecb244',
  DAI: '#f5ac37', RAY: '#5ac4be', HNT: '#474dff', BONK: '#e06b00',
};

function brandColor(base) {
  return BRAND_COLORS[base?.toUpperCase()] ?? '#00d4aa';
}

export default function CoinIcon({ symbol, size = 24, className = '' }) {
  const base     = extractBase(symbol);
  const color    = brandColor(base);
  const initials = base.slice(0, 2) || '?';
  const url      = getIconForSymbol(symbol);

  const [loaded, setLoaded] = useState(false);
  const [error,  setError]  = useState(false);

  const showImg = !!url && !error;

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
      {/* Colored initials — shown until image loads */}
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
          onLoad={()  => setLoaded(true)}
          onError={() => setError(true)}
          style={{
            position:   'absolute',
            inset:      0,
            width:      '100%',
            height:     '100%',
            objectFit:  'cover',
            opacity:    loaded ? 1 : 0,
            transition: 'opacity 0.15s ease',
          }}
        />
      )}
    </div>
  );
}