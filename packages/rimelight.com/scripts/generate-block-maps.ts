import { writeFileSync, existsSync, readdirSync, mkdirSync } from "fs"
import { resolve, basename } from "path"

const root = resolve(process.cwd())
const rendererDir = resolve(root, "src/components/article/blocks/renderer")
const editorDir = resolve(root, "src/components/article/blocks/editor")
const outputDir = resolve(root, "src/generated")

// Ensure output directory exists
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true })
}

function getTimestamp() {
  const now = new Date()
  const pad = (n: number) => n.toString().padStart(2, "0")
  return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

function log(msg: string) {
  console.log(`${getTimestamp()} [block-map-gen] ${msg}`)
}

function warn(msg: string) {
  console.warn(`${getTimestamp()} [block-map-gen] ${msg}`)
}

function generateMap(dir: string, suffix: "Renderer" | "Editor", varName: string, outFile: string) {
  if (!existsSync(dir)) {
    warn(`Directory not found: ${dir}. Skipping.`)
    // Write an empty/fallback file so imports don't break during initial startup
    writeFileSync(
      resolve(outputDir, outFile),
      `// Generated automatically. Fallback.\nexport const ${varName}: Record<string, () => Promise<{ default: any }>> = {};\n`
    )
    return
  }

  const files = readdirSync(dir).filter((f) => f.endsWith(".vue"))
  const names = files.map((f) => basename(f, ".vue").replace(new RegExp(`${suffix}$`), ""))

  let content = `// Generated automatically. Do not edit.\n`
  content += `import type { Component } from "vue"\n\n`
  content += `export const ${varName}: Record<string, () => Promise<{ default: Component }>> = {\n`

  names.forEach((name, index) => {
    const isLast = index === names.length - 1
    const comma = isLast ? "" : ","
    content += `  ${name}: () => import("../components/article/blocks/${suffix.toLowerCase()}/${name}${suffix}.vue")${comma}\n`
  })

  content += `}\n`

  writeFileSync(resolve(outputDir, outFile), content)
  log(`Generated ${names.length} entries in ${outFile}`)
}

generateMap(rendererDir, "Renderer", "BLOCK_RENDERER_COMPONENT_MAP", "blockRendererMap.ts")
generateMap(editorDir, "Editor", "BLOCK_EDITOR_COMPONENT_MAP", "blockEditorMap.ts")
