import { join } from "node:path"
import {
  presetTypography,
  presetWind4,
  presetIcons,
  transformerDirectives,
  transformerVariantGroup,
  type Preset
} from "unocss"
import { colorScales, colorNames, semanticTokens, COLOR_SHADES, type ColorShades } from "../config"

export const uiSrcGlob = join(
  import.meta.dirname,
  "../**/*.{js,ts,jsx,tsx,vue,svelte,astro}"
).replace(/\\/g, "/")
export const uiFilesystemGlob = join(import.meta.dirname, "../**/*").replace(/\\/g, "/")

type ColorModeShades = { light?: ColorShades; dark?: ColorShades }
export type ColorConfigValue = ColorShades | ColorModeShades

const CSS_PROP_MAP: Record<string, string> = {
  text: "color",
  bg: "background-color",
  ring: "--un-ring-color",
  border: "border-color",
  outline: "outline-color"
}

const VAR_PREFIX_MAP: Record<string, string> = {
  ring: "ring-color",
  outline: "ring-color",
  bg: "background-color",
  text: "text-color",
  border: "border-color"
}

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
  const modeLight: ColorShades = raw.light && typeof raw.light === "object" ? raw.light : {}
  const modeDark: ColorShades = raw.dark && typeof raw.dark === "object" ? raw.dark : {}

  const flatShades: ColorShades = {}
  for (const [k, v] of Object.entries(raw)) {
    if (k !== "light" && k !== "dark" && typeof v === "string") flatShades[k] = v
  }

  const allShades = Array.from(
    new Set([...Object.keys(modeLight), ...Object.keys(modeDark), ...Object.keys(flatShades)])
  )

  const light: ColorShades = {}
  const dark: ColorShades = {}

  for (const s of allShades) {
    const rawL = modeLight[s]
    const rawD = modeDark[s]
    const rawF = flatShades[s]

    let lv = rawL ?? rawF ?? rawD
    let dv = rawD ?? rawF ?? rawL

    if (autogenerate) {
      if (!rawL && (rawF || rawD)) {
        lv = generateShade(s, (rawF ?? rawD)!, "white")
      }
      if (!rawD && (rawF || rawL)) {
        dv = generateShade(s, (rawF ?? rawL)!, "black")
      }
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
  .map(([token, val]) => {
    if (typeof val === "string") {
      return `          --${token}: ${val};`
    }
    const l = val.light
    const d = val.dark ?? l
    return `          --${token}: light-dark(${l}, ${d});`
  })
  .join("\n")

interface ColorModes {
  light?: Record<string, string>
  dark?: Record<string, string>
}

const formatColorLines = (colorMap: Record<string, ColorModes>) =>
  Object.entries(colorMap)
    .flatMap(([color, modes]) => {
      const light = modes.light ?? {}
      const dark = modes.dark ?? light
      return Object.keys(light).map((shade) => {
        const l = light[shade]!
        const d = dark[shade] ?? l
        return `            --color-${color}-${shade}: light-dark(${l}, ${d});`
      })
    })
    .join("\n")

const STATIC_BUILTIN_COLOR_LINES = formatColorLines(colorScales)

const STATIC_PREFLIGHT_SUFFIX = `
          /* Shiki / Expressive Code */
          --shiki-foreground: #e1e4e8;
          --shiki-background: #1f2428;
          --shiki-token-keyword: #f97583;
          --shiki-token-string: #9ecbff;
          --shiki-token-comment: #6a737d;
          --shiki-token-function: #b392f0;
          --shiki-token-constant: #79b8ff;
          --shiki-token-parameter: #ffab70;
          --shiki-token-punctuation: #e1e4e8;
        }

        /* ── Container Style Query Property Registration ───────────────── */
        @property --rl-contrast-color {
          syntax: "<color>";
          initial-value: white;
          inherits: true;
        }

        /* ── Theme Container Detector & Sub-element Tinting ────────────── */
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

        /* Dark background detected (contrast-color is white) -> Soft light subtext & subtle border */
        @container style(--rl-contrast-color: white) {
          .rl-theme-container .rl-subtext {
            color: oklch(from var(--rl-surface-effective) 0.88 0.04 h) !important;
          }
          .rl-theme-container .rl-border-subtle {
            border-color: oklch(from var(--rl-surface-effective) 0.45 0.08 h / 0.6) !important;
          }
        }

        /* Light background detected (contrast-color is black) -> Deep hue-tinted subtext & soft border */
        @container style(--rl-contrast-color: black) {
          .rl-theme-container .rl-subtext {
            color: oklch(from var(--rl-surface-effective) 0.32 0.07 h) !important;
          }
          .rl-theme-container .rl-border-subtle {
            border-color: oklch(from var(--rl-surface-effective) 0.75 0.05 h / 0.6) !important;
          }
        }

        /* ── Adaptive Elevation (Shadow in Light, Glowing OKLCH border in Dark) ── */
        .shadow-adaptive, .rl-elevation {
          box-shadow:
            /* Crisp drop shadow in light mode */
            0 2px 8px light-dark(rgba(0, 0, 0, 0.12), transparent),
            0 12px 32px light-dark(rgba(0, 0, 0, 0.08), transparent),
            /* Vivid neon glowing border in dark mode */
            inset 0 0 0 1px light-dark(transparent, oklch(from var(--rl-surface-effective, var(--background)) calc(l + 0.35) 0.15 h / 0.7)),
            0 0 20px light-dark(transparent, oklch(from var(--rl-surface-effective, var(--background)) calc(l + 0.35) 0.2 h / 0.5)),
            0 0 4px light-dark(transparent, oklch(from var(--rl-surface-effective, var(--background)) calc(l + 0.35) 0.25 h / 0.8));
        }

        /* Re-declare color on semantic text elements using :where() so utility/inherited colors take precedence */
        :where(p, h1, h2, h3, h4, h5, h6, li, blockquote, figcaption, caption, label, legend, dt, dd) {
          color: var(--foreground);
        }
        .dark {
          color-scheme: dark;
        }
        .light {
          color-scheme: light;
        }

        /* Accessibility fallback for hidden="until-found" in older/non-supporting browsers */
        @supports not (content-visibility: hidden) {
          [hidden="until-found"] {
            display: none !important;
          }
        }

        /* ── Global body reset ───────────────────────────────────────────── */
        body {
          background-color: var(--background);
          color: var(--foreground);
          font-family: var(--font-sans);
        }

        /* ── Uniform focus styles ────────────────────────────────────────── */
        *,
        ::before,
        ::after {
          /* Setup default ring/outline parameters or halo */
          --un-ring-color: var(--primary);
        }

        *:focus-visible,
        *:has(> a:focus-visible) {
          outline: 2px solid color-mix(in srgb, var(--un-ring-color, var(--primary)) 25%, transparent);
          outline-offset: 2px;
        }
        `

export interface RimelightPresetOptions {
  colors?: Record<string, ColorConfigValue>
  autogenerateColorModes?: boolean
  icons?: Record<string, unknown>
  presets?: {
    wind?: boolean
    typography?: boolean
    icons?: boolean
  }
}

export function rimelightUiPreset(options?: RimelightPresetOptions): Preset {
  const userColors = options?.colors ?? {}
  const autoGen = options?.autogenerateColorModes ?? true
  const allColors = [...new Set([...colorNames, ...Object.keys(userColors)])]

  // Only user-provided colors need resolveColorModes (they may be flat shades or partial modes).
  const resolvedUserColors = Object.fromEntries(
    Object.entries(userColors).map(([name, entry]) => [name, resolveColorModes(entry, autoGen)])
  )

  const safelist: string[] = allColors.map((color) => `rl-color-${color}`)
  if (options?.icons) {
    for (const v of Object.values(options.icons)) {
      if (typeof v === "string" && v.startsWith("i-")) {
        safelist.push(v)
      }
    }
  }

  const enabledPresets = {
    wind: options?.presets?.wind !== false,
    typography: options?.presets?.typography !== false,
    icons: options?.presets?.icons !== false
  }

  const userColorLines =
    Object.keys(userColors).length > 0 ? formatColorLines(resolvedUserColors) : ""

  const lightDarkLines = userColorLines
    ? `${STATIC_BUILTIN_COLOR_LINES}\n${userColorLines}`
    : STATIC_BUILTIN_COLOR_LINES

  const preflightCss = `:root {
  color-scheme: light dark;

  /* Semantic tokens — dynamically generated from semanticTokens */
${STATIC_SEMANTIC_TOKEN_LINES}
  --radius: 0.625rem;
  --font-sans: "Noto Sans", sans-serif;
  --font-serif: "Noto Serif", serif;
  --font-mono: "Noto Sans Mono", monospace;

          --ui-header-height: 4rem;
          --rl-container: 90rem;

          /* Text / background / border / ring semantic tokens using responsive neutral variables */
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

          /* Color scales — light-dark() resolves based on inherited color-scheme */
${lightDarkLines}${STATIC_PREFLIGHT_SUFFIX}`

  return {
    name: "rimelight-ui",
    safelist,
    presets: (
      [
        enabledPresets.wind && presetWind4(),
        enabledPresets.typography &&
          presetTypography({
            cssExtend: {
              "h1,h2,h3,h4,h5,h6": {
                "font-family": "var(--font-sans), system-ui, sans-serif"
              },
              "p,li,blockquote,code": {
                "font-family": "var(--font-sans), system-ui, sans-serif"
              },
              "pre,code": {
                "font-family": "var(--font-mono), monospace"
              }
            }
          }),
        enabledPresets.icons &&
          presetIcons({
            extraProperties: {
              "display": "inline-block",
              "vertical-align": "middle"
            }
          })
      ] as const
    ).filter((p): p is Preset => Boolean(p)),
    transformers: [transformerDirectives(), transformerVariantGroup()],

    outputToCssLayers: true,
    layers: {
      theme: 1,
      preflights: 2,
      shortcuts: 3,
      default: 4
    },

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
      // Pins the element's color-scheme to light — light-dark() resolves to light values.
      // Also sets color so plain text children inherit the correct foreground without needing
      // an explicit utility class on every element.
      ["rl-light", { "color-scheme": "light", "color": "var(--foreground)" }],
      // Pins the element's color-scheme to dark — light-dark() resolves to dark values.
      ["rl-dark", { "color-scheme": "dark", "color": "var(--foreground)" }],
      // Resets color-scheme back to reactive — follows the page-level preference
      // (i.e. whatever is set on <html>). Use inside a pinned wrapper to opt a subtree back out.
      ["rl-auto", { "color-scheme": "light dark", "color": "var(--foreground)" }],
      // Visibility-aware rendering utility to prevent unsafe inline style attributes in strict CSPs
      [
        "rla-visibility-aware",
        {
          "content-visibility": "auto",
          "contain-intrinsic-size": "var(--rla-contain-intrinsic-size, auto 500px)"
        }
      ],
      [
        /^bg-inverted(?:\/(\d+))?$/,
        ([, opacity]) => ({
          "background-color": opacity
            ? `color-mix(in srgb, var(--background-color-inverted) ${opacity}%, transparent)`
            : "var(--background-color-inverted)",
          "color": "var(--text-color-inverted)"
        })
      ],
      [
        /^(text|bg|ring|border|outline)-(default|muted|dimmed|toned|highlighted|elevated|accented|inverted)(?:\/(\d+))?$/,
        ([, prop, name, opacity]) => {
          const cssProp = CSS_PROP_MAP[prop!]!
          const varName = `--${VAR_PREFIX_MAP[prop!]!}-${name}`
          return opacity
            ? { [cssProp]: `color-mix(in srgb, var(${varName}) ${opacity}%, transparent)` }
            : { [cssProp]: `var(${varName})` }
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
        "card": {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)"
        },
        "popover": {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)"
        },
        ...Object.fromEntries(allColors.map((color) => [color, createScale(color)])),
        "muted": {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)"
        },
        "accent": {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)"
        },
        "border": "var(--border)",
        "input": "var(--input)",
        "outline": "var(--outline)",
        "ring": "var(--ring)",
        "destructive": {
          DEFAULT: "var(--destructive)",
          subtle: "var(--color-destructive-subtle)"
        },
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
        "elevated": "var(--background-color-elevated)",
        "accented": "var(--ring-color-accented)",
        "dimmed": "var(--text-color-dimmed)",
        "toned": "var(--text-color-toned)",
        "highlighted": "var(--text-color-highlighted)"
      },
      radius: {
        "xs": "calc(var(--radius) - 0.375rem)",
        "sm": "calc(var(--radius) - 0.25rem)",
        "md": "calc(var(--radius) - 0.125rem)",
        "lg": "var(--radius)",
        "xl": "calc(var(--radius) + 0.25rem)",
        "2xl": "calc(var(--radius) + 0.5rem)",
        "3xl": "calc(var(--radius) + 1rem)"
      },
      animation: {
        keyframes: {
          marquee: "from { transform: translateX(0); } to { transform: translateX(-100%); }"
        },
        durations: {
          marquee: "30s"
        },
        timingFns: {
          marquee: "linear"
        },
        counts: { marquee: "infinite" }
      }
    },

    preflights: [
      {
        getCSS: () => preflightCss
      }
    ]
  }
}

export default rimelightUiPreset
