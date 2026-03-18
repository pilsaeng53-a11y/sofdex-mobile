/**
 * MobileWalletDeepLinks.js
 * Mobile wallet detection + deep link generation for Phantom, Backpack, Solflare.
 */

const APP_URL = encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : 'https://solfort.io');

export const MOBILE_DEEP_LINKS = {
  phantom: `https://phantom.app/ul/browse?url=${APP_URL}`,
  backpack: `https://backpack.app/ul/v1/connect?app_url=${APP_URL}`,
  solflare: `https://solflare.com/ul/v1/browse?url=${APP_URL}`,
};

/**
 * Returns true if running on a mobile browser (iOS or Android)
 */
export function isMobile() {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/**
 * Returns true if running on iOS
 */
export function isIOS() {
  if (typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/**
 * Returns true if running on Android
 */
export function isAndroid() {
  if (typeof navigator === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
}

/**
 * Returns the deep link for a given wallet on mobile.
 * @param {'phantom'|'backpack'|'solflare'} walletKey
 * @returns {string} deep link URL
 */
export function getMobileDeepLink(walletKey) {
  const url = encodeURIComponent(typeof window !== 'undefined' ? window.location.href : 'https://solfort.io');
  switch (walletKey) {
    case 'phantom':
      return `https://phantom.app/ul/browse?url=${url}`;
    case 'backpack':
      return `https://backpack.app/ul/v1/connect?app_url=${url}`;
    case 'solflare':
      return `https://solflare.com/ul/v1/browse?url=${url}`;
    default:
      return '#';
  }
}

/**
 * On mobile: open the wallet's deep link.
 * On desktop: return false so the normal connect flow proceeds.
 * @returns {boolean} true if deep link was triggered
 */
export function triggerMobileDeepLink(walletKey) {
  if (!isMobile()) return false;
  const link = getMobileDeepLink(walletKey);
  window.location.href = link;
  return true;
}