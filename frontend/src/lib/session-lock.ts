let queue: Promise<unknown> = Promise.resolve();
/** Refresh and session-changing requests share one browser-wide lock. */
export async function withSessionLock<T>(action: () => Promise<T>): Promise<T> {
  if (typeof navigator !== 'undefined' && navigator.locks) return await navigator.locks.request('flyngo-refresh', action);
  const result = queue.then(action, action);
  queue = result.catch(() => undefined);
  return await result;
}
