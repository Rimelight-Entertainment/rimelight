# Update Dependencies

This prompt is used to update dependencies in a project.

## Parameters:

- Packages to update:
  - _
- Dependencies to remove:
  - _
- Dependencies to keep at the current version:
  - _

## Instructions

- Verify if in a monorepository to ensure the correct packages are updated.
- Verify `pnpm-workspace.yaml` for configurations like catalogs, overrides, peer dependency rules, build allowlist, `saveExact` and `minimumReleaseAge` before changing a version.
- Keep `workspace:*` references for internal packages and do not replace them with registry versions. Be aware some package-related changes might require updating registry versions to resolve fully.
- Do not remove or weaken `pnpm-workspace.yaml` safeguards such as `strictSsl`, `minimumReleaseAge`, `overrides`, `peerDependencyRules`, or `allowBuilds` to make an update pass.
- Report back any encountered issues instead of attempting to bypass or fix them.

## Workflow

1. Run `vp upgrade` to update Vite-Plus.
2. Run `pnpm self-update` to update pnpm, and update the version in `package.json`.
3. Run `vp outdated` to identify outdated dependencies.
4. Update all dependencies to the latest listed version, updating `package.json` and `pnpm-workspace.yaml`, using the version settings from `pnpm-workspace.yaml`.
5. Run `vp install` to update the lockfile and install the new versions locally.
6. Run `vp pm audit` to verify the security of the updated packages. Add overrides when possible or revert to the previous version if not.
6. Run `vp check --fix` to check for possible breaking changes.
7. Report back on the updated packages and any errors. Do not fix them automatically or commit the changes unless requested.
