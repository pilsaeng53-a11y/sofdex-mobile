/**
 * services/aiSignalResolver.js
 *
 * Single source of truth for AI signal resolution.
 *
 * All of the following MUST import from here — never directly from hooks/useAISignal:
 *   - AISentimentCard      (home page summary card)
 *   - AIIntelligence page  (detail page: score, label, confidence, per-asset signals)
 *   - Any future AI widget
 *
 * Exports:
 *   useOverallAISignal(refreshKey?)  → { label, score, confidence, explanation, reasoning, bullishCount, factors, timestamp }
 *   useAssetAISignals(refreshKey?)   → { [symbol]: { signal, score, basis, change, confidence, factors, risk, sector } }
 *   ASSET_CONTEXT                    → per-symbol narrative/risk/sector metadata
 *   SIGNAL_ASSETS                    → ordered list of assets shown in the Signals tab
 *   computeAssetScore                → pure scoring function (for testing/external use)
 *   getSignalLabel                   → score → 'Bullish'|'Neutral'|'Bearish'
 *   getConfidenceLabel               → score → 'High'|'Medium'|'Low'
 *   buildAssetSignal                 → builds a full signal object for one asset
 */

export {
  useOverallAISignal,
  useAssetAISignals,
  ASSET_CONTEXT,
  SIGNAL_ASSETS,
  computeAssetScore,
  getSignalLabel,
  getConfidenceLabel,
  buildAssetSignal,
} from '../hooks/useAISignal';