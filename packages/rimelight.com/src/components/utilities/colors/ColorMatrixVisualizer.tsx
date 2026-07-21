import { createSignal, createMemo, For, Show } from "solid-js"

export interface ColorMatrixVisualizerProps {
  initialTab?: string
}

const BUILT_IN_COLORS = [
  "primary",
  "secondary",
  "neutral",
  "info",
  "success",
  "warning",
  "error",
  "commentary",
  "ideation",
  "source"
] as const

const VARIANTS = ["solid", "outline", "soft", "subtle", "ghost", "link"] as const

const SEMANTIC_TEXTS = [
  { name: "default", cls: "text-default", label: "Default" },
  { name: "muted", cls: "text-muted", label: "Muted" },
  { name: "elevated", cls: "text-elevated", label: "Elevated" },
  { name: "accented", cls: "text-accented", label: "Accented" },
  { name: "dimmed", cls: "text-dimmed", label: "Dimmed" },
  { name: "toned", cls: "text-toned", label: "Toned" },
  { name: "highlighted", cls: "text-highlighted", label: "Highlighted" },
  { name: "inverted", cls: "text-inverted", label: "Inverted" },
  { name: "primary-600", cls: "text-[var(--color-primary-600)]", label: "Primary 600" },
  { name: "success-600", cls: "text-[var(--color-success-600)]", label: "Success 600" }
]

const SEMANTIC_BACKGROUNDS = [
  { name: "default", cls: "bg-default", label: "Default" },
  { name: "muted", cls: "bg-muted", label: "Muted" },
  { name: "elevated", cls: "bg-elevated", label: "Elevated" },
  { name: "accented", cls: "bg-accented", label: "Accented" },
  { name: "dimmed", cls: "bg-dimmed", label: "Dimmed" },
  { name: "toned", cls: "bg-toned", label: "Toned" },
  { name: "highlighted", cls: "bg-highlighted", label: "Highlighted" },
  { name: "inverted", cls: "bg-inverted", label: "Inverted" },
  { name: "primary-50", cls: "bg-[var(--color-primary-50)]", label: "Primary 50" },
  { name: "primary-500", cls: "bg-[var(--color-primary-500)]", label: "Primary 500" }
]

const SHADES = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"] as const

export default function ColorMatrixVisualizer(props: ColorMatrixVisualizerProps) {
  const [activeTab, setActiveTab] = createSignal(props.initialTab || "matrix")
  const [wrapperTheme, setWrapperTheme] = createSignal<"auto" | "rl-light" | "rl-dark">("auto")
  const [selectedVariant, setSelectedVariant] = createSignal<string>("all")
  const [componentThemeProp, setComponentThemeProp] = createSignal<"auto" | "light" | "dark">(
    "auto"
  )

  // Sandbox State
  const [sandboxBg, setSandboxBg] = createSignal("bg-default")
  const [sandboxText, setSandboxText] = createSignal("text-default")
  const [sandboxColor, setSandboxColor] = createSignal("primary")

  const wrapperClass = createMemo(() => {
    const t = wrapperTheme()
    if (t === "rl-light") return "rl-light bg-default text-default"
    if (t === "rl-dark") return "rl-dark bg-default text-default"
    return "bg-default text-default"
  })

  return (
    <div class="w-full my-8 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-lg font-sans bg-default text-default">
      {/* Header Bar */}
      <div class="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-neutral-200 dark:border-neutral-800 bg-muted">
        <div>
          <h3 class="text-lg font-bold text-highlighted flex items-center gap-2">
            <span class="i-lucide-palette text-primary-500 size-5" />
            Rimelight UI Color & Contrast Architecture Inspector
          </h3>
          <p class="text-xs text-muted">
            Test background/text colors, component variants, and theme wrapper schemes (`rl-light` /
            `rl-dark`) in real-time.
          </p>
        </div>

        {/* Global Context Mode Switcher for the Visualizer */}
        <div class="flex items-center gap-2 bg-elevated p-1 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs">
          <span class="px-2 text-toned font-semibold">Wrapper Scheme:</span>
          <button
            class={`px-2.5 py-1 rounded-md transition-all font-medium ${
              wrapperTheme() === "auto"
                ? "bg-primary-500 text-white shadow-sm"
                : "hover:text-highlighted text-toned"
            }`}
            onClick={() => setWrapperTheme("auto")}
          >
            Auto (Inherit)
          </button>
          <button
            class={`px-2.5 py-1 rounded-md transition-all font-medium ${
              wrapperTheme() === "rl-light"
                ? "bg-primary-500 text-white shadow-sm"
                : "hover:text-highlighted text-toned"
            }`}
            onClick={() => setWrapperTheme("rl-light")}
          >
            rl-light
          </button>
          <button
            class={`px-2.5 py-1 rounded-md transition-all font-medium ${
              wrapperTheme() === "rl-dark"
                ? "bg-primary-500 text-white shadow-sm"
                : "hover:text-highlighted text-toned"
            }`}
            onClick={() => setWrapperTheme("rl-dark")}
          >
            rl-dark
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div class="flex border-b border-neutral-200 dark:border-neutral-800 bg-muted/50 overflow-x-auto">
        <button
          class={`px-5 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab() === "matrix"
              ? "border-primary-500 text-primary-600 dark:text-primary-400 bg-default"
              : "border-transparent text-toned hover:text-highlighted"
          }`}
          onClick={() => setActiveTab("matrix")}
        >
          <span class="i-lucide-grid size-4" />
          Component Variants Matrix
        </button>
        <button
          class={`px-5 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab() === "contrast"
              ? "border-primary-500 text-primary-600 dark:text-primary-400 bg-default"
              : "border-transparent text-toned hover:text-highlighted"
          }`}
          onClick={() => setActiveTab("contrast")}
        >
          <span class="i-lucide-contrast size-4" />
          Text / BG Contrast Grid
        </button>
        <button
          class={`px-5 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab() === "scales"
              ? "border-primary-500 text-primary-600 dark:text-primary-400 bg-default"
              : "border-transparent text-toned hover:text-highlighted"
          }`}
          onClick={() => setActiveTab("scales")}
        >
          <span class="i-lucide-layers size-4" />
          50–950 Shade Scales
        </button>
        <button
          class={`px-5 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab() === "sandbox"
              ? "border-primary-500 text-primary-600 dark:text-primary-400 bg-default"
              : "border-transparent text-toned hover:text-highlighted"
          }`}
          onClick={() => setActiveTab("sandbox")}
        >
          <span class="i-lucide-sliders size-4" />
          Custom Pairing Sandbox
        </button>
      </div>

      {/* Main Content Container wrapped in the selected theme wrapper */}
      <div class={`p-6 transition-colors duration-200 ${wrapperClass()}`}>
        {/* TAB 1: Component Variants Matrix */}
        <Show when={activeTab() === "matrix"}>
          <div class="space-y-6">
            <div class="flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg bg-elevated border border-neutral-200 dark:border-neutral-800">
              <div class="flex items-center gap-4">
                <span class="text-xs font-bold uppercase tracking-wider text-muted">
                  Filter Variant:
                </span>
                <div class="flex flex-wrap gap-1">
                  <button
                    class={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
                      selectedVariant() === "all"
                        ? "bg-primary-500 text-white"
                        : "bg-muted text-toned hover:text-highlighted"
                    }`}
                    onClick={() => setSelectedVariant("all")}
                  >
                    All
                  </button>
                  <For each={VARIANTS}>
                    {(v) => (
                      <button
                        class={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
                          selectedVariant() === v
                            ? "bg-primary-500 text-white"
                            : "bg-muted text-toned hover:text-highlighted"
                        }`}
                        onClick={() => setSelectedVariant(v)}
                      >
                        {v}
                      </button>
                    )}
                  </For>
                </div>
              </div>

              <div class="flex items-center gap-2 text-xs">
                <span class="font-medium text-muted">Component `theme` Prop:</span>
                <select
                  class="bg-default border border-neutral-300 dark:border-neutral-700 rounded px-2 py-1 text-xs text-default"
                  value={componentThemeProp()}
                  onChange={(e) => {
                    const val = e.currentTarget.value
                    if (val === "auto" || val === "light" || val === "dark") {
                      setComponentThemeProp(val)
                    }
                  }}
                >
                  <option value="auto">Auto (Inherit)</option>
                  <option value="light">theme="light"</option>
                  <option value="dark">theme="dark"</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <For each={BUILT_IN_COLORS}>
                {(color) => (
                  <div class="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-elevated/50 space-y-3">
                    <div class="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
                      <span class="font-bold text-sm text-highlighted capitalize flex items-center gap-2">
                        <span class={`size-3 rounded-full rl-color-${color} bg-[var(--rl-bg)]`} />
                        {color}
                      </span>
                      <span class="text-[10px] font-mono text-muted">rl-color-{color}</span>
                    </div>

                    <div class="space-y-2">
                      <For each={VARIANTS}>
                        {(variant) => (
                          <Show when={selectedVariant() === "all" || selectedVariant() === variant}>
                            <div class="flex items-center justify-between gap-2 p-1.5 rounded bg-default">
                              <span class="text-[11px] font-medium text-muted w-14">{variant}</span>
                              <button
                                class={`px-3 py-1.5 text-xs font-medium rounded-md transition-all rl-color-${color}  ${
                                  componentThemeProp() === "light"
                                    ? "rl-light"
                                    : componentThemeProp() === "dark"
                                      ? "rl-dark"
                                      : ""
                                }  ${
                                  variant === "solid"
                                    ? "bg-[var(--rl-bg)] text-white hover:bg-[var(--rl-bg-hover)]"
                                    : variant === "outline"
                                      ? "ring ring-inset ring-[var(--rl-border)]/50 text-[var(--rl-text)] hover:bg-[var(--rl-bg)]/10"
                                      : variant === "soft"
                                        ? "text-[var(--rl-text)] bg-[var(--rl-bg)]/10 hover:bg-[var(--rl-bg)]/15"
                                        : variant === "subtle"
                                          ? "text-[var(--rl-text)] ring ring-inset ring-[var(--rl-border)]/25 bg-[var(--rl-bg)]/10 hover:bg-[var(--rl-bg)]/15"
                                          : variant === "ghost"
                                            ? "text-[var(--rl-text)] hover:bg-[var(--rl-bg)]/10"
                                            : "text-[var(--rl-text)] hover:underline"
                                }`}
                              >
                                Button
                              </button>
                            </div>
                          </Show>
                        )}
                      </For>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </div>
        </Show>

        {/* TAB 2: Text / Background Contrast Grid */}
        <Show when={activeTab() === "contrast"}>
          <div class="space-y-4">
            <div class="p-4 rounded-lg bg-info-50/50 dark:bg-info-950/20 border border-info-200 dark:border-info-800 text-xs text-info-800 dark:text-info-200 flex items-start gap-3">
              <span class="i-lucide-info size-5 shrink-0 text-info-500 mt-0.5" />
              <div>
                <p class="font-bold">Understanding Contrast Semantics in Rimelight UI:</p>
                <p class="mt-1">
                  Semantic utility classes like `text-default`, `text-muted`, and `text-inverted`
                  resolve dynamically based on the active `color-scheme`. When placing dark text on
                  dark backgrounds (e.g. `text-default` inside a dark element without setting
                  `rl-dark` or `color-scheme: dark`), contrast degrades. This matrix inspects text
                  readability across all background containers.
                </p>
              </div>
            </div>

            <div class="overflow-x-auto border border-neutral-200 dark:border-neutral-800 rounded-xl">
              <table class="w-full text-xs text-left border-collapse">
                <thead>
                  <tr class="bg-muted border-b border-neutral-200 dark:border-neutral-800">
                    <th class="p-3 font-bold text-highlighted sticky left-0 bg-muted z-10">
                      Background \ Text
                    </th>
                    <For each={SEMANTIC_TEXTS}>
                      {(txt) => (
                        <th class="p-3 font-semibold text-toned min-w-[120px] text-center border-l border-neutral-200 dark:border-neutral-800">
                          <div>{txt.label}</div>
                          <div class="text-[10px] font-mono text-muted font-normal">{txt.cls}</div>
                        </th>
                      )}
                    </For>
                  </tr>
                </thead>
                <tbody>
                  <For each={SEMANTIC_BACKGROUNDS}>
                    {(bg) => (
                      <tr class="border-b border-neutral-200 dark:border-neutral-800 hover:bg-elevated/50 transition-colors">
                        <td class="p-3 font-bold text-highlighted sticky left-0 bg-default z-10 border-r border-neutral-200 dark:border-neutral-800">
                          <div>{bg.label}</div>
                          <div class="text-[10px] font-mono text-muted font-normal">{bg.cls}</div>
                        </td>
                        <For each={SEMANTIC_TEXTS}>
                          {(txt) => (
                            <td
                              class={`p-3 text-center border-l border-neutral-200 dark:border-neutral-800 ${bg.cls}`}
                            >
                              <span class={`font-medium text-xs ${txt.cls}`}>Sample Text</span>
                            </td>
                          )}
                        </For>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
          </div>
        </Show>

        {/* TAB 3: 50-950 Shade Scales */}
        <Show when={activeTab() === "scales"}>
          <div class="space-y-6">
            <p class="text-xs text-muted">
              Rimelight UI defines 10 default color scales (50–950) emitting CSS custom properties
              via `light-dark()`. Hover over any shade swatch to inspect its CSS variable name.
            </p>

            <div class="space-y-4">
              <For each={BUILT_IN_COLORS}>
                {(color) => (
                  <div class="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-elevated/30">
                    <div class="font-bold text-sm text-highlighted capitalize mb-3 flex items-center justify-between">
                      <span>{color} Scale</span>
                      <span class="text-xs font-mono text-muted font-normal">
                        --color-{color}-&#123;shade&#125;
                      </span>
                    </div>

                    <div class="grid grid-cols-11 gap-1">
                      <For each={SHADES}>
                        {(shade) => (
                          <div class="flex flex-col items-center gap-1 group">
                            <div
                              class="w-full h-12 rounded-lg border border-black/10 dark:border-white/10 shadow-xs transition-transform group-hover:scale-105"
                              style={{ "background-color": `var(--color-${color}-${shade})` }}
                            />
                            <span class="text-[10px] font-mono text-muted">{shade}</span>
                          </div>
                        )}
                      </For>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </div>
        </Show>

        {/* TAB 4: Custom Pairing Sandbox */}
        <Show when={activeTab() === "sandbox"}>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Controls Column */}
            <div class="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-elevated space-y-4">
              <h4 class="font-bold text-sm text-highlighted flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
                <span class="i-lucide-sliders-horizontal text-primary-500 size-4" />
                Sandbox Controls
              </h4>

              <div class="space-y-3 text-xs">
                <div>
                  <label class="block font-semibold text-toned mb-1">
                    Container Background
                    <select
                      id="sandbox-bg-select"
                      class="mt-1 w-full font-normal bg-default border border-neutral-300 dark:border-neutral-700 rounded-lg p-2 text-default"
                      value={sandboxBg()}
                      onChange={(e) => setSandboxBg(e.currentTarget.value)}
                    >
                      <For each={SEMANTIC_BACKGROUNDS}>
                        {(bg) => (
                          <option value={bg.cls}>
                            {bg.label} ({bg.cls})
                          </option>
                        )}
                      </For>
                    </select>
                  </label>
                </div>

                <div>
                  <label class="block font-semibold text-toned mb-1">
                    Text Color Token
                    <select
                      id="sandbox-text-select"
                      class="mt-1 w-full font-normal bg-default border border-neutral-300 dark:border-neutral-700 rounded-lg p-2 text-default"
                      value={sandboxText()}
                      onChange={(e) => setSandboxText(e.currentTarget.value)}
                    >
                      <For each={SEMANTIC_TEXTS}>
                        {(txt) => (
                          <option value={txt.cls}>
                            {txt.label} ({txt.cls})
                          </option>
                        )}
                      </For>
                    </select>
                  </label>
                </div>

                <div>
                  <label class="block font-semibold text-toned mb-1">
                    Accent Brand Color
                    <select
                      id="sandbox-accent-select"
                      class="mt-1 w-full font-normal bg-default border border-neutral-300 dark:border-neutral-700 rounded-lg p-2 text-default"
                      value={sandboxColor()}
                      onChange={(e) => setSandboxColor(e.currentTarget.value)}
                    >
                      <For each={BUILT_IN_COLORS}>
                        {(color) => <option value={color}>{color}</option>}
                      </For>
                    </select>
                  </label>
                </div>
              </div>
            </div>

            {/* Preview Card Column */}
            <div class="lg:col-span-2 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-muted space-y-4">
              <h4 class="font-bold text-xs uppercase tracking-wider text-muted">
                Live Preview Render
              </h4>

              <div
                class={`p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-md space-y-4 ${sandboxBg()}`}
              >
                <div class="flex items-center justify-between border-b border-neutral-200/50 pb-3">
                  <h3 class={`text-lg font-bold ${sandboxText()}`}>Custom Component Card</h3>
                  <span
                    class={`text-xs px-2.5 py-1 rounded-full font-medium rl-color-${sandboxColor()} bg-[var(--rl-bg)]/10 text-[var(--rl-text)]`}
                  >
                    {sandboxColor()} tag
                  </span>
                </div>

                <p class={`text-sm ${sandboxText()}`}>
                  This preview renders real text and component elements using your chosen
                  background, text token, and brand accent color.
                </p>

                <div class="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    class={`px-4 py-2 text-sm font-semibold rounded-lg rl-color-${sandboxColor()} bg-[var(--rl-bg)] text-white hover:bg-[var(--rl-bg-hover)] shadow-sm`}
                  >
                    Primary Action
                  </button>
                  <button
                    class={`px-4 py-2 text-sm font-semibold rounded-lg rl-color-${sandboxColor()} ring ring-inset ring-[var(--rl-border)]/50 text-[var(--rl-text)] hover:bg-[var(--rl-bg)]/10`}
                  >
                    Outline Action
                  </button>
                  <button
                    class={`px-4 py-2 text-sm font-semibold rounded-lg rl-color-${sandboxColor()} text-[var(--rl-text)] hover:bg-[var(--rl-bg)]/10`}
                  >
                    Ghost Action
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Show>
      </div>

      {/* Footer Recommendations */}
      <div class="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-muted/60 text-xs text-muted flex flex-wrap items-center justify-between gap-2">
        <span class="flex items-center gap-1.5 font-medium">
          <span class="i-lucide-check-circle2 text-success-500 size-4" />
          Rimelight UI Architecture: Dynamic CSS Variable Indirection (`rl-color-&#123;name&#125;`)
        </span>
        <a
          href="#refining-color-semantics--recommendations"
          class="text-primary-600 dark:text-primary-400 font-semibold hover:underline flex items-center gap-1"
        >
          View Architecture Recommendations &rarr;
        </a>
      </div>
    </div>
  )
}
