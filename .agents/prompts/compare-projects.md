# Compare Projects and Audit Inconsistencies

This prompt is used to compare all projects within the active directory to identify and report inconsistencies across package versions, configuration values, dependencies, scripts, and project structures without making any modifications.

## Parameters:

- Projects to compare:
  - []
- Projects to ignore:
  - []
- Discrepancies to ignore:
  - []
- Additional Notes:
  -

## Instructions

- Generate a comprehensive diagnostic report.
- Do not make code or configuration changes unless specifically requested..
- Treat any monorepo's `apps/` and `packages/` as individual comparison targets.
- Exclude any monorepo root from direct project-to-project comparisons.
- Adhere to the PowerShell execution context (use `;` instead of `&&` when chaining shell commands).
- Avoid creating persistent scratch files in the workspace; clean up temporary inspection dumps after analysis.

## Workflow

1. **Dependency Analysis**:
   - Flag inconsistent references (local `file:` paths vs SemVer vs `workspace:*`).
   - Flag version mismatches for shared dependencies.
   - Flag missing or differing dependencies.
2. **Configuration Audit**:
   - Flag missing or inconsistent configuration files across projects.
3. **Script Audit**:
   - Flag missing or misaligned utility scripts in `package.json`.
4. **Routes, API, Pages Audit**:
   - Flag missing or misaligned routes, API endpoints, and page components across projects.
5. **Public Assets & Meta Standards**:
   - Check standard public files (`favicon.ico`, `favicon.svg`, `apple-touch-icon.png`, `site.webmanifest`, `robots.txt`, `llms.txt`). 6.**Report Output**:
   - Produce a structured Markdown report categorizing findings by severity and component area.

## Report
