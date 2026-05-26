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
    const wrangler = JSON.parse(content);
    
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
