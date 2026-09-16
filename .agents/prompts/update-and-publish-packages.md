# Update Rimelight Package Versions, Publish, and Update Dependent Projects

This prompt is used to bump the version of one or more Rimelight packages, publish them to the npm registry, and then update every project in the target directory that depends on them to the newly published versions.

## Parameters:

- Packages to version bump:
  - [] (e.g. `@rimelight/ui` to `0.1.0` or `patch`/`minor`/`major`)
- Projects to update after publishing:
  - [] (defaults to all projects in the directory above the monorepo root)
- Projects to ignore:
  - []
- Package version bump commit/push (e.g. `none` | `commit` | `commit and push`):
  - [] (applies only to the version bumps in this monorepo)
- Updated project commits/pushes (e.g. `none` | `commit` | `commit and push`):
  - [] (applies only to the updated projects' changed installations, only if they passed checks cleanly)
- Additional Notes:
  -

## Instructions

- Adhere strictly to the commands provided. If `vp` was instructed, use `vp`. If `pnpm` was instructed, use `pnpm`.
- Verify the current directory first. Confirm you are in the Rimelight monorepository root before bumping any version; do not assume it.
- Respect the two git parameters separately:
  - `Package version bump commit/push` controls committing the version bumps in this monorepo. `none` means do not run any git commands here; `commit` means commit the bumps without pushing; `commit and push` means commit and push them.
  - `Updated project commits/pushes` controls committing the changed installations in the updated projects. Only commit when the project passed its checks cleanly, and `none` means leave them uncommitted.
- Use the repository's commit message format (e.g. `chore: Updates Dependencies`, or `chore: Release @rimelight/<package>@<version>` for the version bumps).
- Ask for confirmation before creating commits or pushing.
- Use `;` and not `&&` to chain commands, as you are executed in a PowerShell context.
- Run pnpm install/update commands sequentially, one package or project at a time; running them in parallel hits the shared pnpm store and fails with `ERR_PNPM_PACKAGE_MANAGER_REMOVE_MODULES_DIR` / "Access is denied". npm `publish` does not touch the pnpm store and may run in parallel.
- Keep `workspace:*` references for internal Rimelight dependencies. Only the packages listed in the parameters get version bumps.
- After bumping a version in `package.json`, run the package's build/check scripts to confirm the package is publishable.
- Do not publish anything until the user has provided an npm OTP. When a publish is about to run, request the OTP from the user and only proceed once it is supplied.
- Pass the OTP to npm via `--otp <code>` (e.g. `npm publish --otp 123456`). Publish all listed packages in parallel, using the single OTP before it expires.
- If a publish fails with an invalid/expired OTP error, do not retry with a broken code: ask the user for a new OTP and retry the publish with it.
- Do not skip a listed package if publishing it fails; report the failure and stop rather than silently continuing.
- After every listed package is published successfully, update the dependent projects: bump the dependency references for the published packages to the exact published versions, following the version settings in the target project's `pnpm-workspace.yaml`, then run the package install for each project.
- Do not touch packages that were not published in this run.

## Workflow

1. Confirm the current directory is the Rimelight monorepository root and note the currently available packages and their versions.
2. For each package listed in the parameters, bump the `version` field in its `package.json` to the requested version (resolving `patch`/`minor`/`major` against the current version). Update every sub-package that references it as a registry dependency if any do, while keeping `workspace:*` untouched.
3. Run the build and check for each bumped package (e.g. `vp check --fix` and the package's build script) to confirm it builds cleanly at the new version.
4. Before starting to publish, ask the user for the npm OTP. Announce each package before publishing it.
5. Publish the listed packages in parallel with `npm publish --otp <code>` from each package directory, using the single OTP before it expires.
6. After all packages are published, list the projects in the target directory (`C:\Users\idant\WebstormProjects` by default) and identify which ones depend on the published packages.
7. In each dependent project, update the dependency/peerDependency/devDependency references for the published packages to the exact newly published versions, respecting the project's `pnpm-workspace.yaml` settings (`saveExact`, catalogs, overrides), then run the project's install to update its lockfile and local installation.
8. Re-run the checks for each updated project (e.g. `vp check --fix`) and verify no unresolved version references remain.
9. Apply `Package version bump commit/push` to commit and optionally push the version bumps in this monorepo.
10. For each updated project that passed its checks cleanly, apply `Updated project commits/pushes` to commit and optionally push its changed installation. Do not commit or push any project that failed its checks.
11. Report back, listing: the packages published with their previous and new versions, the projects updated, the projects skipped or ignored, the git actions performed, and any errors encountered. Do not fix errors automatically.
