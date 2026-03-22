/**
 * CoinIcon — renders a coin logo for any symbol format.
 *
 * Icon source: Render backend https://solfort-api.onrender.com/coin-icons
 * Fallback: colored initials (always works offline)
 *
 * Accepts any format: "BTC" | "PERP_BTC_USDC" | "BTC-USDT" | "BTC/USDC"
 */

import { useState, useEffect } from 'react';
import {
  extractBase,
  getIconForSymbol,
  onIconMapLoaded,
  isIconMapLoaded,
} from '../../services/coinIconMapService';

const BRAND_COLORS = {
  BTC: '#f7931a', ETH: '#627eea', SOL: '#9945ff', BNB: '#f0b90b',
  XRP: '#00aae4', ARB: '#12aaff', LINK: '#2a5ada', UNI: '#ff007a',
  APT: '#00c4a0', TON: '#0088cc', DOGE: '#c2a633', AVAX: '#e84142',
  MATIC: '#8247e5', POL: '#8247e5', OP: '#ff0420', ATOM: '#6f4cff',
  DOT: '#e6007a', ADA: '#0033ad', INJ: '#00afe1', SUI: '#6fbcf0',
  PEPE: '#4aab15', NEAR: '#00c08b', LTC: '#bfbbbb', BCH: '#4cca41',
};

function brandColor(base) {
  return BRAND_COLORS[base?.toUpperCase()] ?? '#00d4aa';
}

export default function CoinIcon({ symbol, size = 24, className = '' }) {
  const base    = extractBase(symbol);
  const color   = brandColor(base);
  const initials = base.slice(0, 2) || '?';

  const [url,    setUrl]    = useState(() => isIconMapLoaded() ? getIconForSymbol(symbol) : null);
  const [loaded, setLoaded] = useState(false);
  const [error,  setError]  = useState(false);

  // Re-resolve when the map loads or symbol changes
  useEffect(() => {
    setLoaded(false);
    setError(false);

    const apply = () => {
      const resolved = getIconForSymbol(symbol);
      setUrl(resolved);
    };

    if (isIconMapLoaded()) {
      apply();
      return;
    }

    // Map not yet loaded — subscribe and apply once it arrives
    const unsub = onIconMapLoaded(apply);
    return unsub;
  }, [symbol]);

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
          onError={() => {
            console.warn('[CoinIcon] img failed to load', { base, url });
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