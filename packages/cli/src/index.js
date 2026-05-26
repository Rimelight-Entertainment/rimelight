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

// Helper to get nested properties in an object
function getNested(obj, path) {
  const parts = path.split(".");
  let current = obj;
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  return current;
}

// Helper to set nested properties in an object
function setNested(obj, path, value) {
  const parts = path.split(".");
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (current[part] === undefined || current[part] === null) {
      current[part] = {};
    }
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
}

// Generic index finder for arrays containing primitives or objects
function findArrayItemIndex(arr, item) {
  const itemStr = JSON.stringify(item);
  return arr.findIndex(x => JSON.stringify(x) === itemStr);
}

// Inject an item at the exact index matched semantically against the starter array order
function injectIntoArray(targetArr, starterArr, value) {
  const sIdx = findArrayItemIndex(starterArr, value);
  if (sIdx === -1) {
    targetArr.push(value);
    return targetArr;
  }
  
  let inserted = false;
  // Look for preceding neighbor that exists in targetArr
  for (let i = sIdx - 1; i >= 0; i--) {
    const precedingVal = starterArr[i];
    const tIdx = findArrayItemIndex(targetArr, precedingVal);
    if (tIdx !== -1) {
      targetArr.splice(tIdx + 1, 0, value);
      inserted = true;
      break;
    }
  }
  
  if (!inserted) {
    // Look for succeeding neighbor that exists in targetArr
    for (let i = sIdx + 1; i < starterArr.length; i++) {
      const succeedingVal = starterArr[i];
      const tIdx = findArrayItemIndex(targetArr, succeedingVal);
      if (tIdx !== -1) {
        targetArr.splice(tIdx, 0, value);
        inserted = true;
        break;
      }
    }
  }
  
  if (!inserted) {
    targetArr.push(value);
  }
  
  return targetArr;
}

// Reorder target object keys to cleanly match starter template order, preserving custom keys
function reorderKeys(targetObj, starterObj) {
  const ordered = {};
  for (const key of Object.keys(starterObj)) {
    if (targetObj[key] !== undefined) {
      if (typeof starterObj[key] === "object" && starterObj[key] !== null && typeof targetObj[key] === "object" && targetObj[key] !== null && !Array.isArray(starterObj[key])) {
        ordered[key] = reorderKeys(targetObj[key], starterObj[key]);
      } else {
        ordered[key] = targetObj[key];
      }
    }
  }
  for (const key of Object.keys(targetObj)) {
    if (ordered[key] === undefined) {
      ordered[key] = targetObj[key];
    }
  }
  return ordered;
}

// Helper to structurally diff JSON/JSONC
function getStructuredJsonDiffs(starterContent, targetContent, file) {
  const starterObj = parseJsonc(starterContent);
  const targetObj = parseJsonc(targetContent);

  const diffs = [];
  
  const diffKeys = (sObj, tObj, prefix = "") => {
    // Check if key insertion order differs for semantic standardizing
    const sKeys = Object.keys(sObj);
    const tKeys = Object.keys(tObj).filter(k => sKeys.includes(k));
    const keyOrderDiffers = sKeys.some((k, idx) => tKeys[idx] !== k);
    if (keyOrderDiffers && sKeys.length > 0) {
      diffs.push({
        type: "out_of_order_keys",
        path: prefix || ".",
        message: `[Out of Order] keys in "${prefix || "root"}" differ from starter order`
      });
    }

    for (const [key, val] of Object.entries(sObj)) {
      const path = prefix ? `${prefix}.${key}` : key;
      
      if (file === "wrangler.jsonc" && (path === "name" || path === "routes")) {
        continue;
      }
      
      if (tObj[key] === undefined) {
        diffs.push({
          type: "missing",
          path,
          value: val,
          message: `missing key "${path}"`
        });
      } else if (Array.isArray(val) && Array.isArray(tObj[key])) {
        // Element-level list checking
        let arrayMissing = false;
        for (const item of val) {
          const itemString = JSON.stringify(item);
          const found = tObj[key].some(tItem => JSON.stringify(tItem) === itemString);
          if (!found) {
            arrayMissing = true;
            diffs.push({
              type: "array_missing",
              path,
              value: item,
              message: `missing array entry ${itemString} in "${path}"`
            });
          }
        }
        
        // Element ordering checking
        if (!arrayMissing && val.length > 0) {
          const tFiltered = tObj[key].filter(tItem => val.some(sItem => JSON.stringify(sItem) === JSON.stringify(tItem)));
          const orderDiffers = val.some((sItem, idx) => JSON.stringify(sItem) !== JSON.stringify(tFiltered[idx]));
          if (orderDiffers) {
            const reordered = [];
            for (const sItem of val) {
              reordered.push(sItem);
            }
            for (const tItem of tObj[key]) {
              if (!val.some(sItem => JSON.stringify(sItem) === JSON.stringify(tItem))) {
                reordered.push(tItem);
              }
            }
            diffs.push({
              type: "out_of_order_array",
              path,
              value: reordered,
              message: `[Out of Order] array elements in "${path}" differ from starter order`
            });
          }
        }
      } else if (typeof val === "object" && val !== null && typeof tObj[key] === "object" && tObj[key] !== null) {
        diffKeys(val, tObj[key], path);
      } else if (JSON.stringify(tObj[key]) !== JSON.stringify(val)) {
        diffs.push({
          type: "differing",
          path,
          value: val,
          currentValue: tObj[key],
          message: `differing key "${path}":\n      ├─ Current:   ${JSON.stringify(tObj[key])}\n      └─ Reference: ${JSON.stringify(val)}`
        });
      }
    }
  };
  
  diffKeys(starterObj, targetObj);
  return diffs;
}

// Helper to diff files line-by-line
function getStructuredLineDiffs(starterContent, targetContent) {
  const cleanLines = (c) => c.split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  const starterLines = cleanLines(starterContent);
  const targetLines = cleanLines(targetContent);

  const diffs = [];
  for (const line of starterLines) {
    if (/^[{}[\],()]+$/.test(line)) continue; // ignore structural syntax-only lines
    const normalizedLine = line.replace(/\s+/g, "");
    const found = targetLines.some(tl => tl.replace(/\s+/g, "") === normalizedLine);
    if (!found) {
      diffs.push({
        type: "missing_line",
        line,
        message: `missing config entry: "${line}"`
      });
    }
  }
  return diffs;
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
      const diffs = getStructuredJsonDiffs(starterContent, targetContent, file);
      return diffs.map(d => d.message);
    } catch (e) {
      // Fallback to line diff if JSON parse fails
    }
  }

  const diffs = getStructuredLineDiffs(normalizedStarter, normalizedTarget);
  return diffs.map(d => d.message);
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
    ".env.example",
    "pnpm-workspace.yaml"
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
          for (const diff of diffs) {
            console.log(`  └─ ${pc.dim(diff)}`);
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
    ".env.example",
    "pnpm-workspace.yaml",
    "astro.config.ts",
    "wrangler.jsonc"
  ];

  const pendingWrites = []; // Accumulate in-memory changes: { filePath, content, actionDescription }

  try {
    // 1. Process standard configuration files
    for (const file of files) {
      const starterFilePath = path.join(starterPath, file);
      const targetFilePath = path.join(targetDir, file);

      if (existsSync(starterFilePath)) {
        if (!existsSync(targetFilePath)) {
          // File is missing entirely
          console.log(`${pc.red("✖")} ${pc.bold(file)}: ${pc.red("MISSING")}`);
          let shouldCreate = true;
          if (isInteractive) {
            shouldCreate = await prompts.confirm({
              message: `Create missing file "${file}" from starter template?`,
              initialValue: true
            });
            if (prompts.isCancel(shouldCreate)) {
              prompts.cancel("Update cancelled.");
              process.exit(0);
            }
          }
          if (shouldCreate) {
            const starterContent = await fs.readFile(starterFilePath, "utf-8");
            pendingWrites.push({
              filePath: targetFilePath,
              content: starterContent,
              actionDescription: `Create missing file "${file}"`
            });
            console.log(pc.green(`✔ Scheduled creation of "${file}".`));
          } else {
            console.log(pc.yellow(`ℹ Skipped file "${file}".`));
          }
          continue;
        }

        const starterContent = await fs.readFile(starterFilePath, "utf-8");
        const targetContent = await fs.readFile(targetFilePath, "utf-8");

        // Parse/Diff dynamically based on file type
        if (file.endsWith(".json") || file.endsWith(".jsonc")) {
          let currentTargetContent = targetContent;
          let loop = true;

          while (loop) {
            let diffs = [];
            try {
              diffs = getStructuredJsonDiffs(starterContent, currentTargetContent, file);
            } catch (e) {
              // Fallback to line diff
            }

            if (diffs.length === 0) break;

            console.log(`${pc.yellow("⚠")} ${pc.bold(file)}: ${pc.yellow("DIFFERING")}`);
            for (const diff of diffs) {
              console.log(`  └─ ${pc.dim(diff.message)}`);
            }

            let selectedDiffMessages = [];
            if (isInteractive) {
              const selection = await prompts.multiselect({
                message: `Select keys to update in ${file} (Select none to finish):`,
                options: diffs.map(diff => ({
                  value: diff.message,
                  label: diff.message
                })),
                required: false
              });

              if (prompts.isCancel(selection)) {
                prompts.cancel("Update cancelled.");
                process.exit(0);
              }
              selectedDiffMessages = selection;
            } else {
              // Apply all in non-interactive mode
              selectedDiffMessages = diffs.map(d => d.message);
            }

            if (selectedDiffMessages.length === 0) {
              break;
            }

            let targetObj = parseJsonc(currentTargetContent);
            for (const diff of diffs) {
              if (selectedDiffMessages.includes(diff.message)) {
                if (diff.type === "array_missing") {
                  const arr = getNested(targetObj, diff.path) || [];
                  const starterObj = parseJsonc(starterContent);
                  const starterArr = getNested(starterObj, diff.path) || [];
                  const newArr = injectIntoArray(arr, starterArr, diff.value);
                  setNested(targetObj, diff.path, newArr);
                } else if (diff.type === "out_of_order_array") {
                  setNested(targetObj, diff.path, diff.value);
                } else if (diff.type === "out_of_order_keys") {
                  targetObj = reorderKeys(targetObj, parseJsonc(starterContent));
                } else {
                  setNested(targetObj, diff.path, diff.value);
                }
              }
            }

            if (file === "wrangler.jsonc") {
              const parsed = parseJsonc(targetContent);
              targetObj.name = parsed.name;
              targetObj.routes = parsed.routes;
            }

            currentTargetContent = JSON.stringify(targetObj, null, 2);
            console.log(pc.green(`✔ Staged ${selectedDiffMessages.length} updates for "${file}" in memory.\n`));

            if (!isInteractive) break; // Non-interactive mode finishes after one re-evaluation
          }

          if (currentTargetContent !== targetContent) {
            pendingWrites.push({
              filePath: targetFilePath,
              content: currentTargetContent,
              actionDescription: `Standardize JSON structures in "${file}"`
            });
            console.log(pc.green(`✔ Scheduled batch updates for "${file}".`));
          }

        } else if (file === ".gitignore" || file === ".env.example" || file === "pnpm-workspace.yaml" || file === ".node-version") {
          let currentTargetContent = targetContent;
          let loop = true;

          while (loop) {
            const diffs = getStructuredLineDiffs(starterContent, currentTargetContent);
            if (diffs.length === 0) break;

            console.log(`${pc.yellow("⚠")} ${pc.bold(file)}: ${pc.yellow("DIFFERING")}`);
            for (const diff of diffs) {
              console.log(`  └─ ${pc.dim(diff.message)}`);
            }

            let selectedLines = [];
            if (isInteractive) {
              const selection = await prompts.multiselect({
                message: `Select entries to add to ${file} (Select none to finish):`,
                options: diffs.map(diff => ({
                  value: diff.line,
                  label: diff.line
                })),
                required: false
              });

              if (prompts.isCancel(selection)) {
                prompts.cancel("Update cancelled.");
                process.exit(0);
              }
              selectedLines = selection;
            } else {
              selectedLines = diffs.map(d => d.line);
            }

            if (selectedLines.length === 0) {
              break;
            }

            let newContent = currentTargetContent;
            for (const diff of diffs) {
              if (selectedLines.includes(diff.line)) {
                if (newContent && !newContent.endsWith("\n")) {
                  newContent += "\n";
                }
                newContent += diff.line + "\n";
              }
            }

            currentTargetContent = newContent;
            console.log(pc.green(`✔ Staged ${selectedLines.length} entries for "${file}" in memory.\n`));

            if (!isInteractive) break;
          }

          if (currentTargetContent !== targetContent) {
            pendingWrites.push({
              filePath: targetFilePath,
              content: currentTargetContent,
              actionDescription: `Standardize entry list in "${file}"`
            });
            console.log(pc.green(`✔ Scheduled batch updates for "${file}".`));
          }

        } else {
          // Complex TS config files: astro.config.ts, vite.config.ts, uno.config.ts
          const diffs = getStructuredLineDiffs(starterContent, targetContent);

          if (diffs.length > 0) {
            console.log(`${pc.yellow("⚠")} ${pc.bold(file)}: ${pc.yellow("DIFFERING")}`);
            for (const diff of diffs) {
              console.log(`  └─ ${pc.dim(diff.message)}`);
            }

            let shouldApply = true;
            if (isInteractive) {
              shouldApply = await prompts.confirm({
                message: `Update entire file "${file}" to match template starter?`,
                initialValue: true
              });
              if (prompts.isCancel(shouldApply)) {
                prompts.cancel("Update cancelled.");
                process.exit(0);
              }
            }

            if (shouldApply) {
              let newContent = "";
              if (file === "astro.config.ts") {
                const siteMatch = targetContent.match(/site:\s*["']https?:\/\/([^"']+)["']/);
                const domain = siteMatch ? siteMatch[1] : "";
                if (domain) {
                  let template = await fs.readFile(starterFilePath, "utf-8");
                  template = template.replace(/site:\s*["'][^"']*["']/g, `site: "https://${domain}"`);
                  template = template.replace(/hostname:\s*["'][^"']*["']/g, `hostname: "**.${domain}"`);
                  template = template.replace(/img-src 'self' https:\/\/cdn\.[^"']*/g, `img-src 'self' https://cdn.${domain}`);
                  if (targetDir.includes("marcelocfilho.com")) {
                    template = template.replace(/security:\s*\{[\s\S]*?\}\s*,\s*\n\s*\n\s*i18n:/, `// security: {\n  //   checkOrigin: true,\n  //   allowedDomains: [\n  //     {\n  //       hostname: "**.${domain}",\n  //       protocol: "https"\n  //     }\n  //   ],\n  //   csp: {\n  //     algorithm: "SHA-384",\n  //     directives: [\n  //       "default-src 'none'",\n  //       "img-src 'self' https://cdn.${domain} https://i3.ytimg.com https://www.youtube.com https://www.youtube-nocookie.com",\n  //       "font-src 'self'",\n  //       "connect-src 'self'",\n  //       "frame-ancestors 'none'",\n  //       "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://challenges.cloudflare.com",\n  //       "upgrade-insecure-requests",\n  //       "base-uri 'self'",\n  //       "form-action 'self'"\n  //     ],\n  //     scriptDirective: {\n  //       resources: [\n  //         "'self'",\n  //         "https://challenges.cloudflare.com",\n  //         "https://betterlytics.io/analytics.js"\n  //       ]\n  //     },\n  //     styleDirective: {\n  //       resources: ["'self'"]\n  //     }\n  //   }\n  // },\n\n  i18n:`);
                  }
                  newContent = template;
                } else {
                  newContent = starterContent;
                }
              } else {
                newContent = starterContent;
              }

              pendingWrites.push({
                filePath: targetFilePath,
                content: newContent,
                actionDescription: `Standardize file "${file}"`
              });
              console.log(pc.green(`✔ Scheduled updates for "${file}".`));
            } else {
              console.log(pc.yellow(`ℹ Skipped file "${file}".`));
            }
          }
        }
      }
    }

    // 2. Standardize package.json preserving custom dependencies
    const targetPkgPath = path.join(targetDir, "package.json");
    if (existsSync(targetPkgPath)) {
      const starterPkg = JSON.parse(await fs.readFile(path.join(starterPath, "package.json"), "utf-8"));
      const targetPkg = JSON.parse(await fs.readFile(targetPkgPath, "utf-8"));

      const pkgOptions = [];

      // Engines Node
      if (starterPkg.engines?.node !== targetPkg.engines?.node) {
        pkgOptions.push({
          value: { type: "engines", key: "node", value: starterPkg.engines.node },
          label: `Update engines.node: "${starterPkg.engines.node}" (Current: "${targetPkg.engines?.node || ""}")`
        });
      }

      // Package Manager
      if (starterPkg.packageManager !== targetPkg.packageManager) {
        pkgOptions.push({
          value: { type: "packageManager", value: starterPkg.packageManager },
          label: `Update packageManager: "${starterPkg.packageManager}" (Current: "${targetPkg.packageManager || ""}")`
        });
      }

      // Scripts
      targetPkg.scripts = targetPkg.scripts || {};
      for (const [key, val] of Object.entries(starterPkg.scripts || {})) {
        if (targetPkg.scripts[key] !== val) {
          const isMissing = !targetPkg.scripts[key];
          pkgOptions.push({
            value: { type: "scripts", key, value: val },
            label: isMissing ? `Add script "${key}": "${val}"` : `Update script "${key}": "${val}" (Current: "${targetPkg.scripts[key]}")`
          });
        }
      }

      // Dependencies
      targetPkg.dependencies = targetPkg.dependencies || {};
      for (const [key, val] of Object.entries(starterPkg.dependencies || {})) {
        if (targetPkg.dependencies[key] !== val) {
          const isMissing = !targetPkg.dependencies[key];
          pkgOptions.push({
            value: { type: "dependencies", key, value: val },
            label: isMissing ? `Add dependency "${key}": "${val}"` : `Update dependency "${key}": "${val}" (Current: "${targetPkg.dependencies[key]}")`
          });
        }
      }

      // devDependencies
      targetPkg.devDependencies = targetPkg.devDependencies || {};
      for (const [key, val] of Object.entries(starterPkg.devDependencies || {})) {
        if (targetPkg.devDependencies[key] !== val) {
          const isMissing = !targetPkg.devDependencies[key];
          pkgOptions.push({
            value: { type: "devDependencies", key, value: val },
            label: isMissing ? `Add devDependency "${key}": "${val}"` : `Update devDependency "${key}": "${val}" (Current: "${targetPkg.devDependencies[key]}")`
          });
        }
      }

      if (pkgOptions.length > 0) {
        console.log(`${pc.yellow("⚠")} ${pc.bold("package.json")}: ${pc.yellow("DIFFERING")}`);
        
        let selectedOpts = pkgOptions.map(o => o.value);
        if (isInteractive) {
          const selection = await prompts.multiselect({
            message: "Select updates to apply to package.json:",
            options: pkgOptions,
            required: false
          });

          if (prompts.isCancel(selection)) {
            prompts.cancel("Update cancelled.");
            process.exit(0);
          }
          selectedOpts = selection;
        }

        if (selectedOpts.length > 0) {
          let pkgModified = false;
          for (const opt of selectedOpts) {
            pkgModified = true;
            if (opt.type === "engines") {
              targetPkg.engines = { ...targetPkg.engines, [opt.key]: opt.value };
            } else if (opt.type === "packageManager") {
              targetPkg.packageManager = opt.value;
            } else {
              targetPkg[opt.type][opt.key] = opt.value;
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

            pendingWrites.push({
              filePath: targetPkgPath,
              content: JSON.stringify(targetPkg, null, 2),
              actionDescription: `Standardize ${selectedOpts.length} entries in "package.json"`
            });
            console.log(pc.green("✔ Scheduled updates for \"package.json\"."));
          }
        } else {
          console.log(pc.yellow("ℹ Skipped updates for package.json."));
        }
      }
    }

    // 3. Batch and Apply all changes at the end
    console.log("");
    if (pendingWrites.length > 0) {
      console.log(pc.bold(pc.cyan("◇ Pending changes to be applied:")));
      for (const item of pendingWrites) {
        const relativeFile = path.relative(targetDir, item.filePath);
        console.log(`  ├─ ${pc.bold(relativeFile)}: ${pc.dim(item.actionDescription)}`);
      }
      console.log("");

      let confirmApply = true;
      if (isInteractive) {
        confirmApply = await prompts.confirm({
          message: `Apply all ${pendingWrites.length} scheduled changes to disk? (Files will not be modified if cancelled)`,
          initialValue: true
        });

        if (prompts.isCancel(confirmApply) || !confirmApply) {
          prompts.cancel("Update cancelled. No files were modified.");
          process.exit(0);
        }
      }

      if (confirmApply) {
        const writeSpinner = prompts.spinner();
        writeSpinner.start("Writing changes to configuration files...");
        for (const item of pendingWrites) {
          await fs.writeFile(item.filePath, item.content, "utf-8");
        }
        writeSpinner.stop(pc.green(`✔ Successfully wrote ${pendingWrites.length} files to disk!`));
      }
    } else {
      console.log(pc.green("✔ No changes were selected. All files remain unchanged."));
    }

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
