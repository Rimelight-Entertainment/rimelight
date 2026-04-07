import { execSync } from "child_process"

export function remarkModifiedTime() {
  return function (_tree: any, file: any) {
    try {
      const filepath = file.history[0]
      const result = execSync(`git log -1 --pretty="format:%cI" "${filepath}"`)
      file.data.astro.frontmatter.lastModified = result.toString()
    } catch {
      file.data.astro.frontmatter.lastModified = new Date().toISOString()
    }
  }
}
