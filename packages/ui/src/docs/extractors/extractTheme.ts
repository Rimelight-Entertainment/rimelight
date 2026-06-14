import { existsSync, readdirSync } from "node:fs"
import path from "node:path"
import { execSync } from "node:child_process"
import type { ThemeMeta } from "../types"

export async function extractThemeMeta(componentName: string, themesDir: string): Promise<ThemeMeta | null> {
  if (!existsSync(themesDir)) return null

  const themeFiles = readdirSync(themesDir).filter((f) => f.endsWith(".theme.ts"))
  let themePath: string | null = null
  for (const file of themeFiles) {
    const baseName = file.replace(".theme.ts", "")
    if (baseName === componentName.toLowerCase()) {
      themePath = path.join(themesDir, file)
      break
    }
  }

  if (!themePath || !existsSync(themePath)) return null

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
      variants: typeof themeObj.variants === "object" && themeObj.variants !== null ? themeObj.variants : {},
      compoundVariants: Array.isArray(themeObj.compoundVariants) ? themeObj.compoundVariants : [],
      defaultVariants: typeof themeObj.defaultVariants === "object" && themeObj.defaultVariants !== null ? themeObj.defaultVariants : {}
    }
  } catch (err) {
    console.warn(`[docs] Failed to extract theme via child process for ${componentName}:`, err)
    return null
  }
}
