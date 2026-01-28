/**
 * Tiny API client for future backend integration.
 * Reads REACT_APP_API_BASE or REACT_APP_BACKEND_URL and exposes stubbed functions.
 */

const rawBase =
  process.env.REACT_APP_API_BASE ||
  process.env.REACT_APP_BACKEND_URL ||
  "";

/**
 * Normalize base URL (no trailing slash).
 * If empty, calls can be skipped by consumers.
 */
const baseURL = rawBase.replace(/\/+$/, "");

// PUBLIC_INTERFACE
export function getApiBaseUrl() {
  /** Returns the configured API base URL (may be empty if not set). */
  return baseURL;
}

// PUBLIC_INTERFACE
export async function validateMove({ board, index, player }) {
  /**
   * Example stub for backend validation.
   * For now this is optional and not required for gameplay.
   *
   * When backend is available, this can call something like:
   * POST `${baseURL}/validate-move`
   */
  if (!baseURL) {
    return { ok: true, source: "local-stub" };
  }

  // Minimal safe example: call backend root if available (current spec exposes GET "/")
  // to verify connectivity, but do not block gameplay if it fails.
  try {
    const res = await fetch(`${baseURL}/`, { method: "GET" });
    if (!res.ok) return { ok: true, source: "backend-unavailable" };
    return { ok: true, source: "backend-healthcheck" };
  } catch (e) {
    return { ok: true, source: "backend-error" };
  }
}
