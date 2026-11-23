import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";
import { builtinBlocks } from "@rimelight/cms/blocks";

// `registry/blocks.json` is a copy of the rimelight-rs file (the Rust crate is the source).
const here = dirname(fileURLToPath(import.meta.url));
const registryFile = JSON.parse(
  readFileSync(resolve(here, "../src/space/content/registry/blocks.json"), "utf8"),
) as {
  version: number;
  blocks: Array<{
    type: string;
    children: string[] | string | null;
    parents: string[] | null;
    inlineText: string | null;
    richText: boolean;
    fields: Record<string, unknown>;
  }>;
};

const byType = new Map(builtinBlocks.map((def) => [def.type, def]));

describe("block registry JSON", () => {
  it("has a built-in for every entry", () => {
    for (const entry of registryFile.blocks) {
      expect(byType.has(entry.type), `no built-in for ${entry.type}`).toBe(true);
    }
  });

  it("has no built-in missing from the JSON", () => {
    const listed = new Set(registryFile.blocks.map((b) => b.type));
    for (const def of builtinBlocks) {
      expect(listed.has(def.type), `${def.type} is not in registry/blocks.json`).toBe(true);
    }
  });

  it("matches each built-in's structure", () => {
    for (const entry of registryFile.blocks) {
      const def = byType.get(entry.type);
      if (!def) continue;
      expect(def.children ?? null, `${entry.type} children`).toEqual(entry.children);
      expect(def.parents ?? null, `${entry.type} parents`).toEqual(entry.parents);
      expect(def.inlineText ?? null, `${entry.type} inlineText`).toEqual(entry.inlineText);
      expect(def.richText === true, `${entry.type} richText`).toBe(entry.richText);
      expect(Object.keys(def.fields ?? {}).sort(), `${entry.type} fields`).toEqual(
        Object.keys(entry.fields).sort(),
      );
    }
  });
});
