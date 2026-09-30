import { describe, it, expect } from "vite-plus/test";
import {
  parseJsonc,
  getNested,
  setNested,
  injectIntoArray,
  injectIntoLines,
  reorderKeys,
  resolveDomainInLine,
  getStructuredJsonDiffs,
  getStructuredLineDiffs,
} from "../src/index";

describe("@rimelight/cli diff and synchronization engine", () => {
  describe("parseJsonc", () => {
    it("should strip single line comments and parse valid JSON", () => {
      const jsonc = `
      {
        // This is a comment
        "name": "rimelight", // inline comment
        "version": "1.0.0"
      }
      `;
      const parsed = parseJsonc(jsonc);
      expect(parsed).toEqual({ name: "rimelight", version: "1.0.0" });
    });

    it("should strip multi-line block comments", () => {
      const jsonc = `
      {
        /* Multi-line
           block comment */
        "active": true
      }
      `;
      const parsed = parseJsonc(jsonc);
      expect(parsed).toEqual({ active: true });
    });
  });

  describe("getNested & setNested", () => {
    it("should get deeply nested property values", () => {
      const obj = { a: { b: { c: 42 } } };
      expect(getNested(obj, "a.b.c")).toBe(42);
      expect(getNested(obj, "a.missing")).toBeUndefined();
    });

    it("should set deeply nested property values creating path on the fly", () => {
      const obj: any = {};
      setNested(obj, "config.engines.node", ">=26");
      expect(obj.config.engines.node).toBe(">=26");
    });
  });

  describe("array & line injection semantics", () => {
    it("should inject an item based on starter ordering", () => {
      const starter = ["first", "second", "third", "fourth"];
      const target = ["first", "fourth"];

      const updated = injectIntoArray([...target], starter, "second");
      expect(updated).toEqual(["first", "second", "fourth"]);
    });

    it("should inject missing lines based on starter line position", () => {
      const starterLines = ["import a from 'a'", "import b from 'b'", "export default {}"];
      const targetLines = ["import a from 'a'", "export default {}"];

      const updated = injectIntoLines([...targetLines], starterLines, "import b from 'b'");
      expect(updated).toEqual(["import a from 'a'", "import b from 'b'", "export default {}"]);
    });
  });

  describe("reorderKeys", () => {
    it("should reorder target object keys to match starter order while retaining custom keys", () => {
      const starter = { name: "", version: "", scripts: {}, dependencies: {} };
      const target = { dependencies: {}, customField: true, name: "my-app", version: "1.0" };

      const ordered = reorderKeys(target, starter);
      expect(Object.keys(ordered)).toEqual(["name", "version", "dependencies", "customField"]);
    });
  });

  describe("resolveDomainInLine", () => {
    it("should resolve domain substitutions dynamically", () => {
      // The domain now comes from the target project's package.json `homepage`.
      const targetContent = '{ "homepage": "https://my-domain.org" }';
      const line = 'domains: ["starter.rimelight.com", "www.starter.rimelight.com"]';
      const resolved = resolveDomainInLine(line, targetContent);
      expect(resolved).toBe('domains: ["my-domain.org", "www.my-domain.org"]');
    });

    it("should resolve the derived worker name too", () => {
      const targetContent = '{ "homepage": "https://my-domain.org" }';
      const line = 'name: "starter-dot-rimelight-dot-com"';
      expect(resolveDomainInLine(line, targetContent)).toBe('name: "my-domain-dot-org"');
    });

    it("should leave the line untouched when no domain can be found", () => {
      const line = 'domains: ["starter.rimelight.com"]';
      expect(resolveDomainInLine(line, "{}")).toBe(line);
    });
  });

  describe("getStructuredJsonDiffs", () => {
    it("should detect missing keys, differing values, and out of order keys", () => {
      const starter = JSON.stringify({ a: 1, b: 2, c: [1, 2] });
      const target = JSON.stringify({ b: 99, a: 1 });

      const diffs = getStructuredJsonDiffs(starter, target);
      const types = diffs.map((d) => d.type);

      expect(types).toContain("missing"); // missing 'c'
      expect(types).toContain("differing"); // differing 'b'
      expect(types).toContain("out_of_order_keys"); // b before a
    });
  });

  describe("getStructuredLineDiffs", () => {
    it("should detect missing lines ignoring structural whitespace", () => {
      const starter = "alpha: 1\nbeta: 2\ngamma: 3";
      const target = "alpha: 1\ngamma: 3";

      const diffs = getStructuredLineDiffs(starter, target, "vite.config.ts");
      expect(diffs).toHaveLength(1);
      expect(diffs[0]?.line).toBe("beta: 2");
    });
  });
});
