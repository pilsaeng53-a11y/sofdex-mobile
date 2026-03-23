/**
 * useTradeSimulator — local (pre-database) trading simulation engine.
 *
 * State:
 *  positions[]   — open positions
 *  pendingOrders[] — limit/stop orders awaiting fill
 *  orderHistory[]  — all submitted orders (market + pending)
 *  tradeHistory[]  — closed trade records
 *
 * Actions:
 *  submitOrder(order)    — place market or pending order
 *  closePosition(id, price)
 *  cancelOrder(id)
 *  tickQuotes(quotesMap) — called on every live quote update to check SL/TP/fill
 */
import { useState, useCallback, useRef } from 'react';

let _id = 1;
const uid = () => `sim-${_id++}`;
const now = () => new Date().toISOString();

export default function useTradeSimulator() {
  const [positions,    setPositions]    = useState([]);
  const [pendingOrders, setPending]     = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);

  // keep refs so tickQuotes callback is stable
  const posRef     = useRef(positions);
  const pendingRef = useRef(pendingOrders);
  posRef.current     = positions;
  pendingRef.current = pendingOrders;

  // ── Submit order ────────────────────────────────────────────────────
  const submitOrder = useCallback((order) => {
    const id = uid();
    const record = {
      id,
      symbol:    order.symbol,
      side:      order.side,       // 'buy' | 'sell'
      orderType: order.orderType,  // 'Market' | 'Limit' | 'Stop'
      volume:    order.volume,
      leverage:  order.leverage,
      sl:        order.sl ? parseFloat(order.sl) : null,
      tp:        order.tp ? parseFloat(order.tp) : null,
      limitPrice: order.limitPrice ? parseFloat(order.limitPrice) : null,
      submittedAt: now(),
      status: 'submitted',
    };

    setOrderHistory(prev => [{ ...record }, ...prev]);

    if (order.orderType === 'Market') {
      // Immediate fill
      const entryPrice = order.side === 'buy' ? order.askPrice : order.bidPrice;
      const pos = {
        id,
        symbol:     order.symbol,
        side:       order.side,
        volume:     order.volume,
        leverage:   order.leverage,
        entryPrice,
        currentPrice: entryPrice,
        sl:         record.sl,
        tp:         record.tp,
        openedAt:   now(),
        swap:       0,
        lotSize:    order.lotSize ?? 100000,
        pipValue:   order.pipValue ?? 0.0001,
      };
      setPositions(prev => [pos, ...prev]);
      setOrderHistory(prev => prev.map(o => o.id === id ? { ...o, status: 'filled', filledAt: now(), filledPrice: entryPrice } : o));
    } else {
      // Pending
      setPending(prev => [{ ...record, status: 'pending' }, ...prev]);
      setOrderHistory(prev => prev.map(o => o.id === id ? { ...o, status: 'pending' } : o));
    }
  }, []);

  // ── Close position ──────────────────────────────────────────────────
  const closePosition = useCallback((posId, closePrice) => {
    const pos = posRef.current.find(p => p.id === posId);
    if (!pos) return;
    const pnl = calcPnl(pos, closePrice);
    const fee = pos.volume * 3.5;
    setTradeHistory(prev => [{
      id: uid(),
      positionId: posId,
      symbol:     pos.symbol,
      side:       pos.side,
      volume:     pos.volume,
      entryPrice: pos.entryPrice,
      exitPrice:  closePrice,
      pnl,
      fee,
      swap:       pos.swap,
      openedAt:   pos.openedAt,
      closedAt:   now(),
    }, ...prev]);
    setPositions(prev => prev.filter(p => p.id !== posId));
  }, []);

  // ── Cancel pending order ────────────────────────────────────────────
  const cancelOrder = useCallback((orderId) => {
    setPending(prev => prev.filter(o => o.id !== orderId));
    setOrderHistory(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled', cancelledAt: now() } : o));
  }, []);

  // ── Tick: update current prices, check SL/TP/fills ─────────────────
  const tickQuotes = useCallback((quotesMap) => {
    // Update positions' currentPrice + check SL/TP
    setPositions(prev => {
      const toClose = [];
      const updated = prev.map(pos => {
        const sym   = normalizeForLookup(pos.symbol);
        const quote = quotesMap[sym];
        if (!quote) return pos;
        const cp = pos.side === 'buy' ? (quote.bid ?? quote.last) : (quote.ask ?? quote.last);
        if (!cp) return pos;
        // SL check
        if (pos.sl && ((pos.side === 'buy' && cp <= pos.sl) || (pos.side === 'sell' && cp >= pos.sl))) {
          toClose.push({ id: pos.id, price: pos.sl, reason: 'sl' });
        }
        // TP check
        if (pos.tp && ((pos.side === 'buy' && cp >= pos.tp) || (pos.side === 'sell' && cp <= pos.tp))) {
          toClose.push({ id: pos.id, price: pos.tp, reason: 'tp' });
        }
        return { ...pos, currentPrice: cp };
      });
      // Process SL/TP closes
      if (toClose.length) {
        const closeIds = new Set(toClose.map(c => c.id));
        toClose.forEach(({ id: posId, price }) => {
          const pos = updated.find(p => p.id === posId);
          if (!pos) return;
          const pnl = calcPnl(pos, price);
          const fee = pos.volume * 3.5;
          setTradeHistory(prev2 => [{
            id: uid(), positionId: posId, symbol: pos.symbol, side: pos.side,
            volume: pos.volume, entryPrice: pos.entryPrice, exitPrice: price,
            pnl, fee, swap: pos.swap, openedAt: pos.openedAt, closedAt: now(),
          }, ...prev2]);
        });
        return updated.filter(p => !closeIds.has(p.id));
      }
      return updated;
    });

    // Check pending order fills
    setPending(prev => {
      const toFill = [];
      const remaining = prev.filter(order => {
        const sym   = normalizeForLookup(order.symbol);
        const quote = quotesMap[sym];
        if (!quote) return true;
        const cp = order.side === 'buy' ? (quote.ask ?? quote.last) : (quote.bid ?? quote.last);
        if (!cp || !order.limitPrice) return true;
        const filled = order.orderType === 'Limit'
          ? (order.side === 'buy' ? cp <= order.limitPrice : cp >= order.limitPrice)
          : (order.side === 'buy' ? cp >= order.limitPrice : cp <= order.limitPrice); // Stop
        if (filled) { toFill.push({ order, fillPrice: cp }); return false; }
        return true;
      });
      if (toFill.length) {
        toFill.forEach(({ order, fillPrice }) => {
          setPositions(prev2 => [{
            id: order.id, symbol: order.symbol, side: order.side,
            volume: order.volume, leverage: order.leverage, entryPrice: fillPrice,
            currentPrice: fillPrice, sl: order.sl, tp: order.tp,
            openedAt: now(), swap: 0, lotSize: order.lotSize ?? 100000, pipValue: order.pipValue ?? 0.0001,
          }, ...prev2]);
          setOrderHistory(prev2 => prev2.map(o => o.id === order.id
            ? { ...o, status: 'filled', filledAt: now(), filledPrice: fillPrice } : o));
        });
      }
      return remaining;
    });
  }, []);

  // ── Derived PnL summary ─────────────────────────────────────────────
  const unrealizedPnl = positions.reduce((s, p) => s + calcPnl(p, p.currentPrice), 0);
  const realizedPnl   = tradeHistory.reduce((s, t) => s + t.pnl, 0);
  const totalFees     = tradeHistory.reduce((s, t) => s + t.fee, 0);

  return {
    positions, pendingOrders, orderHistory, tradeHistory,
    unrealizedPnl, realizedPnl, totalFees,
    submitOrder, closePosition, cancelOrder, tickQuotes,
  };
}

// ── Helpers ─────────────────────────────────────────────────────────
function calcPnl(pos, closePrice) {
  if (!pos || !closePrice) return 0;
  const diff = pos.side === 'buy'
    ? closePrice - pos.entryPrice
    : pos.entryPrice - closePrice;
  return diff * pos.volume * (pos.lotSize ?? 100000);
}

function normalizeForLookup(symbol) {
  return symbol.replace(/-T$/, '').replace(/-PERP$/, '').toUpperCase();
}