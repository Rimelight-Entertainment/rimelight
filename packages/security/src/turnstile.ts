export interface TurnstileVerifyOptions {
  /**
   * The response token provided by the Turnstile client-side widget (e.g. `cf-turnstile-response`).
   */
  token?: string | null | undefined;

  /**
   * The secret key for Turnstile verification. Can be passed directly or read from `env`.
   */
  secretKey?: string | undefined;

  /**
   * The Cloudflare environment or process environment object containing TURNSTILE_SECRET_KEY /
   * TURNSTILE_SITE_KEY.
   */
  env?: any;

  /**
   * The client's IP address (e.g. from `CF-Connecting-IP` or `Astro.clientAddress`).
   */
  remoteIp?: string | undefined;

  /**
   * Whether to fail open (succeed) if keys are not configured or during network errors. Defaults to
   * `true` (safe for local development).
   */
  failOpen?: boolean | undefined;

  /**
   * Custom verify endpoint URL. Defaults to
   * `https://challenges.cloudflare.com/turnstile/v0/siteverify`.
   */
  endpoint?: string | undefined;
}

export interface TurnstileVerifyResult {
  success: boolean;
  error?: string | undefined;
  errorCodes?: string[] | undefined;
}

interface CloudflareVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
}

/**
 * Checks if Turnstile keys are present in the provided environment or `process.env`.
 */
export function isTurnstileEnabled(env?: any): boolean {
  const siteKey =
    env?.TURNSTILE_SITE_KEY ||
    (typeof process !== "undefined" ? process.env?.["TURNSTILE_SITE_KEY"] : undefined);

  const secretKey =
    env?.TURNSTILE_SECRET_KEY ||
    (typeof process !== "undefined" ? process.env?.["TURNSTILE_SECRET_KEY"] : undefined);

  return Boolean(siteKey && secretKey);
}

/**
 * Resolves the Turnstile secret key from options or environment.
 */
export function getTurnstileSecretKey(options: TurnstileVerifyOptions): string | undefined {
  if (options.secretKey) return options.secretKey;
  const env = options.env;
  return (
    env?.TURNSTILE_SECRET_KEY ||
    (typeof process !== "undefined" ? process.env?.["TURNSTILE_SECRET_KEY"] : undefined)
  );
}

/**
 * Resolves the Turnstile site key from environment or process.env.
 */
export function getTurnstileSiteKey(env?: any): string | undefined {
  return (
    env?.TURNSTILE_SITE_KEY ||
    (typeof process !== "undefined" ? process.env?.["TURNSTILE_SITE_KEY"] : undefined)
  );
}

/**
 * Verifies a Cloudflare Turnstile token on the server. Supports both options object and classic
 * signature `(token, env, remoteIp)`.
 */
export async function verifyTurnstile(
  tokenOrOptions: string | null | undefined | TurnstileVerifyOptions,
  legacyEnv?: any,
  legacyRemoteIp?: string
): Promise<TurnstileVerifyResult> {
  const options: TurnstileVerifyOptions =
    typeof tokenOrOptions === "object" && tokenOrOptions !== null
      ? tokenOrOptions
      : {
          token: tokenOrOptions,
          env: legacyEnv,
          remoteIp: legacyRemoteIp
        };

  const failOpen = options.failOpen ?? true;
  const token = options.token;

  // If Turnstile is not enabled (missing keys in env and no explicit secretKey), fail open for local dev
  const secretKey = getTurnstileSecretKey(options);
  if (!secretKey) {
    if (failOpen) {
      console.log("[Turnstile] Keys missing or not configured. Failing open.");
      return { success: true };
    }
    return { success: false, error: "Turnstile secret key is not configured." };
  }

  if (!token) {
    return { success: false, error: "Security check token is missing." };
  }

  try {
    const endpoint =
      options.endpoint || "https://challenges.cloudflare.com/turnstile/v0/siteverify";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: secretKey,
        response: token,
        remoteip: options.remoteIp
      })
    });

    if (!response.ok) {
      if (failOpen) {
        console.error(`[Turnstile] API returned status ${response.status}. Failing open.`);
        return { success: true };
      }
      return {
        success: false,
        error: `Cloudflare Turnstile API returned status ${response.status}`
      };
    }

    const data: CloudflareVerifyResponse = await response.json();
    if (data.success) {
      return { success: true };
    }

    const codes = data["error-codes"] || [];
    let msg = "Bot check verification failed.";
    if (codes.includes("timeout-or-duplicate")) {
      msg = "Verification token expired or already used. Please refresh the security check.";
    } else if (codes.includes("invalid-input-response")) {
      msg = "Invalid verification response. Please try again.";
    }

    return { success: false, error: msg, errorCodes: codes };
  } catch (err: any) {
    console.error(`[Turnstile Exception] ${err?.message || "Unknown error"}`);
    if (failOpen) {
      return { success: true };
    }
    return {
      success: false,
      error: err?.message || "Turnstile verification encountered an exception."
    };
  }
}
