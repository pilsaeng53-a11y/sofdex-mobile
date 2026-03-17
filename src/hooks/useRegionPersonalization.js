import { useRegion } from '@/components/shared/RegionContext';
import { useCurrency } from '@/components/shared/CurrencyContext';
import {
  getRegionDefaultCurrency,
  getRegionAssetFocus,
  getRegionNewsEmphasis,
  getRegionPersonalization,
  rankAssetsByRegion,
  rankNewsByRegion,
} from '@/services/RegionDetectionService';

/**
 * Hook for region-aware personalization
 * Provides: recommended currency, asset focus, news priority, personalization weights
 */
export function useRegionPersonalization() {
  const { region } = useRegion();
  const { displayCurrency, setDisplayCurrency } = useCurrency();

  // Get region's default currency
  const regionDefaultCurrency = getRegionDefaultCurrency(region);

  // Auto-set currency to region default if user hasn't explicitly chosen one
  // (This runs once per session or when region changes)
  const applyRegionCurrencyDefault = () => {
    // Only apply if currency wasn't explicitly set by user
    try {
      const userSetCurrency = localStorage.getItem('sofdex_currency_manual');
      if (!userSetCurrency && displayCurrency === 'USD') {
        // Default USD, so can apply region default
        if (regionDefaultCurrency !== displayCurrency) {
          setDisplayCurrency(regionDefaultCurrency);
        }
      }
    } catch {
      // Ignore
    }
  };

  return {
    // Region info
    region,
    regionDefaultCurrency,

    // Asset recommendations
    getAssetsByRegion: (assets) => rankAssetsByRegion(assets, region),
    focusAssets: getRegionAssetFocus(region),

    // News ranking
    rankNewsByRegion: (news) => rankNewsByRegion(news, region),
    newsEmphasis: getRegionNewsEmphasis(region),

    // Personalization weights (for UI emphasis)
    personalization: getRegionPersonalization(region),

    // Currency helpers
    applyRegionCurrencyDefault,
    shouldShowMacroEmphasis: getRegionPersonalization(region).macroFocus > 0.75,
    shouldShowCryptoEmphasis: getRegionPersonalization(region).cryptoFocus > 0.7,
    shouldShowAIEmphasis: getRegionPersonalization(region).aiStrategiesEmphasis > 0.7,
  };
}