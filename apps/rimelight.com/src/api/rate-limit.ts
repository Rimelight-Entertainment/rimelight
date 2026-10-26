type Limiter = { limit(options: { key: string }): Promise<{ success: boolean }> };

/**
 * Checks one key against a Cloudflare rate-limit binding. Returns `true` when the request may
 * continue. A missing binding or a failed check lets the request through, matching the security
 * middleware's default of fail-open.
 */
export async function allowRequest(limiter: Limiter | undefined, key: string): Promise<boolean> {
  if (typeof limiter?.limit !== "function") return true;
  try {
    return (await limiter.limit({ key })).success;
  } catch {
    return true;
  }
}
