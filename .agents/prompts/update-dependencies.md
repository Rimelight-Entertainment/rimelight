# Update Dependencies

This prompt is used to update dependencies in a project.

## Parameters:

- Packages to update:
  - []
- Dependencies to remove:
  - []
- Dependencies to keep at the current version:
  - []

## Instructions

- Adhere strictly to the commands provided. If `vp` was instructed, use `vp`. If `pnpm` was instructed, use `pnpm`.
- Verify the current directory to ensure the correct packages are updated, not assuming the root to be a monorepository. Run the commands inside all sub-packages in any monorepositories requested – do not rely on the root.
- Verify `pnpm-workspace.yaml` for configurations like catalogs, overrides, peer dependency rules, build allowlist, `saveExact` and `minimumReleaseAge` before changing a version.
- Keep `workspace:*` references for internal packages and do not replace them with registry versions. Be aware some package-related changes might require updating registry versions to resolve fully.
- Do not remove or weaken `pnpm-workspace.yaml` safeguards such as `strictSsl`, `minimumReleaseAge`, `overrides`, `peerDependencyRules`, or `allowBuilds` to make an update pass.
- If a version is listed at vulnerable but within the minimumReleaseAge, add it as an allowed override under the `# Vulnerability Fixes` comment.
- If a newer version of a package inside the `# Vulnerability Fixes` comment is available, remove it from the override list and install the newest version.
- Do not run any git commands during the update process.
- Report back any encountered issues instead of attempting to bypass or fix them.
- IMPORTANT: Use `;` and not `&&` to chain commands, as you are executed in a PowerShell context.
- Do not touch any not specified packages in this directory.

## Workflow

1. Run `vp upgrade` to update Vite-Plus.
2. Run `pnpm self-update` to update pnpm.
3. Update `packageManager` or `devEngines` in `package.json` to the latest installed version. Ensure you update all sub-packages in monorespository cases.
4. Clear the vulnerability overrides in `pnpm-workspace.yaml`, then run `vp outdated` to identify outdated dependencies.
5. Update all dependencies to the latest listed version, updating `package.json`, `pnpm-workspace.yaml`, and other files like actions or other reported usages, using the version settings from `pnpm-workspace.yaml`.
6. Run `vp install` to update the lockfile and install the new versions locally.
7. Run `vp pm audit` to verify the security of the updated packages. Add overrides when possible or revert to the previous version if not.
8. Run `vp check --fix` to check for possible breaking changes.
9. Report back on the updated packages and any errors. Do not fix them automatically or commit the changes unless requested.
