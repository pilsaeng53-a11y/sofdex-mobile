/**
 * useTradeSimulator — local (pre-database) trading simulation engine.
 *
 * Core fix: tickQuotes reads from refs, computes all changes synchronously,
 * then applies state updates and emits events — never inside an updater function.
 */
import { useState, useCallback, useRef } from 'react';

let _id = 1;
const uid  = () => `sim-${_id++}`;
const now  = () => new Date().toISOString();

function calcPnl(pos, closePrice) {
  if (!pos || !closePrice) return 0;
  const diff = pos.side === 'buy'
    ? closePrice - pos.entryPrice
    : pos.entryPrice - closePrice;
  return diff * pos.volume * (pos.lotSize ?? 100000);
}

// Strip "-T" / "-PERP" suffixes for quote map lookup
function normSym(symbol) {
  return symbol.replace(/-T$/, '').replace(/-PERP$/, '').toUpperCase();
}

function makeLiqPrice(side, price, leverage) {
  const lev = leverage ?? 50;
  return side === 'buy'
    ? price * (1 - 1 / lev * 0.85)
    : price * (1 + 1 / lev * 0.85);
}

export default function useTradeSimulator() {
  const [positions,    setPositions]   = useState([]);
  const [pendingOrders, setPending]    = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);

  // Always-current refs — updated on every render
  const posRef     = useRef([]);
  const pendingRef = useRef([]);
  posRef.current     = positions;
  pendingRef.current = pendingOrders;

  const onEventRef = useRef(null);
  const setOnEvent = useCallback((fn) => { onEventRef.current = fn; }, []);
  const emit = useCallback((type, data) => { onEventRef.current?.(type, data); }, []);

  // ── Submit order ──────────────────────────────────────────────────────────
  const submitOrder = useCallback((order) => {
    const id  = uid();
    const sl  = order.sl  ? parseFloat(order.sl)  : null;
    const tp  = order.tp  ? parseFloat(order.tp)  : null;
    const lp  = order.limitPrice ? parseFloat(order.limitPrice) : null;

    const record = {
      id, symbol: order.symbol, side: order.side,
      orderType:  order.orderType, volume: order.volume,
      leverage:   order.leverage,
      sl, tp, limitPrice: lp,
      lotSize:   order.lotSize  ?? 100000,
      pipValue:  order.pipValue ?? 0.0001,
      submittedAt: now(), status: 'submitted',
    };

    setOrderHistory(prev => [record, ...prev]);

    if (order.orderType === 'Market') {
      // Buy executes at ask, Sell executes at bid
      const entryPrice = order.side === 'buy' ? order.askPrice : order.bidPrice;
      if (!entryPrice) { emit('error', { message: 'No live price — try again' }); return; }

      const pos = {
        id, symbol: order.symbol, side: order.side,
        volume: order.volume, leverage: order.leverage,
        entryPrice, currentPrice: entryPrice,
        sl, tp,
        liqPrice: makeLiqPrice(order.side, entryPrice, order.leverage),
        openedAt: now(), swap: 0,
        lotSize: record.lotSize, pipValue: record.pipValue,
      };
      setPositions(prev => [pos, ...prev]);
      setOrderHistory(prev => prev.map(o =>
        o.id === id ? { ...o, status: 'filled', filledAt: now(), filledPrice: entryPrice } : o
      ));
      emit('market_fill', { pos, entryPrice });

    } else {
      // Limit or Stop — goes to pending queue
      const pending = { ...record, status: 'pending' };
      setPending(prev => [pending, ...prev]);
      setOrderHistory(prev => prev.map(o =>
        o.id === id ? { ...o, status: 'pending' } : o
      ));
      emit('pending_placed', { order: pending });
    }
  }, [emit]);

  // ── Manual close position ─────────────────────────────────────────────────
  const closePosition = useCallback((posId, closePrice) => {
    const pos = posRef.current.find(p => p.id === posId);
    if (!pos) return;
    const pnl = calcPnl(pos, closePrice);
    const fee = pos.volume * 3.5;
    const trade = {
      id: uid(), positionId: pos.id, symbol: pos.symbol,
      side: pos.side, volume: pos.volume,
      entryPrice: pos.entryPrice, exitPrice: closePrice,
      pnl, fee, swap: pos.swap ?? 0,
      openedAt: pos.openedAt, closedAt: now(), reason: 'manual',
    };
    setTradeHistory(prev => [trade, ...prev]);
    setPositions(prev => prev.filter(p => p.id !== posId));
    emit('position_closed', { pos, closePrice, pnl });
  }, [emit]);

  // ── Cancel pending order ──────────────────────────────────────────────────
  const cancelOrder = useCallback((orderId) => {
    setPending(prev => prev.filter(o => o.id !== orderId));
    setOrderHistory(prev => prev.map(o =>
      o.id === orderId ? { ...o, status: 'cancelled', cancelledAt: now() } : o
    ));
    emit('order_cancelled', { orderId });
  }, [emit]);

  // ── Tick: called on every live quote update ───────────────────────────────
  // Reads exclusively from refs so it never sees stale closures.
  // Computes ALL changes first, then applies state + emits — never inside updaters.
  const tickQuotes = useCallback((quotesMap) => {
    const curPositions = posRef.current;
    const curPending   = pendingRef.current;

    // 1. Process open positions ───────────────────────────────────────────
    const nextPositions = [];   // positions that remain open (updated price)
    const closures      = [];   // { pos, price, reason }

    for (const pos of curPositions) {
      const quote = quotesMap[normSym(pos.symbol)];
      if (!quote) { nextPositions.push(pos); continue; }

      // Open BUY positions mark-to-market at bid (the close price for a buy)
      // Open SELL positions mark-to-market at ask (the close price for a sell)
      const cp = pos.side === 'buy'
        ? (quote.bid ?? quote.last)
        : (quote.ask ?? quote.last);

      if (!cp) { nextPositions.push(pos); continue; }

      const updated = { ...pos, currentPrice: cp };

      // Stop Loss
      if (pos.sl != null) {
        const hit = pos.side === 'buy' ? cp <= pos.sl : cp >= pos.sl;
        if (hit) { closures.push({ pos: updated, price: pos.sl, reason: 'sl' }); continue; }
      }
      // Take Profit
      if (pos.tp != null) {
        const hit = pos.side === 'buy' ? cp >= pos.tp : cp <= pos.tp;
        if (hit) { closures.push({ pos: updated, price: pos.tp, reason: 'tp' }); continue; }
      }
      // Liquidation (checked after SL/TP so SL fires first)
      if (pos.liqPrice != null) {
        const hit = pos.side === 'buy' ? cp <= pos.liqPrice : cp >= pos.liqPrice;
        if (hit) { closures.push({ pos: updated, price: cp, reason: 'liquidated' }); continue; }
      }

      nextPositions.push(updated);
    }

    // 2. Process pending orders ───────────────────────────────────────────
    const remainingPending = [];
    const fills            = [];   // { order, fillPrice }

    for (const order of curPending) {
      const quote = quotesMap[normSym(order.symbol)];
      if (!quote || order.limitPrice == null) { remainingPending.push(order); continue; }

      const ask = quote.ask ?? quote.last;
      const bid = quote.bid ?? quote.last;
      let filled = false;

      if (order.orderType === 'Limit') {
        // Buy Limit: execute when ask falls to or below the limit price
        // Sell Limit: execute when bid rises to or above the limit price
        if (order.side === 'buy')  filled = ask != null && ask <= order.limitPrice;
        else                       filled = bid != null && bid >= order.limitPrice;
      } else if (order.orderType === 'Stop') {
        // Buy Stop: execute when ask rises to or above the stop price
        // Sell Stop: execute when bid falls to or below the stop price
        if (order.side === 'buy')  filled = ask != null && ask >= order.limitPrice;
        else                       filled = bid != null && bid <= order.limitPrice;
      }

      if (filled) {
        const fillPrice = order.side === 'buy' ? ask : bid;
        fills.push({ order, fillPrice });
      } else {
        remainingPending.push(order);
      }
    }

    // 3. Build new positions from filled pending orders ───────────────────
    const filledPositions = fills.map(({ order, fillPrice }) => ({
      id: order.id, symbol: order.symbol, side: order.side,
      volume: order.volume, leverage: order.leverage,
      entryPrice: fillPrice, currentPrice: fillPrice,
      sl: order.sl, tp: order.tp,
      liqPrice: makeLiqPrice(order.side, fillPrice, order.leverage),
      openedAt: now(), swap: 0,
      lotSize: order.lotSize ?? 100000, pipValue: order.pipValue ?? 0.0001,
    }));

    // 4. Build trade records for closures ────────────────────────────────
    const newTrades = closures.map(({ pos, price, reason }) => ({
      id: uid(), positionId: pos.id, symbol: pos.symbol,
      side: pos.side, volume: pos.volume,
      entryPrice: pos.entryPrice, exitPrice: price,
      pnl: calcPnl(pos, price),
      fee: pos.volume * 3.5,
      swap: pos.swap ?? 0,
      openedAt: pos.openedAt, closedAt: now(), reason,
    }));

    // 5. Apply all state updates ──────────────────────────────────────────
    const finalPositions = [...nextPositions, ...filledPositions];
    setPositions(finalPositions);

    if (remainingPending.length !== curPending.length) {
      setPending(remainingPending);
    }

    if (newTrades.length) {
      setTradeHistory(prev => [...newTrades, ...prev]);
    }

    if (fills.length) {
      setOrderHistory(prev => {
        let updated = prev;
        fills.forEach(({ order, fillPrice }) => {
          updated = updated.map(o =>
            o.id === order.id
              ? { ...o, status: 'filled', filledAt: now(), filledPrice: fillPrice }
              : o
          );
        });
        return updated;
      });
    }

    // 6. Emit events (always after state updates, never inside updaters) ──
    closures.forEach(({ pos, price, reason }) => {
      const pnl = calcPnl(pos, price);
      const evtType = reason === 'sl' ? 'sl_triggered'
                    : reason === 'tp' ? 'tp_triggered'
                    : 'liquidated';
      emit(evtType, { pos, closePrice: price, pnl });
    });

    fills.forEach(({ order, fillPrice }) => {
      const pos = filledPositions.find(p => p.id === order.id);
      emit('pending_filled', { order, pos, fillPrice });
    });

  }, [emit]);  // emit is stable (useCallback [])

  // ── Derived totals ────────────────────────────────────────────────────────
  const unrealizedPnl = positions.reduce((s, p) => s + calcPnl(p, p.currentPrice), 0);
  const realizedPnl   = tradeHistory.reduce((s, t) => s + t.pnl, 0);
  const totalFees     = tradeHistory.reduce((s, t) => s + t.fee, 0);

  return {
    positions, pendingOrders, orderHistory, tradeHistory,
    unrealizedPnl, realizedPnl, totalFees,
    submitOrder, closePosition, cancelOrder, tickQuotes, setOnEvent,
  };
}