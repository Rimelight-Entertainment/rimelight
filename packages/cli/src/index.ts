import path from "node:path";
import fs from "node:fs/promises";
import { existsSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import type { SpawnSyncOptions } from "node:child_process";
import * as prompts from "./prompts";
import { pc } from "./prompts";

function runCommand(cmd: string, args: string[], options: SpawnSyncOptions = {}) {
  return spawnSync(cmd, args, {
    ...options,
    shell: process.platform === "win32",
  });
}

const candidateStarterPaths = [
  path.resolve(import.meta.dirname, "../../../apps/starter.rimelight.com"),
  path.resolve(import.meta.dirname, "../../starter"),
  path.resolve(import.meta.dirname, "../starter"),
];
export const starterPath: string =
  candidateStarterPaths.find((p) => existsSync(p)) || candidateStarterPaths[0]!;

// Helper to parse JSON with comments (JSONC)
export function parseJsonc(content: string): any {
  let stripped = content.replace(/(?:^|\s)\/\*[\s\S]*?\*\//g, "");
  stripped = stripped.replace(/(^|[^\\:])\/\/.*$/gm, "$1");
  return JSON.parse(stripped);
}

// Helper to copy directory recursively
async function copyDir(src: string, dest: string): Promise<void> {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  const promises = entries.map(async (entry) => {
    if (
      entry.name === "node_modules" ||
      entry.name === "dist" ||
      entry.name === ".git" ||
      entry.name === ".wrangler"
    ) {
      return;
    }

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  });

  await Promise.all(promises);
}

// Cloudflare worker names may only contain lowercase alphanumerics and dashes,
// so `my-app.com` becomes `my-app-dot-com`.
export function toWorkerName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9-]/g, "-");
}

// Helper to update the Cloudflare worker config with the chosen domain
export async function updateDomainConfigs(
  resolvedTargetDir: string,
  domain: string,
  displayProjectName: string,
): Promise<void> {
  // Without a domain there is nothing to derive a worker name from, so fall back
  // to the project name. The starter domain is left untouched in that case.
  const workerName = domain
    ? toWorkerName(domain.replace(/\./g, "-dot-"))
    : toWorkerName(displayProjectName);

  // Every occurrence of the starter worker name in cloudflare.config.ts is
  // derived from it (worker.name, the R2 bucket name and the ChatRoom worker
  // binding), so one pass of substitutions keeps them all consistent with
  // each other.
  const cloudflareConfigPath = path.join(resolvedTargetDir, "cloudflare.config.ts");
  if (existsSync(cloudflareConfigPath)) {
    let content = await fs.readFile(cloudflareConfigPath, "utf-8");
    content = content.replace(/starter-dot-rimelight-dot-com/g, workerName);
    if (domain) {
      content = content.replace(/starter\.rimelight\.com/g, domain);
    }
    await fs.writeFile(cloudflareConfigPath, content, "utf-8");
  }

  // The site domain is also baked into the seo and security plugin options.
  const viteConfigPath = path.join(resolvedTargetDir, "vite.config.ts");
  if (domain && existsSync(viteConfigPath)) {
    let content = await fs.readFile(viteConfigPath, "utf-8");
    content = content.replace(/starter\.rimelight\.com/g, domain);
    await fs.writeFile(viteConfigPath, content, "utf-8");
  }
}

export interface CreateOptions {
  projectName?: string | undefined;
  domain?: string | undefined;
  git?: boolean | undefined;
  install?: boolean | undefined;
  packageManager?: string | undefined;
}

export async function runCreate(options: CreateOptions): Promise<void> {
  const isInteractive = Boolean(process.stdout.isTTY && !process.env["CI"]);

  if (isInteractive) {
    prompts.intro(pc.magenta(pc.bold("◇ Welcome to Rimelight!")));

    // 1. Prompt for project name/directory
    let targetDir: string = options.projectName || "";
    if (!targetDir) {
      const response = await prompts.text({
        message: "Where should we create your new project?",
        placeholder: "./my-rimelight-app",
        validate: (value) => {
          if (!value.trim()) return "Please enter a directory path";
          if (existsSync(path.resolve(value)) && readdirSync(path.resolve(value)).length > 0) {
            return "Directory is not empty";
          }
          return undefined;
        },
      });

      if (prompts.isCancel(response)) {
        prompts.cancel("Scaffolding cancelled.");
        process.exit(0);
      }
      targetDir = response as string;
    }

    const resolvedTargetDir = path.resolve(targetDir);
    const displayProjectName = path.basename(resolvedTargetDir);

    // Prompt for website domain (optionally)
    let domain: string | undefined = options.domain;
    if (domain === undefined) {
      const response = await prompts.text({
        message: "What is the website domain for this project? (Optional)",
        placeholder: "e.g. example.com",
        validate: (value) => {
          if (!value || !value.trim()) return undefined;
          // Simple domain check
          if (!/^[a-z0-9][a-z0-9-]{0,61}[a-z0-9](?:\.[a-z]{2,})+$/i.test(value.trim())) {
            return "Please enter a valid domain name (e.g. example.com)";
          }
          return undefined;
        },
      });

      if (prompts.isCancel(response)) {
        prompts.cancel("Scaffolding cancelled.");
        process.exit(0);
      }
      domain = response ? (response as string).trim() : "";
    }

    // Check if directory exists and is not empty
    if (existsSync(resolvedTargetDir)) {
      const files = await fs.readdir(resolvedTargetDir);
      if (files.length > 0) {
        const overwrite = await prompts.select({
          message: `Target directory "${targetDir}" is not empty. Overwrite?`,
          options: [
            { value: "cancel", label: "No, cancel scaffolding" },
            { value: "overwrite", label: "Yes, delete existing files and continue" },
          ],
        });

        if (prompts.isCancel(overwrite) || overwrite === "cancel") {
          prompts.cancel("Scaffolding cancelled.");
          process.exit(0);
        }

        const spinner = prompts.spinner();
        spinner.start("Clearing target directory");
        await Promise.all(
          files.map((file) =>
            fs.rm(path.join(resolvedTargetDir, file), { recursive: true, force: true }),
          ),
        );
        spinner.stop("Target directory cleared");
      }
    }

    // 2. Prompt for package manager
    let packageManager: string = options.packageManager || "";
    if (!packageManager) {
      const response = await prompts.select({
        message: "Which package manager do you want to use?",
        options: [
          { value: "pnpm", label: "pnpm (Recommended)", hint: "Fast, disk space efficient" },
          { value: "npm", label: "npm", hint: "Default package manager" },
          { value: "yarn", label: "yarn", hint: "Classic package manager" },
          { value: "bun", label: "bun", hint: "Ultra-fast runner & installer" },
        ],
        initialValue: "pnpm",
      });

      if (prompts.isCancel(response)) {
        prompts.cancel("Scaffolding cancelled.");
        process.exit(0);
      }
      packageManager = response as string;
    }

    // 3. Prompt for Git initialization
    let initGit: boolean | symbol | undefined = options.git;
    if (initGit === undefined) {
      const response = await prompts.confirm({
        message: "Initialize a new Git repository?",
        initialValue: true,
      });

      if (prompts.isCancel(response)) {
        prompts.cancel("Scaffolding cancelled.");
        process.exit(0);
      }
      initGit = response;
    }

    // 4. Prompt for dependency installation
    let installDeps: boolean | symbol | undefined = options.install;
    if (installDeps === undefined) {
      const response = await prompts.confirm({
        message: `Install dependencies automatically using ${packageManager}?`,
        initialValue: true,
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

      // Update cloudflare.config.ts and vite.config.ts with custom domain
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
      const gitInit = runCommand("git", ["init"], { cwd: resolvedTargetDir });
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

      const install = runCommand(packageManager, ["install"], {
        cwd: resolvedTargetDir,
        stdio: "ignore",
      });

      if (install.status === 0) {
        installSpinner.stop(pc.green("✔ Dependencies successfully installed!"));
      } else {
        installSpinner.stop(
          pc.red(
            `✖ Dependency installation failed. Please run "${packageManager} install" manually.`,
          ),
        );
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
        await Promise.all(
          files.map((file) =>
            fs.rm(path.join(resolvedTargetDir, file), { recursive: true, force: true }),
          ),
        );
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

    // Update cloudflare.config.ts and vite.config.ts with custom domain
    await updateDomainConfigs(resolvedTargetDir, domain, displayProjectName);

    console.log(pc.green("✔ Scaffolding complete!"));

    if (initGit) {
      console.log("Initializing Git repository...");
      const gitInit = runCommand("git", ["init"], { cwd: resolvedTargetDir });
      if (gitInit.status === 0) {
        console.log(pc.green("✔ Git repository initialized!"));
      } else {
        console.log(pc.yellow("⚠ Git initialization failed."));
      }
    }

    if (installDeps) {
      console.log(`Installing dependencies using ${packageManager}...`);
      const install = runCommand(packageManager, ["install"], {
        cwd: resolvedTargetDir,
        stdio: "ignore",
      });
      if (install.status === 0) {
        console.log(pc.green("✔ Dependencies successfully installed!"));
      } else {
        console.log(
          pc.red(`✖ Dependency installation failed. Run "${packageManager} install" manually.`),
        );
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
export function getNested(obj: any, propPath: string): any {
  const parts = propPath.split(".");
  let current = obj;
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  return current;
}

// Helper to set nested properties in an object
export function setNested(obj: any, propPath: string, value: any): void {
  const parts = propPath.split(".");
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]!;
    if (current[part] === undefined || current[part] === null) {
      current[part] = {};
    }
    current = current[part];
  }
  current[parts[parts.length - 1]!] = value;
}

// Generic index finder for arrays containing primitives or objects
export function findArrayItemIndex(arr: any[], item: any): number {
  const itemStr = JSON.stringify(item);
  return arr.findIndex((x) => JSON.stringify(x) === itemStr);
}

// Inject an item at the exact index matched semantically against the starter array order
export function injectIntoArray<T>(targetArr: T[], starterArr: T[], value: T): T[] {
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

const cleanLine = (l: string) => l.trim().replace(/\s+/g, "");

// Inject a missing line cleanly at its semantic index inside targetLines based on starterLines order
export function injectIntoLines(
  targetLines: string[],
  starterLines: string[],
  value: string,
): string[] {
  const valueClean = cleanLine(value);

  const sIdx = starterLines.findIndex((x) => cleanLine(x) === valueClean);
  if (sIdx === -1) {
    targetLines.push(value);
    return targetLines;
  }

  let inserted = false;
  // Look for preceding neighbor in starterLines that exists in targetLines
  for (let i = sIdx - 1; i >= 0; i--) {
    const precedingVal = starterLines[i];
    const precedingValClean = cleanLine(precedingVal!);
    if (!precedingValClean) continue;
    const tIdx = targetLines.findIndex((x) => cleanLine(x) === precedingValClean);
    if (tIdx !== -1) {
      targetLines.splice(tIdx + 1, 0, value);
      inserted = true;
      break;
    }
  }

  if (!inserted) {
    // Look for succeeding neighbor in starterLines that exists in targetLines
    for (let i = sIdx + 1; i < starterLines.length; i++) {
      const succeedingVal = starterLines[i];
      const succeedingValClean = cleanLine(succeedingVal!);
      if (!succeedingValClean) continue;
      const tIdx = targetLines.findIndex((x) => cleanLine(x) === succeedingValClean);
      if (tIdx !== -1) {
        targetLines.splice(tIdx, 0, value);
        inserted = true;
        break;
      }
    }
  }

  if (!inserted) {
    targetLines.push(value);
  }

  return targetLines;
}

// Reorder target object keys to cleanly match starter template order, preserving custom keys
export function reorderKeys(
  targetObj: Record<string, any>,
  starterObj: Record<string, any>,
): Record<string, any> {
  const ordered: Record<string, any> = {};
  for (const key of Object.keys(starterObj)) {
    if (targetObj[key] !== undefined) {
      if (
        typeof starterObj[key] === "object" &&
        starterObj[key] !== null &&
        typeof targetObj[key] === "object" &&
        targetObj[key] !== null &&
        !Array.isArray(starterObj[key])
      ) {
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

// Resolve domains in injected lines specifically for cloudflare.config.ts
export function resolveDomainInLine(line: string, targetContent: string): string {
  // targetContent is the target project's package.json, which carries the site
  // as `homepage`.
  const siteMatch = targetContent.match(/"homepage":\s*["']https?:\/\/([^"']+)["']/);
  const targetDomain = siteMatch ? siteMatch[1] : "";
  if (targetDomain) {
    return line
      .replace(/starter\.rimelight\.com/g, targetDomain)
      .replace(/starter-dot-rimelight-dot-com/g, targetDomain.replace(/\./g, "-dot-"));
  }
  return line;
}

export interface ConfigDiff {
  type: string;
  path: string;
  value?: any;
  currentValue?: any;
  message: string;
}

// Helper to structurally diff JSON/JSONC
export function getStructuredJsonDiffs(
  starterContent: string,
  targetContent: string,
): ConfigDiff[] {
  const starterObj = parseJsonc(starterContent);
  const targetObj = parseJsonc(targetContent);

  const diffs: ConfigDiff[] = [];

  const diffKeys = (sObj: any, tObj: any, prefix = ""): void => {
    // Check if key insertion order differs for semantic standardizing
    const sKeys = Object.keys(sObj);
    const tKeys = Object.keys(tObj).filter((k) => sKeys.includes(k));
    const keyOrderDiffers = sKeys.some((k, idx) => tKeys[idx] !== k);
    if (keyOrderDiffers && sKeys.length > 0) {
      diffs.push({
        type: "out_of_order_keys",
        path: prefix || ".",
        message: `[Out of Order] keys in "${prefix || "root"}" differ from starter order`,
      });
    }

    for (const [key, val] of Object.entries(sObj)) {
      const nestedPath = prefix ? `${prefix}.${key}` : key;

      if (tObj[key] === undefined) {
        diffs.push({
          type: "missing",
          path: nestedPath,
          value: val,
          message: `missing key "${nestedPath}"`,
        });
      } else if (Array.isArray(val) && Array.isArray(tObj[key])) {
        // Element-level list checking
        let arrayMissing = false;
        for (const item of val) {
          const itemString = JSON.stringify(item);
          const found = tObj[key].some((tItem) => JSON.stringify(tItem) === itemString);
          if (!found) {
            arrayMissing = true;
            diffs.push({
              type: "array_missing",
              path: nestedPath,
              value: item,
              message: `missing array entry ${itemString} in "${nestedPath}"`,
            });
          }
        }

        // Element ordering checking
        if (!arrayMissing && val.length > 0) {
          const tFiltered = tObj[key].filter((tItem) =>
            val.some((sItem) => JSON.stringify(sItem) === JSON.stringify(tItem)),
          );
          const orderDiffers = val.some(
            (sItem, idx) => JSON.stringify(sItem) !== JSON.stringify(tFiltered[idx]),
          );
          if (orderDiffers) {
            const reordered = [];
            for (const sItem of val) {
              reordered.push(sItem);
            }
            for (const tItem of tObj[key]) {
              if (!val.some((sItem) => JSON.stringify(sItem) === JSON.stringify(tItem))) {
                reordered.push(tItem);
              }
            }
            diffs.push({
              type: "out_of_order_array",
              path: nestedPath,
              value: reordered,
              message: `[Out of Order] array elements in "${nestedPath}" differ from starter order`,
            });
          }
        }
      } else if (
        typeof val === "object" &&
        val !== null &&
        typeof tObj[key] === "object" &&
        tObj[key] !== null
      ) {
        diffKeys(val, tObj[key], nestedPath);
      } else if (JSON.stringify(tObj[key]) !== JSON.stringify(val)) {
        diffs.push({
          type: "differing",
          path: nestedPath,
          value: val,
          currentValue: tObj[key],
          message: `differing key "${nestedPath}":\n      ├─ Current:   ${JSON.stringify(tObj[key])}\n      └─ Reference: ${JSON.stringify(val)}`,
        });
      }
    }
  };

  diffKeys(starterObj, targetObj);
  return diffs;
}

const cleanLines = (c: string): string[] =>
  c
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

export interface LineDiff {
  type: string;
  line: string;
  message: string;
}

// Helper to diff files line-by-line
export function getStructuredLineDiffs(
  starterContent: string,
  targetContent: string,
  file: string,
): LineDiff[] {
  let normalizedTarget = targetContent;
  let normalizedStarter = starterContent;

  if (file === "cloudflare.config.ts") {
    // Normalize both reference and target domains to example.com to avoid staged mismatch loops
    normalizedStarter = normalizedStarter
      .replace(/starter\.rimelight\.com/g, "example.com")
      .replace(/starter-dot-rimelight-dot-com/g, "example-dot-com");

    // The domain now lives in `worker.domains`, so read it from there.
    const domainsMatch = targetContent.match(/domains:\s*\[([^\]]*)\]/);
    const domain = domainsMatch?.[1]?.match(/["']([^"']+)["']/)?.[1];
    if (domain) {
      normalizedTarget = normalizedTarget
        .split(domain)
        .join("example.com")
        .replace(/starter-dot-rimelight-dot-com/g, "example-dot-com");
    }
  }

  const starterLines = cleanLines(normalizedStarter);
  const targetLines = cleanLines(normalizedTarget);

  const diffs: LineDiff[] = [];
  for (const line of starterLines) {
    if (/^[{}[\],()]+$/.test(line)) continue; // ignore structural syntax-only lines
    const normalizedLine = line.replace(/\s+/g, "");
    const found = targetLines.some((tl) => tl.replace(/\s+/g, "") === normalizedLine);
    if (!found) {
      diffs.push({
        type: "missing_line",
        line,
        message: `missing config entry: "${line}"`,
      });
    }
  }
  return diffs;
}

// Helper to dynamically calculate line-level differences between config files
export function getDiffLines(
  starterContent: string,
  targetContent: string,
  file: string,
): string[] {
  // Parse JSONC config structurally (tsconfig, knip, lunaria, etc.)
  if (file.endsWith(".json") || file.endsWith(".jsonc")) {
    try {
      const diffs = getStructuredJsonDiffs(starterContent, targetContent);
      return diffs.map((d) => d.message);
    } catch {
      // Fallback to line diff if JSON parse fails
    }
  }

  const diffs = getStructuredLineDiffs(starterContent, targetContent, file);
  return diffs.map((d) => d.message);
}

interface CompareFileData {
  file: string;
  exists: boolean;
  starterContent?: string | undefined;
  targetContent?: string | undefined;
  error?: unknown;
}

export async function runCompare(options: { targetDir: string }): Promise<void> {
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
    "cloudflare.config.ts",
    "drizzle.config.ts",
    "tsconfig.json",
    "vite.config.ts",
    ".dev.vars.example",
    "pnpm-workspace.yaml",
  ];

  let totalDiffs = 0;

  const filesData = await Promise.all(
    files.map(async (file): Promise<CompareFileData> => {
      const starterFilePath = path.join(starterPath, file);
      const targetFilePath = path.join(targetDir, file);

      if (!existsSync(targetFilePath)) {
        return { file, exists: false };
      }

      try {
        const [starterContent, targetContent] = await Promise.all([
          fs.readFile(starterFilePath, "utf-8"),
          fs.readFile(targetFilePath, "utf-8"),
        ]);
        return { file, exists: true, starterContent, targetContent };
      } catch (err) {
        return { file, exists: true, error: err };
      }
    }),
  );

  for (const data of filesData) {
    const { file, exists, error } = data;

    if (!exists) {
      console.log(`${pc.red("✖")} ${pc.bold(file)}: ${pc.red("MISSING")}`);
      totalDiffs++;
      continue;
    }

    if (error) {
      console.log(
        `${pc.red("✖")} ${pc.bold(file)}: ${pc.red("ERROR")} (${(error as Error).message})`,
      );
      totalDiffs++;
      continue;
    }

    const starterContent = data.starterContent!;
    const targetContent = data.targetContent!;

    if (file === "package.json") {
      try {
        const starterPkg = JSON.parse(starterContent);
        const targetPkg = JSON.parse(targetContent);

        const pkgDiffs: string[] = [];

        // Engines Node
        if (starterPkg.engines?.node !== targetPkg.engines?.node) {
          pkgDiffs.push(
            `engines.node:\n    ├─ Current:   "${targetPkg.engines?.node || ""}"\n    └─ Reference: "${starterPkg.engines?.node || ""}"`,
          );
        }

        // Package Manager
        if (starterPkg.packageManager !== targetPkg.packageManager) {
          pkgDiffs.push(
            `packageManager:\n    ├─ Current:   "${targetPkg.packageManager || ""}"\n    └─ Reference: "${starterPkg.packageManager || ""}"`,
          );
        }

        // Scripts
        for (const [key, val] of Object.entries(starterPkg.scripts || {}) as Array<[string, any]>) {
          if (!targetPkg.scripts?.[key]) {
            pkgDiffs.push(`missing script "${key}":\n    └─ Reference: "${val}"`);
          } else if (targetPkg.scripts[key] !== val) {
            pkgDiffs.push(
              `differing script "${key}":\n    ├─ Current:   "${targetPkg.scripts[key]}"\n    └─ Reference: "${val}"`,
            );
          }
        }

        // Dependencies (matching only)
        for (const [key, val] of Object.entries(starterPkg.dependencies || {}) as Array<
          [string, any]
        >) {
          if (!targetPkg.dependencies?.[key]) {
            pkgDiffs.push(`missing dependency "${key}":\n    └─ Reference: "${val}"`);
          } else if (targetPkg.dependencies[key] !== val) {
            pkgDiffs.push(
              `differing dependency "${key}":\n    ├─ Current:   "${targetPkg.dependencies[key]}"\n    └─ Reference: "${val}"`,
            );
          }
        }

        // devDependencies (matching only)
        for (const [key, val] of Object.entries(starterPkg.devDependencies || {}) as Array<
          [string, any]
        >) {
          if (!targetPkg.devDependencies?.[key]) {
            pkgDiffs.push(`missing devDependency "${key}":\n    └─ Reference: "${val}"`);
          } else if (targetPkg.devDependencies[key] !== val) {
            pkgDiffs.push(
              `differing devDependency "${key}":\n    ├─ Current:   "${targetPkg.devDependencies[key]}"\n    └─ Reference: "${val}"`,
            );
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
      } catch (err) {
        console.log(
          `${pc.red("✖")} ${pc.bold(file)}: ${pc.red("INVALID JSON")} (${(err as Error).message})`,
        );
        totalDiffs++;
      }
    } else {
      const diffs = getDiffLines(starterContent, targetContent, file);

      if (diffs.length > 0) {
        console.log(`${pc.yellow("⚠")} ${pc.bold(file)}: ${pc.yellow("DIFFERING")}`);
        for (const diff of diffs) {
          console.log(`  └─ ${pc.dim(diff)}`);
        }
        totalDiffs += diffs.length;
      } else {
        console.log(`${pc.green("✔")} ${pc.bold(file)}: ${pc.green("UP TO DATE")}`);
      }
    }
  }

  console.log("\n" + pc.magenta(pc.bold("◇ Comparison Complete")));
  if (totalDiffs > 0) {
    console.log(
      pc.yellow(
        `Found ${totalDiffs} differences. Run "rimelight update [path]" to standardize them.`,
      ),
    );
  } else {
    console.log(pc.green("✔ All configuration files are up to date with the starter template!"));
  }
}

export async function runUpdate(options: { targetDir: string }): Promise<void> {
  const targetDir = path.resolve(options.targetDir);
  const displayProjectName = path.basename(targetDir);

  const isInteractive = Boolean(process.stdout.isTTY && !process.env["CI"]);

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
    "cloudflare.config.ts",
    "drizzle.config.ts",
    ".dev.vars.example",
  ];

  const pendingWrites: Array<{ filePath: string; content: string; actionDescription: string }> = []; // Accumulate in-memory changes: { filePath, content, actionDescription }

  try {
    // Pre-read config files
    const starterExists = files.map((file) => existsSync(path.join(starterPath, file)));
    const targetExists = files.map((file) => existsSync(path.join(targetDir, file)));

    const preReadStarter = await Promise.all(
      files.map((file, i) =>
        starterExists[i] ? fs.readFile(path.join(starterPath, file), "utf-8") : Promise.resolve(""),
      ),
    );
    const preReadTarget = await Promise.all(
      files.map((file, i) =>
        starterExists[i] && targetExists[i]
          ? fs.readFile(path.join(targetDir, file), "utf-8")
          : Promise.resolve(""),
      ),
    );

    // Pre-read package.json files
    const targetPkgPath = path.join(targetDir, "package.json");
    const starterPkgPath = path.join(starterPath, "package.json");
    const targetPkgExists = existsSync(targetPkgPath);

    const [starterPkgContent, targetPkgContent] = await Promise.all([
      fs.readFile(starterPkgPath, "utf-8").catch(() => "{}"),
      targetPkgExists ? fs.readFile(targetPkgPath, "utf-8") : Promise.resolve("{}"),
    ]);

    const starterPkg = JSON.parse(starterPkgContent);
    const targetPkg = JSON.parse(targetPkgContent);

    // Helper functions to update diffs recursively instead of using loop with await
    const handleJsonDiff = async (
      currentTargetContent: string,
      starterContent: string,
      file: string,
    ): Promise<string> => {
      let diffs: ConfigDiff[] = [];
      try {
        diffs = getStructuredJsonDiffs(starterContent, currentTargetContent);
      } catch {
        // Fallback to line diff
      }

      if (diffs.length === 0) return currentTargetContent;

      console.log(`${pc.yellow("⚠")} ${pc.bold(file)}: ${pc.yellow("DIFFERING")}`);
      for (const diff of diffs) {
        console.log(`  └─ ${pc.dim(diff.message)}`);
      }

      let selectedDiffMessages: string[] = [];
      if (isInteractive) {
        const selection = await prompts.multiselect({
          message: `Select keys to update in ${file} (Select none to finish):`,
          options: diffs.map((diff) => ({
            value: diff.message,
            label: diff.message,
          })),
          required: false,
        });

        if (prompts.isCancel(selection)) {
          prompts.cancel("Update cancelled.");
          process.exit(0);
        }
        selectedDiffMessages = selection as string[];
      } else {
        // Apply all in non-interactive mode
        selectedDiffMessages = diffs.map((d) => d.message);
      }

      if (selectedDiffMessages.length === 0) {
        return currentTargetContent;
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

      const nextContent = JSON.stringify(targetObj, null, 2);
      console.log(
        pc.green(`✔ Staged ${selectedDiffMessages.length} updates for "${file}" in memory.\n`),
      );

      if (!isInteractive) return nextContent;
      return handleJsonDiff(nextContent, starterContent, file);
    };

    const handleLineDiff = async (
      currentTargetContent: string,
      starterContent: string,
      file: string,
    ): Promise<string> => {
      const diffs = getStructuredLineDiffs(starterContent, currentTargetContent, file);
      if (diffs.length === 0) return currentTargetContent;

      console.log(`${pc.yellow("⚠")} ${pc.bold(file)}: ${pc.yellow("DIFFERING")}`);
      for (const diff of diffs) {
        console.log(`  └─ ${pc.dim(diff.message)}`);
      }

      let selectedLines: string[] = [];
      if (isInteractive) {
        const selection = await prompts.multiselect({
          message: `Select entries to add to ${file} (Select none to finish):`,
          options: diffs.map((diff) => ({
            value: diff.line,
            label: diff.line,
          })),
          required: false,
        });

        if (prompts.isCancel(selection)) {
          prompts.cancel("Update cancelled.");
          process.exit(0);
        }
        selectedLines = selection as string[];
      } else {
        selectedLines = diffs.map((d) => d.line);
      }

      if (selectedLines.length === 0) {
        return currentTargetContent;
      }

      const starterLines = starterContent.split("\n");
      let targetLines = currentTargetContent.split("\n");

      for (const diff of diffs) {
        if (selectedLines.includes(diff.line)) {
          let resolvedLine = diff.line;
          if (file === "cloudflare.config.ts") {
            resolvedLine = resolveDomainInLine(diff.line, targetPkgContent);
          }
          targetLines = injectIntoLines(targetLines, starterLines, resolvedLine);
        }
      }

      const nextContent = targetLines.join("\n");
      console.log(pc.green(`✔ Staged ${selectedLines.length} entries for "${file}" in memory.\n`));

      if (!isInteractive) return nextContent;
      return handleLineDiff(nextContent, starterContent, file);
    };

    // 1. Process standard configuration files recursively to avoid loops with await
    const processFiles = async (index: number): Promise<void> => {
      if (index >= files.length) return;
      const file = files[index] as string;
      const targetFilePath = path.join(targetDir, file);

      if (starterExists[index]) {
        if (!targetExists[index]) {
          // File is missing entirely
          console.log(`${pc.red("✖")} ${pc.bold(file)}: ${pc.red("MISSING")}`);
          let shouldCreate: boolean | symbol = true;
          if (isInteractive) {
            shouldCreate = await prompts.confirm({
              message: `Create missing file "${file}" from starter template?`,
              initialValue: true,
            });
            if (prompts.isCancel(shouldCreate)) {
              prompts.cancel("Update cancelled.");
              process.exit(0);
            }
          }
          if (shouldCreate) {
            pendingWrites.push({
              filePath: targetFilePath,
              content: preReadStarter[index]!,
              actionDescription: `Create missing file "${file}"`,
            });
            console.log(pc.green(`✔ Scheduled creation of "${file}".`));
          } else {
            console.log(pc.yellow(`ℹ Skipped file "${file}".`));
          }
          await processFiles(index + 1);
          return;
        }

        const starterContent = preReadStarter[index]!;
        const targetContent = preReadTarget[index]!;

        // Parse/Diff dynamically based on file type
        if (file.endsWith(".json") || file.endsWith(".jsonc")) {
          const finalContent = await handleJsonDiff(targetContent, starterContent, file);
          if (finalContent !== targetContent) {
            pendingWrites.push({
              filePath: targetFilePath,
              content: finalContent,
              actionDescription: `Standardize JSON structures in "${file}"`,
            });
            console.log(pc.green(`✔ Scheduled batch updates for "${file}".`));
          }
        } else if (
          file === ".gitignore" ||
          file === ".env.example" ||
          file === "pnpm-workspace.yaml" ||
          file === ".node-version" ||
          file === "cloudflare.config.ts" ||
          file === "vite.config.ts"
        ) {
          const finalContent = await handleLineDiff(targetContent, starterContent, file);
          if (finalContent !== targetContent) {
            pendingWrites.push({
              filePath: targetFilePath,
              content: finalContent,
              actionDescription: `Standardize entry list in "${file}"`,
            });
            console.log(pc.green(`✔ Scheduled batch updates for "${file}".`));
          }
        }
      }
      await processFiles(index + 1);
    };

    await processFiles(0);

    // 2. Standardize package.json preserving custom dependencies
    if (targetPkgExists) {
      const pkgOptions: Array<{ value: any; label: string }> = [];

      // Engines Node
      if (starterPkg.engines?.node !== targetPkg.engines?.node) {
        pkgOptions.push({
          value: { type: "engines", key: "node", value: starterPkg.engines.node },
          label: `Update engines.node: "${starterPkg.engines.node}" (Current: "${targetPkg.engines?.node || ""}")`,
        });
      }

      // Package Manager
      if (starterPkg.packageManager !== targetPkg.packageManager) {
        pkgOptions.push({
          value: { type: "packageManager", value: starterPkg.packageManager },
          label: `Update packageManager: "${starterPkg.packageManager}" (Current: "${targetPkg.packageManager || ""}")`,
        });
      }

      // Scripts
      targetPkg.scripts = targetPkg.scripts || {};
      for (const [key, val] of Object.entries(starterPkg.scripts || {}) as Array<[string, any]>) {
        if (targetPkg.scripts[key] !== val) {
          const isMissing = !targetPkg.scripts[key];
          pkgOptions.push({
            value: { type: "scripts", key, value: val },
            label: isMissing
              ? `Add script "${key}": "${val}"`
              : `Update script "${key}": "${val}" (Current: "${targetPkg.scripts[key]}")`,
          });
        }
      }

      // Dependencies
      targetPkg.dependencies = targetPkg.dependencies || {};
      for (const [key, val] of Object.entries(starterPkg.dependencies || {}) as Array<
        [string, any]
      >) {
        if (targetPkg.dependencies[key] !== val) {
          const isMissing = !targetPkg.dependencies[key];
          pkgOptions.push({
            value: { type: "dependencies", key, value: val },
            label: isMissing
              ? `Add dependency "${key}": "${val}"`
              : `Update dependency "${key}": "${val}" (Current: "${targetPkg.dependencies[key]}")`,
          });
        }
      }

      // devDependencies
      targetPkg.devDependencies = targetPkg.devDependencies || {};
      for (const [key, val] of Object.entries(starterPkg.devDependencies || {}) as Array<
        [string, any]
      >) {
        if (targetPkg.devDependencies[key] !== val) {
          const isMissing = !targetPkg.devDependencies[key];
          pkgOptions.push({
            value: { type: "devDependencies", key, value: val },
            label: isMissing
              ? `Add devDependency "${key}": "${val}"`
              : `Update devDependency "${key}": "${val}" (Current: "${targetPkg.devDependencies[key]}")`,
          });
        }
      }

      if (pkgOptions.length > 0) {
        console.log(`${pc.yellow("⚠")} ${pc.bold("package.json")}: ${pc.yellow("DIFFERING")}`);

        let selectedOpts = pkgOptions.map((o) => o.value) as any[];
        if (isInteractive) {
          const selection = await prompts.multiselect({
            message: "Select updates to apply to package.json:",
            options: pkgOptions,
            required: false,
          });

          if (prompts.isCancel(selection)) {
            prompts.cancel("Update cancelled.");
            process.exit(0);
          }
          selectedOpts = selection as any[];
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
            const orderedScripts: Record<string, any> = {};
            const allScriptKeys = new Set([
              ...Object.keys(starterPkg.scripts || {}),
              ...Object.keys(targetPkg.scripts || {}),
            ]);
            const standardOrder = [
              "prepare",
              "generate-types",
              "generate-types",
              "dev",
              "prebuild",
              "build",
              "preview",
              "db:generate",
              "db:migrate",
              "db:migrate:remote",
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
              actionDescription: `Standardize ${selectedOpts.length} entries in "package.json"`,
            });
            console.log(pc.green('✔ Scheduled updates for "package.json".'));
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

      let confirmApply: boolean | symbol = true;
      if (isInteractive) {
        confirmApply = await prompts.confirm({
          message: `Apply all ${pendingWrites.length} scheduled changes to disk? (Files will not be modified if cancelled)`,
          initialValue: true,
        });

        if (prompts.isCancel(confirmApply) || !confirmApply) {
          prompts.cancel("Update cancelled. No files were modified.");
          process.exit(0);
        }
      }

      if (confirmApply) {
        const writeSpinner = prompts.spinner();
        writeSpinner.start("Writing changes to configuration files...");
        await Promise.all(
          pendingWrites.map((item) => fs.writeFile(item.filePath, item.content, "utf-8")),
        );
        writeSpinner.stop(pc.green(`✔ Successfully wrote ${pendingWrites.length} files to disk!`));
      }
    } else {
      console.log(pc.green("✔ No changes were selected. All files remain unchanged."));
    }

    prompts.outro(pc.green("✔ Standardization process complete!"));

    let runInstall: boolean | symbol = true;
    if (isInteractive) {
      runInstall = await prompts.confirm({
        message: "Run 'vp install' now?",
        initialValue: true,
      });
      if (prompts.isCancel(runInstall)) {
        process.exit(0);
      }
    }

    if (runInstall) {
      const runVpInstall = prompts.spinner();
      runVpInstall.start("Running vp install...");
      const vpInstall = runCommand("vp", ["install"], { cwd: targetDir, stdio: "ignore" });
      if (vpInstall.status === 0) {
        runVpInstall.stop(pc.green("✔ vp install completed successfully!"));
      } else {
        runVpInstall.stop(
          pc.yellow("⚠ vp install failed. Please run it manually in the directory."),
        );
      }
    }
  } catch (error) {
    prompts.cancel(pc.red(`✖ Update failed: ${(error as Error).message}`));
    console.error(error);
    process.exit(1);
  }
}
