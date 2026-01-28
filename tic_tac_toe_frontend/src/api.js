/**
 * Tiny API client for backend integration.
 * Reads REACT_APP_API_BASE or REACT_APP_BACKEND_URL and exposes helper functions.
 *
 * Backend default: http://localhost:3001
 */

const envBase =
  process.env.REACT_APP_API_BASE || process.env.REACT_APP_BACKEND_URL || "";

/**
 * Normalize base URL (no trailing slash).
 * If env var is empty/unset, default to localhost backend.
 */
const baseURL = (envBase && envBase.trim()
  ? envBase.trim()
  : "http://localhost:3001"
).replace(/\/+$/, "");

// PUBLIC_INTERFACE
export function getApiBaseUrl() {
  /** Returns the configured API base URL. */
  return baseURL;
}

function normalizeBoardForBackend(board) {
  // Backend schema expects an array of 9 strings: "X", "O", or "".
  return board.map((cell) => (cell == null ? "" : cell));
}

async function fetchJson(url, options) {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options && options.headers ? options.headers : {}),
    },
  });

  // Try to parse JSON even when non-2xx so we can surface meaningful errors.
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    data = text;
  }

  if (!res.ok) {
    const msg =
      (data && data.detail && JSON.stringify(data.detail)) ||
      (typeof data === "string" && data) ||
      `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.body = data;
    throw err;
  }

  return data;
}

// PUBLIC_INTERFACE
export async function validateMove({ board, index, player }) {
  /**
   * Calls backend POST /validate-move to validate a move.
   *
   * Params:
   * - board: array(9) of "X" | "O" | null
   * - index: number 0..8
   * - player: "X" | "O"
   *
   * Returns:
   * - { valid: boolean, reason?: string | null }
   */
  return fetchJson(`${baseURL}/validate-move`, {
    method: "POST",
    body: JSON.stringify({
      board: normalizeBoardForBackend(board),
      moveIndex: index,
      player,
    }),
  });
}

// PUBLIC_INTERFACE
export async function computeOutcome({ board }) {
  /**
   * Calls backend POST /compute-outcome to compute winner/draw information.
   *
   * Params:
   * - board: array(9) of "X" | "O" | null
   *
   * Returns:
   * - { winner: "X" | "O" | null, isDraw: boolean, winningLine: number[] | null }
   */
  return fetchJson(`${baseURL}/compute-outcome`, {
    method: "POST",
    body: JSON.stringify({
      board: normalizeBoardForBackend(board),
    }),
  });
}
