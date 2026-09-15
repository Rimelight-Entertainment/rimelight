import type { SecurityTxtOptions } from "./types.js"

/**
 * Build RFC 9116 compliant security.txt content. https://www.rfc-editor.org/rfc/rfc9116
 */
export function buildSecurityTxt(options: SecurityTxtOptions): string {
  const lines: string[] = []

  // Contact (REQUIRED in RFC 9116: at least one)
  const contacts = Array.isArray(options.contact)
    ? options.contact
    : options.contact
      ? [options.contact]
      : []

  for (const contact of contacts) {
    lines.push(`Contact: ${contact}`)
  }

  // Expires (REQUIRED in RFC 9116)
  let expiresStr: string
  if (options.expires instanceof Date) {
    expiresStr = options.expires.toISOString()
  } else if (typeof options.expires === "string" && options.expires.trim().length > 0) {
    expiresStr = options.expires
  } else {
    // Default to 1 year in the future from generation
    const oneYearFromNow = new Date()
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
    expiresStr = oneYearFromNow.toISOString()
  }
  lines.push(`Expires: ${expiresStr}`)

  // Encryption (OPTIONAL)
  if (options.encryption) {
    const encList = Array.isArray(options.encryption) ? options.encryption : [options.encryption]
    for (const enc of encList) {
      lines.push(`Encryption: ${enc}`)
    }
  }

  // Acknowledgments (OPTIONAL)
  if (options.acknowledgments) {
    const acks = Array.isArray(options.acknowledgments)
      ? options.acknowledgments
      : [options.acknowledgments]
    for (const ack of acks) {
      lines.push(`Acknowledgments: ${ack}`)
    }
  }

  // Preferred-Languages (OPTIONAL)
  if (options.preferredLanguages) {
    lines.push(`Preferred-Languages: ${options.preferredLanguages}`)
  }

  // Canonical (OPTIONAL)
  if (options.canonical) {
    lines.push(`Canonical: ${options.canonical}`)
  }

  // Policy (OPTIONAL)
  if (options.policy) {
    lines.push(`Policy: ${options.policy}`)
  }

  // Hiring (OPTIONAL)
  if (options.hiring) {
    lines.push(`Hiring: ${options.hiring}`)
  }

  // CSAF (OPTIONAL)
  if (options.csaf) {
    lines.push(`CSAF: ${options.csaf}`)
  }

  return lines.join("\n") + "\n"
}
