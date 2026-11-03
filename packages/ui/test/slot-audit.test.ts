import { describe, it, expect } from "vite-plus/test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

// Component JSX content must go through a `*Slot` prop, read only via `setup(props, { slots })`
// or `slot(() => props.xSlot)`. A direct `props.xSlot` read builds a new subtree every time.

const COMPONENTS_DIR = join(import.meta.dirname, "..", "src", "components");
const DIRECT_SLOT_READ = /\bprops\.[A-Za-z]+Slot\b/;
const SANCTIONED_SLOT_CALL = /\bslot\(\(\) => props\.[A-Za-z]+Slot\)/;

// Top-level JSX-typed props that are not `*Slot`. Each entry is data, not a component slot.
const JSX_PROP_ALLOWLIST: Record<string, string> = {
  "context-menu/context-menu.types.ts:label": "menu item data field",
  "context-menu/context-menu.types.ts:description": "menu item data field",
  "context-menu/context-menu.types.ts:icon": "menu item data field",
  "context-menu/context-menu.types.ts:leading": "menu item data field",
  "splitter/splitter.types.ts:content": "splitter handle / panel config data",
  "splitter/splitter.types.ts:panels": "splitter panel list data",
};

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

describe("slot audit", () => {
  it("has no direct props.*Slot reads in components", () => {
    const offenders: string[] = [];
    for (const file of walk(COMPONENTS_DIR)) {
      if (!file.endsWith(".tsx")) continue;
      readFileSync(file, "utf8")
        .split("\n")
        .forEach((line, i) => {
          if (DIRECT_SLOT_READ.test(line) && !SANCTIONED_SLOT_CALL.test(line)) {
            offenders.push(`${relative(COMPONENTS_DIR, file)}:${i + 1}: ${line.trim()}`);
          }
        });
    }
    expect(offenders).toEqual([]);
  });

  it("declares JSX-typed props only with a *Slot name (or an allowlisted data field)", () => {
    const offenders: string[] = [];
    const JSX_PROP = /^  ([A-Za-z]+)\??:\s*(?:[^;]*JSX\.Element)/;
    for (const file of walk(COMPONENTS_DIR)) {
      if (!file.endsWith(".types.ts")) continue;
      const rel = relative(COMPONENTS_DIR, file).replace(/\\/g, "/");
      readFileSync(file, "utf8")
        .split("\n")
        .forEach((line) => {
          const match = JSX_PROP.exec(line);
          if (!match) return;
          const name = match[1]!;
          if (name === "children" || name.endsWith("Slot")) return;
          if (JSX_PROP_ALLOWLIST[`${rel}:${name}`]) return;
          offenders.push(`${rel}: ${name}`);
        });
    }
    expect(offenders).toEqual([]);
  });
});
