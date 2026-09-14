import fs from "node:fs"
import path from "node:path"

export function findSourceEntries(baseDir = "src") {
  if (!fs.existsSync(baseDir)) {
    return []
  }

  const entries = []

  function walk(currentDir) {
    const files = fs.readdirSync(currentDir, { withFileTypes: true })
    for (const file of files) {
      const fullPath = path.join(currentDir, file.name)
      if (file.isDirectory()) {
        walk(fullPath)
      } else if (file.isFile()) {
        const normalized = fullPath.split(path.sep).join("/")
        if (
          (file.name.endsWith(".ts") ||
            file.name.endsWith(".tsx") ||
            file.name.endsWith(".js") ||
            file.name.endsWith(".jsx")) &&
          !file.name.endsWith(".d.ts") &&
          !file.name.endsWith(".test.ts") &&
          !file.name.endsWith(".test.tsx") &&
          !file.name.endsWith(".spec.ts") &&
          !file.name.endsWith(".spec.tsx")
        ) {
          entries.push(normalized)
        }
      }
    }
  }

  walk(baseDir)
  return entries.sort((a, b) => a.localeCompare(b))
}

export function rimelightConfig() {
  return {
    lint: {
      options: {
        typeAware: true,
        typeCheck: true
      }
    },
    fmt: {
      jsdoc: {
        bracketSpacing: true,
        commentLineStrategy: "multiline"
      },
      trailingComma: "none",
      semi: false,
      quoteProps: "consistent"
    },
    staged: {
      "*": "vp check --fix"
    },
    test: {
      environment: "node"
    }
  }
}

export function rimelightPackConfig(options = {}) {
  const { entry, autoEntry, pack = {}, ...rest } = options

  let resolvedEntry = ["src/index.ts"]

  if (Array.isArray(entry)) {
    resolvedEntry = entry
  } else if (entry === "auto" || autoEntry) {
    const dir = typeof autoEntry === "string" ? autoEntry : "src"
    const discovered = findSourceEntries(dir)
    if (discovered.length > 0) {
      resolvedEntry = discovered
    }
  } else if (typeof entry === "string") {
    resolvedEntry = [entry]
  }

  return {
    ...rimelightConfig(),
    ...rest,
    pack: {
      entry: resolvedEntry,
      dts: true,
      ...pack
    }
  }
}
