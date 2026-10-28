import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";
import { generateMetaSource } from "../scripts/generate-meta.ts";
import { componentMeta } from "../src/meta/index.ts";

const generatedFile = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "meta",
  "generated.ts",
);

describe("@rimelight/ui/meta", () => {
  it("generated.ts matches the component sources (run `vp run generate:meta`)", async () => {
    expect(readFileSync(generatedFile, "utf8")).toBe(await generateMetaSource());
  });

  it("describes every RL component with props, slots and theme", () => {
    const button = componentMeta["button"];
    expect(button?.name).toBe("Button");
    expect(button?.props.length).toBeGreaterThan(0);
    expect(button?.theme).not.toBeNull();
  });
});
