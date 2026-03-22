/**
 * hooks/useOrderForm.js
 *
 * All order form state and derived calculations, extracted from OrderPanel.
 * This separates form logic from UI rendering.
 *
 * Consumed by: OrderPanel
 * Depends on:  lib/trading/orderCalc.js (pure math)
 *
 * When connecting live trading:
 *   - Replace MOCK_BALANCE with a real account balance hook
 *   - Replace the submit stub with the real Orderly order placement call
 *   - All calculations stay identical — only the data source changes
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  deriveQuantities,
  calcMargin,
  calcFee,
  pctToAmount,
  calcLiqPrice,
  calcLiqDistance,
  getLiqRiskState,
  getLeverageRisk,
  validateOrder,
  isOrderReady,
} from '../lib/trading/orderCalc';
import { formatOrderlyError } from '../services/orderly/orderlyErrors';

// ── Temporary mock balance ────────────────────────────────────────────────────
// TODO: Replace with useAccountBalance() hook when live account data is ready
export const MOCK_BALANCE = 4821.36;

export default function useOrderForm({ symbol, markPrice, maxLeverage }) {
  const balance   = MOCK_BALANCE; // swap this line when live
  const maxLev    = maxLeverage ?? 50;

  // ── Form state ──────────────────────────────────────────────────────────────
  const [side,       setSide]       = useState('buy');
  const [mode,       setMode]       = useState('limit');
  const [denom,      setDenom]      = useState('base');
  const [price,      setPrice]      = useState('');
  const [amount,     setAmount]     = useState('');
  const [leverage,   setLeverage]   = useState(Math.min(10, maxLev));
  const [tp,         setTp]         = useState('');
  const [sl,         setSl]         = useState('');
  const [showTPSL,   setShowTPSL]   = useState(false);
  const [activePct,  setActivePct]  = useState(null);
  const [priceFlash, setPriceFlash] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [errors,     setErrors]     = useState({});
  const flashTimer = useRef(null);

  // ── Reset form when symbol changes ──────────────────────────────────────────
  useEffect(() => {
    setAmount('');
    setErrors({});
    setActivePct(null);
    // Keep side, mode, leverage, denom — user preferences should persist across symbols
  }, [symbol]);

  // ── Apply price from OrderBook click ────────────────────────────────────────
  // externalPrice is managed in TradingDesk and passed via prop.
  // This is exposed as applyExternalPrice to keep the hook self-contained.
  const applyExternalPrice = useCallback((p) => {
    if (!p || p <= 0) return;
    setPrice(String(p));
    setMode('limit');
    setErrors(e => ({ ...e, price: null }));
    clearTimeout(flashTimer.current);
    setPriceFlash(true);
    flashTimer.current = setTimeout(() => setPriceFlash(false), 1500);
  }, []);

  useEffect(() => () => clearTimeout(flashTimer.current), []);

  // ── Resolved entry price ─────────────────────────────────────────────────────
  // market → use markPrice from Orderly ticker
  // limit  → use user-entered price
  const entryPrice = useMemo(() => {
    if (mode === 'market') return markPrice ?? 0;
    const p = parseFloat(price);
    return p > 0 ? p : 0;
  }, [mode, price, markPrice]);

  // ── Percentage-derived amount ────────────────────────────────────────────────
  // Recalculates automatically when leverage, entryPrice, or denom changes
  const pctDerivedAmount = useMemo(() =>
    pctToAmount({ pct: activePct, balance, price: entryPrice, leverage, denom }),
    [activePct, balance, entryPrice, leverage, denom]
  );

  // Sync derived pct value back to amount state so the input field shows it
  useEffect(() => {
    if (activePct && pctDerivedAmount) {
      setAmount(pctDerivedAmount);
    }
  }, [activePct, pctDerivedAmount]);

  // The effective amount shown and used in calculations
  const effectiveAmount = activePct ? (pctDerivedAmount ?? amount) : amount;
  const parsedAmt = parseFloat(effectiveAmount) || 0;

  // ── Core calculations ────────────────────────────────────────────────────────
  const { baseQty, quoteQty } = useMemo(() =>
    deriveQuantities({ denom, amount: effectiveAmount, price: entryPrice, leverage, balance }),
    [denom, effectiveAmount, entryPrice, leverage, balance]
  );

  const margin = useMemo(() => calcMargin(quoteQty, leverage), [quoteQty, leverage]);
  const fee    = useMemo(() => calcFee(quoteQty, mode),        [quoteQty, mode]);

  // ── Liquidation ──────────────────────────────────────────────────────────────
  const liqPrice    = useMemo(() => calcLiqPrice(entryPrice, leverage, side),         [entryPrice, leverage, side]);
  const liqDistance = useMemo(() => calcLiqDistance(entryPrice, liqPrice, side),      [entryPrice, liqPrice, side]);
  const riskState   = useMemo(() => getLiqRiskState(quoteQty > 0 ? liqDistance?.pct : null), [liqDistance, quoteQty]);
  const riskLevel   = useMemo(() => getLeverageRisk(leverage, maxLev),                [leverage, maxLev]);

  // ── Validation & readiness ────────────────────────────────────────────────────
  const validate = useCallback(() => {
    const e = validateOrder({ mode, price, denom, parsedAmt, margin, balance, entryPrice });
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [mode, price, denom, parsedAmt, margin, balance, entryPrice]);

  const isReady = useMemo(() =>
    isOrderReady({ mode, price, parsedAmt, quoteQty, margin, balance, errors, entryPrice }),
    [mode, price, parsedAmt, quoteQty, margin, balance, errors, entryPrice]
  );

  const insufficientBalance = margin > balance;

  // ── Percentage button handler ─────────────────────────────────────────────────
  const handlePct = useCallback((pct) => {
    if (activePct === pct) {
      setActivePct(null);
      setAmount('');
      return;
    }
    setActivePct(pct);
    setErrors(e => ({ ...e, amount: null }));
  }, [activePct]);

  const handleAmountChange = useCallback((v) => {
    setAmount(v);
    setActivePct(null);
    setErrors(e => ({ ...e, amount: null }));
  }, []);

  const handleModeChange = useCallback((m) => {
    setMode(m);
    setErrors(e => ({ ...e, price: null }));
  }, []);

  const handleDenomChange = useCallback((d) => {
    setDenom(d);
    setAmount('');
    setActivePct(null);
    setErrors(e => ({ ...e, amount: null }));
  }, []);

  const handleSideChange = useCallback((s) => {
    setSide(s);
    setErrors({});
  }, []);

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
    setSubmitting(true);
    setErrors({});
    try {
      // TODO: Replace with real Orderly order placement when auth is ready
      // await orderlyClient.placeOrder({ symbol, side, mode, price, baseQty, leverage });
      await new Promise(r => setTimeout(r, 1300));
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setAmount('');
        setPrice('');
        setTp('');
        setSl('');
        setActivePct(null);
      }, 2500);
    } catch (err) {
      setErrors(e => ({ ...e, submit: formatOrderlyError(err) }));
    } finally {
      setSubmitting(false);
    }
  }, [validate]);

  return {
    // Form state
    side, setSide: handleSideChange,
    mode, setMode: handleModeChange,
    denom, setDenom: handleDenomChange,
    price, setPrice,
    amount: effectiveAmount, setAmount: handleAmountChange,
    leverage, setLeverage,
    tp, setTp,
    sl, setSl,
    showTPSL, setShowTPSL,
    activePct, handlePct,
    priceFlash, applyExternalPrice,

    // Derived values
    entryPrice,
    baseQty,
    quoteQty,
    margin,
    fee,
    parsedAmt,

    // Liquidation
    liqPrice:    quoteQty > 0 ? liqPrice    : null,
    liqDistance: quoteQty > 0 ? liqDistance : null,
    riskState,
    riskLevel,

    // Status
    isReady,
    insufficientBalance,
    submitting,
    submitted,
    errors,
    validate,
    handleSubmit,
    balance,
  };
}