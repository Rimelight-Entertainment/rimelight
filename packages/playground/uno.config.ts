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
          "font-family": "system-ui, sans-serif"
        },
        "p,li,blockquote,code": {
          "font-family": "system-ui, sans-serif"
        },
        "pre,code": {
          "font-family": "monospace"
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
        "../ui/src/**/*.{js,ts,jsx,tsx,vue,svelte,astro}"
      ]
    },
    filesystem: ["../ui/src/**/*", "src/components/**/*", "src/pages/**/*"]
  },

  shortcuts: {
    // Layout & Components
    "container": "mx-auto w-full max-w-90rem px-md",
    "sr-only":
      "absolute w-px h-px p-0 m-0 overflow-hidden clip-rect-1-1-1-1 whitespace-nowrap border-0"
  },
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
      "primary": {
        DEFAULT: "var(--primary)",
        foreground: "var(--primary-foreground)",
        accent: "var(--primary-accent)"
      },
      "secondary": {
        DEFAULT: "var(--secondary)",
        foreground: "var(--secondary-foreground)",
        accent: "var(--secondary-accent)"
      },
      "muted": {
        DEFAULT: "var(--muted)",
        foreground: "var(--muted-foreground)"
      },
      "accent": {
        DEFAULT: "var(--accent)",
        foreground: "var(--accent-foreground)"
      },
      "info": {
        DEFAULT: "var(--info)",
        foreground: "var(--info-foreground)"
      },
      "success": {
        DEFAULT: "var(--success)",
        foreground: "var(--success-foreground)"
      },
      "warning": {
        DEFAULT: "var(--warning)",
        foreground: "var(--warning-foreground)"
      },
      "error": {
        DEFAULT: "var(--error)",
        foreground: "var(--error-foreground)"
      },
      "commentary": {
        DEFAULT: "var(--commentary)",
        foreground: "var(--commentary-foreground)"
      },
      "ideation": {
        DEFAULT: "var(--ideation)",
        foreground: "var(--ideation-foreground)"
      },
      "source": {
        DEFAULT: "var(--source)",
        foreground: "var(--source-foreground)"
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
      "accent-subtle": "var(--color-accent-subtle)"
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
      counts: {
        marquee: "infinite"
      }
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
          --commentary: #ec4899;
          --commentary-foreground: #f9fafb;
          --ideation: #8b5cf6;
          --ideation-foreground: #f9fafb;
          --source: #38bdf8;
          --source-foreground: #0f172a;
          --border: #e5e7eb;
          --input: #e5e7eb;
          --outline: #9ca3af;
          --ring: #9ca3af;
          --radius: 0.625rem;
          --sidebar: #f9fafb;
          --sidebar-foreground: #030712;
          --sidebar-primary: #1d4ed8;
          --sidebar-primary-foreground: #f9fafb;
          --sidebar-accent: #f3f4f6;
          --sidebar-accent-foreground: #111827;
          --sidebar-border: #e5e7eb;
          --sidebar-ring: #9ca3af;
          --chart-1: #3b82f6;
          --chart-2: #6366f1;
          --chart-3: #8b5cf6;
          --chart-4: #a855f7;
          --chart-5: #ec4899;
          --destructive: #ef4444;
          --color-surface: #ffffff;
          --color-muted-strong: #e5e7eb;
          --color-foreground-secondary: #4b5563;
          --color-foreground-tertiary: #6b7280;
          --color-placeholder: #9ca3af;
          --color-input-border: #d1d5db;
          --color-hover: #f3f4f6;
          --color-destructive-subtle: #fef2f2;
          --color-accent-subtle: #eff6ff;
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
          --commentary: #f472b6;
          --commentary-foreground: #0f172a;
          --ideation: #a78bfa;
          --ideation-foreground: #0f172a;
          --source: #7dd3fc;
          --source-foreground: #0f172a;
          --border: rgba(249, 250, 251, 0.1);
          --input: rgba(249, 250, 251, 0.15);
          --outline: #6b7280;
          --ring: #6b7280;
          --sidebar: #111827;
          --sidebar-foreground: #f9fafb;
          --sidebar-primary: #1d4ed8;
          --sidebar-primary-foreground: #f9fafb;
          --sidebar-accent: #1f2937;
          --sidebar-accent-foreground: #f3f4f6;
          --sidebar-border: #1f2937;
          --sidebar-ring: #6b7280;
          --chart-1: #60a5fa;
          --chart-2: #818cf8;
          --chart-3: #a78bfa;
          --chart-4: #c084fc;
          --chart-5: #f472b6;
          --destructive: #f87171;
          --color-surface: #1f2937;
          --color-muted-strong: #374151;
          --color-foreground-secondary: #d1d5db;
          --color-foreground-tertiary: #9ca3af;
          --color-placeholder: #6b7280;
          --color-input-border: #4b5563;
          --color-hover: #374151;
          --color-destructive-subtle: #451a1a;
          --color-accent-subtle: #1e293b;
        }

        * {
          border-color: var(--border);
          outline-color: rgba(156, 163, 175, 0.5);
        }

        body {
          background-color: var(--background);
          color: var(--foreground);
          font-family: system-ui, sans-serif;
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
