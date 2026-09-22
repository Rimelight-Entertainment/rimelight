import fs from "node:fs"
import path from "node:path"
import type { UserConfig } from "vite-plus"

export function findSourceEntries(baseDir = "src"): string[] {
  if (!fs.existsSync(baseDir)) {
    return []
  }

  const entries: string[] = []

  function walk(currentDir: string) {
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

export function rimelightConfig(): UserConfig {
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

export function findPackageExternals(pkgJsonPath = "package.json"): string[] {
  try {
    const fullPath = path.resolve(process.cwd(), pkgJsonPath)
    if (!fs.existsSync(fullPath)) return ["@rimelight/*"]
    const pkg = JSON.parse(fs.readFileSync(fullPath, "utf8"))
    const externals = new Set<string>()

    if (pkg.peerDependencies) {
      Object.keys(pkg.peerDependencies).forEach((dep) => externals.add(dep))
    }
    if (pkg.dependencies) {
      Object.keys(pkg.dependencies).forEach((dep) => externals.add(dep))
    }

    return Array.from(externals)
  } catch {
    return []
  }
}

export interface ExportValidationResult {
  valid: boolean
  missingExports: string[]
  extraExports: string[]
}

export function verifyPackageExports(
  pkgJsonPath = "package.json",
  srcDir = "src"
): ExportValidationResult {
  try {
    const fullPath = path.resolve(process.cwd(), pkgJsonPath)
    if (!fs.existsSync(fullPath)) {
      return { valid: false, missingExports: ["package.json not found"], extraExports: [] }
    }
    const pkg = JSON.parse(fs.readFileSync(fullPath, "utf8"))
    const exportsMap = pkg.exports || {}
    const sourceEntries = findSourceEntries(srcDir)

    const expectedKeys = sourceEntries.map((file) => {
      const rel = file.replace(new RegExp(`^${srcDir}/`), "").replace(/\.(ts|tsx|js|jsx)$/, "")
      return rel === "index" ? "." : `./${rel}`
    })

    const definedKeys = Object.keys(exportsMap)
    const missingExports = expectedKeys.filter(
      (k) => !definedKeys.includes(k) && !definedKeys.includes("./*")
    )
    const extraExports = definedKeys.filter(
      (k) => k !== "." && k !== "./*" && !k.includes("*") && !expectedKeys.includes(k)
    )

    return {
      valid: missingExports.length === 0,
      missingExports,
      extraExports
    }
  } catch (err: any) {
    return { valid: false, missingExports: [err.message], extraExports: [] }
  }
}

export function findVirtualExternals(baseDir = "src"): string[] {
  if (!fs.existsSync(baseDir)) {
    return []
  }

  const externals = new Set<string>()

  function walk(currentDir: string) {
    const files = fs.readdirSync(currentDir, { withFileTypes: true })
    for (const file of files) {
      const fullPath = path.join(currentDir, file.name)
      if (file.isDirectory()) {
        walk(fullPath)
      } else if (file.isFile() && /\.(ts|tsx|js|jsx|astro|vue)$/.test(file.name)) {
        const content = fs.readFileSync(fullPath, "utf8")
        const regex = /["']((?:virtual|cloudflare):[^"']+)["']/g
        let match: RegExpExecArray | null
        while ((match = regex.exec(content)) !== null) {
          externals.add(match[1]!)
        }
      }
    }
  }

  walk(baseDir)
  return Array.from(externals)
}

export interface RimelightPackOptions {
  entry?: string[] | "auto"
  autoEntry?: boolean | string
  pack?: Record<string, any>
  autoExternal?: boolean
  [key: string]: any
}

export function rimelightPackConfig(options: RimelightPackOptions = {}): any {
  const { entry, autoEntry, pack = {}, autoExternal = true, ...rest } = options

  let resolvedEntry: string[] = ["src/index.ts"]

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

  const discoveredExternals = autoExternal ? findPackageExternals() : []
  const discoveredVirtualExternals = autoExternal ? findVirtualExternals() : []
  const userExternal = pack["external"] || []
  const userExternalList = Array.isArray(userExternal) ? userExternal : [userExternal]
  const userDeps = (pack["deps"] as Record<string, any> | undefined) || {}
  const userNeverBundle = userDeps["neverBundle"] || []
  const userNeverBundleList = Array.isArray(userNeverBundle) ? userNeverBundle : [userNeverBundle]
  const mergedExternal = Array.from(
    new Set([
      ...userExternalList,
      ...userNeverBundleList,
      ...discoveredExternals,
      ...discoveredVirtualExternals
    ])
  ).filter(Boolean)

  const hasUserDeps = pack["deps"] !== undefined
  const hasExternals = mergedExternal.length > 0

  return {
    ...rimelightConfig(),
    ...rest,
    pack: {
      entry: resolvedEntry,
      dts: true,
      checks: { pluginTimings: false },
      ...pack,
      ...(hasUserDeps || hasExternals
        ? { deps: { ...userDeps, ...(hasExternals ? { neverBundle: mergedExternal } : {}) } }
        : {})
    }
  }
}
