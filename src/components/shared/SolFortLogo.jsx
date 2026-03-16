import React from 'react';

// Token symbol (circular castle icon — classic gold version)
export const LOGO_URL = 'https://media.base44.com/images/public/69adcc4764afafa4c2760a52/c6b24748f_SolFort_Token_Symbol_Cropped.png';

// 3D neon logo — for splash / hero sections
export const LOGO_3D_URL = 'https://media.base44.com/images/public/69adcc4764afafa4c2760a52/602900a9f_SolFort_3D_Logo.png';

// Font logo (SOLFORT word-mark gradient) — for headers / banners
export const LOGO_FONT_URL = 'https://media.base44.com/images/public/69adcc4764afafa4c2760a52/cf29ac0b6_SolFort_Font_Logo.png';

export default function SolFortLogo({ size = 28, className = '', variant = 'symbol' }) {
  const src = variant === 'font' ? LOGO_FONT_URL : variant === '3d' ? LOGO_3D_URL : LOGO_URL;
  return (
    <img
      src={src}
      alt="SolFort"
      width={size}
      height={size}
      className={`object-contain ${variant === 'symbol' ? 'rounded-full' : ''} ${className}`}
      style={{ width: size, height: 'auto' }}
    />
  );
}