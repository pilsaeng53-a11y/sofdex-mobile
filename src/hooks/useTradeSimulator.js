/**
 * useTradeSimulator — local (pre-database) trading simulation engine.
 * Supports: market orders, pending orders, SL/TP/liquidation auto-close,
 * pending order fill triggers, and event callbacks for execution feedback.
 */
import { useState, useCallback, useRef } from 'react';

let _id = 1;
const uid = () => `sim-${_id++}`;
const now = () => new Date().toISOString();

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

export default function useTradeSimulator() {
  const [positions,     setPositions]    = useState([]);
  const [pendingOrders, setPending]      = useState([]);
  const [orderHistory,  setOrderHistory] = useState([]);
  const [tradeHistory,  setTradeHistory] = useState([]);

  // Stable refs so tickQuotes doesn't go stale
  const posRef     = useRef(positions);
  const pendingRef = useRef(pendingOrders);
  posRef.current     = positions;
  pendingRef.current = pendingOrders;

  // Optional event callback — caller sets this via returned setter
  const onEventRef = useRef(null);
  const setOnEvent = useCallback((fn) => { onEventRef.current = fn; }, []);

  const emit = (type, data) => { onEventRef.current?.(type, data); };

  // ── Internal close helper (shared by manual close, SL/TP, liquidation) ──
  const _closePos = (pos, closePrice, reason = 'manual') => {
    const pnl = calcPnl(pos, closePrice);
    const fee = pos.volume * 3.5;
    setTradeHistory(prev => [{
      id: uid(), positionId: pos.id, symbol: pos.symbol,
      side: pos.side, volume: pos.volume,
      entryPrice: pos.entryPrice, exitPrice: closePrice,
      pnl, fee, swap: pos.swap ?? 0, openedAt: pos.openedAt, closedAt: now(), reason,
    }, ...prev]);
    setPositions(prev => prev.filter(p => p.id !== pos.id));
    emit(reason === 'sl' ? 'sl_triggered' : reason === 'tp' ? 'tp_triggered' : reason === 'liquidated' ? 'liquidated' : 'position_closed', { pos, closePrice, pnl });
  };

  // ── Submit order ─────────────────────────────────────────────────────────
  const submitOrder = useCallback((order) => {
    const id = uid();
    const record = {
      id, symbol: order.symbol, side: order.side,
      orderType: order.orderType, volume: order.volume,
      leverage:  order.leverage,
      sl:         order.sl ? parseFloat(order.sl) : null,
      tp:         order.tp ? parseFloat(order.tp) : null,
      limitPrice: order.limitPrice ? parseFloat(order.limitPrice) : null,
      lotSize:    order.lotSize   ?? 100000,
      pipValue:   order.pipValue  ?? 0.0001,
      submittedAt: now(), status: 'submitted',
    };

    setOrderHistory(prev => [{ ...record }, ...prev]);

    if (order.orderType === 'Market') {
      const entryPrice = order.side === 'buy' ? order.askPrice : order.bidPrice;
      if (!entryPrice) { emit('error', { message: 'No live price available' }); return; }
      const liqPrice = order.side === 'buy'
        ? entryPrice * (1 - 1 / order.leverage * 0.85)
        : entryPrice * (1 + 1 / order.leverage * 0.85);
      const pos = {
        id, symbol: order.symbol, side: order.side,
        volume: order.volume, leverage: order.leverage,
        entryPrice, currentPrice: entryPrice,
        sl: record.sl, tp: record.tp, liqPrice,
        openedAt: now(), swap: 0,
        lotSize: record.lotSize, pipValue: record.pipValue,
      };
      setPositions(prev => [pos, ...prev]);
      setOrderHistory(prev => prev.map(o => o.id === id
        ? { ...o, status: 'filled', filledAt: now(), filledPrice: entryPrice } : o));
      emit('market_fill', { pos, entryPrice });
    } else {
      const pending = { ...record, status: 'pending' };
      setPending(prev => [pending, ...prev]);
      setOrderHistory(prev => prev.map(o => o.id === id ? { ...o, status: 'pending' } : o));
      emit('pending_placed', { order: pending });
    }
  }, []);

  // ── Manual close ─────────────────────────────────────────────────────────
  const closePosition = useCallback((posId, closePrice) => {
    const pos = posRef.current.find(p => p.id === posId);
    if (!pos) return;
    _closePos(pos, closePrice, 'manual');
  }, []);

  // ── Cancel pending order ─────────────────────────────────────────────────
  const cancelOrder = useCallback((orderId) => {
    setPending(prev => prev.filter(o => o.id !== orderId));
    setOrderHistory(prev => prev.map(o => o.id === orderId
      ? { ...o, status: 'cancelled', cancelledAt: now() } : o));
    emit('order_cancelled', { orderId });
  }, []);

  // ── Tick: update prices, check SL/TP/liq, fill pending orders ───────────
  const tickQuotes = useCallback((quotesMap) => {
    const closureQueue = [];

    // Update positions
    setPositions(prev => {
      const updated = prev.map(pos => {
        const sym   = normalizeForLookup(pos.symbol);
        const quote = quotesMap[sym];
        if (!quote) return pos;
        const cp = pos.side === 'buy'
          ? (quote.bid ?? quote.last)
          : (quote.ask ?? quote.last);
        if (!cp) return pos;

        // SL check
        if (pos.sl != null && ((pos.side === 'buy' && cp <= pos.sl) || (pos.side === 'sell' && cp >= pos.sl))) {
          closureQueue.push({ pos: { ...pos, currentPrice: cp }, price: pos.sl, reason: 'sl' });
          return pos; // will be removed after
        }
        // TP check
        if (pos.tp != null && ((pos.side === 'buy' && cp >= pos.tp) || (pos.side === 'sell' && cp <= pos.tp))) {
          closureQueue.push({ pos: { ...pos, currentPrice: cp }, price: pos.tp, reason: 'tp' });
          return pos;
        }
        // Liquidation check
        if (pos.liqPrice != null && ((pos.side === 'buy' && cp <= pos.liqPrice) || (pos.side === 'sell' && cp >= pos.liqPrice))) {
          closureQueue.push({ pos: { ...pos, currentPrice: cp }, price: cp, reason: 'liquidated' });
          return pos;
        }
        return { ...pos, currentPrice: cp };
      });

      if (closureQueue.length === 0) return updated;

      const closeIds = new Set(closureQueue.map(c => c.pos.id));
      // Process closures
      closureQueue.forEach(({ pos, price, reason }) => {
        const pnl = calcPnl(pos, price);
        const fee = pos.volume * 3.5;
        setTradeHistory(prev => [{
          id: uid(), positionId: pos.id, symbol: pos.symbol,
          side: pos.side, volume: pos.volume,
          entryPrice: pos.entryPrice, exitPrice: price,
          pnl, fee, swap: pos.swap ?? 0, openedAt: pos.openedAt, closedAt: now(), reason,
        }, ...prev]);
        emit(reason === 'sl' ? 'sl_triggered' : reason === 'tp' ? 'tp_triggered' : 'liquidated',
          { pos, closePrice: price, pnl });
      });
      return updated.filter(p => !closeIds.has(p.id));
    });

    // Check pending order fills
    setPending(prev => {
      const toFill = [];
      const remaining = prev.filter(order => {
        const sym   = normalizeForLookup(order.symbol);
        const quote = quotesMap[sym];
        if (!quote || !order.limitPrice) return true;
        const ask = quote.ask ?? quote.last;
        const bid = quote.bid ?? quote.last;

        let filled = false;
        if (order.orderType === 'Limit') {
          filled = order.side === 'buy' ? (ask != null && ask <= order.limitPrice)
                                        : (bid != null && bid >= order.limitPrice);
        } else if (order.orderType === 'Stop') {
          filled = order.side === 'buy' ? (ask != null && ask >= order.limitPrice)
                                        : (bid != null && bid <= order.limitPrice);
        }
        if (filled) {
          const fillPrice = order.side === 'buy' ? ask : bid;
          toFill.push({ order, fillPrice });
          return false;
        }
        return true;
      });

      if (toFill.length) {
        toFill.forEach(({ order, fillPrice }) => {
          const liqPrice = order.side === 'buy'
            ? fillPrice * (1 - 1 / (order.leverage ?? 50) * 0.85)
            : fillPrice * (1 + 1 / (order.leverage ?? 50) * 0.85);
          const pos = {
            id: order.id, symbol: order.symbol, side: order.side,
            volume: order.volume, leverage: order.leverage,
            entryPrice: fillPrice, currentPrice: fillPrice,
            sl: order.sl, tp: order.tp, liqPrice,
            openedAt: now(), swap: 0,
            lotSize: order.lotSize ?? 100000, pipValue: order.pipValue ?? 0.0001,
          };
          setPositions(prev => [pos, ...prev]);
          setOrderHistory(prev => prev.map(o => o.id === order.id
            ? { ...o, status: 'filled', filledAt: now(), filledPrice: fillPrice } : o));
          emit('pending_filled', { order, pos, fillPrice });
        });
      }
      return remaining;
    });
  }, []);

  const unrealizedPnl = positions.reduce((s, p) => s + calcPnl(p, p.currentPrice), 0);
  const realizedPnl   = tradeHistory.reduce((s, t) => s + t.pnl, 0);
  const totalFees     = tradeHistory.reduce((s, t) => s + t.fee, 0);

  return {
    positions, pendingOrders, orderHistory, tradeHistory,
    unrealizedPnl, realizedPnl, totalFees,
    submitOrder, closePosition, cancelOrder, tickQuotes, setOnEvent,
  };
}