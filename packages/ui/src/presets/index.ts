import {
  presetTypography,
  presetWind4,
  presetIcons,
  transformerDirectives,
  transformerVariantGroup,
  type Preset
} from "unocss"
import { colorScales, getAllColorNames, COLOR_SHADES, type UIConfig } from "../config"

type ColorEntry = NonNullable<UIConfig["colors"]>[string]
type Shades = Record<string, string>

const isMode = (v: ColorEntry): v is { light?: Shades; dark?: Shades } =>
  typeof v === "object" && v !== null && ("light" in v || "dark" in v)

function generateShade(shade: string, value: string, target: "white" | "black"): string {
  const num = Number(shade)
  if (!num || num === 500) return value
  const pct = Math.round(
    Math.max(0, target === "white" ? (500 - num) / 500 : (num - 500) / 450) * 75
  )
  return pct ? `color-mix(in oklch, ${value}, ${target} ${pct}%)` : value
}

function resolveColorModes(
  entry: ColorEntry,
  autogenerate = true
): { light: Shades; dark: Shades } {
  const mode = isMode(entry)
  const mL = mode ? entry.light : entry
  const mD = mode ? entry.dark : entry
  const light: Shades = {}
  const dark: Shades = {}
  const keys = autogenerate
    ? COLOR_SHADES
    : [...new Set([...Object.keys(mL ?? {}), ...Object.keys(mD ?? {})])]
  const baseL = mL?.["500"] ?? Object.values(mL ?? {})[0] ?? ""
  const baseD = mD?.["500"] ?? Object.values(mD ?? {})[0] ?? baseL

  for (const s of keys) {
    const isLight = Number(s) < 500
    const lVal =
      mL?.[s] ??
      (autogenerate
        ? generateShade(s, baseL || baseD, isLight ? "white" : "black")
        : baseL || baseD)
    const dVal =
      mD?.[s] ??
      (autogenerate
        ? generateShade(s, baseD || baseL, isLight ? "black" : "white")
        : baseD || baseL)
    if (lVal) light[s] = lVal
    if (dVal) dark[s] = dVal
  }
  return { light, dark }
}

const createScale = (c: string) => ({
  DEFAULT: `var(--${c})`,
  foreground: `var(--${c}-foreground)`,
  accent: `var(--${c}-accent)`,
  ...Object.fromEntries(COLOR_SHADES.map((s) => [s, `var(--color-${c}-${s})`]))
})

const formatColorLines = (
  entries: Iterable<[string, { light?: Record<string, string>; dark?: Record<string, string> }]>
) =>
  [...entries]
    .flatMap(([c, m]) => {
      const keys = [...new Set([...Object.keys(m.light ?? {}), ...Object.keys(m.dark ?? {})])]
      const lines = keys.map((s) => {
        const l = m.light?.[s]
        const d = m.dark?.[s]
        return `  --color-${c}-${s}: light-dark(${l ?? d}, ${d ?? l});`
      })
      const l500 = m.light?.["500"] ?? m.dark?.["500"]
      if (l500) {
        lines.push(
          `  --${c}: light-dark(${l500}, ${m.dark?.["500"] ?? l500});`,
          `  --${c}-foreground: light-dark(oklch(1 0 0), oklch(0.145 0 0));`,
          `  --${c}-accent: var(--color-${c}-600);`
        )
      }
      return lines
    })
    .join("\n")

const STATIC_BUILTIN_COLOR_LINES = formatColorLines(Object.entries(colorScales))

const STATIC_THEME_COLORS = {
  background: "var(--background)",
  foreground: "var(--foreground)",
  border: "var(--border)",
  input: "var(--input)",
  ring: "var(--ring)",
  outline: "var(--outline)",
  muted: { DEFAULT: "var(--background-color-muted)", foreground: "var(--text-color-muted)" },
  accent: {
    DEFAULT: "var(--background-color-accented)",
    foreground: "var(--text-color-highlighted)"
  }
}

const PROP_MAP: Record<string, [css: string, prefix: string]> = {
  text: ["color", "text"],
  bg: ["background-color", "background"],
  ring: ["--un-ring-color", "ring"],
  outline: ["outline-color", "ring"],
  divide: ["border-color", "divide"],
  border: ["border-color", "border"]
}

const INTENTS: Record<string, [string, string, string, string, string]> = {
  default: ["700", "light-dark(oklch(1 0 0), var(--color-neutral-50))", "200", "300", "100"],
  muted: ["600", "100", "200", "300", "200"],
  elevated: ["800", "light-dark(oklch(1 0 0), var(--color-neutral-100))", "200", "400", "100"],
  accented: ["900", "200", "300", "500", "300"],
  dimmed: ["500", "light-dark(var(--color-neutral-50), oklch(0 0 0 / 0.25))", "300", "400", "200"],
  toned: ["800", "700", "600", "900", "800"],
  highlighted: ["950", "200", "800", "950", "900"],
  inverted: ["50", "950", "800", "700", "900"]
}

const INTENT_PROPS = ["text", "background", "border", "ring", "divide"] as const
const INTENT_PREFLIGHT_VARS = Object.entries(INTENTS)
  .flatMap(([n, vals]) =>
    INTENT_PROPS.map(
      (p, i) =>
        `  --${p}-color-${n}: ${vals[i]!.startsWith("light-dark(") ? vals[i]! : `var(--color-neutral-${vals[i]!})`};`
    )
  )
  .join("\n")

const INTENT_REGEX = new RegExp(
  `^(text|bg|ring|border|outline|divide)-(${Object.keys(INTENTS).join("|")})(?:\\/(\\d+))?$`
)

const STATIC_PREFLIGHT_SUFFIX = `
}

:root.dark, html.dark, .dark, [data-theme="dark"] { color-scheme: dark; }
:root.light, html.light, .light, [data-theme="light"] { color-scheme: light; }

@property --rl-contrast-color { syntax: "<color>"; initial-value: white; inherits: true; }

.rl-theme-container {
  container-type: normal;
  --rl-surface-effective: var(--rl-bg, var(--background));
  --rl-contrast-color: contrast-color(var(--rl-surface-effective));
  color: var(--rl-contrast-color);
}
.rl-theme-container > *, .rl-theme-container :where(h1, h2, h3, h4, h5, h6, p, span, div, li, strong) { color: inherit; }

@container style(--rl-contrast-color: white) {
  .rl-theme-container .rl-subtext { color: oklch(from var(--rl-surface-effective) 0.88 0.04 h); }
  .rl-theme-container .rl-border-subtle { border-color: oklch(from var(--rl-surface-effective) 0.45 0.08 h / 0.6); }
}

@container style(--rl-contrast-color: black) {
  .rl-theme-container .rl-subtext { color: oklch(from var(--rl-surface-effective) 0.32 0.07 h); }
  .rl-theme-container .rl-border-subtle { border-color: oklch(from var(--rl-surface-effective) 0.75 0.05 h / 0.6); }
}

body { background-color: var(--background); color: var(--foreground); font-family: var(--font-sans); }
*, ::before, ::after { --un-ring-color: var(--primary); }
*:focus-visible, *:has(> a:focus-visible) {
  outline: 2px solid color-mix(in srgb, var(--un-ring-color, var(--primary)) 25%, transparent);
  outline-offset: 2px;
}
`

const buildPreflight = (extra = "") =>
  `:root {\n  color-scheme: light dark;\n  --background: light-dark(oklch(1 0 0), var(--color-neutral-50));\n  --foreground: var(--color-neutral-950);\n  --border: var(--border-color-default);\n  --input: var(--border-color-default);\n  --ring: var(--ring-color-default);\n  --outline: var(--ring-color-default);\n  --radius: 0.625rem;\n  --font-sans: "Noto Sans", sans-serif;\n  --font-serif: "Noto Serif", serif;\n  --font-mono: "Noto Sans Mono", monospace;\n  --ui-header-height: 4rem;\n  --rl-container: 90rem;\n${INTENT_PREFLIGHT_VARS}\n\n${STATIC_BUILTIN_COLOR_LINES}${extra ? `\n${extra}` : ""}${STATIC_PREFLIGHT_SUFFIX}`

const THEME_SPACING = {
  "6xs": "0.125rem",
  "5xs": "0.25rem",
  "4xs": "0.375rem",
  "3xs": "0.5rem",
  "2xs": "0.625rem",
  "xs": "0.75rem",
  "sm": "0.875rem",
  "md": "1rem",
  "lg": "1.25rem",
  "xl": "1.5rem",
  "2xl": "2rem",
  "3xl": "3rem",
  "4xl": "4rem",
  "5xl": "6rem",
  "6xl": "8rem"
}
const THEME_RADIUS = {
  "xs": "calc(var(--radius) - 0.375rem)",
  "sm": "calc(var(--radius) - 0.25rem)",
  "md": "calc(var(--radius) - 0.125rem)",
  "lg": "var(--radius)",
  "xl": "calc(var(--radius) + 0.25rem)",
  "2xl": "calc(var(--radius) + 0.5rem)",
  "3xl": "calc(var(--radius) + 1rem)"
}

export function rimelightUiPreset(options?: UIConfig): Preset {
  const userColors = options?.colors ?? {}
  const allColors = getAllColorNames(userColors)
  const safelist = [
    ...allColors.map((c) => `rl-color-${c}`),
    ...Object.values(options?.icons ?? {}).filter(
      (v): v is string => typeof v === "string" && v.startsWith("i-")
    )
  ]
  const userColorLines = Object.keys(userColors).length
    ? formatColorLines(
        Object.entries(userColors).map(([name, entry]) => [
          name,
          resolveColorModes(entry, options?.autogenerateColorModes ?? true)
        ])
      )
    : ""
  const preflightCss = buildPreflight(userColorLines)

  const opt = options?.presets
  const presets: Preset[] = [
    opt?.wind !== false && presetWind4(),
    opt?.typography !== false &&
      presetTypography({
        cssExtend: {
          "h1,h2,h3,h4,h5,h6,p,li,blockquote": {
            "font-family": "var(--font-sans), system-ui, sans-serif"
          },
          "pre,code": { "font-family": "var(--font-mono), monospace" }
        }
      }),
    opt?.icons !== false &&
      presetIcons({
        extraProperties: { "display": "inline-block", "vertical-align": "middle" }
      })
  ].filter((p): p is Preset => !!p)

  return {
    name: "rimelight-ui",
    safelist,
    presets,
    transformers: [transformerDirectives(), transformerVariantGroup()],
    outputToCssLayers: true,
    layers: { theme: 1, preflights: 2, shortcuts: 3, default: 4 },
    shortcuts: {
      "container": "mx-auto w-full max-w-[var(--rl-container)] px-xs sm:px-md md:px-xl",
      "sr-only":
        "absolute w-px h-px p-0 m-0 overflow-hidden [clip:rect(1px,1px,1px,1px)] whitespace-nowrap border-0"
    },
    rules: [
      [
        /^rl-color-([\w-]+)$/,
        ([, c]) => ({
          "--rl-bg": `var(--color-${c}-500)`,
          "--rl-bg-hover": `var(--color-${c}-600)`,
          "--rl-text": `var(--color-${c}-600)`,
          "--rl-ring": `var(--color-${c}-500)`,
          "--rl-border": `var(--color-${c}-500)`
        })
      ],
      [
        /^(?:rl-)?(light|dark|auto)$/,
        ([, mode]) => ({
          "color-scheme": mode === "auto" ? "light dark" : mode,
          "color": "var(--foreground)"
        })
      ],
      [
        /^(shadow-adaptive|rl-elevation)$/,
        () => ({
          "box-shadow":
            "0 2px 8px light-dark(oklch(0 0 0 / 0.12), transparent), 0 12px 32px light-dark(oklch(0 0 0 / 0.08), transparent), inset 0 0 0 1px light-dark(transparent, oklch(from var(--rl-surface-effective, var(--background)) calc(l + 0.35) 0.15 h / 0.7)), 0 0 20px light-dark(transparent, oklch(from var(--rl-surface-effective, var(--background)) calc(l + 0.35) 0.2 h / 0.5)), 0 0 4px light-dark(transparent, oklch(from var(--rl-surface-effective, var(--background)) calc(l + 0.35) 0.25 h / 0.8))"
        })
      ],
      [
        "rla-visibility-aware",
        {
          "content-visibility": "auto",
          "contain-intrinsic-size": "var(--rla-contain-intrinsic-size, auto 500px)"
        }
      ],
      [
        INTENT_REGEX,
        ([, prop, name, opacity]) => {
          const [css, prefix] = PROP_MAP[prop!]!
          const varName = `--${prefix}-color-${name}`
          const val = opacity
            ? `color-mix(in srgb, var(${varName}) ${opacity}%, transparent)`
            : `var(${varName})`
          return prop === "bg" && name === "inverted"
            ? { [css]: val, color: "var(--text-color-inverted)" }
            : { [css]: val }
        }
      ]
    ],
    theme: {
      spacing: THEME_SPACING,
      colors: {
        ...STATIC_THEME_COLORS,
        ...Object.fromEntries(allColors.map((c) => [c, createScale(c)]))
      },
      radius: THEME_RADIUS
    },
    preflights: [{ getCSS: () => preflightCss }]
  }
}

export default rimelightUiPreset
