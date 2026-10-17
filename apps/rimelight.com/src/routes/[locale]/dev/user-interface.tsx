import { For, Show, createSignal } from "solid-js";
import { type JSX } from "@solidjs/web";
import DevLayout from "#layouts/DevLayout";
import { RLBadge, RLButton, RLIcon } from "@rimelight/ui";
import { DEFAULT_ICON_NAMES } from "@rimelight/ui/icons";
import { getUIConfig } from "@rimelight/ui/runtime";

// Inlined here to avoid importing fonts.ts (which pulls unocss → oxc-parser WASM into the client bundle)
const DEFAULT_UI_FONTS = {
  provider: "fontsource" as const,
  fonts: {
    sans: [{ name: "Noto Sans", weights: [400, 500, 600, 700] }],
    serif: [{ name: "Noto Serif", weights: [400, 700] }],
    mono: [{ name: "JetBrains Mono", weights: [400, 500, 700] }],
  },
};

const PALETTES = [
  "neutral",
  "primary",
  "secondary",
  "info",
  "success",
  "warning",
  "error",
  "commentary",
  "ideation",
  "source",
] as const;

const SHADES = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "950",
] as const;

const INTENTS = [
  "default",
  "muted",
  "elevated",
  "accented",
  "dimmed",
  "toned",
  "highlighted",
  "inverted",
] as const;

interface ActiveFontFamily {
  key: string;
  name: string;
  weights: number[];
  cssClass: string;
}

export default function DevUserInterfacePage() {
  const [iconSearch, setIconSearch] = createSignal("");
  const [copiedIcon, setCopiedIcon] = createSignal<string | null>(null);

  const uiConfig = getUIConfig();
  const iconNames: readonly string[] = DEFAULT_ICON_NAMES;
  const userIconOverrides = uiConfig?.icons ?? {};
  const overrideCount = Object.keys(userIconOverrides).length;

  // Dynamically resolve currently active fonts by merging DEFAULT_UI_FONTS with user uiConfig.fonts
  const resolvedFontsConfig = () => {
    const userFonts =
      typeof uiConfig?.fonts === "object" && uiConfig.fonts !== null
        ? uiConfig.fonts.fonts
        : undefined;
    return {
      provider:
        (typeof uiConfig?.fonts === "object" && uiConfig.fonts?.provider) ||
        DEFAULT_UI_FONTS.provider,
      fonts: {
        ...DEFAULT_UI_FONTS.fonts,
        ...userFonts,
      },
    };
  };

  const activeFontFamilies = (): ActiveFontFamily[] => {
    const fontsObj = resolvedFontsConfig().fonts;
    return Object.entries(fontsObj).map(([familyKey, fontDefs]) => {
      const firstDef = Array.isArray(fontDefs) ? fontDefs[0] : fontDefs;
      const name =
        typeof firstDef === "string"
          ? firstDef
          : typeof firstDef === "object" && firstDef !== null
            ? (firstDef.name ?? familyKey)
            : familyKey;
      const weights =
        typeof firstDef === "object" && Array.isArray(firstDef?.weights)
          ? firstDef.weights
          : [400, 700];

      return {
        key: familyKey,
        name: String(name),
        weights: weights as number[],
        cssClass: `font-${familyKey}`,
      };
    });
  };

  const filteredIcons = () => {
    const q = iconSearch().toLowerCase().trim();
    if (!q) return iconNames;
    return iconNames.filter((name) => name.toLowerCase().includes(q));
  };

  const copyIconSnippet = (name: string) => {
    const snippet = `<RLIcon name="${name}" />`;
    void navigator.clipboard?.writeText(snippet);
    setCopiedIcon(name);
    setTimeout(() => setCopiedIcon(null), 1600);
  };

  const sections = (): {
    title: string;
    mono?: boolean;
    output?: string;
    rows: {
      label?: string;
      mono?: boolean;
      code?: string;
      description?: string;
      value?: string;
      content?: JSX.Element;
    }[];
  }[] => [
    {
      title: "Active Configuration",
      rows: [
        {
          label: "Virtual UI Module",
          code: `getUIConfig()`,
          description:
            "Resolved options provided to the UnoCSS preset and Solid runtime from virtual:rimelight-ui.",
          value: JSON.stringify(uiConfig, null, 2),
        },
        {
          label: "Palettes & Scales",
          code: `PALETTES`,
          description: "Ten hybrid OKLCH palettes with 11 lightness/chroma shade stops each.",
          value: PALETTES.join(", "),
        },
        {
          label: "Intent Tokens",
          code: `INTENTS`,
          description:
            "8 semantic intent modifiers (text, bg, border, ring) mapped dynamically to neutral tone stops.",
          value: INTENTS.join(", "),
        },
      ],
    },
    {
      title: "Typography & Web Fonts",
      mono: true,
      rows: [
        {
          label: "Active Web Font Preset Config",
          code: `resolveWebFontsPreset(getUIConfig().fonts)`,
          description:
            "Active font configuration merged from DEFAULT_UI_FONTS and virtual:rimelight-ui. Fonts are downloaded into node_modules/.cache and served locally with zero CDN requests.",
          value: JSON.stringify(resolvedFontsConfig(), null, 2),
        },
        {
          label: "Active Font Families",
          code: `Object.keys(resolvedFontsConfig().fonts)`,
          description:
            "Dynamically resolved families and configured weights actively applied to CSS utility classes.",
          content: (
            <div class="flex flex-col gap-md w-full">
              <For each={activeFontFamilies()}>
                {(family) => (
                  <div class="flex flex-col gap-xs rounded-xl border border-default bg-elevated/30 p-md">
                    <div class="flex items-center justify-between border-b border-default pb-xs">
                      <span class="text-xs font-bold text-highlighted">
                        {family.name}{" "}
                        <span class="text-muted font-normal font-mono">({family.key})</span>
                      </span>
                      <code class="text-xs text-primary">{family.cssClass}</code>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-sm pt-xs">
                      <For each={family.weights}>
                        {(weight) => (
                          <div class="flex flex-col gap-0.5">
                            <span class="text-[10px] text-muted">Weight {weight}</span>
                            <p
                              class={`text-sm text-highlighted ${family.cssClass}`}
                              style={{ "font-weight": String(weight) }}
                            >
                              Sphinx of black quartz, judge my vow. 1234567890
                            </p>
                          </div>
                        )}
                      </For>
                    </div>
                  </div>
                )}
              </For>
            </div>
          ),
        },
      ],
    },
    {
      title: "Icon System",
      mono: true,
      rows: [
        {
          label: "Lucide Collection & Resolution",
          code: `presetIcons() // resolves i-lucide-* via @iconify-json/lucide`,
          description:
            "Icons resolve to UnoCSS icon classes backed by the bundled Lucide collection. Bare lucide names (e.g. `check`) are prefixed to `i-lucide-check`; full class names like 'i-lucide-*' or 'i-carbon-*' pass through as-is.",
          value: `Default icons: ${iconNames.length} (safelisted)\nConfigured overrides: ${overrideCount}`,
        },
        {
          label: "Default Icons (Lucide)",
          code: `<RLIcon name="..." /> or class="i-lucide-..."`,
          description:
            "Click any icon cell to copy its JSX component invocation. Supports searching by keyword.",
          content: (
            <div class="flex flex-col gap-sm w-full">
              <div class="flex items-center gap-sm">
                <input
                  type="text"
                  placeholder="Filter default icons by name..."
                  value={iconSearch()}
                  onInput={(e) => setIconSearch(e.currentTarget.value)}
                  class="w-full max-w-xs rounded-lg border border-default bg-elevated/40 px-sm py-xs text-xs text-highlighted placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                <span class="text-xs text-muted">
                  {filteredIcons().length} of {iconNames.length} icons
                </span>
                <Show when={copiedIcon()}>
                  <span class="text-xs text-emerald-500 font-mono">
                    Copied &lt;RLIcon name="{copiedIcon()}" /&gt;!
                  </span>
                </Show>
              </div>

              <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1.5 max-h-96 overflow-y-auto p-xs rounded-xl border border-default bg-elevated/10">
                <For each={filteredIcons()}>
                  {(name) => (
                    <button
                      type="button"
                      onClick={() => copyIconSnippet(name)}
                      class="flex flex-col items-center justify-center gap-1 p-2 rounded-lg border border-default bg-elevated/30 hover:bg-elevated hover:border-primary-500/50 transition-all text-center group"
                      title={`Click to copy: <RLIcon name="${name}" /> (lucide)`}
                    >
                      <RLIcon
                        name={name}
                        size="md"
                        class="text-highlighted group-hover:text-primary transition-colors"
                      />
                      <span class="w-full truncate text-[10px] font-mono text-muted group-hover:text-highlighted">
                        {name}
                      </span>
                    </button>
                  )}
                </For>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      title: "Active Hybrid Palette Scales",
      mono: true,
      rows: PALETTES.map((name) => ({
        label: name,
        mono: true,
        code: `var(--rl-${name}-[50..950])`,
        content: (
          <div class="grid grid-cols-11 gap-1 w-full">
            <For each={SHADES}>
              {(shade) => (
                <div class="flex flex-col items-center gap-1">
                  <div
                    class="w-full h-8 rounded shadow-xs border border-default"
                    style={{ background: `var(--rl-${name}-${shade})` }}
                    title={`${name}-${shade}`}
                  />
                  <span class="text-[9px] font-mono text-muted">{shade}</span>
                </div>
              )}
            </For>
          </div>
        ),
      })),
    },
    {
      title: "Semantic Intent Utility Tokens",
      rows: [
        {
          label: "Surface intent tokens",
          code: `bg-[intent] / text-[intent] / border-[intent]`,
          description: "Design tokens dynamically resolved to the current theme surface layer.",
          content: (
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
              <For each={INTENTS}>
                {(intent) => (
                  <div
                    class={`p-3 rounded-lg border shadow-xs bg-${intent} text-${intent} border-${intent}`}
                  >
                    <span class="text-[10px] font-mono block font-bold mb-0.5">{intent}</span>
                    <span class="text-xs">Sample surface</span>
                  </div>
                )}
              </For>
            </div>
          ),
        },
      ],
    },
    {
      title: "Component Scoped Theming (rl-color-*)",
      rows: [
        {
          label: "Button color variants",
          code: `<RLButton color="primary|secondary|..." variant="solid|soft|outline" />`,
          description:
            "Single class scoped theming tokens driving solid, soft, outline, subtle, ghost, and link variants.",
          content: (
            <div class="flex flex-wrap items-center gap-2">
              <RLButton label="Primary Solid" color="primary" variant="solid" />
              <RLButton label="Secondary Soft" color="secondary" variant="soft" />
              <RLButton label="Success Outline" color="success" variant="outline" />
              <RLButton label="Warning Subtle" color="warning" variant="subtle" />
              <RLButton label="Error Ghost" color="error" variant="ghost" />
              <RLButton label="Info Link" color="info" variant="link" />
            </div>
          ),
        },
        {
          label: "Badge palette spectrum",
          code: `<RLBadge color="..." />`,
          description: "All 10 hybrid palette colors applied to the badge primitive.",
          content: (
            <div class="flex flex-wrap items-center gap-1.5">
              <For each={PALETTES}>{(color) => <RLBadge label={color} color={color} />}</For>
            </div>
          ),
        },
      ],
    },
  ];

  return (
    <DevLayout
      title="User Interface"
      description="Verifying @rimelight/ui OKLCH hybrid palette scales, dynamic typography families, icon library and collections, semantic intent utilities, and component theming"
    >
      <div class="flex flex-col gap-2xl">
        <header class="flex flex-col gap-xs">
          <h1 class="text-3xl text-highlighted">User Interface</h1>
          <p class="text-sm text-muted">
            Verifying @rimelight/ui OKLCH hybrid palette scales, dynamic typography families, icon
            library and collections, semantic intent utilities, and component theming.
          </p>
        </header>

        <For each={sections()}>
          {(section) => (
            <section class="bg-elevated/20">
              <header class="bg-elevated/40 px-xl py-sm">
                <h2 class="text-xs text-muted">
                  {section.mono ? <code>{section.title}</code> : section.title}
                </h2>
              </header>
              <hr class="border-default" />
              <div class="flex flex-col">
                <For each={section.rows}>
                  {(row, index) => (
                    <>
                      <Show when={index() > 0}>
                        <hr class="border-default" />
                      </Show>
                      <div class="grid grid-cols-1 items-start gap-xl px-xl py-md lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
                        <div class="flex min-w-0 flex-col gap-xs">
                          <Show when={row.label}>
                            {row.mono ? (
                              <code class="text-sm text-highlighted">{row.label}</code>
                            ) : (
                              <span class="text-sm text-highlighted">{row.label}</span>
                            )}
                          </Show>
                          <Show when={row.code}>
                            <pre class="whitespace-pre-wrap break-words text-xs text-muted">
                              {row.code}
                            </pre>
                          </Show>
                          <Show when={row.description}>
                            <p class="text-xs text-muted">{row.description}</p>
                          </Show>
                        </div>
                        <div class="min-w-0 text-sm text-highlighted">
                          <Show when={row.value}>
                            <pre class="whitespace-pre-wrap break-words">{row.value}</pre>
                          </Show>
                          {row.content}
                        </div>
                      </div>
                    </>
                  )}
                </For>
              </div>
            </section>
          )}
        </For>
      </div>
    </DevLayout>
  );
}
