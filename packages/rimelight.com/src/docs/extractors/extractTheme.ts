import { existsSync } from "node:fs"
import path from "node:path"
import { execSync } from "node:child_process"
import type { ThemeMeta } from "../types"

export async function extractThemeMeta(
  componentName: string,
  componentsDir: string
): Promise<ThemeMeta | null> {
  const kebabName = componentName.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()
  const themePath = path.join(componentsDir, kebabName, `${kebabName}.theme.ts`)

  if (!existsSync(themePath)) return null

  try {
    const fileUrl = "file:///" + themePath.replace(/\\/g, "/")
    // Run evaluation in a separate Node process with the tsx loader.
    // This bypasses Vite's ModuleRunner restrictions inside Astro config setups.
    // We pass the loader script via stdin to avoid any command line escaping issues.
    const input = `import('${fileUrl}').then(m => console.log(JSON.stringify(m.default))).catch(err => { console.error(err); process.exit(1); })`
    const output = execSync(`"${process.execPath}" --import tsx -`, {
      input,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "ignore"]
    })

    const themeObj = JSON.parse(output.trim())
    if (!themeObj) return null

    return {
      slots: Array.isArray(themeObj.slots) ? themeObj.slots : [],
      base: typeof themeObj.base === "object" && themeObj.base !== null ? themeObj.base : {},
      variants:
        typeof themeObj.variants === "object" && themeObj.variants !== null
          ? themeObj.variants
          : {},
      compoundVariants: Array.isArray(themeObj.compoundVariants) ? themeObj.compoundVariants : [],
      defaultVariants:
        typeof themeObj.defaultVariants === "object" && themeObj.defaultVariants !== null
          ? themeObj.defaultVariants
          : {}
    }
  } catch (err) {
    console.warn(`[docs] Failed to extract theme via child process for ${componentName}:`, err)
    return null
  }
}
