import {
  defineConfig,
  presetTypography,
  presetWind4,
  transformerDirectives,
  transformerVariantGroup,
  type PresetWind4Theme
} from "unocss"

export default defineConfig<PresetWind4Theme>({
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
    })
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],

  // Enable CSS Cascade Layers for better specificity control
  outputToCssLayers: true,
  layers: {
    theme: 1,
    preflights: 2,
    shortcuts: 3,
    default: 4
  },

  // Tighten content scanning for better performance
  content: {
    pipeline: {
      include: [
        /\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/,
        "src/**/*.{js,ts,jsx,tsx,vue,svelte,astro}",
        "../../packages/components/src/**/*.{js,ts,jsx,tsx,vue,svelte,astro}"
      ]
    },
    filesystem: ["../../packages/components/src/**/*", "src/components/**/*", "src/pages/**/*"]
  },

  shortcuts: [
    {
      "container": "mx-auto w-full max-w-90rem px-md",
      "sr-only":
        "absolute w-px h-px p-0 m-0 overflow-hidden clip-rect-1-1-1-1 whitespace-nowrap border-0"
    },
    // Design System Spacing Utilities (Shortcuts win over preset rules)
    [
      /^h-((?:6xs|5xs|4xs|3xs|2xs|xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl))$/,
      ([, s], { theme }: any) => `h-[${theme.spacing[s]}]`
    ],
    [
      /^w-((?:6xs|5xs|4xs|3xs|2xs|xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl))$/,
      ([, s], { theme }: any) => `w-[${theme.spacing[s]}]`
    ]
  ],

  rules: [
    [
      /^clip-rect-(\d+)-(\d+)-(\d+)-(\d+)$/,
      ([, t, r, b, l]) => ({ clip: `rect(${t}px, ${r}px, ${b}px, ${l}px)` })
    ]
  ],

  theme: {
    spacing: {
      // 2px
      "6xs": "0.125rem",
      // 4px
      "5xs": "0.25rem",
      // 6px
      "4xs": "0.375rem",
      // 8px
      "3xs": "0.5rem",
      // 10px
      "2xs": "0.625rem",
      // 12px
      "xs": "0.75rem",
      // 14px
      "sm": "0.875rem",
      // 16px
      "md": "1rem",
      // 20px
      "lg": "1.25rem",
      // 24px
      "xl": "1.5rem",
      // 32px
      "2xl": "2rem",
      // 48px
      "3xl": "3rem",
      // 64px
      "4xl": "4rem",
      // 96px
      "5xl": "6rem",
      // 128px
      "6xl": "8rem"
    },
    colors: {
      background: "var(--background)",
      foreground: "var(--foreground)",
      card: {
        DEFAULT: "var(--card)",
        foreground: "var(--card-foreground)"
      },
      popover: {
        DEFAULT: "var(--popover)",
        foreground: "var(--popover-foreground)"
      },
      primary: {
        DEFAULT: "var(--primary)",
        foreground: "var(--primary-foreground)",
        accent: "var(--primary-accent)"
      },
      secondary: {
        DEFAULT: "var(--secondary)",
        foreground: "var(--secondary-foreground)",
        accent: "var(--secondary-accent)"
      },
      muted: {
        DEFAULT: "var(--muted)",
        foreground: "var(--muted-foreground)"
      },
      accent: {
        DEFAULT: "var(--accent)",
        foreground: "var(--accent-foreground)"
      },
      info: {
        DEFAULT: "var(--info)",
        foreground: "var(--info-foreground)"
      },
      success: {
        DEFAULT: "var(--success)",
        foreground: "var(--success-foreground)"
      },
      warning: {
        DEFAULT: "var(--warning)",
        foreground: "var(--warning-foreground)"
      },
      error: {
        DEFAULT: "var(--error)",
        foreground: "var(--error-foreground)"
      },
      border: "var(--border)",
      input: "var(--input)",
      outline: "var(--outline)"
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

  preflights: [
    {
      getCSS: () => `
        :root {
          --background: #ffffff;
          --foreground: #030712;
          --card: #ffffff;
          --card-foreground: #030712;
          --popover: #ffffff;
          --popover-foreground: #030712;
          --primary: #f97316;
          --primary-foreground: #f9fafb;
          --primary-accent: #ea580c;
          --secondary: #8b5cf6;
          --secondary-foreground: #f9fafb;
          --secondary-accent: #7c3aed;
          --muted: #f3f4f6;
          --muted-foreground: #4b5563;
          --accent: #f3f4f6;
          --accent-foreground: #111827;
          --info: #3b82f6;
          --info-foreground: #ffffff;
          --success: #22c55e;
          --success-foreground: #ffffff;
          --warning: #f59e0b;
          --warning-foreground: #000000;
          --error: #ef4444;
          --error-foreground: #f9fafb;
          --border: #e5e7eb;
          --input: #e5e7eb;
          --outline: #9ca3af;
          --radius: 0.625rem;
          --font-sans: "Outfit", sans-serif;
          --font-serif: "Noto Serif", serif;
          --font-mono: "Noto Sans Mono", monospace;
        }

        .dark {
          --background: #030712;
          --foreground: #f9fafb;
          --card: #111827;
          --card-foreground: #f9fafb;
          --popover: #1f2937;
          --popover-foreground: #f9fafb;
          --primary: #f97316;
          --primary-foreground: #f9fafb;
          --primary-accent: #fb923c;
          --secondary: #8b5cf6;
          --secondary-foreground: #f9fafb;
          --secondary-accent: #a78bfa;
          --muted: #1f2937;
          --muted-foreground: #9ca3af;
          --accent: #374151;
          --accent-foreground: #f3f4f6;
          --info: #3b82f6;
          --info-foreground: #ffffff;
          --success: #22c55e;
          --success-foreground: #ffffff;
          --warning: #f59e0b;
          --warning-foreground: #000000;
          --error: #ef4444;
          --error-foreground: #f9fafb;
          --border: rgba(249, 250, 251, 0.1);
          --input: rgba(249, 250, 251, 0.15);
          --outline: #6b7280;
          --radius: 0.625rem;
        }

        * {
          border-color: var(--border);
          outline-color: rgba(156, 163, 175, 0.5);
        }

        body {
          background-color: var(--background);
          color: var(--foreground);
          font-family: var(--font-sans);
        }

        button {
          cursor: pointer;
        }

        ::selection {
          background-color: var(--primary);
          color: var(--primary-foreground);
        }
      `
    }
  ]
})
