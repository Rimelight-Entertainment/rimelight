import { describe, expect, it } from "vite-plus/test";
import { parseJsonc } from "../src/index.js";

describe("@rimelight/cli - JSONC Parser Fuzz and Strict Recovery", () => {
  it("parses valid JSON without comments", () => {
    const input = '{"name": "@rimelight/starter", "version": "1.0.0", "active": true}';
    expect(parseJsonc(input)).toEqual({
      name: "@rimelight/starter",
      version: "1.0.0",
      active: true,
    });
  });

  it("strips single-line and multi-line comments", () => {
    const input = `
    // Top-level comment
    {
      /* Multi-line
         configuration comment */
      "compatibility_date": "2026-09-01", // inline comment
      "compatibility_flags": [
        "nodejs_compat" /* comment inside array */
      ]
    }
    `;
    const parsed = parseJsonc(input);
    expect(parsed.compatibility_date).toBe("2026-09-01");
    expect(parsed.compatibility_flags).toEqual(["nodejs_compat"]);
  });

  it("handles complex JSON structure with multiple comment forms", () => {
    const input = `
    {
      // Comment before property
      "name": "my-project",
      /* Another comment block */
      "port": 4321
    }
    `;
    const parsed = parseJsonc(input);
    expect(parsed.name).toBe("my-project");
    expect(parsed.port).toBe(4321);
  });
});
