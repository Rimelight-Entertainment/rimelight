interface TurnstileResponse {
  "success": boolean
  "error-codes"?: string[]
}

export function isTurnstileEnabled(env: any): boolean {
  return !!(env?.TURNSTILE_SITE_KEY && env?.TURNSTILE_SECRET_KEY)
}

export async function verifyTurnstile(
  token: string | null | undefined,
  env: any,
  remoteIP?: string
): Promise<{ success: boolean; error?: string }> {
  // Fail-open for local dev / unconfigured environments
  if (!isTurnstileEnabled(env)) {
    console.log("[Turnstile] Keys missing. Skipping verification (Failing Open).")
    return { success: true }
  }

  if (!token) {
    return { success: false, error: "Security check token is missing." }
  }

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: env.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: remoteIP
      })
    })

    if (!response.ok) {
      return {
        success: false,
        error: `Cloudflare Turnstile API returned status ${response.status}`
      }
    }

    // eslint-disable-next-line typescript/no-unsafe-type-assertion
    const data = (await response.json()) as TurnstileResponse
    if (data.success) {
      return { success: true }
    } else {
      return { success: false, error: "Bot check verification failed." }
    }
  } catch (err: any) {
    console.error("[Turnstile Exception]", err)
    return { success: true }
  }
}
