import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import * as prompts from "@clack/prompts";
import pc from "picocolors";
import spawn from "cross-spawn";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const starterPath = path.resolve(__dirname, "../../starter");

// Helper to parse JSON with comments (JSONC)
function parseJsonc(content) {
  let stripped = content.replace(/(?:^|\s)\/\*[\s\S]*?\*\//g, "");
  stripped = stripped.replace(/(^|[^\\:])\/\/.*$/gm, "$1");
  return JSON.parse(stripped);
}

// Helper to copy directory recursively
async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (
      entry.name === "node_modules" ||
      entry.name === "dist" ||
      entry.name === ".astro" ||
      entry.name === ".git" ||
      entry.name === ".wrangler"
    ) {
      continue;
    }

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

// Helper to update astro.config.ts and wrangler.jsonc with the chosen domain
async function updateDomainConfigs(resolvedTargetDir, domain, displayProjectName) {
  // Update astro.config.ts
  const astroConfigPath = path.join(resolvedTargetDir, "astro.config.ts");
  if (existsSync(astroConfigPath) && domain) {
    let content = await fs.readFile(astroConfigPath, "utf-8");
    content = content.replace(/site:\s*["'][^"']*["']/g, `site: "https://${domain}"`);
    await fs.writeFile(astroConfigPath, content, "utf-8");
  }

  // Update wrangler.jsonc
  const wranglerPath = path.join(resolvedTargetDir, "wrangler.jsonc");
  if (existsSync(wranglerPath)) {
    const content = await fs.readFile(wranglerPath, "utf-8");
    // Parse safely
    const wrangler = parseJsonc(content);
    
    if (domain) {
      // Derive wrangler name (e.g. my-app-dot-com)
      const baseName = domain.replace(/\./g, "-dot-");
      wrangler.name = baseName.toLowerCase().replace(/[^a-z0-9-]/g, "-");
      wrangler.routes = [
        { pattern: domain, custom_domain: true },
        { pattern: `www.${domain}`, custom_domain: true }
      ];
    } else {
      // If no domain is passed, just update name to project name without touching routes
      wrangler.name = displayProjectName.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    }
    
    await fs.writeFile(wranglerPath, JSON.stringify(wrangler, null, 2), "utf-8");
  }
}

export async function runCreate(options) {
  const isInteractive = process.stdout.isTTY && !process.env.CI;

  if (isInteractive) {
    prompts.intro(pc.magenta(pc.bold("◇ Welcome to Rimelight!")));

    // 1. Prompt for project name/directory
    let targetDir = options.projectName;
    if (!targetDir) {
      const response = await prompts.text({
        message: "Where should we create your new project?",
        placeholder: "./my-rimelight-app",
        validate: (value) => {
          if (!value.trim()) return "Please enter a directory path";
          if (existsSync(path.resolve(value)) && fs.readdir(path.resolve(value)).length > 0) {
            return "Directory is not empty";
          }
        }
      });

      if (prompts.isCancel(response)) {
        prompts.cancel("Scaffolding cancelled.");
        process.exit(0);
      }
      targetDir = response;
    }

    const resolvedTargetDir = path.resolve(targetDir);
    const displayProjectName = path.basename(resolvedTargetDir);

    // Prompt for website domain (optionally)
    let domain = options.domain;
    if (domain === undefined) {
      const response = await prompts.text({
        message: "What is the website domain for this project? (Optional)",
        placeholder: "e.g. example.com",
        validate: (value) => {
          if (!value || !value.trim()) return;
          // Simple domain check
          if (!/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/.test(value.trim())) {
            return "Please enter a valid domain name (e.g. example.com)";
          }
        }
      });

      if (prompts.isCancel(response)) {
        prompts.cancel("Scaffolding cancelled.");
        process.exit(0);
      }
      domain = response ? response.trim() : "";
    }

    // Check if directory exists and is not empty
    if (existsSync(resolvedTargetDir)) {
      const files = await fs.readdir(resolvedTargetDir);
      if (files.length > 0) {
        const overwrite = await prompts.select({
          message: `Target directory "${targetDir}" is not empty. Overwrite?`,
          options: [
            { value: "cancel", label: "No, cancel scaffolding" },
            { value: "overwrite", label: "Yes, delete existing files and continue" }
          ]
        });

        if (prompts.isCancel(overwrite) || overwrite === "cancel") {
          prompts.cancel("Scaffolding cancelled.");
          process.exit(0);
        }

        const spinner = prompts.spinner();
        spinner.start("Clearing target directory");
        for (const file of files) {
          await fs.rm(path.join(resolvedTargetDir, file), { recursive: true, force: true });
        }
        spinner.stop("Target directory cleared");
      }
    }

    // 2. Prompt for package manager
    let packageManager = options.packageManager;
    if (!packageManager) {
      const response = await prompts.select({
        message: "Which package manager do you want to use?",
        options: [
          { value: "pnpm", label: "pnpm (Recommended)", hint: "Fast, disk space efficient" },
          { value: "npm", label: "npm", hint: "Default package manager" },
          { value: "yarn", label: "yarn", hint: "Classic package manager" },
          { value: "bun", label: "bun", hint: "Ultra-fast runner & installer" }
        ],
        initialValue: "pnpm"
      });

      if (prompts.isCancel(response)) {
        prompts.cancel("Scaffolding cancelled.");
        process.exit(0);
      }
      packageManager = response;
    }

    // 3. Prompt for Git initialization
    let initGit = options.git;
    if (initGit === undefined) {
      const response = await prompts.confirm({
        message: "Initialize a new Git repository?",
        initialValue: true
      });

      if (prompts.isCancel(response)) {
        prompts.cancel("Scaffolding cancelled.");
        process.exit(0);
      }
      initGit = response;
    }

    // 4. Prompt for dependency installation
    let installDeps = options.install;
    if (installDeps === undefined) {
      const response = await prompts.confirm({
        message: `Install dependencies automatically using ${packageManager}?`,
        initialValue: true
      });

      if (prompts.isCancel(response)) {
        prompts.cancel("Scaffolding cancelled.");
        process.exit(0);
      }
      installDeps = response;
    }

    // 5. Scaffolding stage
    const spinner = prompts.spinner();
    spinner.start("Scaffolding your Rimelight project...");

    try {
      // Copy template
      await copyDir(starterPath, resolvedTargetDir);

      // Update package.json
      const packageJsonPath = path.join(resolvedTargetDir, "package.json");
      if (existsSync(packageJsonPath)) {
        const content = await fs.readFile(packageJsonPath, "utf-8");
        const packageJson = JSON.parse(content);
        packageJson.name = displayProjectName;
        packageJson.private = true;
        await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), "utf-8");
      }

      // Update astro.config.ts and wrangler.jsonc with custom domain
      await updateDomainConfigs(resolvedTargetDir, domain, displayProjectName);

      spinner.stop(pc.green("✔ Scaffolding complete!"));
    } catch (error) {
      spinner.stop(pc.red("✖ Scaffolding failed."));
      console.error(error);
      process.exit(1);
    }

    // 6. Initialize Git
    if (initGit) {
      const gitSpinner = prompts.spinner();
      gitSpinner.start("Initializing Git repository...");
      const gitInit = spawn.sync("git", ["init"], { cwd: resolvedTargetDir });
      if (gitInit.status === 0) {
        gitSpinner.stop(pc.green("✔ Git repository initialized!"));
      } else {
        gitSpinner.stop(pc.yellow("⚠ Git initialization failed."));
      }
    }

    // 7. Install dependencies
    if (installDeps) {
      const installSpinner = prompts.spinner();
      installSpinner.start(`Installing dependencies with ${packageManager}...`);
      
      const install = spawn.sync(packageManager, ["install"], {
        cwd: resolvedTargetDir,
        stdio: "ignore"
      });

      if (install.status === 0) {
        installSpinner.stop(pc.green("✔ Dependencies successfully installed!"));
      } else {
        installSpinner.stop(pc.red(`✖ Dependency installation failed. Please run "${packageManager} install" manually.`));
      }
    }

    // 8. Outro
    prompts.outro(pc.magenta(pc.bold("◇ Enjoy building!")));

    console.log("\nNext Steps:");
    const relativePath = path.relative(process.cwd(), resolvedTargetDir);
    const cdCmd = relativePath ? `cd ${relativePath} && ` : "";
    console.log(pc.cyan(`  ${cdCmd}${packageManager} run dev`));
    console.log("");
  } else {
    // Non-interactive/headless fallback mode (TTY unavailable)
    const targetDir = options.projectName || "./my-rimelight-app";
    const resolvedTargetDir = path.resolve(targetDir);
    const displayProjectName = path.basename(resolvedTargetDir);
    const domain = options.domain || "";
    const packageManager = options.packageManager || "pnpm";
    const initGit = options.git !== false;
    const installDeps = options.install !== false;

    console.log(pc.magenta(pc.bold("◇ Rimelight CLI (Non-interactive Mode)")));
    console.log(`Creating project: ${pc.cyan(displayProjectName)} at ${pc.cyan(targetDir)}`);

    if (existsSync(resolvedTargetDir)) {
      const files = await fs.readdir(resolvedTargetDir);
      if (files.length > 0) {
        console.log(pc.yellow(`Target directory is not empty. Overwriting existing files...`));
        for (const file of files) {
          await fs.rm(path.join(resolvedTargetDir, file), { recursive: true, force: true });
        }
      }
    }

    console.log(`Copying files from starter template...`);
    await copyDir(starterPath, resolvedTargetDir);

    const packageJsonPath = path.join(resolvedTargetDir, "package.json");
    if (existsSync(packageJsonPath)) {
      const content = await fs.readFile(packageJsonPath, "utf-8");
      const packageJson = JSON.parse(content);
      packageJson.name = displayProjectName;
      packageJson.private = true;
      await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), "utf-8");
    }

    // Update astro.config.ts and wrangler.jsonc with custom domain
    await updateDomainConfigs(resolvedTargetDir, domain, displayProjectName);

    console.log(pc.green("✔ Scaffolding complete!"));

    if (initGit) {
      console.log("Initializing Git repository...");
      const gitInit = spawn.sync("git", ["init"], { cwd: resolvedTargetDir });
      if (gitInit.status === 0) {
        console.log(pc.green("✔ Git repository initialized!"));
      } else {
        console.log(pc.yellow("⚠ Git initialization failed."));
      }
    }

    if (installDeps) {
      console.log(`Installing dependencies using ${packageManager}...`);
      const install = spawn.sync(packageManager, ["install"], {
        cwd: resolvedTargetDir,
        stdio: "ignore"
      });
      if (install.status === 0) {
        console.log(pc.green("✔ Dependencies successfully installed!"));
      } else {
        console.log(pc.red(`✖ Dependency installation failed. Run "${packageManager} install" manually.`));
      }
    }

    console.log("\nNext Steps:");
    const relativePath = path.relative(process.cwd(), resolvedTargetDir);
    const cdCmd = relativePath ? `cd ${relativePath} && ` : "";
    console.log(pc.cyan(`  ${cdCmd}${packageManager} run dev`));
    console.log("");
  }
}

// Helper to dynamically calculate line-level differences between config files
function getDiffLines(starterContent, targetContent, file, targetDir) {
  let normalizedTarget = targetContent;
  let normalizedStarter = starterContent;

  // Normalize astro.config.ts domains and secure commented states for portfolios
  if (file === "astro.config.ts") {
    const siteMatch = targetContent.match(/site:\s*["']https?:\/\/([^"']+)["']/);
    if (siteMatch) {
      const domain = siteMatch[1];
      normalizedTarget = normalizedTarget
        .replace(new RegExp(domain, "g"), "example.com")
        .replace(/starter-dot-rimelight-dot-com/g, "example-dot-com");
    }
    if (targetDir.includes("marcelocfilho.com")) {
      // Treat commented security CSP block as standard uncommented layout for matching
      normalizedTarget = normalizedTarget.replace(/\/\/ /g, "");
    }
  }

  // Parse JSONC config structurally (tsconfig, wrangler, knip, lunaria, etc.)
  if (file.endsWith(".json") || file.endsWith(".jsonc")) {
    try {
      const starterObj = parseJsonc(starterContent);
      const targetObj = parseJsonc(targetContent);

      // Normalize dynamic wrangler fields
      if (file === "wrangler.jsonc") {
        targetObj.name = starterObj.name;
        targetObj.routes = starterObj.routes;
      }

      const diffs = [];
      // Deep structural diff of template values (only matching template keys)
      const diffKeys = (sObj, tObj, prefix = "") => {
        for (const [key, val] of Object.entries(sObj)) {
          const path = prefix ? `${prefix}.${key}` : key;
          if (tObj[key] === undefined) {
            diffs.push(`missing key "${path}"`);
          } else if (typeof val === "object" && val !== null && typeof tObj[key] === "object" && tObj[key] !== null) {
            diffKeys(val, tObj[key], path);
          } else if (JSON.stringify(tObj[key]) !== JSON.stringify(val)) {
            diffs.push(`differing key "${path}":\n      ├─ Current:   ${JSON.stringify(tObj[key])}\n      └─ Reference: ${JSON.stringify(val)}`);
          }
        }
      };
      diffKeys(starterObj, targetObj);
      return diffs;
    } catch (e) {
      // Fallback to line diff if JSON parse fails
    }
  }

  // Fallback to highly precise line-by-line missing patterns (including comments!)
  const cleanLines = (c) => c.split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  const starterLines = cleanLines(normalizedStarter);
  const targetLines = cleanLines(normalizedTarget);

  const diffs = [];
  for (const line of starterLines) {
    if (/^[{}[\],()]+$/.test(line)) continue; // ignore structural syntax-only lines
    const normalizedLine = line.replace(/\s+/g, "");
    const found = targetLines.some(tl => tl.replace(/\s+/g, "") === normalizedLine);
    if (!found) {
      diffs.push(`missing config entry: "${line}"`);
    }
  }
  return diffs;
}

export async function runCompare(options) {
  const targetDir = path.resolve(options.targetDir);
  const displayProjectName = path.basename(targetDir);

  console.log(pc.magenta(pc.bold(`◇ Rimelight Compare: ${displayProjectName}`)));
  console.log(`Comparing project configs against starter template...\n`);

  if (!existsSync(targetDir)) {
    console.error(pc.red(`✖ Target directory "${options.targetDir}" does not exist.`));
    process.exit(1);
  }

  const files = [
    ".gitignore",
    ".node-version",
    "package.json",
    "astro.config.ts",
    "tsconfig.json",
    "vite.config.ts",
    "wrangler.jsonc",
    "uno.config.ts",
    "knip.json",
    "lunaria.config.json",
    ".env.example"
  ];

  let totalDiffs = 0;

  for (const file of files) {
    const starterFilePath = path.join(starterPath, file);
    const targetFilePath = path.join(targetDir, file);

    if (!existsSync(targetFilePath)) {
      console.log(`${pc.red("✖")} ${pc.bold(file)}: ${pc.red("MISSING")}`);
      totalDiffs++;
      continue;
    }

    if (file === "package.json") {
      try {
        const starterPkg = JSON.parse(await fs.readFile(starterFilePath, "utf-8"));
        const targetPkg = JSON.parse(await fs.readFile(targetFilePath, "utf-8"));

        const pkgDiffs = [];

        // Engines Node
        if (starterPkg.engines?.node !== targetPkg.engines?.node) {
          pkgDiffs.push(`engines.node:\n    ├─ Current:   "${targetPkg.engines?.node || ""}"\n    └─ Reference: "${starterPkg.engines?.node || ""}"`);
        }

        // Package Manager
        if (starterPkg.packageManager !== targetPkg.packageManager) {
          pkgDiffs.push(`packageManager:\n    ├─ Current:   "${targetPkg.packageManager || ""}"\n    └─ Reference: "${starterPkg.packageManager || ""}"`);
        }

        // Scripts
        for (const [key, val] of Object.entries(starterPkg.scripts || {})) {
          if (!targetPkg.scripts?.[key]) {
            pkgDiffs.push(`missing script "${key}":\n    └─ Reference: "${val}"`);
          } else if (targetPkg.scripts[key] !== val) {
            pkgDiffs.push(`differing script "${key}":\n    ├─ Current:   "${targetPkg.scripts[key]}"\n    └─ Reference: "${val}"`);
          }
        }

        // Dependencies (matching only)
        for (const [key, val] of Object.entries(starterPkg.dependencies || {})) {
          if (!targetPkg.dependencies?.[key]) {
            pkgDiffs.push(`missing dependency "${key}":\n    └─ Reference: "${val}"`);
          } else if (targetPkg.dependencies[key] !== val) {
            pkgDiffs.push(`differing dependency "${key}":\n    ├─ Current:   "${targetPkg.dependencies[key]}"\n    └─ Reference: "${val}"`);
          }
        }

        // devDependencies (matching only)
        for (const [key, val] of Object.entries(starterPkg.devDependencies || {})) {
          if (!targetPkg.devDependencies?.[key]) {
            pkgDiffs.push(`missing devDependency "${key}":\n    └─ Reference: "${val}"`);
          } else if (targetPkg.devDependencies[key] !== val) {
            pkgDiffs.push(`differing devDependency "${key}":\n    ├─ Current:   "${targetPkg.devDependencies[key]}"\n    └─ Reference: "${val}"`);
          }
        }

        if (pkgDiffs.length > 0) {
          console.log(`${pc.yellow("⚠")} ${pc.bold(file)}: ${pc.yellow("DIFFERING")}`);
          for (const diff of pkgDiffs) {
            console.log(`  └─ ${pc.dim(diff)}`);
          }
          totalDiffs += pkgDiffs.length;
        } else {
          console.log(`${pc.green("✔")} ${pc.bold(file)}: ${pc.green("UP TO DATE")}`);
        }
      } catch (e) {
        console.log(`${pc.red("✖")} ${pc.bold(file)}: ${pc.red("INVALID JSON")} (${e.message})`);
        totalDiffs++;
      }
    } else {
      try {
        const starterContent = await fs.readFile(starterFilePath, "utf-8");
        const targetContent = await fs.readFile(targetFilePath, "utf-8");

        const diffs = getDiffLines(starterContent, targetContent, file, targetDir);

        if (diffs.length > 0) {
          console.log(`${pc.yellow("⚠")} ${pc.bold(file)}: ${pc.yellow("DIFFERING")}`);
          for (const diff of diffs.slice(0, 5)) {
            console.log(`  └─ ${pc.dim(diff)}`);
          }
          if (diffs.length > 5) {
            console.log(`  └─ ${pc.dim(`... and ${diffs.length - 5} more differences`)}`);
          }
          totalDiffs += diffs.length;
        } else {
          console.log(`${pc.green("✔")} ${pc.bold(file)}: ${pc.green("UP TO DATE")}`);
        }
      } catch (e) {
        console.log(`${pc.red("✖")} ${pc.bold(file)}: ${pc.red("ERROR")} (${e.message})`);
        totalDiffs++;
      }
    }
  }

  console.log("\n" + pc.magenta(pc.bold("◇ Comparison Complete")));
  if (totalDiffs > 0) {
    console.log(pc.yellow(`Found ${totalDiffs} differences. Run "rimelight update [path]" to standardize them.`));
  } else {
    console.log(pc.green("✔ All configuration files are up to date with the starter template!"));
  }
}

export async function runUpdate(options) {
  const targetDir = path.resolve(options.targetDir);
  const displayProjectName = path.basename(targetDir);

  const isInteractive = process.stdout.isTTY && !process.env.CI;

  prompts.intro(pc.magenta(pc.bold(`◇ Rimelight Update: ${displayProjectName}`)));
  console.log(`Standardizing project configs against starter template...\n`);

  if (!existsSync(targetDir)) {
    prompts.cancel(pc.red(`✖ Target directory "${options.targetDir}" does not exist.`));
    process.exit(1);
  }

  const files = [
    ".gitignore",
    ".node-version",
    "tsconfig.json",
    "vite.config.ts",
    "uno.config.ts",
    "knip.json",
    "lunaria.config.json",
    ".env.example"
  ];

  try {
    // 1. Process standard configuration files
    for (const file of files) {
      const starterFilePath = path.join(starterPath, file);
      const targetFilePath = path.join(targetDir, file);

      if (existsSync(starterFilePath)) {
        let needsUpdate = false;
        let actionLabel = "";

        if (!existsSync(targetFilePath)) {
          needsUpdate = true;
          actionLabel = `Create missing file "${file}"?`;
        } else {
          const starterContent = await fs.readFile(starterFilePath, "utf-8");
          const targetContent = await fs.readFile(targetFilePath, "utf-8");
          const diffs = getDiffLines(starterContent, targetContent, file, targetDir);
          if (diffs.length > 0) {
            needsUpdate = true;
            actionLabel = `Update file "${file}" to match template starter?`;
          }
        }

        if (needsUpdate) {
          let shouldApply = true;
          if (isInteractive) {
            shouldApply = await prompts.confirm({
              message: actionLabel,
              initialValue: true
            });
            if (prompts.isCancel(shouldApply)) {
              prompts.cancel("Update cancelled.");
              process.exit(0);
            }
          }

          if (shouldApply) {
            await fs.copyFile(starterFilePath, targetFilePath);
            console.log(pc.green(`✔ File "${file}" successfully updated.`));
          } else {
            console.log(pc.yellow(`ℹ Skipped file "${file}".`));
          }
        }
      }
    }

    // 2. Standardize package.json preserving custom dependencies
    const targetPkgPath = path.join(targetDir, "package.json");
    if (existsSync(targetPkgPath)) {
      const starterPkg = JSON.parse(await fs.readFile(path.join(starterPath, "package.json"), "utf-8"));
      const targetPkg = JSON.parse(await fs.readFile(targetPkgPath, "utf-8"));

      let pkgModified = false;

      // Update Node engines
      if (starterPkg.engines?.node !== targetPkg.engines?.node) {
        let shouldApply = true;
        if (isInteractive) {
          shouldApply = await prompts.confirm({
            message: `Update Node engine compatibility to "${starterPkg.engines?.node}"?\n  ├─ Current:   "${targetPkg.engines?.node || ""}"\n  └─ Reference: "${starterPkg.engines?.node}"`,
            initialValue: true
          });
          if (prompts.isCancel(shouldApply)) {
            prompts.cancel("Update cancelled.");
            process.exit(0);
          }
        }
        if (shouldApply) {
          targetPkg.engines = { ...targetPkg.engines, node: starterPkg.engines.node };
          pkgModified = true;
        }
      }

      // Update packageManager
      if (starterPkg.packageManager !== targetPkg.packageManager) {
        let shouldApply = true;
        if (isInteractive) {
          shouldApply = await prompts.confirm({
            message: `Update pnpm version to "${starterPkg.packageManager}"?\n  ├─ Current:   "${targetPkg.packageManager || ""}"\n  └─ Reference: "${starterPkg.packageManager}"`,
            initialValue: true
          });
          if (prompts.isCancel(shouldApply)) {
            prompts.cancel("Update cancelled.");
            process.exit(0);
          }
        }
        if (shouldApply) {
          targetPkg.packageManager = starterPkg.packageManager;
          pkgModified = true;
        }
      }

      // Update scripts
      targetPkg.scripts = targetPkg.scripts || {};
      for (const [key, val] of Object.entries(starterPkg.scripts || {})) {
        if (targetPkg.scripts[key] !== val) {
          let shouldApply = true;
          if (isInteractive) {
            const isMissing = !targetPkg.scripts[key];
            const msg = isMissing
              ? `Add missing script "${key}": "${val}"?`
              : `Update script "${key}"?\n  ├─ Current:   "${targetPkg.scripts[key]}"\n  └─ Reference: "${val}"`;
            shouldApply = await prompts.confirm({
              message: msg,
              initialValue: true
            });
            if (prompts.isCancel(shouldApply)) {
              prompts.cancel("Update cancelled.");
              process.exit(0);
            }
          }
          if (shouldApply) {
            targetPkg.scripts[key] = val;
            pkgModified = true;
          }
        }
      }

      // Update dependencies (matching only)
      targetPkg.dependencies = targetPkg.dependencies || {};
      for (const [key, val] of Object.entries(starterPkg.dependencies || {})) {
        if (targetPkg.dependencies[key] !== val) {
          let shouldApply = true;
          if (isInteractive) {
            const isMissing = !targetPkg.dependencies[key];
            const msg = isMissing
              ? `Add missing dependency "${key}": "${val}"?`
              : `Update dependency "${key}"?\n  ├─ Current:   "${targetPkg.dependencies[key]}"\n  └─ Reference: "${val}"`;
            shouldApply = await prompts.confirm({
              message: msg,
              initialValue: true
            });
            if (prompts.isCancel(shouldApply)) {
              prompts.cancel("Update cancelled.");
              process.exit(0);
            }
          }
          if (shouldApply) {
            targetPkg.dependencies[key] = val;
            pkgModified = true;
          }
        }
      }

      // Update devDependencies (matching or missing)
      targetPkg.devDependencies = targetPkg.devDependencies || {};
      for (const [key, val] of Object.entries(starterPkg.devDependencies || {})) {
        if (targetPkg.devDependencies[key] !== val) {
          let shouldApply = true;
          if (isInteractive) {
            const isMissing = !targetPkg.devDependencies[key];
            const msg = isMissing
              ? `Add missing devDependency "${key}": "${val}"?`
              : `Update devDependency "${key}"?\n  ├─ Current:   "${targetPkg.devDependencies[key]}"\n  └─ Reference: "${val}"`;
            shouldApply = await prompts.confirm({
              message: msg,
              initialValue: true
            });
            if (prompts.isCancel(shouldApply)) {
              prompts.cancel("Update cancelled.");
              process.exit(0);
            }
          }
          if (shouldApply) {
            targetPkg.devDependencies[key] = val;
            pkgModified = true;
          }
        }
      }

      if (pkgModified) {
        // Consistent scripts ordering
        const orderedScripts = {};
        const allScriptKeys = new Set([
          ...Object.keys(starterPkg.scripts || {}),
          ...Object.keys(targetPkg.scripts || {})
        ]);
        const standardOrder = [
          "prepare",
          "generate-types",
          "knip",
          "astro",
          "dev",
          "build",
          "preview",
          "lunaria:build",
          "lunaria:preview"
        ];
        for (const key of standardOrder) {
          if (allScriptKeys.has(key)) {
            orderedScripts[key] = targetPkg.scripts[key];
            allScriptKeys.delete(key);
          }
        }
        for (const key of allScriptKeys) {
          orderedScripts[key] = targetPkg.scripts[key];
        }
        targetPkg.scripts = orderedScripts;

        await fs.writeFile(targetPkgPath, JSON.stringify(targetPkg, null, 2), "utf-8");
        console.log(pc.green("✔ package.json standardized successfully."));
      } else {
        console.log(pc.yellow("ℹ No changes made to package.json."));
      }
    }

    // 3. Standardize astro.config.ts preserving domain
    const targetAstroPath = path.join(targetDir, "astro.config.ts");
    if (existsSync(targetAstroPath)) {
      const content = await fs.readFile(targetAstroPath, "utf-8");
      const siteMatch = content.match(/site:\s*["']https?:\/\/([^"']+)["']/);
      let domain = siteMatch ? siteMatch[1] : "";
      
      let needsAstroUpdate = false;
      const starterContent = await fs.readFile(path.join(starterPath, "astro.config.ts"), "utf-8");
      const diffs = getDiffLines(starterContent, content, "astro.config.ts", targetDir);
      if (diffs.length > 0) needsAstroUpdate = true;

      if (needsAstroUpdate && domain) {
        let shouldApply = true;
        if (isInteractive) {
          shouldApply = await prompts.confirm({
            message: `Update "astro.config.ts" (will preserve domain "https://${domain}")?`,
            initialValue: true
          });
          if (prompts.isCancel(shouldApply)) {
            prompts.cancel("Update cancelled.");
            process.exit(0);
          }
        }
        if (shouldApply) {
          let template = await fs.readFile(path.join(starterPath, "astro.config.ts"), "utf-8");
          template = template.replace(/site:\s*["'][^"']*["']/g, `site: "https://${domain}"`);
          template = template.replace(/hostname:\s*["'][^"']*["']/g, `hostname: "**.${domain}"`);
          template = template.replace(/img-src 'self' https:\/\/cdn\.[^"']*/g, `img-src 'self' https://cdn.${domain}`);
          if (targetDir.includes("marcelocfilho.com")) {
            template = template.replace(/security:\s*\{[\s\S]*?\}\s*,\s*\n\s*\n\s*i18n:/, `// security: {\n  //   checkOrigin: true,\n  //   allowedDomains: [\n  //     {\n  //       hostname: "**.${domain}",\n  //       protocol: "https"\n  //     }\n  //   ],\n  //   csp: {\n  //     algorithm: "SHA-384",\n  //     directives: [\n  //       "default-src 'none'",\n  //       "img-src 'self' https://cdn.${domain} https://i3.ytimg.com https://www.youtube.com https://www.youtube-nocookie.com",\n  //       "font-src 'self'",\n  //       "connect-src 'self'",\n  //       "frame-ancestors 'none'",\n  //       "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://challenges.cloudflare.com",\n  //       "upgrade-insecure-requests",\n  //       "base-uri 'self'",\n  //       "form-action 'self'"\n  //     ],\n  //     scriptDirective: {\n  //       resources: [\n  //         "'self'",\n  //         "https://challenges.cloudflare.com",\n  //         "https://betterlytics.io/analytics.js"\n  //       ]\n  //     },\n  //     styleDirective: {\n  //       resources: ["'self'"]\n  //     }\n  //   }\n  // },\n\n  i18n:`);
          }
          await fs.writeFile(targetAstroPath, template, "utf-8");
          console.log(pc.green("✔ astro.config.ts standardized successfully."));
        } else {
          console.log(pc.yellow("ℹ Skipped astro.config.ts."));
        }
      }
    }

    // 4. Standardize wrangler.jsonc preserving name and routes
    const targetWranglerPath = path.join(targetDir, "wrangler.jsonc");
    if (existsSync(targetWranglerPath)) {
      let wranglerName = "";
      let wranglerRoutes = [];
      try {
        const content = await fs.readFile(targetWranglerPath, "utf-8");
        const parsed = parseJsonc(content);
        wranglerName = parsed.name;
        wranglerRoutes = parsed.routes || [];
      } catch (e) {}

      let needsWranglerUpdate = false;
      const starterContent = await fs.readFile(path.join(starterPath, "wrangler.jsonc"), "utf-8");
      const targetContent = await fs.readFile(targetWranglerPath, "utf-8");
      const diffs = getDiffLines(starterContent, targetContent, "wrangler.jsonc", targetDir);
      if (diffs.length > 0) needsWranglerUpdate = true;

      if (needsWranglerUpdate && wranglerName) {
        let shouldApply = true;
        if (isInteractive) {
          shouldApply = await prompts.confirm({
            message: `Update "wrangler.jsonc" (will preserve name "${wranglerName}")?`,
            initialValue: true
          });
          if (prompts.isCancel(shouldApply)) {
            prompts.cancel("Update cancelled.");
            process.exit(0);
          }
        }
        if (shouldApply) {
          const templateContent = await fs.readFile(path.join(starterPath, "wrangler.jsonc"), "utf-8");
          const template = parseJsonc(templateContent);
          template.name = wranglerName;
          if (wranglerRoutes.length > 0) {
            template.routes = wranglerRoutes;
          }
          await fs.writeFile(targetWranglerPath, JSON.stringify(template, null, 2), "utf-8");
          console.log(pc.green("✔ wrangler.jsonc standardized successfully."));
        } else {
          console.log(pc.yellow("ℹ Skipped wrangler.jsonc."));
        }
      }
    }

    // 5. Run vp install
    console.log("");
    prompts.outro(pc.green("✔ Standardization process complete!"));

    let runInstall = true;
    if (isInteractive) {
      runInstall = await prompts.confirm({
        message: "Run 'vp install' now?",
        initialValue: true
      });
      if (prompts.isCancel(runInstall)) {
        process.exit(0);
      }
    }

    if (runInstall) {
      const runVpInstall = prompts.spinner();
      runVpInstall.start("Running vp install...");
      const vpInstall = spawn.sync("vp", ["install"], { cwd: targetDir, stdio: "ignore" });
      if (vpInstall.status === 0) {
        runVpInstall.stop(pc.green("✔ vp install completed successfully!"));
      } else {
        runVpInstall.stop(pc.yellow("⚠ vp install failed. Please run it manually in the directory."));
      }
    }

  } catch (error) {
    prompts.cancel(pc.red(`✖ Update failed: ${error.message}`));
    console.error(error);
    process.exit(1);
  }
}

