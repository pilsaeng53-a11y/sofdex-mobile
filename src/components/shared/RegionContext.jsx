import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  detectRegion,
  getBrowserLocale,
  getUserTimezone,
  getRegionDefaultCurrency,
  REGIONS,
} from '@/services/RegionDetectionService';

const RegionContext = createContext({
  region: 'GLOBAL',
  setRegion: () => {},
  regionConfig: REGIONS.GLOBAL,
});

/**
 * Region Provider - Manages user's region and auto-applies region defaults
 * Priority: user preference > language > browser locale > timezone > fallback
 */
export function RegionProvider({ children, language }) {
  const [region, setRegionState] = useState(() => {
    try {
      const saved = localStorage.getItem('sofdex_region');
      return saved || 'GLOBAL';
    } catch {
      return 'GLOBAL';
    }
  });

  // Auto-detect region when language changes
  useEffect(() => {
    if (!language) return;

    // Only auto-detect if user hasn't manually set region
    try {
      const savedRegion = localStorage.getItem('sofdex_region');
      if (savedRegion) return; // User manually set region, don't auto-update
    } catch {
      // Ignore
    }

    // Auto-detect from language, locale, timezone
    const detected = detectRegion(
      null, // No saved preference
      language,
      getBrowserLocale(),
      getUserTimezone()
    );

    setRegionState(detected);
  }, [language]);

  const setRegion = (regionCode) => {
    if (!REGIONS[regionCode]) {
      console.warn(`Invalid region: ${regionCode}`);
      return;
    }

    try {
      localStorage.setItem('sofdex_region', regionCode);
    } catch {
      // Ignore
    }

    setRegionState(regionCode);
  };

  const regionConfig = REGIONS[region] || REGIONS.GLOBAL;

  return (
    <RegionContext.Provider value={{ region, setRegion, regionConfig }}>
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  return useContext(RegionContext);
}