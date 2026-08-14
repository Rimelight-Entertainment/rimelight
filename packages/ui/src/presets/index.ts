import {
  presetTypography,
  presetWind4,
  presetIcons,
  transformerDirectives,
  transformerVariantGroup,
  type Preset
} from "unocss"
import {
  colorScales,
  getAllColorNames,
  semanticTokens,
  COLOR_SHADES,
  type ColorShades
} from "../config"

type ColorModeShades = { light?: ColorShades; dark?: ColorShades }
export type ColorConfigValue = ColorShades | ColorModeShades

const isMode = (v: ColorConfigValue): v is ColorModeShades =>
  typeof v === "object" && v !== null && ("light" in v || "dark" in v)

function generateShade(shade: string, value: string, target: "white" | "black"): string {
  const num = Number(shade)
  if (isNaN(num)) return value
  const pct = target === "white" ? (950 - num) / 950 : (num - 50) / 900
  return `color-mix(in oklch, ${value}, ${target} ${Math.min(60, Math.round(pct * 60))}%)`
}

function resolveColorModes(
  entry: ColorConfigValue,
  autogenerate?: boolean
): { light: Record<string, string>; dark: Record<string, string> } {
  const mode = isMode(entry)
  const mL = mode ? (entry.light ?? {}) : {}
  const mD = mode ? (entry.dark ?? {}) : {}
  const flat = mode ? {} : entry
  const shades = mode ? Object.keys({ ...entry.light, ...entry.dark }) : Object.keys(entry)
  const light: ColorShades = {}
  const dark: ColorShades = {}

  for (const s of shades) {
    const base = flat[s] ?? mD[s] ?? mL[s] ?? ""
    light[s] = mL[s] ?? (autogenerate && base ? generateShade(s, base, "white") : base)
    dark[s] = mD[s] ?? (autogenerate && base ? generateShade(s, base, "black") : base)
  }
  return { light, dark }
}

const createScale = (c: string) => ({
  DEFAULT: `var(--${c})`,
  foreground: `var(--${c}-foreground)`,
  accent: `var(--${c}-accent)`,
  ...Object.fromEntries(COLOR_SHADES.map((s) => [s, `var(--color-${c}-${s})`]))
})

const STATIC_SEMANTIC_TOKEN_LINES = Object.entries(semanticTokens)
  .map(([t, v]) =>
    typeof v === "string"
      ? `  --${t}: ${v};`
      : `  --${t}: light-dark(${v.light}, ${v.dark ?? v.light});`
  )
  .join("\n")

const formatColorLines = (
  colorMap: Record<string, { light?: Record<string, string>; dark?: Record<string, string> }>
) =>
  Object.entries(colorMap)
    .flatMap(([c, m]) => {
      const shades = COLOR_SHADES.filter(
        (s) => m.light?.[s] !== undefined || m.dark?.[s] !== undefined
      )
      const keys = shades.length ? shades : Object.keys({ ...m.light, ...m.dark })
      return keys.map(
        (s) =>
          `  --color-${c}-${s}: light-dark(${m.light?.[s] ?? m.dark?.[s]}, ${m.dark?.[s] ?? m.light?.[s]});`
      )
    })
    .join("\n")

const STATIC_BUILTIN_COLOR_LINES = formatColorLines(colorScales)

const PROP_MAP: Record<string, [css: string, prefix: string]> = {
  text: ["color", "text"],
  bg: ["background-color", "background"],
  ring: ["--un-ring-color", "ring"],
  outline: ["outline-color", "ring"],
  divide: ["border-color", "divide"],
  border: ["border-color", "border"]
}

const INTENTS: Record<string, [t: string, b: string, bg?: string]> = {
  default: ["700", "200", "light-dark(oklch(1 0 0), var(--color-neutral-50))"],
  muted: ["600", "100"],
  elevated: ["800", "200"],
  accented: ["900", "300"],
  dimmed: ["500", "400"],
  toned: ["800", "800"],
  highlighted: ["950", "900"],
  inverted: ["50", "950"]
}

const INTENT_PREFLIGHT_VARS = Object.entries(INTENTS)
  .flatMap(([n, [t, b, bg]]) => [
    `  --text-color-${n}: var(--color-neutral-${t});`,
    `  --background-color-${n}: ${bg ?? `var(--color-neutral-${b})`};`,
    `  --border-color-${n}: var(--color-neutral-${b});`,
    `  --ring-color-${n}: var(--color-neutral-${b});`,
    `  --divide-color-${n}: var(--color-neutral-${b});`
  ])
  .join("\n")

const STATIC_PREFLIGHT_SUFFIX = `
}

@property --rl-contrast-color { syntax: "<color>"; initial-value: white; inherits: true; }

.rl-theme-container {
  container-type: normal;
  --rl-surface-effective: var(--rl-bg, var(--background));
  --rl-contrast-color: contrast-color(var(--rl-surface-effective));
  color: var(--rl-contrast-color);
}
.rl-theme-container > *, .rl-theme-container :where(h1, h2, h3, h4, h5, h6, p, span, div, li, strong) { color: inherit; }

@container style(--rl-contrast-color: white) {
  .rl-theme-container .rl-subtext { color: oklch(from var(--rl-surface-effective) 0.88 0.04 h) !important; }
  .rl-theme-container .rl-border-subtle { border-color: oklch(from var(--rl-surface-effective) 0.45 0.08 h / 0.6) !important; }
}

@container style(--rl-contrast-color: black) {
  .rl-theme-container .rl-subtext { color: oklch(from var(--rl-surface-effective) 0.32 0.07 h) !important; }
  .rl-theme-container .rl-border-subtle { border-color: oklch(from var(--rl-surface-effective) 0.75 0.05 h / 0.6) !important; }
}

body { background-color: var(--background); color: var(--foreground); font-family: var(--font-sans); }
*, ::before, ::after { --un-ring-color: var(--primary); }
*:focus-visible, *:has(> a:focus-visible) {
  outline: 2px solid color-mix(in srgb, var(--un-ring-color, var(--primary)) 25%, transparent);
  outline-offset: 2px;
}
`

export interface RimelightPresetOptions {
  colors?: Record<string, ColorConfigValue>
  autogenerateColorModes?: boolean
  icons?: Record<string, unknown>
  presets?: { wind?: boolean; typography?: boolean; icons?: boolean }
}

export function rimelightUiPreset(options?: RimelightPresetOptions): Preset {
  const userColors = options?.colors ?? {}
  const allColors = getAllColorNames(userColors)
  const resolvedUserColors = Object.fromEntries(
    Object.entries(userColors).map(([name, entry]) => [
      name,
      resolveColorModes(entry, options?.autogenerateColorModes ?? true)
    ])
  )

  const safelist: string[] = [
    ...allColors.map((color) => `rl-color-${color}`),
    ...Object.values(options?.icons ?? {}).filter(
      (v): v is string => typeof v === "string" && v.startsWith("i-")
    )
  ]

  const userColorLines =
    Object.keys(userColors).length > 0 ? formatColorLines(resolvedUserColors) : ""
  const lightDarkLines = userColorLines
    ? `${STATIC_BUILTIN_COLOR_LINES}\n${userColorLines}`
    : STATIC_BUILTIN_COLOR_LINES

  const preflightCss = `:root {\n  color-scheme: light dark;\n${STATIC_SEMANTIC_TOKEN_LINES}\n  --radius: 0.625rem;\n  --font-sans: "Noto Sans", sans-serif;\n  --font-serif: "Noto Serif", serif;\n  --font-mono: "Noto Sans Mono", monospace;\n  --ui-header-height: 4rem;\n  --rl-container: 90rem;\n${INTENT_PREFLIGHT_VARS}\n\n${lightDarkLines}${STATIC_PREFLIGHT_SUFFIX}`

  const presets: Preset[] = [
    options?.presets?.wind !== false ? presetWind4() : null,
    options?.presets?.typography !== false
      ? presetTypography({
          cssExtend: {
            "h1,h2,h3,h4,h5,h6,p,li,blockquote": {
              "font-family": "var(--font-sans), system-ui, sans-serif"
            },
            "pre,code": { "font-family": "var(--font-mono), monospace" }
          }
        })
      : null,
    options?.presets?.icons !== false
      ? presetIcons({
          extraProperties: { "display": "inline-block", "vertical-align": "middle" }
        })
      : null
  ].filter((p): p is Preset => Boolean(p))

  return {
    name: "rimelight-ui",
    safelist,
    presets,
    transformers: [transformerDirectives(), transformerVariantGroup()],
    outputToCssLayers: true,
    layers: { theme: 1, preflights: 2, shortcuts: 3, default: 4 },
    shortcuts: {
      "container": "mx-auto w-full max-w-[var(--rl-container)] px-xs sm:px-md md:px-xl lg:px-xl",
      "sr-only":
        "absolute w-px h-px p-0 m-0 overflow-hidden [clip:rect(1px,1px,1px,1px)] whitespace-nowrap border-0"
    },
    rules: [
      [
        /^rl-color-([a-z][a-z0-9-]*)$/,
        ([, color]) => ({
          "--rl-bg": `var(--color-${color}-500)`,
          "--rl-bg-hover": `var(--color-${color}-600)`,
          "--rl-text": `var(--color-${color}-600)`,
          "--rl-ring": `var(--color-${color}-500)`,
          "--rl-border": `var(--color-${color}-500)`
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
        /^(text|bg|ring|border|outline|divide)-(default|muted|dimmed|toned|highlighted|elevated|accented|inverted)(?:\/(\d+))?$/,
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
      spacing: {
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
      },
      colors: {
        "background": "var(--background)",
        "foreground": "var(--foreground)",
        "card": { DEFAULT: "var(--card)", foreground: "var(--card-foreground)" },
        "popover": { DEFAULT: "var(--popover)", foreground: "var(--popover-foreground)" },
        "muted": { DEFAULT: "var(--muted)", foreground: "var(--muted-foreground)" },
        "accent": { DEFAULT: "var(--accent)", foreground: "var(--accent-foreground)" },
        "border": "var(--border)",
        "input": "var(--input)",
        "outline": "var(--outline)",
        "ring": "var(--ring)",
        "sidebar": {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: {
            DEFAULT: "var(--sidebar-primary)",
            foreground: "var(--sidebar-primary-foreground)"
          },
          accent: {
            DEFAULT: "var(--sidebar-accent)",
            foreground: "var(--sidebar-accent-foreground)"
          },
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)"
        },
        "chart": Object.fromEntries([1, 2, 3, 4, 5].map((i) => [i, `var(--chart-${i})`])),
        "hover": "var(--color-hover)",
        "surface": "var(--color-surface)",
        "muted-strong": "var(--color-muted-strong)",
        "foreground-secondary": "var(--color-foreground-secondary)",
        "foreground-tertiary": "var(--color-foreground-tertiary)",
        "placeholder": "var(--color-placeholder)",
        "input-border": "var(--color-input-border)",
        "accent-subtle": "var(--color-accent-subtle)",
        ...Object.fromEntries(allColors.map((c) => [c, createScale(c)]))
      },
      radius: {
        "xs": "calc(var(--radius) - 0.375rem)",
        "sm": "calc(var(--radius) - 0.25rem)",
        "md": "calc(var(--radius) - 0.125rem)",
        "lg": "var(--radius)",
        "xl": "calc(var(--radius) + 0.25rem)",
        "2xl": "calc(var(--radius) + 0.5rem)",
        "3xl": "calc(var(--radius) + 1rem)"
      }
    },
    preflights: [{ getCSS: () => preflightCss }]
  }
}

export default rimelightUiPreset
