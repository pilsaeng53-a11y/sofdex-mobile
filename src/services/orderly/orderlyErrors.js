/**
 * Orderly Network API error code → user-friendly message map.
 * Source: https://orderly.network/docs/build-on-evm/evm-api/error-codes
 *
 * Usage:
 *   import { getOrderlyError } from '@/services/orderly/orderlyErrors';
 *   const { title, detail, actionable } = getOrderlyError(code);
 */

const ORDERLY_ERRORS = {
  // ── Unknown / server ──────────────────────────────────────────────────────
  '-1000': {
    title:      'Server error',
    detail:     'An unknown error occurred on the exchange. Please try again.',
    actionable: 'Retry in a few seconds.',
    category:   'server',
  },

  // ── Auth ──────────────────────────────────────────────────────────────────
  '-1001': {
    title:      'Invalid API credentials',
    detail:     'API key or secret is in the wrong format.',
    actionable: 'Check your API key and secret configuration.',
    category:   'auth',
  },
  '-1002': {
    title:      'Unauthorized',
    detail:     'API key or secret is invalid, expired, or lacks required permissions.',
    actionable: 'Re-connect your wallet or regenerate your API credentials.',
    category:   'auth',
  },

  // ── Rate limit ────────────────────────────────────────────────────────────
  '-1003': {
    title:      'Rate limit exceeded',
    detail:     'Too many requests sent in a short period.',
    actionable: 'Wait a moment before retrying.',
    category:   'rateLimit',
  },

  // ── Bad request ───────────────────────────────────────────────────────────
  '-1004': {
    title:      'Unknown parameter',
    detail:     'An unrecognized parameter was included in the request.',
    actionable: 'Check the order parameters and try again.',
    category:   'badRequest',
  },
  '-1005': {
    title:      'Invalid parameter format',
    detail:     'One or more parameters are in the wrong format.',
    actionable: 'Verify price, quantity, and leverage values are within allowed ranges.',
    category:   'badRequest',
  },
  '-1006': {
    title:      'Data not found',
    detail:     'The requested data does not exist on the server.',
    actionable: 'The order may have already been filled or cancelled.',
    category:   'notFound',
  },
  '-1007': {
    title:      'Duplicate request',
    detail:     'This order or action already exists.',
    actionable: 'Avoid submitting the same order twice.',
    category:   'conflict',
  },
  '-1008': {
    title:      'Settlement quantity too high',
    detail:     'The settlement amount exceeds the permitted maximum.',
    actionable: 'Reduce the settlement quantity and try again.',
    category:   'badRequest',
  },
  '-1009': {
    title:      'Cannot withdraw — arrears pending',
    detail:     'A withdrawal settlement cannot be processed while outstanding debts exist.',
    actionable: 'Deposit funds to cover arrears before withdrawing.',
    category:   'badRequest',
  },
  '-1011': {
    title:      'Internal network error',
    detail:     'Order could not be placed or cancelled due to a temporary internal error.',
    actionable: 'Try again in a few seconds.',
    category:   'internal',
  },
  '-1012': {
    title:      'Order rejected',
    detail:     'The order was rejected — your account may be in liquidation or experiencing an internal error.',
    actionable: 'Check your account status and try again shortly.',
    category:   'internal',
  },

  // ── Risk / margin ─────────────────────────────────────────────────────────
  '-1101': {
    title:      'Risk exposure too high',
    detail:     'Your order size or leverage would exceed allowed risk exposure.',
    actionable: 'Reduce position size or lower leverage to proceed.',
    category:   'risk',
  },
  '-1102': {
    title:      'Order value too small',
    detail:     'The notional value (price × size) is below the minimum allowed.',
    actionable: 'Increase your order size.',
    category:   'size',
  },

  // ── Price validation ──────────────────────────────────────────────────────
  '-1103': {
    title:      'Invalid order price',
    detail:     'Order price is outside allowed range or does not match the tick size.',
    actionable: 'Adjust the price to comply with tick size and min/max price limits.',
    category:   'price',
  },

  // ── Quantity validation ───────────────────────────────────────────────────
  '-1104': {
    title:      'Invalid order quantity',
    detail:     'Order quantity is outside the allowed range or does not match the step size.',
    actionable: 'Adjust the quantity to comply with step size and min/max limits.',
    category:   'size',
  },

  // ── Price deviation ───────────────────────────────────────────────────────
  '-1105': {
    title:      'Price too far from market',
    detail:     'The limit price is too far from the current mid price.',
    actionable: 'Move the limit price closer to the market price.',
    category:   'price',
  },

  // ── Liquidation ───────────────────────────────────────────────────────────
  '-1201': {
    title:      'Liquidation ratio error',
    detail:     'The liquidation request ratio is invalid or total notional is below the minimum.',
    actionable: 'Ensure total notional ≥ $10,000 and ratio_qty_request is set to 1.',
    category:   'liquidation',
  },
  '-1202': {
    title:      'Liquidation not needed',
    detail:     'No liquidation is required — account margin is sufficient, or the liquidation ID was not found.',
    actionable: 'Verify the account state or liquidation ID.',
    category:   'liquidation',
  },
};

/**
 * Resolve an Orderly error code to a structured error object.
 * @param {number|string} code  e.g. -1101 or "-1101"
 * @returns {{ title: string, detail: string, actionable: string, category: string }}
 */
export function getOrderlyError(code) {
  const key = String(code);
  return ORDERLY_ERRORS[key] ?? {
    title:      'Unknown exchange error',
    detail:     `Error code ${code}`,
    actionable: 'Please try again or contact support.',
    category:   'unknown',
  };
}

/**
 * Resolve an Orderly error response object (e.g. { code, message }) to a
 * human-readable string suitable for toasts / inline error banners.
 * @param {{ code?: number, message?: string } | null | undefined} err
 * @returns {string}
 */
export function formatOrderlyError(err) {
  if (!err) return 'An unexpected error occurred.';
  const mapped = getOrderlyError(err.code);
  // If we have a specific mapping, use it; otherwise fall back to API message
  if (mapped.category !== 'unknown') {
    return `${mapped.title}: ${mapped.actionable}`;
  }
  return err.message ?? mapped.detail;
}

export default ORDERLY_ERRORS;