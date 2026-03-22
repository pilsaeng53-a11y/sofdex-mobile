# SolFort Futures — Database Schema Design
**Version:** 2.0 · Post market-data integration  
**Target:** Neon/Postgres (compatible with Base44 entities for MVP)  
**Date:** 2026-03-22

---

## Design Principles

1. **Public market data is never stored per-tick.** Orderly WebSocket data is consumed in real-time and not persisted (except optional daily snapshots for analytics).
2. **User/account data is fully separated from market data.**
3. **Token metadata (CoinGecko, logo, supply) is separated from trading prices.**
4. **Cache tables use short TTLs and are flagged explicitly.**
5. **All foreign keys reference `users.id` (UUID) — matches Orderly's account model.**

---

## Tables

---

### `users`
> Core identity table. Maps platform user to Orderly account.

| Column              | Type         | Notes                                      |
|---------------------|--------------|--------------------------------------------|
| `id`                | UUID PK      | App-level user ID                          |
| `email`             | TEXT UNIQUE  | Auth email                                 |
| `full_name`         | TEXT         |                                            |
| `role`              | TEXT         | `admin` / `user` / `partner`               |
| `wallet_address`    | TEXT UNIQUE  | Primary Solana wallet                      |
| `orderly_account_id`| TEXT UNIQUE  | Linked Orderly Network account ID          |
| `kyc_status`        | TEXT         | `none` / `pending` / `verified`            |
| `referral_code`     | TEXT UNIQUE  | Auto-generated on registration             |
| `referred_by`       | UUID → users | Self-referential                           |
| `created_at`        | TIMESTAMPTZ  |                                            |
| `updated_at`        | TIMESTAMPTZ  |                                            |

---

### `user_settings`
> Per-user app preferences. One row per user.

| Column                  | Type     | Notes                                     |
|-------------------------|----------|-------------------------------------------|
| `user_id`               | UUID FK  | → users.id (UNIQUE — one row per user)    |
| `display_currency`      | TEXT     | `USD` / `KRW` / `JPY` etc.               |
| `language`              | TEXT     | `en` / `ko` / `zh` etc.                  |
| `theme`                 | TEXT     | `dark` (default) / `light`               |
| `default_leverage`      | INT      | 1–100                                     |
| `default_order_type`    | TEXT     | `limit` / `market`                        |
| `notifications_enabled` | BOOL     | Global notification toggle                |
| `trading_alerts`        | BOOL     | Price alert emails/push                   |
| `region`                | TEXT     | ISO 3166-1 alpha-2 (e.g. `KR`, `AE`)     |
| `timezone`              | TEXT     | IANA tz string                            |
| `updated_at`            | TIMESTAMPTZ |                                        |

---

### `watchlists`
> User-curated symbol watchlists.

| Column       | Type        | Notes                                     |
|--------------|-------------|-------------------------------------------|
| `id`         | UUID PK     |                                           |
| `user_id`    | UUID FK     | → users.id                                |
| `name`       | TEXT        | e.g. "My Crypto", "FX Majors"            |
| `symbols`    | TEXT[]      | Array of base symbols, e.g. `{BTC, ETH}` |
| `is_default` | BOOL        | One default per user                      |
| `created_at` | TIMESTAMPTZ |                                           |
| `updated_at` | TIMESTAMPTZ |                                           |

*Index: `(user_id)`*

---

### `symbols`
> Master list of tradeable instruments (both Orderly perps and CFD instruments).

| Column           | Type     | Notes                                          |
|------------------|----------|------------------------------------------------|
| `id`             | TEXT PK  | Canonical symbol key, e.g. `PERP_BTC_USDC`    |
| `base`           | TEXT     | `BTC`                                          |
| `quote`          | TEXT     | `USDC`                                         |
| `display_name`   | TEXT     | `BTC-USDC`                                     |
| `market_type`    | TEXT     | `crypto_perp` / `cfd_index` / `cfd_forex` / `cfd_commodity` |
| `broker`         | TEXT     | `orderly` / `vantage` / `internal`             |
| `is_active`      | BOOL     | Whether currently tradeable                    |
| `max_leverage`   | INT      | Max allowed leverage                           |
| `min_qty`        | NUMERIC  | Minimum order quantity                         |
| `qty_step`       | NUMERIC  | Order quantity step                            |
| `price_decimals` | INT      | Display decimal places for price               |
| `qty_decimals`   | INT      | Display decimal places for quantity            |
| `category`       | TEXT     | e.g. `layer1`, `defi`, `forex_major`           |
| `created_at`     | TIMESTAMPTZ |                                             |
| `updated_at`     | TIMESTAMPTZ |                                             |

*Index: `(market_type)`, `(broker)`, `(base)`*

---

### `token_metadata`
> CoinGecko / external metadata for crypto tokens.  
> **NOT used for trading prices** — purely for display, logos, market cap context.

| Column              | Type        | Notes                                        |
|---------------------|-------------|----------------------------------------------|
| `symbol`            | TEXT PK     | Base symbol, e.g. `BTC`                      |
| `name`              | TEXT        | Full name, e.g. `Bitcoin`                    |
| `coingecko_id`      | TEXT        | For API lookups                              |
| `logo_url`          | TEXT        | CDN logo URL                                 |
| `website`           | TEXT        |                                              |
| `whitepaper_url`    | TEXT        |                                              |
| `circulating_supply`| NUMERIC     | From CoinGecko — NOT for price calc          |
| `max_supply`        | NUMERIC     | NULL = unlimited                             |
| `market_cap_usd`    | NUMERIC     | Snapshot value — NOT live                    |
| `cg_rank`           | INT         | CoinGecko market cap rank                    |
| `description`       | TEXT        | Short token description                      |
| `categories`        | TEXT[]      | e.g. `{defi, layer1}`                        |
| `last_fetched_at`   | TIMESTAMPTZ | When this row was last refreshed             |

*Refresh: daily job. Never used for order/margin calculations.*

---

### `market_snapshots_cache`
> **CACHE TABLE** — Daily OHLCV summary snapshots per symbol.  
> Purpose: historical chart context, analytics dashboard. NOT real-time.

| Column        | Type        | Notes                                  |
|---------------|-------------|----------------------------------------|
| `id`          | UUID PK     |                                        |
| `symbol_id`   | TEXT FK     | → symbols.id                           |
| `snapshot_date`| DATE       | Date of snapshot (UTC)                 |
| `open`        | NUMERIC     |                                        |
| `high`        | NUMERIC     |                                        |
| `low`         | NUMERIC     |                                        |
| `close`       | NUMERIC     |                                        |
| `volume`      | NUMERIC     |                                        |
| `open_interest`| NUMERIC    | End-of-day OI snapshot                 |
| `funding_rate` | NUMERIC    | 8h funding rate at close               |
| `source`      | TEXT        | `orderly` / `binance` / `coingecko`    |
| `created_at`  | TIMESTAMPTZ |                                        |

*Index: `(symbol_id, snapshot_date)` UNIQUE*  
*Partition by month if row count exceeds 500K*  
*TTL: keep 2 years, archive older*

---

### `order_form_preferences`
> Persists the user's last-used order form state per symbol.  
> Used to restore the form exactly as the user left it.

| Column             | Type     | Notes                                  |
|--------------------|----------|----------------------------------------|
| `user_id`          | UUID FK  | → users.id                             |
| `symbol_id`        | TEXT FK  | → symbols.id                           |
| `side`             | TEXT     | `buy` / `sell`                         |
| `order_type`       | TEXT     | `limit` / `market`                     |
| `leverage`         | INT      |                                        |
| `denomination`     | TEXT     | `base` / `quote` / `percent`           |
| `last_price_used`  | NUMERIC  | For reference display only             |
| `updated_at`       | TIMESTAMPTZ |                                     |

*PK: `(user_id, symbol_id)`*

---

### `positions`
> Live open positions. Synced from Orderly account on load.  
> Source of truth is Orderly — this is a local cache for fast dashboard display.

| Column             | Type        | Notes                                      |
|--------------------|-------------|--------------------------------------------|
| `id`               | UUID PK     |                                            |
| `user_id`          | UUID FK     | → users.id                                 |
| `symbol_id`        | TEXT FK     | → symbols.id                               |
| `side`             | TEXT        | `buy` (long) / `sell` (short)              |
| `size`             | NUMERIC     | Current position size in base units        |
| `avg_entry_price`  | NUMERIC     |                                            |
| `mark_price`       | NUMERIC     | Last synced mark price                     |
| `unrealized_pnl`   | NUMERIC     |                                            |
| `realized_pnl`     | NUMERIC     |                                            |
| `liq_price`        | NUMERIC     | Estimated liquidation price                |
| `margin_used`      | NUMERIC     |                                            |
| `leverage`         | INT         |                                            |
| `tp_price`         | NUMERIC     | NULL if not set                            |
| `sl_price`         | NUMERIC     | NULL if not set                            |
| `status`           | TEXT        | `open` / `closing` / `liquidated`          |
| `orderly_position_id`| TEXT      | Remote position ID for sync                |
| `opened_at`        | TIMESTAMPTZ |                                            |
| `updated_at`       | TIMESTAMPTZ |                                            |

*Index: `(user_id, status)`, `(symbol_id)`*

---

### `open_orders`
> Active/pending orders. Synced from Orderly.

| Column            | Type        | Notes                                      |
|-------------------|-------------|--------------------------------------------|
| `id`              | UUID PK     | Local order ID                             |
| `orderly_order_id`| TEXT UNIQUE | Remote order ID                            |
| `user_id`         | UUID FK     | → users.id                                 |
| `symbol_id`       | TEXT FK     | → symbols.id                               |
| `side`            | TEXT        | `buy` / `sell`                             |
| `type`            | TEXT        | `limit` / `market` / `stop_limit`          |
| `price`           | NUMERIC     | NULL for market orders                     |
| `qty`             | NUMERIC     | Original requested quantity                |
| `filled_qty`      | NUMERIC     | Quantity filled so far                     |
| `status`          | TEXT        | `new` / `partial` / `cancelled` / `rejected` |
| `time_in_force`   | TEXT        | `GTC` / `IOC` / `FOK`                     |
| `created_at`      | TIMESTAMPTZ |                                            |
| `updated_at`      | TIMESTAMPTZ |                                            |

*Index: `(user_id, status)`, `(symbol_id, status)`*

---

### `order_history`
> Completed, cancelled, or rejected orders.

| Column            | Type        | Notes                                      |
|-------------------|-------------|--------------------------------------------|
| `id`              | UUID PK     |                                            |
| `orderly_order_id`| TEXT UNIQUE |                                            |
| `user_id`         | UUID FK     |                                            |
| `symbol_id`       | TEXT FK     |                                            |
| `side`            | TEXT        |                                            |
| `type`            | TEXT        |                                            |
| `price`           | NUMERIC     |                                            |
| `qty`             | NUMERIC     |                                            |
| `filled_qty`      | NUMERIC     |                                            |
| `avg_fill_price`  | NUMERIC     |                                            |
| `fee`             | NUMERIC     | Total fee paid                             |
| `status`          | TEXT        | `filled` / `cancelled` / `rejected`        |
| `reject_reason`   | TEXT        | NULL unless rejected                       |
| `created_at`      | TIMESTAMPTZ |                                            |
| `closed_at`       | TIMESTAMPTZ |                                            |

*Partition by `created_at` monthly if volume is high*  
*Index: `(user_id, created_at DESC)`, `(symbol_id, created_at DESC)`*

---

### `trade_history`
> Individual fill records (executions against the orderbook).

| Column          | Type        | Notes                                  |
|-----------------|-------------|----------------------------------------|
| `id`            | UUID PK     |                                        |
| `order_id`      | UUID FK     | → order_history.id                     |
| `user_id`       | UUID FK     |                                        |
| `symbol_id`     | TEXT FK     |                                        |
| `side`          | TEXT        |                                        |
| `fill_price`    | NUMERIC     |                                        |
| `fill_qty`      | NUMERIC     |                                        |
| `fee`           | NUMERIC     |                                        |
| `fee_asset`     | TEXT        | e.g. `USDC`                            |
| `is_maker`      | BOOL        | Maker vs taker fill                    |
| `realized_pnl`  | NUMERIC     | NULL for opening fills                 |
| `executed_at`   | TIMESTAMPTZ |                                        |

*Partition by `executed_at` monthly*  
*Index: `(user_id, executed_at DESC)`, `(order_id)`*

---

### `notifications`
> In-app and push notification records.

| Column       | Type        | Notes                                      |
|--------------|-------------|--------------------------------------------|
| `id`         | UUID PK     |                                            |
| `user_id`    | UUID FK     |                                            |
| `type`       | TEXT        | `fill` / `liquidation` / `price_alert` / `system` / `partner` |
| `title`      | TEXT        |                                            |
| `body`       | TEXT        |                                            |
| `data`       | JSONB       | Type-specific payload (e.g. `{symbol, price}`) |
| `is_read`    | BOOL        | Default FALSE                              |
| `created_at` | TIMESTAMPTZ |                                            |

*Index: `(user_id, is_read, created_at DESC)`*  
*TTL: auto-delete after 90 days*

---

### `partner_inquiries`
> Sales partner / affiliate program inquiries.

| Column         | Type        | Notes                                  |
|----------------|-------------|----------------------------------------|
| `id`           | UUID PK     |                                        |
| `user_id`      | UUID FK     | NULL if pre-registration               |
| `name`         | TEXT        |                                        |
| `email`        | TEXT        |                                        |
| `telegram`     | TEXT        |                                        |
| `wallet_address`| TEXT       |                                        |
| `region`       | TEXT        |                                        |
| `experience`   | TEXT        | `beginner` / `intermediate` / `advanced` / `professional` |
| `message`      | TEXT        | Free-text pitch                        |
| `referral_source`| TEXT      | How they heard about us                |
| `status`       | TEXT        | `pending` / `approved` / `rejected` / `withdrawn` |
| `reviewed_by`  | UUID FK     | → users.id (admin who reviewed)        |
| `reviewed_at`  | TIMESTAMPTZ |                                        |
| `notes`        | TEXT        | Internal admin notes                   |
| `created_at`   | TIMESTAMPTZ |                                        |

*Index: `(status, created_at DESC)`*

---

### `business_registrations`
> Institutional / business account onboarding submissions.

| Column               | Type        | Notes                                    |
|----------------------|-------------|------------------------------------------|
| `id`                 | UUID PK     |                                          |
| `user_id`            | UUID FK     |                                          |
| `business_name`      | TEXT        |                                          |
| `business_type`      | TEXT        | `fund` / `prop_firm` / `family_office` / `corporate` |
| `country`            | TEXT        | ISO-2 code                               |
| `registration_number`| TEXT        |                                          |
| `contact_name`       | TEXT        |                                          |
| `contact_email`      | TEXT        |                                          |
| `contact_phone`      | TEXT        |                                          |
| `telegram`           | TEXT        |                                          |
| `aum_range`          | TEXT        | e.g. `$1M–$10M`                          |
| `trading_instruments`| TEXT[]      | e.g. `{crypto_perp, forex_cfd}`          |
| `intended_volume`    | TEXT        | Monthly volume estimate                  |
| `documents_url`      | TEXT[]      | Uploaded document URLs                   |
| `status`             | TEXT        | `pending` / `reviewing` / `approved` / `rejected` |
| `reviewed_by`        | UUID FK     | → users.id                               |
| `reviewed_at`        | TIMESTAMPTZ |                                          |
| `notes`              | TEXT        |                                          |
| `created_at`         | TIMESTAMPTZ |                                          |

*Index: `(status, created_at DESC)`*

---

## What is NOT stored

| Data type                        | Reason                                          |
|----------------------------------|-------------------------------------------------|
| Orderly tick-by-tick prices      | Consumed in real-time via WS; not persisted     |
| Full orderbook snapshots         | Orderly API is source of truth; not replicated  |
| Binance / CoinGecko live prices  | Display-only; stored in React state only        |
| JWT / session tokens             | Managed by Orderly SDK / app auth layer         |
| Raw WS frame logs                | Handled by `publicMarketService.js` in memory   |

---

## Indexing notes for Postgres

```sql
-- Hot path: user dashboard
CREATE INDEX idx_positions_user_status  ON positions   (user_id, status);
CREATE INDEX idx_open_orders_user       ON open_orders (user_id, status);
CREATE INDEX idx_notifications_unread   ON notifications (user_id, is_read, created_at DESC);
CREATE INDEX idx_order_history_user_ts  ON order_history (user_id, created_at DESC);
CREATE INDEX idx_trade_history_user_ts  ON trade_history  (user_id, executed_at DESC);

-- Admin dashboard
CREATE INDEX idx_partner_inquiries_status    ON partner_inquiries       (status, created_at DESC);
CREATE INDEX idx_biz_reg_status              ON business_registrations  (status, created_at DESC);

-- Symbol lookups
CREATE INDEX idx_symbols_market_type ON symbols (market_type);
CREATE INDEX idx_symbols_broker      ON symbols (broker);
```

---

## Migration path: Base44 → Neon/Postgres

| Phase | Action |
|-------|--------|
| **MVP** | Use Base44 entities for all tables. Map JSON schema → entity fields. |
| **Beta** | Add Neon Postgres. Migrate `trade_history`, `order_history`, `positions` first (high-volume). |
| **Production** | Move all user/account tables to Postgres. Keep Base44 for notifications/settings. |
| **Scale** | Partition `trade_history` and `market_snapshots_cache` by month. Add read replicas. |