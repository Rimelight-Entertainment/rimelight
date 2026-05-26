#!/usr/bin/env node

import mri from "mri";
import { runCreate } from "../src/index.js";

async function main() {
  const args = process.argv.slice(2);
  const parsed = mri(args, {
    alias: {
      h: "help",
      v: "version",
      g: "git",
      i: "install"
    },
    boolean: ["help", "version", "git", "install"],
    string: ["package-manager"]
  });

  if (parsed.version) {
    console.log("rimelight v0.1.0");
    process.exit(0);
  }

  if (parsed.help) {
    console.log(`
Rimelight CLI - Scaffold premium Rimelight applications.

Usage:
  rimelight create [project-name] [options]

Options:
  -g, --git             Initialize a Git repository (default: auto)
  -i, --install         Automatically install dependencies (default: auto)
  --package-manager     Force a package manager (npm, pnpm, yarn, bun)
  -h, --help            Show this help screen
  -v, --version         Show CLI version
    `);
    process.exit(0);
  }

  const command = parsed._[0];

  // Default to 'create' command or handle 'create' specifically
  if (!command || command === "create") {
    const projectName = parsed._[0] === "create" ? parsed._[1] : parsed._[0];
    await runCreate({
      projectName,
      git: parsed.git,
      install: parsed.install,
      packageManager: parsed["package-manager"]
    });
  } else {
    console.error(`Unknown command: ${command}. Use "rimelight --help" to see all options.`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("An unexpected error occurred:", err);
  process.exit(1);
});
