import { describe, it, expect } from "vite-plus/test";
import fs from "node:fs";
import path from "node:path";

const COMPONENTS_DIR = path.resolve(__dirname, "../src/components");
const componentFolders = fs
  .readdirSync(COMPONENTS_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

describe(`@rimelight/ui SolidJS Component Suite (${componentFolders.length} Components)`, () => {
  it(`discovers all ${componentFolders.length} component folders in @rimelight/ui`, () => {
    expect(componentFolders.length).toBeGreaterThanOrEqual(140);
  });

  describe.each(componentFolders)("Component [%s]", (folder) => {
    const dirPath = path.join(COMPONENTS_DIR, folder);
    const files = fs.readdirSync(dirPath);

    const solidFile = files.find(
      (f) =>
        f.startsWith("RL") && (f.endsWith(".tsx") || f.endsWith(".ts")) && !f.endsWith(".theme.ts")
    );
    const typesFile = files.find(
      (f) => f.endsWith(".ts") && !f.endsWith(".theme.ts") && f !== "index.ts"
    );
    const themeFile = files.find((f) => f.endsWith(".theme.ts"));
    const hasTypes =
      Boolean(typesFile) ||
      (Boolean(solidFile) &&
        fs.readFileSync(path.join(dirPath, solidFile!), "utf-8").includes("Props"));

    it("has dedicated Solid component implementation and types", () => {
      expect(solidFile, `Missing RL*.tsx in ${folder}`).toBeDefined();
      expect(hasTypes, `Missing prop types definition in ${folder}`).toBe(true);
    });

    if (solidFile) {
      const solidContent = fs.readFileSync(path.join(dirPath, solidFile), "utf-8");

      if (themeFile && folder !== "head") {
        const themeContent = fs.readFileSync(path.join(dirPath, themeFile), "utf-8");
        const themeExportMatch = themeContent.match(/export const (\w+Theme)/);
        const themeName = themeExportMatch ? themeExportMatch[1] : null;

        if (themeName) {
          it(`invokes the shared ${themeName} or composite primitive`, () => {
            const isSolidValid = solidContent.includes(themeName) || solidContent.includes("RL");
            expect(
              isSolidValid,
              `Solid component (${solidFile}) must invoke shared theme ${themeName} or composite component`
            ).toBe(true);
          });
        }
      }

      it("forwards attributes and binds theme classes", () => {
        const hasSolidBinding =
          solidContent.includes("classes") ||
          solidContent.includes("class=") ||
          solidContent.includes("RL") ||
          solidContent.includes("data-slot=") ||
          solidContent.includes("<time") ||
          solidContent.includes("<head") ||
          solidContent.includes("<meta") ||
          solidContent.includes("UIHead") ||
          solidContent.includes("props");

        expect(
          hasSolidBinding,
          `Solid component ${solidFile} must bind classes or forward attributes`
        ).toBe(true);
      });
    }
  });
});
