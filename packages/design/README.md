# @rimelight/design

Design tokens for the Rimelight apps. `tokens.json` is the single source of truth (format and rules in
[SCHEMA.md](SCHEMA.md)). Everything under `generated/` and `crate/ui/tokens.slint` and `crate/src/generated.rs` is
produced from it.

## Regenerate

```sh
pnpm --filter @rimelight/design generate   # node generate.ts
pnpm --filter @rimelight/design check      # node generate.ts --check (CI)
```

The generator has no dependencies and runs on Node with type stripping. `--check` exits 1 when an output is stale or a
contrast check fails. Contrast results are written to `generated/contrast.md`.

## Outputs

| Path                     | Consumer                                                                            |
| ------------------------ | ----------------------------------------------------------------------------------- |
| `generated/tokens.css`   | Web (`@rimelight/ui`): CSS variables with `light-dark()`, `[data-theme]` switch     |
| `generated/tokens.json`  | Web preset: every token resolved to a value                                         |
| `generated/contrast.md`  | Human review of every checked colour pair                                           |
| `crate/ui/tokens.slint`  | Slint apps: `Tokens` global (zoom, text scale, names as in Space) and `ThemeChoice` |
| `crate/src/generated.rs` | Rust: `tokens` constants and the `ROLES` table                                      |

`space-rename-map.json` is not generated. It lists the Rimelight Space property names that still differ from the Slint
names here (the control and icon scales). `node generate.ts --check` does not read it.

## Consumers

- `crate/` (`rimelight_design`): Rust crate, no dependencies, `unsafe` forbidden. Standalone; not a member of any
  Cargo workspace.
- `@rimelight/ui`: reads `generated/tokens.css` and `generated/tokens.json`.

Do not edit the generated files. Change `tokens.json` and regenerate.
