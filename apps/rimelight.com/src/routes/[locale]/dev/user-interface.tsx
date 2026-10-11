import { For, Show, createSignal, type Component } from "solid-js";
import { type JSX } from "@solidjs/web";
import DevLayout from "#layouts/DevLayout";
import ColorTestingMatrix, {
  PALETTES,
  SHADES,
  INTENTS,
} from "#components/dev/ColorTestingMatrix.tsx";
import {
  RLBadge,
  RLButton,
  RLCard,
  RLGrid,
  RLIcon,
  ICONS,
  DEFAULT_UI_FONTS,
  getUIConfig,
} from "@rimelight/ui";

const FONT_SAMPLES = [
  {
    family: "sans",
    name: "Noto Sans",
    role: "Body & Primary UI",
    class: "font-sans",
    weights: [
      { label: "Regular (400)", class: "font-normal" },
      { label: "Medium (500)", class: "font-medium" },
      { label: "Semibold (600)", class: "font-semibold" },
      { label: "Bold (700)", class: "font-bold" },
    ],
  },
  {
    family: "serif",
    name: "Noto Serif",
    role: "Editorial & Rich Content",
    class: "font-serif",
    weights: [
      { label: "Regular (400)", class: "font-normal" },
      { label: "Bold (700)", class: "font-bold" },
    ],
  },
  {
    family: "mono",
    name: "JetBrains Mono",
    role: "Code & Monospace Diagnostics",
    class: "font-mono",
    weights: [
      { label: "Regular (400)", class: "font-normal" },
      { label: "Medium (500)", class: "font-medium" },
      { label: "Bold (700)", class: "font-bold" },
    ],
  },
] as const;

export const DevUserInterfacePage: Component = () => {
  const [viewMode, setViewMode] = createSignal<"standard" | "interactive">("standard");
  const [iconSearch, setIconSearch] = createSignal("");
  const [copiedIcon, setCopiedIcon] = createSignal<string | null>(null);

  const uiConfig = getUIConfig();
  const iconNames = Object.keys(ICONS);

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
          code: `Object.keys(PALETTES)`,
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
          label: "Font Provider & Defaults",
          code: `DEFAULT_UI_FONTS`,
          description:
            "Downloaded into node_modules/.cache and served locally via Astro-style Vite middleware. No third-party CDN hits in production or dev.",
          value: JSON.stringify(DEFAULT_UI_FONTS, null, 2),
        },
        {
          label: "Font Family Showcase",
          code: `font-sans, font-serif, font-mono`,
          description: "Visual rendering of primary font families across configured weights.",
          content: (
            <div class="flex flex-col gap-md w-full">
              <For each={FONT_SAMPLES}>
                {(sample) => (
                  <div class="flex flex-col gap-xs rounded-xl border border-default bg-elevated/30 p-md">
                    <div class="flex items-center justify-between border-b border-default pb-xs">
                      <span class="text-xs font-bold text-highlighted">
                        {sample.name} <span class="text-muted font-normal">({sample.role})</span>
                      </span>
                      <code class="text-xs text-primary">{sample.class}</code>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-sm pt-xs">
                      <For each={sample.weights}>
                        {(weight) => (
                          <div class="flex flex-col gap-0.5">
                            <span class="text-[10px] text-muted">{weight.label}</span>
                            <p class={`text-sm text-highlighted ${sample.class} ${weight.class}`}>
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
      title: "Built-in Icon System",
      mono: true,
      rows: [
        {
          label: "Total Registered Icons",
          code: `Object.keys(ICONS).length`,
          description:
            "Lightweight Lucide-derived SVG vector nodes rendered via Solid Dynamic without icon-font bloat.",
          value: `${iconNames.length} icons available`,
        },
        {
          label: "Icon Library & Inspector",
          code: `<RLIcon name="..." size="md" />`,
          description:
            "Click any icon cell to copy its JSX component invocation. Supports searching by keyword.",
          content: (
            <div class="flex flex-col gap-sm w-full">
              <div class="flex items-center gap-sm">
                <input
                  type="text"
                  placeholder="Filter icons by name..."
                  value={iconSearch()}
                  onInput={(e) => setIconSearch(e.currentTarget.value)}
                  class="w-full max-w-xs rounded-lg border border-default bg-elevated/40 px-sm py-xs text-xs text-highlighted placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                <span class="text-xs text-muted">{filteredIcons().length} matches</span>
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
                      title={`Click to copy: <RLIcon name="${name}" />`}
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
    {
      title: "Grid & Slot Customization",
      rows: [
        {
          label: "Responsive Grid & Cards",
          code: `<RLGrid cols={3}><RLCard ... /></RLGrid>`,
          description: "Composite layout components with standard slot definitions.",
          content: (
            <RLGrid cols={3}>
              <RLCard
                title="Hybrid Seed Matrix"
                description="Generates lightweight OKLCH scales without 200+ hardcoded number strings."
              />
              <RLCard
                title="Component Scoping"
                description="Single-class rl-color-* resolver drives button, badge, and input variants."
              />
              <RLCard
                title="Web Fonts & Icons"
                description="Locally-cached typography presets and zero-dependency SVG icon system."
              />
            </RLGrid>
          ),
        },
      ],
    },
  ];

  return (
    <DevLayout
      title="User Interface"
      description="Verifying @rimelight/ui palettes, typography, icon library, intent tokens, and component theming."
      actions={
        <div class="flex items-center gap-1 bg-muted p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setViewMode("standard")}
            class={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              viewMode() === "standard"
                ? "bg-default text-highlighted shadow-xs"
                : "text-muted hover:text-highlighted"
            }`}
          >
            Standard View
          </button>
          <button
            type="button"
            onClick={() => setViewMode("interactive")}
            class={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              viewMode() === "interactive"
                ? "bg-default text-highlighted shadow-xs"
                : "text-muted hover:text-highlighted"
            }`}
          >
            Interactive Matrix
          </button>
        </div>
      }
    >
      <Show when={viewMode() === "interactive"}>
        <ColorTestingMatrix />
      </Show>

      <Show when={viewMode() === "standard"}>
        <div class="flex flex-col gap-2xl">
          <header class="flex flex-col gap-xs">
            <h1 class="text-3xl text-highlighted">User Interface</h1>
            <p class="text-sm text-muted">
              Verifying @rimelight/ui OKLCH hybrid palette scales, font presets, icon library,
              semantic intent utilities, and component theming.
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
      </Show>
    </DevLayout>
  );
};

export default DevUserInterfacePage;
