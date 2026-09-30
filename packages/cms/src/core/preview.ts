/**
 * Generates and verifies HMAC-signed stateless preview tokens for draft pages.
 */

async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function hexEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexDecode(hex: string): Uint8Array {
  const matches = hex.match(/.{1,2}/g) || [];
  return new Uint8Array(matches.map((byte) => parseInt(byte, 16)));
}

/**
 * Generates a signed token for a page ID valid for ttlSeconds (default 24h).
 */
export async function generatePreviewToken(
  pageId: string,
  secret: string,
  ttlSeconds = 86400
): Promise<{ token: string; expiresAt: number }> {
  const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = `${pageId}:${expiresAt}`;

  const key = await getCryptoKey(secret);
  const enc = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  const signature = hexEncode(signatureBuffer);

  // Token format: base64(payload).signature
  const token = `${btoa(payload)}.${signature}`;
  return { token, expiresAt };
}

/**
 * Verifies a signed preview token against a pageId and secret.
 */
export async function verifyPreviewToken(
  pageId: string,
  token: string,
  secret: string
): Promise<boolean> {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return false;

    const [b64Payload, signatureHex] = parts;
    if (!b64Payload || !signatureHex) return false;

    const payload = atob(b64Payload);
    const [tokenPageId, tokenExpStr] = payload.split(":");
    if (!tokenPageId || !tokenExpStr) return false;

    if (tokenPageId !== pageId) return false;

    const expiresAt = parseInt(tokenExpStr, 10);
    const now = Math.floor(Date.now() / 1000);
    if (isNaN(expiresAt) || now > expiresAt) return false;

    const key = await getCryptoKey(secret);
    const enc = new TextEncoder();
    const signatureBytes = hexDecode(signatureHex);

    return await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes as unknown as BufferSource,
      enc.encode(payload)
    );
  } catch {
    return false;
  }
}
