import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import {
  definePreset,
  presetTypography,
  presetWind4,
  presetIcons,
  transformerDirectives,
  transformerVariantGroup
} from "unocss"
import { defaultColorScales, defaultColors } from "./defaults"

const pathDirname = dirname(fileURLToPath(import.meta.url))
export const uiSrcGlob = join(pathDirname, "../**/*.{js,ts,jsx,tsx,vue,svelte,astro}")
export const uiFilesystemGlob = join(pathDirname, "../**/*")

type ColorShades = Record<string, string>
type ColorModeShades = { light?: ColorShades; dark?: ColorShades }
export type ColorConfigValue = ColorShades | ColorModeShades

function generateLightShade(shade: string, value: string): string {
  const num = Number(shade)
  if (isNaN(num)) return value
  const mixPct = Math.min(60, ((950 - num) / 950) * 60)
  return `color-mix(in oklch, ${value}, white ${mixPct.toFixed(0)}%)`
}

function generateDarkShade(shade: string, value: string): string {
  const num = Number(shade)
  if (isNaN(num)) return value
  const mixPct = Math.min(60, ((num - 50) / 900) * 60)
  return `color-mix(in oklch, ${value}, black ${mixPct.toFixed(0)}%)`
}

function resolveColorModes(
  entry: ColorConfigValue,
  autogenerate?: boolean
): { light: Record<string, string>; dark: Record<string, string> } {
  const raw = entry as Record<string, unknown>

  const modeLight =
    typeof raw.light === "object" && raw.light !== null
      ? ({ ...raw.light } as ColorShades)
      : ({} as ColorShades)
  const modeDark =
    typeof raw.dark === "object" && raw.dark !== null
      ? ({ ...raw.dark } as ColorShades)
      : ({} as ColorShades)

  const modeKeys = new Set(["light", "dark"])
  const flatShades: ColorShades = {}
  for (const [k, v] of Object.entries(raw)) {
    if (!modeKeys.has(k) && typeof v === "string") {
      flatShades[k] = v
    }
  }

  const allShades = [
    ...new Set([...Object.keys(modeLight), ...Object.keys(modeDark), ...Object.keys(flatShades)])
  ]

  if (autogenerate) {
    if (Object.keys(modeLight).length === 0) {
      for (const shade of allShades) {
        const value = flatShades[shade] ?? modeDark[shade]
        if (value) modeLight[shade] = generateLightShade(shade, value)
      }
    }
    if (Object.keys(modeDark).length === 0) {
      for (const shade of allShades) {
        const value = flatShades[shade] ?? modeLight[shade]
        if (value) modeDark[shade] = generateDarkShade(shade, value)
      }
    }
  }

  const light: ColorShades = {}
  const dark: ColorShades = {}

  for (const shade of allShades) {
    const lv = modeLight[shade] ?? flatShades[shade] ?? modeDark[shade]
    if (lv !== undefined) light[shade] = lv

    const dv = modeDark[shade] ?? flatShades[shade] ?? modeLight[shade]
    if (dv !== undefined) dark[shade] = dv
  }

  return { light, dark }
}

const createScale = (colorName: string, shadeKeys: string[]) => ({
  DEFAULT: `var(--${colorName})`,
  foreground: `var(--${colorName}-foreground)`,
  accent: `var(--${colorName}-accent)`,
  ...Object.fromEntries(shadeKeys.map((shade) => [shade, `var(--color-${colorName}-${shade})`]))
})

export interface RimelightPresetOptions {
  colors?: Record<string, ColorConfigValue>
  autogenerateColorModes?: boolean
}

export default definePreset((options?: RimelightPresetOptions) => {
  const userColors = options?.colors ?? {}
  const autoGen = options?.autogenerateColorModes ?? true
  const coreColors = [...defaultColors, "neutral"]
  const mergedColorScales = { ...defaultColorScales, ...userColors }
  const allColors = [...new Set([...coreColors, ...Object.keys(userColors)])]

  const resolvedColors = Object.fromEntries(
    Object.entries(mergedColorScales).map(([name, entry]) => [
      name,
      resolveColorModes(entry, autoGen)
    ])
  )

  const safelist = allColors.flatMap((color) => ["rl-color-" + color])

  return {
    name: "rimelight-ui",
    safelist,
    presets: [
      presetWind4(),
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
      presetIcons({
        extraProperties: {
          "display": "inline-block",
          "vertical-align": "middle"
        }
      })
    ],
    transformers: [transformerDirectives(), transformerVariantGroup()],

    outputToCssLayers: true,
    layers: {
      theme: 1,
      preflights: 2,
      shortcuts: 3,
      default: 4
    },

    content: {
      pipeline: {
        include: [
          /\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/,
          "src/**/*.{js,ts,jsx,tsx,vue,svelte,astro}",
          uiSrcGlob,
          "../ui/src/**/*.{js,ts,jsx,tsx,vue,svelte,astro}"
        ]
      },
      filesystem: [uiFilesystemGlob, "../ui/src/**/*", "src/components/**/*", "src/pages/**/*"]
    },

    shortcuts: {
      "container": "mx-auto w-full max-w-90rem px-md",
      "sr-only":
        "absolute w-px h-px p-0 m-0 overflow-hidden clip-rect-1-1-1-1 whitespace-nowrap border-0"
    },
    rules: [
      [
        /^clip-rect-(\d+)-(\d+)-(\d+)-(\d+)$/,
        ([, t, r, b, l]) => ({ clip: `rect(${t}px, ${r}px, ${b}px, ${l}px)` })
      ],
      [
        /^rl-color-(.+)$/,
        ([, color]) => ({
          "--rl-bg": `var(--color-${color}-500)`,
          "--rl-bg-hover": `var(--color-${color}-600)`,
          "--rl-text": `var(--color-${color}-600)`,
          "--rl-ring": `var(--color-${color}-500)`,
          "--rl-border": `var(--color-${color}-500)`
        })
      ],
      // Pins the element's color-scheme to light — light-dark() resolves to light values
      ["rl-light", { "color-scheme": "light" }],
      // Pins the element's color-scheme to dark — light-dark() resolves to dark values
      ["rl-dark", { "color-scheme": "dark" }],
      // Resets color-scheme back to reactive — follows the page-level preference
      // (i.e. whatever is set on <html>). Use this inside a pinned wrapper to opt
      // a subtree back out of the pin.
      ["rl-auto", { "color-scheme": "light dark" }],
      [
        /^(text)-(default|inverted)(?:\/(\d+))?$/,
        ([, , name, opacity]) =>
          opacity
            ? { color: `color-mix(in srgb, var(--text-color-${name}) ${opacity}%, transparent)` }
            : { color: `var(--text-color-${name})` }
      ],
      [
        /^(bg)-(default|inverted)(?:\/(\d+))?$/,
        ([, , name, opacity]) =>
          opacity
            ? {
                "background-color": `color-mix(in srgb, var(--background-color-${name}) ${opacity}%, transparent)`
              }
            : { "background-color": `var(--background-color-${name})` }
      ],
      [
        /^(ring)-(default|inverted)(?:\/(\d+))?$/,
        ([, , name, opacity]) =>
          opacity
            ? {
                "--un-ring-color": `color-mix(in srgb, var(--ring-color-${name}) ${opacity}%, transparent)`
              }
            : { "--un-ring-color": `var(--ring-color-${name})` }
      ],
      [
        /^(divide)-(default)(?:\/(\d+))?$/,
        ([, , name, opacity]) =>
          opacity
            ? {
                "border-color": `color-mix(in srgb, var(--divide-color-${name}) ${opacity}%, transparent)`
              }
            : { "border-color": `var(--divide-color-${name})` }
      ],
      [
        /^(border)-(default)(?:\/(\d+))?$/,
        ([, , name, opacity]) =>
          opacity
            ? {
                "border-color": `color-mix(in srgb, var(--border-color-${name}) ${opacity}%, transparent)`
              }
            : { "border-color": `var(--border-color-${name})` }
      ],
      [
        /^(outline)-(inverted)(?:\/(\d+))?$/,
        ([, , name, opacity]) =>
          opacity
            ? {
                "outline-color": `color-mix(in srgb, var(--ring-color-${name}) ${opacity}%, transparent)`
              }
            : { "outline-color": `var(--ring-color-${name})` }
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
        ...Object.fromEntries(
          allColors.map((color) => {
            const m = resolvedColors[color]!
            const shadeKeys = [...new Set([...Object.keys(m.light), ...Object.keys(m.dark)])]
            return [color, createScale(color, shadeKeys)]
          })
        ),
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
          "accordion-down":
            "{ from { height: 0; } to { height: var(--starwind-accordion-content-height); } }",
          "accordion-up":
            "{ from { height: var(--starwind-accordion-content-height); } to { height: 0; } }",
          "marquee": "{ from { transform: translateX(0); } to { transform: translateX(-100%); } }"
        },
        durations: {
          "accordion-down": "0.2s",
          "accordion-up": "0.2s",
          "marquee": "30s"
        },
        timingFns: {
          "accordion-down": "ease-out",
          "accordion-up": "ease-out",
          "marquee": "linear"
        },
        counts: { marquee: "infinite" }
      }
    },

    preflights: [
      {
        getCSS: () => {
          // Single pass: emit light-dark() for every color shade.
          // The browser resolves each call based on the element's inherited color-scheme.
          const lightDarkLines = Object.entries(resolvedColors)
            .flatMap(([color, modes]) =>
              Object.keys(modes.light).map((shade) => {
                const l = modes.light[shade]
                const d = modes.dark[shade] ?? modes.light[shade]
                return `            --color-${color}-${shade}: light-dark(${l}, ${d});`
              })
            )
            .join("\n")

          return `
        :root {
          color-scheme: light dark;

          /* Semantic tokens — each resolves to its light or dark value based on color-scheme */
          --background: light-dark(#ffffff, #030712);
          --foreground: light-dark(#030712, #f9fafb);
          --card: light-dark(#ffffff, #111827);
          --card-foreground: light-dark(#030712, #f9fafb);
          --popover: light-dark(#ffffff, #1f2937);
          --popover-foreground: light-dark(#030712, #f9fafb);
          --primary: light-dark(#0064d7, #3b82f6);
          --primary-foreground: #ffffff;
          --primary-accent: light-dark(#0050ac, #60a5fa);
          --secondary: #8b5cf6;
          --secondary-foreground: #f9fafb;
          --secondary-accent: light-dark(#7c3aed, #a78bfa);
          --muted: light-dark(#f3f4f6, #1f2937);
          --muted-foreground: light-dark(#4b5563, #9ca3af);
          --accent: light-dark(#f3f4f6, #374151);
          --accent-foreground: light-dark(#111827, #f3f4f6);
          --info: #3b82f6;
          --info-foreground: #ffffff;
          --info-accent: light-dark(#2563eb, #60a5fa);
          --success: #22c55e;
          --success-foreground: #ffffff;
          --success-accent: light-dark(#16a34a, #4ade80);
          --warning: #f59e0b;
          --warning-foreground: #000000;
          --warning-accent: light-dark(#d97706, #fbbf24);
          --error: #ef4444;
          --error-foreground: #f9fafb;
          --error-accent: light-dark(#dc2626, #f87171);
          --commentary: light-dark(#ec4899, #f472b6);
          --commentary-foreground: light-dark(#f9fafb, #0f172a);
          --commentary-accent: light-dark(#db2777, #f9a8d4);
          --ideation: light-dark(#8b5cf6, #a78bfa);
          --ideation-foreground: light-dark(#f9fafb, #0f172a);
          --ideation-accent: light-dark(#7c3aed, #c4b5fd);
          --source: light-dark(#38bdf8, #7dd3fc);
          --source-foreground: #0f172a;
          --source-accent: light-dark(#0284c7, #bae6fd);
          --border: light-dark(#e5e7eb, rgba(249, 250, 251, 0.1));
          --input: light-dark(#e5e7eb, rgba(249, 250, 251, 0.15));
          --outline: light-dark(#9ca3af, #6b7280);
          --ring: light-dark(#9ca3af, #6b7280);
          --radius: 0.625rem;
          --sidebar: light-dark(#f9fafb, #111827);
          --sidebar-foreground: light-dark(#030712, #f9fafb);
          --sidebar-primary: #1d4ed8;
          --sidebar-primary-foreground: #f9fafb;
          --sidebar-accent: light-dark(#f3f4f6, #1f2937);
          --sidebar-accent-foreground: light-dark(#111827, #f3f4f6);
          --sidebar-border: light-dark(#e5e7eb, #1f2937);
          --sidebar-ring: light-dark(#9ca3af, #6b7280);
          --chart-1: light-dark(#3b82f6, #60a5fa);
          --chart-2: light-dark(#6366f1, #818cf8);
          --chart-3: light-dark(#8b5cf6, #a78bfa);
          --chart-4: light-dark(#a855f7, #c084fc);
          --chart-5: light-dark(#ec4899, #f472b6);
          --destructive: light-dark(#ef4444, #f87171);
          --color-surface: light-dark(#ffffff, #1f2937);
          --color-muted-strong: light-dark(#e5e7eb, #374151);
          --color-foreground-secondary: light-dark(#4b5563, #d1d5db);
          --color-foreground-tertiary: light-dark(#6b7280, #9ca3af);
          --color-placeholder: light-dark(#9ca3af, #6b7280);
          --color-input-border: light-dark(#d1d5db, #4b5563);
          --color-hover: light-dark(#f3f4f6, #374151);
          --color-destructive-subtle: light-dark(#fef2f2, #451a1a);
          --color-accent-subtle: light-dark(#eff6ff, #1e293b);
          --font-sans: "Noto Sans", sans-serif;
          --font-serif: "Noto Serif", serif;
          --font-mono: "Noto Sans Mono", monospace;

          --ui-header-height: 4rem;
          --ui-container: 80rem;

          /* Text / background / border / ring semantic tokens using light-dark() */
          --text-color-default: light-dark(var(--color-neutral-700), var(--color-neutral-200));
          --text-color-muted: light-dark(var(--color-neutral-500), var(--color-neutral-400));
          --text-color-dimmed: light-dark(var(--color-neutral-400), var(--color-neutral-500));
          --text-color-toned: light-dark(var(--color-neutral-600), var(--color-neutral-300));
          --text-color-highlighted: light-dark(var(--color-neutral-900), #ffffff);
          --text-color-inverted: light-dark(#ffffff, #030712);
          --background-color-default: light-dark(#ffffff, var(--color-neutral-900));
          --background-color-muted: light-dark(var(--color-neutral-50), var(--color-neutral-800));
          --background-color-elevated: light-dark(var(--color-neutral-100), var(--color-neutral-800));
          --background-color-accented: light-dark(var(--color-neutral-200), var(--color-neutral-700));
          --background-color-inverted: light-dark(var(--color-neutral-900), #ffffff);
          --border-color-default: light-dark(var(--color-neutral-200), var(--color-neutral-800));
          --border-color-muted: light-dark(var(--color-neutral-200), var(--color-neutral-700));
          --border-color-accented: light-dark(var(--color-neutral-300), var(--color-neutral-700));
          --border-color-inverted: light-dark(var(--color-neutral-900), #ffffff);
          --ring-color-default: light-dark(var(--color-neutral-200), var(--color-neutral-800));
          --ring-color-muted: light-dark(var(--color-neutral-200), var(--color-neutral-700));
          --ring-color-accented: light-dark(var(--color-neutral-300), var(--color-neutral-700));
          --ring-color-inverted: light-dark(var(--color-neutral-900), #ffffff);
          --divide-color-default: light-dark(var(--color-neutral-200), var(--color-neutral-800));

          /* Color scales — light-dark() resolves based on inherited color-scheme */
${lightDarkLines}

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
        .dark {
          color-scheme: dark;
        }
        .light {
          color-scheme: light;
        }
        `
        }
      }
    ]
  }
})
