import React from 'react';
import { useLang } from '@/components/shared/LanguageContext';

/**
 * Language Selector Component
 * Displays language options with native names and flags
 * Allows users to manually switch languages
 */
export default function LanguageSelector() {
  const { lang, setLang, LANGUAGES, t } = useLang();

  return (
    <div className="space-y-4 p-4 bg-card rounded-xl border border-border">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          {t('profile_language')}
        </h3>
        <p className="text-sm text-muted-foreground">
          Select your preferred language
        </p>
      </div>

      {/* Language Grid */}
      <div className="grid grid-cols-2 gap-3">
        {LANGUAGES.map((language) => (
          <button
            key={language.code}
            onClick={() => setLang(language.code)}
            className={`
              relative flex flex-col items-center gap-2 p-4 rounded-lg 
              transition-all duration-200 border-2
              ${
                lang === language.code
                  ? 'border-primary bg-primary/10 ring-2 ring-primary/50'
                  : 'border-border bg-card hover:border-primary/50'
              }
            `}
          >
            {/* Flag */}
            <span className="text-2xl">{language.flag}</span>

            {/* Native Name */}
            <span className="text-sm font-medium text-foreground">
              {language.nativeName}
            </span>

            {/* English Name */}
            <span className="text-xs text-muted-foreground">
              {language.name}
            </span>

            {/* Active Indicator */}
            {lang === language.code && (
              <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-primary ring-2 ring-primary/30" />
            )}
          </button>
        ))}
      </div>

      {/* Automatic Detection Note */}
      <div className="text-xs text-muted-foreground pt-2 border-t border-border">
        <p>
          💡 Your language preference is automatically detected on first visit 
          based on your browser settings. You can change it anytime here.
        </p>
      </div>
    </div>
  );
}