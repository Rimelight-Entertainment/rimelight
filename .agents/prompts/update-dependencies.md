# Update Dependencies

This prompt is used to update dependencies in a project.

## Parameters:

- Packages to update:
  - []
- Dependencies to remove:
  - []
- Dependencies to keep at the current version:
  - []
- Additional Notes:
  -

## Instructions

- Adhere strictly to the commands provided. If `vp` was instructed, use `vp`. If `pnpm` was instructed, use `pnpm`.
- Verify the current directory to ensure the correct packages are updated, not assuming the root to be a monorepository. Run the commands inside all sub-packages in any monorepositories requested – do not rely on the root.
- Verify `pnpm-workspace.yaml` for configurations like catalogs, overrides, peer dependency rules, build allowlist, `saveExact` and `minimumReleaseAge` before changing a version.
- Verify `.node-version` matches the locally installed Node.js version.
- Keep `workspace:*` references for internal packages and do not replace them with registry versions. Be aware some package-related changes might require updating registry versions to resolve fully.
- Do not remove or weaken `pnpm-workspace.yaml` safeguards such as `strictSsl`, `minimumReleaseAge`, `overrides`, `peerDependencyRules`, or `allowBuilds` to make an update pass.
- If a version is listed at vulnerable but within the minimumReleaseAge, add it as an allowed override under the `# Vulnerability Fixes` comment.
- If a newer version of a package inside the `# Vulnerability Fixes` comment is available, remove it from the override list and install the newest version.
- Do not run any git commands during the update process.
- Report back any encountered issues instead of attempting to bypass or fix them.
- Run package-manager commands sequentially, one project at a time. Running them in parallel across projects hits the shared pnpm store and fails with `ERR_PNPM_PACKAGE_MANAGER_REMOVE_MODULES_DIR` / "Access is denied".
- IMPORTANT: Use `;` and not `&&` to chain commands, as you are executed in a PowerShell context.
- Do not touch any not specified packages in this directory.

## Node.js and package managers are managed by vite-plus

There is no `nvm`/`fnm`/`volta` on this machine. Node.js, npm, pnpm, Yarn, and Bun are managed by vite-plus (`vp env`) and resolved through shims in `C:\Users\idant\AppData\Local\vite-plus\bin`. Use `vp env` instead of a version manager:

- Inspect the resolved environment: `vp env current` (note the `Source`: `.node-version`, `packageManager`, `default`, or `lts`).
- List installed node versions and package managers: `vp env list`.
- Set the global default: `vp env default <version>` (e.g. `vp env default 26.8.2`).
- Install a missing version: `vp env install <version>`.
- Run diagnostics: `vp env doctor`.

Inside a project directory, the resolution is driven by `.node-version` and `packageManager`/`devEngines` in `package.json`, so update those files before relying on the new versions. No shell restart is required: the shims resolve the current default on every new process.

## Workflow

1. Check the locally installed Node.js version with `node --version` and compare it to the latest release with `npm view node version`. Update the local Node.js to the latest version via `vp env default <latest>` (install it first with `vp env install <latest>` if missing). Verify with `vp env current` and `vp env doctor`.
2. Update each project's `.node-version` to the latest version. Ensure you update all sub-packages in monorepository cases. Also update node references elsewhere, such as `node-version` and pinned action SHAs in `.github/workflows`.
3. Run `vp upgrade` to update Vite-Plus.
4. Run `pnpm self-update` to update pnpm.
5. Update `packageManager` or `devEngines` in `package.json` to the latest installed version. Ensure you update all sub-packages in monorespository cases.
6. Clear the vulnerability overrides in `pnpm-workspace.yaml`, and check whether the entries in the `auditConfig` section (e.g. `ignoreGhsas`) are still needed: remove an ignored advisory when a fixed version is available after the update, and keep it only while no patched version exists. Then run `vp outdated` to identify outdated dependencies. Use `vp outdated -r` in monorepositories so sub-packages are included. Note that `vp outdated` only compares against the `latest` dist-tag: when a dependency is tracked on a prerelease channel (e.g. `next`), compare it against the latest version on that channel (`npm view <package> dist-tags`) instead of `latest`.
7. Update all dependencies to the latest listed version, updating `package.json`, `pnpm-workspace.yaml`, and other files like actions or other reported usages, using the version settings from `pnpm-workspace.yaml`. With `saveExact` pins, use `vp update -L <package>...` so exact versions advance to latest; you may pass multiple packages in one call. Do not use `--no-save` (it conflicts with `minimumReleaseAgeStrict` and reports `ERR_PNPM_STRICT_MIN_RELEASE_AGE_REQUIRES_SAVE`). Re-run `vp outdated` to confirm everything else is current.
8. Run `vp install` to update the lockfile and install the new versions locally.
9. Run `vp pm audit` to verify the security of the updated packages. Add overrides when possible or revert to the previous version if not. If overrides were re-added, run `vp install` again so the lockfile applies them, then re-run `vp pm audit` until clean.
10. Run `vp check --fix` to check for possible breaking changes.
11. Report back on the updated packages and any errors. Do not fix them automatically or commit the changes unless requested.
