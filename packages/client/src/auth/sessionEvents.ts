/** Dispatched when the API rejects the session (e.g. expired JWT). AuthProvider clears React state + read caches. */
export const SESSION_INVALIDATED_EVENT = "dimome:session-invalidated";

export function emitSessionInvalidated(): void {
  window.dispatchEvent(new CustomEvent(SESSION_INVALIDATED_EVENT));
}
