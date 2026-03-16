import React from 'react';

const LOGO_URL = 'https://artificial-crimson-pmz2ll22jb.edgeone.app/%EC%86%94%ED%8F%AC%ED%8A%B8%20%EB%A1%9C%EA%B3%A0.jpg';

export default function SolFortLogo({ size = 28, className = '' }) {
  return (
    <img
      src={LOGO_URL}
      alt="SolFort"
      width={size}
      height={size}
      className={`object-contain rounded-lg ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

export { LOGO_URL };