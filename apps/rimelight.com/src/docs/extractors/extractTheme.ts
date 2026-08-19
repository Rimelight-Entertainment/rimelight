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
    const output = execSync(`"${process.execPath}" -`, {
      input,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "ignore"]
    })

    const allThemesObj = JSON.parse(output.trim())
    const results: Record<string, ThemeMeta> = {}

    for (const [name, themeObj] of Object.entries(allThemesObj)) {
      if (!themeObj || typeof themeObj !== "object") continue

      const slotsRaw = Reflect.get(themeObj, "slots")
      const slots: string[] = []
      if (Array.isArray(slotsRaw)) {
        for (const s of slotsRaw) {
          if (typeof s === "string") slots.push(s)
        }
      }

      const baseRaw = Reflect.get(themeObj, "base")
      const base: Record<string, string | string[]> = {}
      if (baseRaw && typeof baseRaw === "object") {
        for (const key of Object.getOwnPropertyNames(baseRaw)) {
          const val = Reflect.get(baseRaw, key)
          if (typeof val === "string") {
            base[key] = val
          } else if (Array.isArray(val)) {
            const items: string[] = []
            for (const item of val) {
              if (typeof item === "string") items.push(item)
            }
            if (items.length > 0) base[key] = items
          }
        }
      }

      const variantsRaw = Reflect.get(themeObj, "variants")
      const variants: Record<string, Record<string, Record<string, string | string[]>>> = {}
      if (variantsRaw && typeof variantsRaw === "object") {
        for (const outerKey of Object.getOwnPropertyNames(variantsRaw)) {
          const inner = Reflect.get(variantsRaw, outerKey)
          if (inner && typeof inner === "object") {
            const innerRecord: Record<string, Record<string, string | string[]>> = {}
            for (const midKey of Object.getOwnPropertyNames(inner)) {
              const innerMost = Reflect.get(inner, midKey)
              if (innerMost && typeof innerMost === "object") {
                const leafRecord: Record<string, string | string[]> = {}
                for (const leafKey of Object.getOwnPropertyNames(innerMost)) {
                  const leafVal = Reflect.get(innerMost, leafKey)
                  if (typeof leafVal === "string") {
                    leafRecord[leafKey] = leafVal
                  } else if (Array.isArray(leafVal)) {
                    const items: string[] = []
                    for (const item of leafVal) {
                      if (typeof item === "string") items.push(item)
                    }
                    if (items.length > 0) leafRecord[leafKey] = items
                  }
                }
                if (Object.getOwnPropertyNames(leafRecord).length > 0) {
                  innerRecord[midKey] = leafRecord
                }
              }
            }
            if (Object.getOwnPropertyNames(innerRecord).length > 0) {
              variants[outerKey] = innerRecord
            }
          }
        }
      }

      const cvRaw = Reflect.get(themeObj, "compoundVariants")
      const compoundVariants: Record<string, unknown>[] = []
      if (Array.isArray(cvRaw)) {
        for (const cv of cvRaw) {
          if (cv && typeof cv === "object") {
            const entry: Record<string, unknown> = {}
            for (const key of Object.getOwnPropertyNames(cv)) {
              entry[key] = Reflect.get(cv, key)
            }
            compoundVariants.push(entry)
          }
        }
      }

      const dvRaw = Reflect.get(themeObj, "defaultVariants")
      const defaultVariants: Record<string, unknown> = {}
      if (dvRaw && typeof dvRaw === "object") {
        for (const key of Object.getOwnPropertyNames(dvRaw)) {
          defaultVariants[key] = Reflect.get(dvRaw, key)
        }
      }

      results[name] = { slots, base, variants, compoundVariants, defaultVariants }
    }

    return results
  } catch (err) {
    console.warn(`[docs] Failed to extract themes in batch:`, err)
    return {}
  }
}
