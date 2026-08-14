import { join } from "node:path"
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

export const uiSrcGlob = join(
  import.meta.dirname,
  "../**/*.{js,ts,jsx,tsx,vue,svelte,astro}"
).replace(/\\/g, "/")

type ColorModeShades = { light?: ColorShades; dark?: ColorShades }
export type ColorConfigValue = ColorShades | ColorModeShades

function generateShade(shade: string, value: string, target: "white" | "black"): string {
  const num = Number(shade)
  if (isNaN(num)) return value
  const mixPct =
    target === "white"
      ? Math.min(60, ((950 - num) / 950) * 60)
      : Math.min(60, ((num - 50) / 900) * 60)
  return `color-mix(in oklch, ${value}, ${target} ${Math.round(mixPct)}%)`
}

function resolveColorModes(
  entry: ColorConfigValue,
  autogenerate?: boolean
): { light: Record<string, string>; dark: Record<string, string> } {
  const raw = entry as Record<string, any>
  const mL: ColorShades = typeof raw.light === "object" ? raw.light : {}
  const mD: ColorShades = typeof raw.dark === "object" ? raw.dark : {}
  const flat = Object.fromEntries(
    Object.entries(raw).filter(([k, v]) => k !== "light" && k !== "dark" && typeof v === "string")
  )
  const shades = [...new Set([...Object.keys(mL), ...Object.keys(mD), ...Object.keys(flat)])]

  const light: ColorShades = {}
  const dark: ColorShades = {}
  for (const s of shades) {
    const [rL, rD, rF] = [mL[s], mD[s], flat[s]]
    let [lv, dv] = [rL ?? rF ?? rD, rD ?? rF ?? rL]
    if (autogenerate) {
      if (!rL && (rF || rD)) lv = generateShade(s, rF ?? rD, "white")
      if (!rD && (rF || rL)) dv = generateShade(s, rF ?? rL, "black")
    }
    if (lv) light[s] = lv
    if (dv) dark[s] = dv
  }
  return { light, dark }
}

const createScale = (colorName: string) => ({
  DEFAULT: `var(--${colorName})`,
  foreground: `var(--${colorName}-foreground)`,
  accent: `var(--${colorName}-accent)`,
  ...Object.fromEntries(COLOR_SHADES.map((shade) => [shade, `var(--color-${colorName}-${shade})`]))
})

const STATIC_SEMANTIC_TOKEN_LINES = Object.entries(semanticTokens)
  .map(([token, val]) =>
    typeof val === "string"
      ? `  --${token}: ${val};`
      : `  --${token}: light-dark(${val.light}, ${val.dark ?? val.light});`
  )
  .join("\n")

const formatColorLines = (
  colorMap: Record<string, { light?: Record<string, string>; dark?: Record<string, string> }>
) =>
  Object.entries(colorMap)
    .flatMap(([color, modes]) => {
      const light = modes.light ?? {}
      const dark = modes.dark ?? light
      return Object.keys(light).map(
        (s) => `  --color-${color}-${s}: light-dark(${light[s]}, ${dark[s] ?? light[s]});`
      )
    })
    .join("\n")

const STATIC_BUILTIN_COLOR_LINES = formatColorLines(colorScales)

const STATIC_PREFLIGHT_SUFFIX = `
}

@property --rl-contrast-color {
  syntax: "<color>";
  initial-value: white;
  inherits: true;
}

.rl-theme-container {
  container-type: normal;
  --rl-surface-effective: var(--rl-bg, var(--background));
  --rl-contrast-color: contrast-color(var(--rl-surface-effective));
  color: var(--rl-contrast-color);
}
.rl-theme-container > *,
.rl-theme-container :where(h1, h2, h3, h4, h5, h6, p, span, div, li, strong) {
  color: inherit;
}

@container style(--rl-contrast-color: white) {
  .rl-theme-container .rl-subtext { color: oklch(from var(--rl-surface-effective) 0.88 0.04 h) !important; }
  .rl-theme-container .rl-border-subtle { border-color: oklch(from var(--rl-surface-effective) 0.45 0.08 h / 0.6) !important; }
}

@container style(--rl-contrast-color: black) {
  .rl-theme-container .rl-subtext { color: oklch(from var(--rl-surface-effective) 0.32 0.07 h) !important; }
  .rl-theme-container .rl-border-subtle { border-color: oklch(from var(--rl-surface-effective) 0.75 0.05 h / 0.6) !important; }
}

body {
  background-color: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans);
}

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
  const autoGen = options?.autogenerateColorModes ?? true
  const allColors = getAllColorNames(userColors)

  const resolvedUserColors = Object.fromEntries(
    Object.entries(userColors).map(([name, entry]) => [name, resolveColorModes(entry, autoGen)])
  )

  const safelist: string[] = allColors.map((color) => `rl-color-${color}`)
  if (options?.icons) {
    for (const v of Object.values(options.icons)) {
      if (typeof v === "string" && v.startsWith("i-")) safelist.push(v)
    }
  }

  const userColorLines =
    Object.keys(userColors).length > 0 ? formatColorLines(resolvedUserColors) : ""
  const lightDarkLines = userColorLines
    ? `${STATIC_BUILTIN_COLOR_LINES}\n${userColorLines}`
    : STATIC_BUILTIN_COLOR_LINES

  const preflightCss = `:root {
  color-scheme: light dark;
${STATIC_SEMANTIC_TOKEN_LINES}
  --radius: 0.625rem;
  --font-sans: "Noto Sans", sans-serif;
  --font-serif: "Noto Serif", serif;
  --font-mono: "Noto Sans Mono", monospace;
  --ui-header-height: 4rem;
  --rl-container: 90rem;

  --text-color-default: var(--color-neutral-700);
  --text-color-muted: var(--color-neutral-600);
  --text-color-dimmed: var(--color-neutral-500);
  --text-color-toned: var(--color-neutral-800);
  --text-color-highlighted: var(--color-neutral-950);
  --text-color-elevated: var(--color-neutral-800);
  --text-color-accented: var(--color-neutral-900);
  --text-color-inverted: var(--color-neutral-50);

  --background-color-default: light-dark(#ffffff, var(--color-neutral-50));
  --background-color-muted: var(--color-neutral-100);
  --background-color-elevated: var(--color-neutral-200);
  --background-color-accented: var(--color-neutral-300);
  --background-color-dimmed: var(--color-neutral-400);
  --background-color-toned: var(--color-neutral-800);
  --background-color-highlighted: var(--color-neutral-900);
  --background-color-inverted: var(--color-neutral-950);

  --border-color-default: var(--color-neutral-200);
  --border-color-muted: var(--color-neutral-100);
  --border-color-elevated: var(--color-neutral-200);
  --border-color-accented: var(--color-neutral-300);
  --border-color-dimmed: var(--color-neutral-400);
  --border-color-toned: var(--color-neutral-800);
  --border-color-highlighted: var(--color-neutral-900);
  --border-color-inverted: var(--color-neutral-950);

  --ring-color-default: var(--color-neutral-200);
  --ring-color-muted: var(--color-neutral-100);
  --ring-color-elevated: var(--color-neutral-200);
  --ring-color-accented: var(--color-neutral-300);
  --ring-color-dimmed: var(--color-neutral-400);
  --ring-color-toned: var(--color-neutral-800);
  --ring-color-highlighted: var(--color-neutral-900);
  --ring-color-inverted: var(--color-neutral-950);

  --divide-color-default: var(--color-neutral-200);
  --divide-color-inverted: var(--color-neutral-950);

${lightDarkLines}${STATIC_PREFLIGHT_SUFFIX}`

  const presets: Preset[] = []
  if (options?.presets?.wind !== false) presets.push(presetWind4())
  if (options?.presets?.typography !== false) {
    presets.push(
      presetTypography({
        cssExtend: {
          "h1,h2,h3,h4,h5,h6,p,li,blockquote": {
            "font-family": "var(--font-sans), system-ui, sans-serif"
          },
          "pre,code": {
            "font-family": "var(--font-mono), monospace"
          }
        }
      })
    )
  }
  if (options?.presets?.icons !== false) {
    presets.push(
      presetIcons({ extraProperties: { "display": "inline-block", "vertical-align": "middle" } })
    )
  }

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
        /^(rl-)?(light|dark)$/,
        ([, , mode]) => ({ "color-scheme": mode, "color": "var(--foreground)" })
      ],
      ["rl-auto", { "color-scheme": "light dark", "color": "var(--foreground)" }],
      [
        /^(shadow-adaptive|rl-elevation)$/,
        () => ({
          "box-shadow":
            "0 2px 8px light-dark(rgba(0, 0, 0, 0.12), transparent), 0 12px 32px light-dark(rgba(0, 0, 0, 0.08), transparent), inset 0 0 0 1px light-dark(transparent, oklch(from var(--rl-surface-effective, var(--background)) calc(l + 0.35) 0.15 h / 0.7)), 0 0 20px light-dark(transparent, oklch(from var(--rl-surface-effective, var(--background)) calc(l + 0.35) 0.2 h / 0.5)), 0 0 4px light-dark(transparent, oklch(from var(--rl-surface-effective, var(--background)) calc(l + 0.35) 0.25 h / 0.8))"
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
          const cssProp =
            prop === "text"
              ? "color"
              : prop === "bg"
                ? "background-color"
                : prop === "ring"
                  ? "--un-ring-color"
                  : prop === "divide"
                    ? "border-color"
                    : `${prop}-color`
          const prefix = prop === "bg" ? "background" : prop === "outline" ? "ring" : prop
          const varName = `--${prefix}-color-${name}`
          const isBgInverted = prop === "bg" && name === "inverted"
          const baseResult: Record<string, string> = opacity
            ? { [cssProp]: `color-mix(in srgb, var(${varName}) ${opacity}%, transparent)` }
            : { [cssProp]: `var(${varName})` }
          if (isBgInverted) baseResult.color = "var(--text-color-inverted)"
          return baseResult
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
        "destructive": { DEFAULT: "var(--destructive)", subtle: "var(--color-destructive-subtle)" },
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
        "chart": {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)"
        },
        "hover": "var(--color-hover)",
        "surface": "var(--color-surface)",
        "muted-strong": "var(--color-muted-strong)",
        "foreground-secondary": "var(--color-foreground-secondary)",
        "foreground-tertiary": "var(--color-foreground-tertiary)",
        "placeholder": "var(--color-placeholder)",
        "input-border": "var(--color-input-border)",
        "accent-subtle": "var(--color-accent-subtle)",
        ...Object.fromEntries(allColors.map((color) => [color, createScale(color)]))
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
