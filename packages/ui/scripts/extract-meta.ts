import { writeFileSync, mkdirSync } from "node:fs"
import { join, resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { extractAllMeta } from "../src/docs/extractAll"

const pathDirname = dirname(fileURLToPath(import.meta.url))
const uiRoot = resolve(pathDirname, "..")
const outputDir = join(uiRoot, "test-results")

async function main() {
  console.log("Extracting component metadata...")
  const meta = await extractAllMeta()

  mkdirSync(outputDir, { recursive: true })
  const outputPath = join(outputDir, "component-meta.json")
  writeFileSync(outputPath, JSON.stringify(meta, null, 2), "utf-8")

  console.log(`Extracted metadata for ${Object.keys(meta).length} components`)
  console.log(`Output: ${outputPath}`)

  return meta
}

main().catch(console.error)

export default main
