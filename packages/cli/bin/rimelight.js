#!/usr/bin/env node

import { parseArgs } from "node:util"
import { runCreate } from "../src/index.js"

async function main() {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      "domain": { type: "string", short: "d" },
      "git": { type: "boolean", short: "g" },
      "install": { type: "boolean", short: "i" },
      "package-manager": { type: "string" },
      "help": { type: "boolean", short: "h" },
      "version": { type: "boolean", short: "v" }
    },
    allowPositionals: true,
    strict: false
  })

  if (values.version) {
    console.log("rimelight v0.1.0")
    process.exit(0)
  }

  if (values.help) {
    console.log(`
Rimelight CLI - Manage and scaffold premium Rimelight projects.

Usage:
  rimelight create [project-name] [options]
  rimelight compare [project-path]
  rimelight update [project-path]

Commands:
  create              Scaffold a new project from the reference template
  compare             Compare target project configurations against starter baseline
  update              Standardize target project configs to match starter baseline

Options:
  -d, --domain          Specify website domain (e.g. example.com)
  -g, --git             Initialize a Git repository (default: auto)
  -i, --install         Automatically install dependencies (default: auto)
  --package-manager     Force a package manager (npm, pnpm, yarn, bun)
  -h, --help            Show this help screen
  -v, --version         Show CLI version
    `)
    process.exit(0)
  }

  const command = positionals[0]

  if (command === "compare") {
    const targetDir = positionals[1] || "."
    const { runCompare } = await import("../src/index.js")
    await runCompare({ targetDir })
  } else if (command === "update") {
    const targetDir = positionals[1] || "."
    const { runUpdate } = await import("../src/index.js")
    await runUpdate({ targetDir })
  } else if (!command || command === "create") {
    const projectName = command === "create" ? positionals[1] : positionals[0]
    await runCreate({
      projectName,
      domain: values.domain,
      git: values.git,
      install: values.install,
      packageManager: values["package-manager"]
    })
  } else {
    console.error(`Unknown command: ${command}. Use "rimelight --help" to see all options.`)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error("An unexpected error occurred:", err)
  process.exit(1)
})
