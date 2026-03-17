import React from 'react';
import { useRegion } from '@/components/shared/RegionContext';
import { REGIONS } from '@/services/RegionDetectionService';
import { useLang } from '@/components/shared/LanguageContext';

/**
 * Region Selector Component
 * Allows users to manually override region detection
 * Shows region info: default currency, asset focus, news emphasis
 */
export default function RegionSelector() {
  const { region, setRegion, regionConfig } = useRegion();
  const { t } = useLang();

  const regionList = Object.values(REGIONS).filter(r => r.code !== 'GLOBAL');

  return (
    <div className="space-y-4 p-4 bg-card rounded-xl border border-border">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          Region & Personalization
        </h3>
        <p className="text-sm text-muted-foreground">
          Your region determines default currency, asset recommendations, and news focus
        </p>
      </div>

      {/* Current Region Info */}
      <div className="bg-muted/30 rounded-lg p-3 border border-border">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-foreground">{regionConfig.nativeName}</p>
            <p className="text-xs text-muted-foreground">{regionConfig.name}</p>
          </div>
          <span className="text-lg">
            {regionConfig.code === 'KO' ? '🇰🇷' : regionConfig.code === 'JP' ? '🇯🇵' : '🌍'}
          </span>
        </div>

        {/* Default Currency */}
        <div className="text-xs space-y-1 mb-2 pb-2 border-b border-border">
          <p className="text-muted-foreground">
            Default Currency: <span className="font-medium text-foreground">{regionConfig.defaultCurrency}</span>
          </p>
        </div>

        {/* Asset Focus */}
        <div className="text-xs space-y-1 mb-2 pb-2 border-b border-border">
          <p className="text-muted-foreground">Focus Assets:</p>
          <div className="flex flex-wrap gap-1">
            {regionConfig.focusAssets.map((asset) => (
              <span key={asset} className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">
                {asset}
              </span>
            ))}
          </div>
        </div>

        {/* News Emphasis */}
        <div className="text-xs">
          <p className="text-muted-foreground mb-1">News Emphasis:</p>
          <div className="flex flex-wrap gap-1">
            {regionConfig.newsEmphasis.map((topic) => (
              <span key={topic} className="px-2 py-0.5 bg-secondary/10 text-secondary-foreground rounded text-xs capitalize">
                {topic}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Region Selection Grid */}
      <div className="grid grid-cols-2 gap-3">
        {regionList.map((r) => (
          <button
            key={r.code}
            onClick={() => setRegion(r.code)}
            className={`
              relative flex flex-col items-center gap-2 p-4 rounded-lg 
              transition-all duration-200 border-2
              ${
                region === r.code
                  ? 'border-primary bg-primary/10 ring-2 ring-primary/50'
                  : 'border-border bg-card hover:border-primary/50'
              }
            `}
          >
            {/* Flag */}
            <span className="text-2xl">
              {r.code === 'KO' ? '🇰🇷' : r.code === 'JP' ? '🇯🇵' : '🌍'}
            </span>

            {/* Native Name */}
            <span className="text-sm font-medium text-foreground">
              {r.nativeName}
            </span>

            {/* Currency */}
            <span className="text-xs text-muted-foreground">
              {r.defaultCurrency}
            </span>

            {/* Active Indicator */}
            {region === r.code && (
              <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-primary ring-2 ring-primary/30" />
            )}
          </button>
        ))}

        {/* Global Option */}
        <button
          onClick={() => setRegion('GLOBAL')}
          className={`
            relative flex flex-col items-center gap-2 p-4 rounded-lg 
            transition-all duration-200 border-2 col-span-2
            ${
              region === 'GLOBAL'
                ? 'border-primary bg-primary/10 ring-2 ring-primary/50'
                : 'border-border bg-card hover:border-primary/50'
            }
          `}
        >
          <span className="text-2xl">🌍</span>
          <span className="text-sm font-medium text-foreground">Global</span>
          <span className="text-xs text-muted-foreground">USD</span>

          {region === 'GLOBAL' && (
            <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-primary ring-2 ring-primary/30" />
          )}
        </button>
      </div>

      {/* Info */}
      <div className="text-xs text-muted-foreground pt-2 border-t border-border">
        <p>
          💡 Your region auto-detects based on language and browser settings.
          Override anytime to customize asset recommendations, news focus, and default currency.
        </p>
      </div>
    </div>
  );
}