import { describe, it, expect } from "vite-plus/test";
import { buildSecurityTxt } from "../src/security.js";

describe("buildSecurityTxt", () => {
  it("generates RFC 9116 compliant security.txt with single contact and default expires", () => {
    const output = buildSecurityTxt({
      contact: "mailto:security@example.com",
    });

    expect(output).toContain("Contact: mailto:security@example.com");
    expect(output).toMatch(/Expires: \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it("handles multiple contacts and explicit date expires", () => {
    const expiry = new Date("2027-12-31T23:59:59.000Z");
    const output = buildSecurityTxt({
      contact: ["mailto:security@example.com", "https://example.com/security/report"],
      expires: expiry,
      preferredLanguages: "en, pt",
      canonical: "https://example.com/.well-known/security.txt",
      policy: "https://example.com/legal/security",
      hiring: "https://example.com/careers",
      acknowledgments: "https://example.com/security/acknowledgments",
    });

    expect(output).toContain("Contact: mailto:security@example.com");
    expect(output).toContain("Contact: https://example.com/security/report");
    expect(output).toContain("Expires: 2027-12-31T23:59:59.000Z");
    expect(output).toContain("Preferred-Languages: en, pt");
    expect(output).toContain("Canonical: https://example.com/.well-known/security.txt");
    expect(output).toContain("Policy: https://example.com/legal/security");
    expect(output).toContain("Hiring: https://example.com/careers");
    expect(output).toContain("Acknowledgments: https://example.com/security/acknowledgments");
  });

  it("formats encryption and csaf directives", () => {
    const output = buildSecurityTxt({
      contact: "mailto:security@example.com",
      encryption: "https://example.com/pgp-key.txt",
      csaf: "https://example.com/.well-known/csaf/provider-metadata.json",
    });

    expect(output).toContain("Encryption: https://example.com/pgp-key.txt");
    expect(output).toContain("CSAF: https://example.com/.well-known/csaf/provider-metadata.json");
  });
});
