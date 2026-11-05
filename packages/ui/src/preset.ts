import { presetIcons, presetTypography, presetWind4, type Preset } from "unocss";
import type { ColorModeInput, UIConfig } from "./types";
import { DEFAULT_ICON_NAMES } from "./constants/icons";
import { resolveWebFontsPreset } from "./fonts";
import { PALETTES } from "./constants/palettes";

export { PALETTES };

const SHADES = {
  "50": [0.985, 0.1, 0.145, 0.2],
  "100": [0.965, 0.25, 0.2, 0.35],
  "200": [0.925, 0.45, 0.28, 0.55],
  "300": [0.85, 0.7, 0.35, 0.75],
  "400": [0.72, 0.9, 0.44, 0.9],
  "500": [0.55, 1, 0.53, 1],
  "600": [0.44, 0.9, 0.61, 0.85],
  "700": [0.35, 0.75, 0.69, 0.7],
  "800": [0.27, 0.6, 0.77, 0.55],
  "900": [0.2, 0.45, 0.86, 0.4],
  "950": [0.145, 0.3, 0.93, 0.25],
} as const;

const SHADE_ENTRIES = Object.entries(SHADES);

export const INTENTS: Record<string, Record<string, string>> = {
  default: { text: "800", bg: "50", border: "200", ring: "300" },
  muted: { text: "600", bg: "100", border: "200", ring: "300" },
  elevated: { text: "800", bg: "200", border: "300", ring: "400" },
  accented: { text: "900", bg: "300", border: "400", ring: "500" },
  dimmed: { text: "500", bg: "100", border: "200", ring: "400" },
  toned: { text: "800", bg: "200", border: "300", ring: "600" },
  highlighted: { text: "950", bg: "200", border: "800", ring: "950" },
  inverted: { text: "50", bg: "950", border: "800", ring: "700" },
};

const createThemeShades = (name: string) => ({
  DEFAULT: `var(--rl-${name}-500)`,
  ...Object.fromEntries(SHADE_ENTRIES.map(([s]) => [s, `var(--rl-${name}-${s})`])),
});

const createOklchShadeGetter = ([c, h]: readonly [number, number]) => {
  const oklch = (l: number, factor: number) => `oklch(${l} ${(factor * c).toFixed(3)} ${h})`;
  return (_: string, [l1, c1, l2, c2]: readonly [number, number, number, number]) => [
    oklch(l1, c1),
    oklch(l2, c2),
  ];
};

const createCustomShadeGetter = (val: any) => {
  const isSplit = "light" in val || "dark" in val;
  const light = (isSplit ? val.light : val) ?? {};
  const dark = (isSplit ? val.dark : light) ?? light;
  const fallback = light["500"] ?? Object.values(light)[0] ?? "oklch(0.55 0.15 0)";
  return (s: string) => [light[s] ?? fallback, dark[s] ?? fallback];
};

function resolveTokens(custom: Record<string, ColorModeInput> = {}) {
  const themeColors: Record<string, Record<string, string>> = {};
  const tokenVarLines: string[] = [];

  for (const [name, val] of Object.entries({ ...PALETTES, ...custom })) {
    themeColors[name] = createThemeShades(name);
    const getShade = Array.isArray(val)
      ? createOklchShadeGetter(val)
      : createCustomShadeGetter(val);

    for (const [s, coords] of SHADE_ENTRIES) {
      const [light, dark] = getShade(s, coords as any);
      tokenVarLines.push(`--rl-${name}-${s}: light-dark(${light}, ${dark});`);
    }
  }

  return { themeColors, tokenVarLines };
}

export function rimelightUiPreset({ colors, icons, fonts, presets = {} }: UIConfig = {}): Preset {
  const { themeColors, tokenVarLines } = resolveTokens(colors);
  const webFontsPreset =
    presets.fonts !== false && fonts !== false ? resolveWebFontsPreset(fonts) : null;

  return {
    name: "rimelight-ui",
    outputToCssLayers: true,
    safelist: [
      ...Object.keys(themeColors).map((c) => `rl-color-${c}`),
      ...DEFAULT_ICON_NAMES.map((n) => `i-lucide-${n}`),
      ...Object.values(icons ?? {}).filter(
        (v): v is string => typeof v === "string" && v.startsWith("i-"),
      ),
    ],
    presets: [
      presets.wind !== false && presetWind4(),
      presets.typography !== false && presetTypography(),
      presets.icons !== false && presetIcons(),
      webFontsPreset,
      {
        name: "rimelight-theme",
        theme: {
          spacing: { md: "1rem" },
          colors: themeColors,
        },
      },
    ].filter(Boolean) as Preset[],
    shortcuts: [
      [
        /^(text|bg|ring|border)-([a-z-]+)(?:\/(\d+))?$/,
        ([, p, n, o]) => {
          const s = INTENTS[n!]?.[p!];
          if (!s) return;
          const base = `${p}-neutral-${s}${o ? `/${o}` : ""}`;
          return p === "bg" && n === "inverted" ? `${base} text-neutral-50` : base;
        },
      ],
    ],
    rules: [
      [
        /^rl-color-([\w-]+)$/,
        ([, c]) => {
          const v500 = `var(--rl-${c}-500)`;
          const v600 = `var(--rl-${c}-600)`;
          return {
            "--rl-bg": v500,
            "--rl-ring": v500,
            "--rl-border": v500,
            "--rl-bg-hover": v600,
            "--rl-text": v600,
          };
        },
      ],
    ],
    preflights: [
      {
        getCSS: () => `
@keyframes marquee-left {
  from { transform: translateX(0); }
  to { transform: translateX(calc(-100% - var(--marquee-gap, 1rem))); }
}
@keyframes marquee-right {
  from { transform: translateX(calc(-100% - var(--marquee-gap, 1rem))); }
  to { transform: translateX(0); }
}
@keyframes marquee-up {
  from { transform: translateY(0); }
  to { transform: translateY(calc(-100% - var(--marquee-gap, 1rem))); }
}
@keyframes marquee-down {
  from { transform: translateY(calc(-100% - var(--marquee-gap, 1rem))); }
  to { transform: translateY(0); }
}
.animate-marquee,
.animate-marquee-left {
  animation: marquee-left 40s linear infinite;
}
.animate-marquee-right {
  animation: marquee-right 40s linear infinite;
}
.animate-marquee-up {
  animation: marquee-up 40s linear infinite;
}
.animate-marquee-down {
  animation: marquee-down 40s linear infinite;
}

:root[data-theme="dark"] .rl-img-light,
        [data-theme="dark"] .rl-img-light,
        [data-theme="dark"] .rl-image-color-mode .rl-img-light,
        .rl-image-color-mode[data-theme="dark"] .rl-img-light {
          display: none !important;
        }

        :root[data-theme="dark"] .rl-img-dark,
        [data-theme="dark"] .rl-img-dark,
        [data-theme="dark"] .rl-image-color-mode .rl-img-dark,
        .rl-image-color-mode[data-theme="dark"] .rl-img-dark {
          display: block !important;
        }

        :root[data-theme="light"] .rl-img-light,
        [data-theme="light"] .rl-img-light,
        [data-theme="light"] .rl-image-color-mode .rl-img-light,
        .rl-image-color-mode[data-theme="light"] .rl-img-light {
          display: block !important;
        }

        :root[data-theme="light"] .rl-img-dark,
        [data-theme="light"] .rl-img-dark,
        [data-theme="light"] .rl-image-color-mode .rl-img-dark,
        .rl-image-color-mode[data-theme="light"] .rl-img-dark {
          display: none !important;
        }

        @media (prefers-color-scheme: dark) {
          :root:not([data-theme="light"]) .rl-img-light {
            display: none !important;
          }
          :root:not([data-theme="light"]) .rl-img-dark {
            display: block !important;
          }
          :root:not([data-theme="light"]) [data-theme="light"] .rl-img-light {
            display: block !important;
          }
          :root:not([data-theme="light"]) [data-theme="light"] .rl-img-dark {
            display: none !important;
          }
        }

        @supports (background-image: light-dark(none, none)) {
          .rl-image-color-mode {
            background-image: light-dark(var(--rl-img-light), var(--rl-img-dark));
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
          }
          .rl-image-color-mode > .rl-img-light,
          .rl-image-color-mode > .rl-img-dark {
            opacity: 0 !important;
            visibility: hidden !important;
          }
        }

.rl-steps-list {
          list-style: none;
          counter-reset: rl-step 0;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
        }
        .rl-steps-list > li {
          counter-increment: rl-step;
          position: relative;
          padding-left: 2.625rem;
          padding-bottom: 1.75rem;
          margin: 0;
        }
        .rl-steps-list > li:last-child {
          padding-bottom: 0;
        }
        .rl-steps-list > li::before {
          content: counter(rl-step);
          position: absolute;
          left: 0;
          top: 0.125rem;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 1.75rem;
          height: 1.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 700;
          line-height: 1;
          color: var(--rl-neutral-50);
          background-color: var(--rl-bg);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          z-index: 1;
        }
        .rl-steps-list > li::after {
          content: '';
          position: absolute;
          left: calc(0.875rem - 1px);
          top: calc(1.75rem + 0.375rem);
          bottom: 0;
          width: 2px;
          background-color: var(--rl-neutral-200);
        }
        .rl-steps-list > li:last-child::after {
          display: none;
        }
        .rl-steps-list > li > :first-child {
          margin-top: 0;
        }
        [data-size="xs"] .rl-steps-list > li {
          padding-left: 1.75rem;
          padding-bottom: 1rem;
        }
        [data-size="xs"] .rl-steps-list > li::before {
          width: 1.125rem;
          height: 1.125rem;
          font-size: 0.5625rem;
        }
        [data-size="xs"] .rl-steps-list > li::after {
          left: calc(0.5625rem - 1px);
          top: calc(1.125rem + 0.375rem);
        }
        [data-size="sm"] .rl-steps-list > li {
          padding-left: 2rem;
          padding-bottom: 1.25rem;
        }
        [data-size="sm"] .rl-steps-list > li::before {
          width: 1.375rem;
          height: 1.375rem;
          font-size: 0.625rem;
        }
        [data-size="sm"] .rl-steps-list > li::after {
          left: calc(0.6875rem - 1px);
          top: calc(1.375rem + 0.375rem);
        }
        [data-size="lg"] .rl-steps-list > li {
          padding-left: 3.25rem;
          padding-bottom: 2.25rem;
        }
        [data-size="lg"] .rl-steps-list > li::before {
          width: 2.25rem;
          height: 2.25rem;
          font-size: 0.875rem;
        }
        [data-size="lg"] .rl-steps-list > li::after {
          left: calc(1.125rem - 1px);
          top: calc(2.25rem + 0.375rem);
        }
        [data-size="xl"] .rl-steps-list > li {
          padding-left: 3.75rem;
          padding-bottom: 2.75rem;
        }
        [data-size="xl"] .rl-steps-list > li::before {
          width: 2.75rem;
          height: 2.75rem;
          font-size: 1rem;
        }
        [data-size="xl"] .rl-steps-list > li::after {
          left: calc(1.375rem - 1px);
          top: calc(2.75rem + 0.375rem);
        }
`,
      },
      {
        getCSS: () => `:root {
  color-scheme: light dark;
  --rl-header-height: 4rem;
  --rl-container: 90rem;
  ${tokenVarLines.join("\n  ")}
}
[data-theme="dark"] { color-scheme: dark; }
[data-theme="light"] { color-scheme: light; }
body { background-color: var(--rl-neutral-50); color: var(--rl-neutral-950); }

/* Sticky surfaces: the container is the sticky element itself (see sticky-surface theme). */
@container rl-sticky scroll-state(stuck: top) {
  .rl-sticky-shadow {
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1), 0 1px 4px 0 rgba(0, 0, 0, 0.06);
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  }
}
@media (prefers-color-scheme: dark) {
  @container rl-sticky scroll-state(stuck: top) {
    .rl-sticky-shadow {
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.4), 0 1px 4px 0 rgba(0, 0, 0, 0.2);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
  }
}

/* Text selection uses the primary colour. */
::selection {
  background-color: var(--rl-primary-500);
  color: #fff;
}

/* Reduced motion - disable all animations for users who prefer it */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Customizable select: the picker and its options are styled here, since UnoCSS can't target ::picker(select). */
select.rl-select {
  appearance: base-select;
  color: var(--rl-neutral-950);
}
select.rl-select::picker(select) {
  appearance: base-select;
  border: 1px solid var(--rl-border);
  border-radius: 0.5rem;
  background: var(--rl-neutral-50);
  color: var(--rl-neutral-950);
  box-shadow: 0 10px 24px rgb(0 0 0 / 0.12);
  padding: 0.25rem;
  opacity: 0;
  transition: all 0.15s allow-discrete;
}
select.rl-select:open::picker(select) {
  opacity: 1;
}
@starting-style {
  select.rl-select:open::picker(select) {
    opacity: 0;
  }
}
select.rl-select > button {
  font: inherit;
  color: inherit;
  text-align: start;
}
select.rl-select selectedcontent {
  display: block;
  min-width: 0;
}
select.rl-select[data-variant="icon"] selectedcontent {
  display: none;
}
select.rl-select[data-variant="icon"]::picker-icon {
  display: none;
}
select.rl-select[data-variant="icon"] {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
select.rl-select[data-variant="icon"] > button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
select.rl-select[data-variant="icon"] [data-slot="leading"] {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}
select.rl-select::picker-icon {
  color: var(--rl-neutral-500);
  transition: rotate 0.15s;
}
select.rl-select:open::picker-icon {
  rotate: 180deg;
}
select.rl-select option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  cursor: pointer;
  background: transparent;
}
select.rl-select option:hover,
select.rl-select option:focus {
  background: color-mix(in oklab, var(--rl-primary-500) 15%, transparent);
  outline: none;
}
select.rl-select option:checked {
  font-weight: 600;
  color: var(--rl-primary-600);
}
select.rl-select option::checkmark {
  order: 1;
  margin-left: auto;
  color: var(--rl-primary-500);
}

/* Global focus-visible ring for consistent keyboard focus */
:focus-visible {
  outline: 2px solid var(--rl-primary-500);
  outline-offset: 2px;
}

/* Ensure minimum touch target sizes (WCAG 2.2 - 24x24 minimum, 44x44 enhanced) */
button:not(:disabled),
[role="button"]:not(:disabled),
a[href],
input:not([type="hidden"]),
select,
textarea,
summary {
  min-width: 24px;
  min-height: 24px;
}

/* Enhanced touch targets for primary interactive elements */
@media (pointer: coarse) {
  button:not(:disabled),
  [role="button"]:not(:disabled),
  a[href] {
    min-width: 44px;
    min-height: 44px;
  }
}

/* Improve skip link visibility */
.skip-link:focus-visible {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 9999;
  padding: 0.75rem 1.5rem;
  background: var(--rl-primary-600);
  color: white;
  border-radius: 0.5rem;
  font-weight: 600;
  text-decoration: none;
}

@keyframes carousel {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(350%); }
}
@keyframes carousel-inverse {
  0% { transform: translateX(350%); }
  100% { transform: translateX(-100%); }
}
@keyframes swing {
  0%, 100% { transform: translateX(-50%); }
  50% { transform: translateX(250%); }
}
@keyframes elastic {
  0% { transform: scaleX(0.1) translateX(-100%); }
  50% { transform: scaleX(0.7) translateX(100%); }
  100% { transform: scaleX(0.1) translateX(350%); }
}`,
      },
    ],
  };
}
