interface TurnstileResponse {
  "success": boolean
  "challenge_ts"?: string
  "hostname"?: string
  "error-codes"?: string[]
  "action"?: string
  "cdata"?: string
}

/**
 * Verify a Turnstile token with Cloudflare's API
 */
export async function verifyTurnstileToken(
  token: string,
  secretKey: string,
  remoteIP?: string
): Promise<TurnstileResponse> {
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      secret: secretKey,
      response: token,
      remoteip: remoteIP
    })
  })

  if (!response.ok) {
    throw new Error(`Turnstile API error: ${response.status}`)
  }

  return response.json()
}
