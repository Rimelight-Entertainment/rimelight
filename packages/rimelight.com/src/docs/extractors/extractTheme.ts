import { existsSync } from "node:fs"
import path from "node:path"
import { execSync } from "node:child_process"
import type { ThemeMeta } from "@rimelight/docs"

function getThemePath(componentName: string, componentsDir: string): string {
  const kebabName = componentName.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()
  return path.join(componentsDir, kebabName, `${kebabName}.theme.ts`)
}

export async function extractAllThemesMeta(
  componentNames: string[],
  componentsDir: string
): Promise<Record<string, ThemeMeta>> {
  const targets: { name: string; fileUrl: string }[] = []

  for (const name of componentNames) {
    const themePath = getThemePath(name, componentsDir)
    if (existsSync(themePath)) {
      const fileUrl = "file:///" + themePath.replace(/\\/g, "/")
      targets.push({ name, fileUrl })
    }
  }

  if (targets.length === 0) return {}

  try {
    // Generate script to dynamic import all theme files concurrently
    const input = `
const targets = ${JSON.stringify(targets)};
const results = {};
Promise.all(
  targets.map(async ({ name, fileUrl }) => {
    try {
      const m = await import(fileUrl);
      results[name] = m.default;
    } catch (err) {
      // ignore
    }
  })
).then(() => {
  console.log(JSON.stringify(results));
}).catch(err => {
  console.error(err);
  process.exit(1);
});
`
    const output = execSync(`"${process.execPath}" --import tsx -`, {
      input,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "ignore"]
    })

    const allThemesObj = JSON.parse(output.trim())
    const results: Record<string, ThemeMeta> = {}

    for (const [name, themeObj] of Object.entries(allThemesObj)) {
      if (!themeObj) continue
      const t = themeObj as any
      results[name] = {
        slots: Array.isArray(t.slots) ? t.slots : [],
        base: typeof t.base === "object" && t.base !== null ? t.base : {},
        variants: typeof t.variants === "object" && t.variants !== null ? t.variants : {},
        compoundVariants: Array.isArray(t.compoundVariants) ? t.compoundVariants : [],
        defaultVariants:
          typeof t.defaultVariants === "object" && t.defaultVariants !== null
            ? t.defaultVariants
            : {}
      }
    }

    return results
  } catch (err) {
    console.warn(`[docs] Failed to extract themes in batch:`, err)
    return {}
  }
}
