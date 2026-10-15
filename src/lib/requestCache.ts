/** Cache successful reads briefly; revisions invalidate even an in-flight read. */
export function createRequestCache<T>(load: () => Promise<T>, ttlMs: number) {
  let pending: Promise<T> | null = null;
  let expiresAt = 0;
  let revision: number | undefined;
  return {
    get(nextRevision: number): Promise<T> {
      if (pending && revision === nextRevision && Date.now() < expiresAt) return pending;
      revision = nextRevision;
      expiresAt = Date.now() + ttlMs;
      const request = load().catch((error) => {
        if (pending === request) pending = null;
        throw error;
      });
      pending = request;
      return request;
    },
  };
}
