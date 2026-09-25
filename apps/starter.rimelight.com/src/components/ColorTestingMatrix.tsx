import { createSignal, For, Show } from "solid-js"

export const PALETTES = [
  "neutral",
  "primary",
  "secondary",
  "info",
  "success",
  "warning",
  "error",
  "commentary",
  "ideation",
  "source"
] as const

export const SHADES = [
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
  "950"
] as const

export const INTENTS = [
  "default",
  "muted",
  "elevated",
  "accented",
  "dimmed",
  "toned",
  "highlighted",
  "inverted"
] as const

export default function ColorTestingMatrix() {
  const [activeTab, setActiveTab] = createSignal<
    "palettes" | "intents" | "matrix" | "variants" | "sandbox"
  >("palettes")
  const [selectedMatrixPalette, setSelectedMatrixPalette] = createSignal<string>("neutral")
  const [copiedToken, setCopiedToken] = createSignal<string | null>(null)

  // Sandbox State
  const [sandboxBgIntent, setSandboxBgIntent] = createSignal<string>("bg-default")
  const [sandboxTextIntent, setSandboxTextIntent] = createSignal<string>("text-default")
  const [sandboxBorderIntent, setSandboxBorderIntent] = createSignal<string>("border-default")
  const [sandboxAccentColor, setSandboxAccentColor] = createSignal<string>("primary")
  const [sandboxVariantBg, setSandboxVariantBg] = createSignal<string>("bg-default")

  const copyToClipboard = (text: string) => {
    void navigator.clipboard.writeText(text)
    setCopiedToken(text)
    setTimeout(() => setCopiedToken(null), 1500)
  }

  return (
    <div class="flex flex-col gap-6 w-full">
      {/* Toast */}
      <Show when={copiedToken()}>
        <div class="fixed bottom-4 right-4 z-50 bg-neutral-950 text-neutral-50 px-3 py-1.5 rounded-md shadow-lg text-xs font-mono">
          Copied: <strong>{copiedToken()}</strong>
        </div>
      </Show>

      {/* Controls Header */}
      <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-default">
        {/* Navigation Tabs */}
        <div class="flex flex-wrap items-center gap-1 bg-muted p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab("palettes")}
            class={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              activeTab() === "palettes"
                ? "bg-default text-highlighted shadow-xs"
                : "text-muted hover:text-highlighted"
            }`}
          >
            Palettes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("intents")}
            class={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              activeTab() === "intents"
                ? "bg-default text-highlighted shadow-xs"
                : "text-muted hover:text-highlighted"
            }`}
          >
            Intents (8×8)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("matrix")}
            class={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              activeTab() === "matrix"
                ? "bg-default text-highlighted shadow-xs"
                : "text-muted hover:text-highlighted"
            }`}
          >
            Shade Matrix (11×11)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("variants")}
            class={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              activeTab() === "variants"
                ? "bg-default text-highlighted shadow-xs"
                : "text-muted hover:text-highlighted"
            }`}
          >
            Component Variants
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("sandbox")}
            class={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              activeTab() === "sandbox"
                ? "bg-default text-highlighted shadow-xs"
                : "text-muted hover:text-highlighted"
            }`}
          >
            Dual Sandbox
          </button>
        </div>

        {/* Global theme controls */}
        <div class="flex items-center gap-1">
          <button
            type="button"
            onClick={() => document.documentElement.removeAttribute("data-theme")}
            class="px-2.5 py-1 rounded text-xs font-medium border border-default hover:bg-muted text-toned"
          >
            Auto
          </button>
          <button
            type="button"
            onClick={() => document.documentElement.setAttribute("data-theme", "light")}
            class="px-2.5 py-1 rounded text-xs font-medium border border-default hover:bg-muted text-toned"
          >
            Light
          </button>
          <button
            type="button"
            onClick={() => document.documentElement.setAttribute("data-theme", "dark")}
            class="px-2.5 py-1 rounded text-xs font-medium border border-default hover:bg-muted text-toned"
          >
            Dark
          </button>
        </div>
      </div>

      {/* 1. PALETTES TAB */}
      <Show when={activeTab() === "palettes"}>
        <div class="flex flex-col gap-4">
          <For each={PALETTES}>
            {(pal) => (
              <div class="flex flex-col sm:flex-row sm:items-center gap-3">
                <div class="w-28 shrink-0 flex items-center justify-between sm:justify-start gap-2">
                  <span
                    class="size-3 rounded-full border border-black/20 shrink-0"
                    style={{ background: `var(--rl-${pal}-500)` }}
                  />
                  <span class="font-mono text-xs font-bold text-highlighted capitalize">{pal}</span>
                </div>

                {/* Swatch row */}
                <div class="grid grid-cols-11 flex-1 rounded-lg overflow-hidden border border-default">
                  <For each={SHADES}>
                    {(s) => {
                      const varName = `--rl-${pal}-${s}`
                      return (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(varName)}
                          class="h-14 flex flex-col justify-between p-1.5 text-left transition-opacity hover:opacity-90"
                          style={{ background: `var(${varName})` }}
                          title={`Click to copy: ${varName}`}
                        >
                          <span class="text-[9px] font-mono font-bold px-1 rounded bg-black/40 text-white w-fit">
                            {s}
                          </span>
                        </button>
                      )
                    }}
                  </For>
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>

      {/* 2. INTENTS (8x8) TAB */}
      <Show when={activeTab() === "intents"}>
        <div class="overflow-x-auto border border-default rounded-lg">
          <table class="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr class="border-b border-default bg-muted">
                <th class="p-2 text-xs font-mono font-bold text-highlighted w-28 border-r border-default">
                  BG \ Text
                </th>
                <For each={INTENTS}>
                  {(col) => (
                    <th class="p-2 text-xs font-mono font-bold text-highlighted text-center border-r border-default last:border-r-0">
                      text-{col}
                    </th>
                  )}
                </For>
              </tr>
            </thead>
            <tbody>
              <For each={INTENTS}>
                {(row) => (
                  <tr class="border-b border-default last:border-b-0">
                    <td class="p-2 text-xs font-mono font-bold text-highlighted border-r border-default bg-muted/40">
                      bg-{row}
                    </td>
                    <For each={INTENTS}>
                      {(col) => (
                        <td class="p-1 border-r border-default last:border-r-0">
                          <div
                            class={`p-2 rounded border border-default bg-${row} text-${col} flex flex-col justify-between h-14 cursor-pointer`}
                            onClick={() => copyToClipboard(`bg-${row} text-${col}`)}
                            title={`bg-${row} text-${col}`}
                          >
                            <span class="text-xs font-bold font-sans">Aa Sample</span>
                            <span class="text-[8px] font-mono opacity-60">
                              {row} / {col}
                            </span>
                          </div>
                        </td>
                      )}
                    </For>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
      </Show>

      {/* 3. SHADE MATRIX (11x11) TAB */}
      <Show when={activeTab() === "matrix"}>
        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-2">
            <span class="text-xs font-mono text-muted">Palette:</span>
            <select
              value={selectedMatrixPalette()}
              onChange={(e) => setSelectedMatrixPalette(e.currentTarget.value)}
              class="bg-default border border-default text-highlighted text-xs rounded px-2 py-1 font-mono capitalize"
            >
              <For each={PALETTES}>{(pal) => <option value={pal}>{pal}</option>}</For>
            </select>
          </div>

          <div class="overflow-x-auto border border-default rounded-lg">
            <table class="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr class="border-b border-default bg-muted">
                  <th class="p-2 text-xs font-mono font-bold text-highlighted w-20 border-r border-default">
                    BG \ Text
                  </th>
                  <For each={SHADES}>
                    {(col) => (
                      <th class="p-1 text-xs font-mono font-bold text-highlighted text-center border-r border-default last:border-r-0">
                        {col}
                      </th>
                    )}
                  </For>
                </tr>
              </thead>
              <tbody>
                <For each={SHADES}>
                  {(bgShade) => {
                    const pal = selectedMatrixPalette()
                    const bgVar = `--rl-${pal}-${bgShade}`
                    return (
                      <tr class="border-b border-default last:border-b-0">
                        <td class="p-1.5 text-xs font-mono font-bold text-highlighted border-r border-default bg-muted/40">
                          {bgShade}
                        </td>
                        <For each={SHADES}>
                          {(txtShade) => {
                            const txtVar = `--rl-${pal}-${txtShade}`
                            return (
                              <td class="p-0.5 border-r border-default last:border-r-0">
                                <div
                                  class="h-10 flex flex-col justify-between items-center p-1 text-center cursor-pointer"
                                  style={{
                                    background: `var(${bgVar})`,
                                    color: `var(${txtVar})`
                                  }}
                                  onClick={() =>
                                    copyToClipboard(`bg-${pal}-${bgShade} text-${pal}-${txtShade}`)
                                  }
                                  title={`bg-${pal}-${bgShade} text-${pal}-${txtShade}`}
                                >
                                  <span class="text-xs font-bold">Aa</span>
                                  <span class="text-[7px] font-mono opacity-70">
                                    {bgShade}/{txtShade}
                                  </span>
                                </div>
                              </td>
                            )
                          }}
                        </For>
                      </tr>
                    )
                  }}
                </For>
              </tbody>
            </table>
          </div>
        </div>
      </Show>

      {/* 4. COMPONENT VARIANTS TAB */}
      <Show when={activeTab() === "variants"}>
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-2">
            <span class="text-xs font-mono text-muted">Preview BG:</span>
            <select
              value={sandboxVariantBg()}
              onChange={(e) => setSandboxVariantBg(e.currentTarget.value)}
              class="bg-default border border-default text-highlighted text-xs rounded px-2 py-1 font-mono"
            >
              <For each={INTENTS}>
                {(intent) => <option value={`bg-${intent}`}>bg-{intent}</option>}
              </For>
            </select>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <For each={PALETTES}>
              {(pal) => {
                const colorClass = `rl-color-${pal}`
                return (
                  <div
                    class={`p-4 rounded-xl border border-default flex flex-col gap-3 ${sandboxVariantBg()} ${
                      sandboxVariantBg() === "bg-inverted" || sandboxVariantBg() === "bg-toned"
                        ? "text-neutral-50"
                        : "text-neutral-950"
                    }`}
                  >
                    <div class="flex items-center justify-between">
                      <span class="font-mono text-xs font-bold capitalize">{pal}</span>
                      <span class="text-[10px] font-mono opacity-60">.{colorClass}</span>
                    </div>

                    {/* Buttons */}
                    <div class={`flex flex-wrap items-center gap-2 ${colorClass}`}>
                      <button
                        type="button"
                        class="px-2.5 py-1 rounded text-xs font-semibold bg-[var(--rl-bg)] text-white hover:bg-[var(--rl-bg-hover)]"
                      >
                        Solid
                      </button>
                      <button
                        type="button"
                        class="px-2.5 py-1 rounded text-xs font-semibold border border-[var(--rl-border)] text-[var(--rl-text)] hover:bg-[var(--rl-bg)]/10"
                      >
                        Outline
                      </button>
                      <button
                        type="button"
                        class="px-2.5 py-1 rounded text-xs font-semibold bg-[var(--rl-bg)]/10 text-[var(--rl-text)]"
                      >
                        Soft
                      </button>
                      <button
                        type="button"
                        class="px-2.5 py-1 rounded text-xs font-semibold bg-[var(--rl-bg)]/15 text-[var(--rl-text)]"
                      >
                        Subtle
                      </button>
                      <button
                        type="button"
                        class="px-2.5 py-1 rounded text-xs font-semibold text-[var(--rl-text)] hover:bg-[var(--rl-bg)]/10"
                      >
                        Ghost
                      </button>
                      <button
                        type="button"
                        class="px-2 py-1 text-xs font-semibold text-[var(--rl-text)] underline"
                      >
                        Link
                      </button>
                    </div>

                    {/* Pills */}
                    <div class={`flex flex-wrap items-center gap-2 ${colorClass}`}>
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--rl-bg)] text-white">
                        Solid
                      </span>
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold border border-[var(--rl-border)] text-[var(--rl-text)]">
                        Outline
                      </span>
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--rl-bg)]/15 text-[var(--rl-text)]">
                        Subtle
                      </span>
                    </div>
                  </div>
                )
              }}
            </For>
          </div>
        </div>
      </Show>

      {/* 5. DUAL SANDBOX TAB */}
      <Show when={activeTab() === "sandbox"}>
        <div class="flex flex-col gap-4">
          {/* Controls */}
          <div class="flex flex-wrap gap-3 p-3 bg-muted rounded-lg text-xs font-mono">
            <div class="flex items-center gap-1.5">
              <span class="text-muted">BG:</span>
              <select
                value={sandboxBgIntent()}
                onChange={(e) => setSandboxBgIntent(e.currentTarget.value)}
                class="bg-default border border-default rounded px-2 py-1 text-highlighted"
              >
                <For each={INTENTS}>
                  {(intent) => <option value={`bg-${intent}`}>bg-{intent}</option>}
                </For>
              </select>
            </div>

            <div class="flex items-center gap-1.5">
              <span class="text-muted">Text:</span>
              <select
                value={sandboxTextIntent()}
                onChange={(e) => setSandboxTextIntent(e.currentTarget.value)}
                class="bg-default border border-default rounded px-2 py-1 text-highlighted"
              >
                <For each={INTENTS}>
                  {(intent) => <option value={`text-${intent}`}>text-{intent}</option>}
                </For>
              </select>
            </div>

            <div class="flex items-center gap-1.5">
              <span class="text-muted">Border:</span>
              <select
                value={sandboxBorderIntent()}
                onChange={(e) => setSandboxBorderIntent(e.currentTarget.value)}
                class="bg-default border border-default rounded px-2 py-1 text-highlighted"
              >
                <For each={INTENTS}>
                  {(intent) => <option value={`border-${intent}`}>border-{intent}</option>}
                </For>
              </select>
            </div>

            <div class="flex items-center gap-1.5">
              <span class="text-muted">Accent:</span>
              <select
                value={sandboxAccentColor()}
                onChange={(e) => setSandboxAccentColor(e.currentTarget.value)}
                class="bg-default border border-default rounded px-2 py-1 text-highlighted capitalize"
              >
                <For each={PALETTES}>{(pal) => <option value={pal}>{pal}</option>}</For>
              </select>
            </div>
          </div>

          {/* Side by side light/dark */}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Forced Light */}
            <div
              data-theme="light"
              class="p-4 rounded-xl border border-neutral-300 bg-white text-neutral-900 flex flex-col gap-3"
              style={{ "color-scheme": "light" }}
            >
              <div class="text-[10px] font-mono text-neutral-500 font-bold">LIGHT MODE</div>
              <div
                class={`p-4 rounded-lg border ${sandboxBorderIntent()} ${sandboxBgIntent()} ${sandboxTextIntent()} rl-color-${sandboxAccentColor()} flex flex-col gap-3`}
              >
                <div class="flex items-center justify-between">
                  <span class="font-bold text-sm">Preview Card</span>
                  <span class="text-[10px] px-2 py-0.5 rounded font-bold bg-[var(--rl-bg)] text-white">
                    {sandboxAccentColor()}
                  </span>
                </div>
                <p class="text-xs">
                  {sandboxBgIntent()} + {sandboxTextIntent()} + {sandboxBorderIntent()}
                </p>
                <div class="flex gap-2">
                  <button
                    type="button"
                    class="px-3 py-1 text-xs font-semibold rounded bg-[var(--rl-bg)] text-white"
                  >
                    Button
                  </button>
                  <button
                    type="button"
                    class="px-3 py-1 text-xs font-semibold rounded border border-[var(--rl-border)] text-[var(--rl-text)]"
                  >
                    Outline
                  </button>
                </div>
              </div>
            </div>

            {/* Forced Dark */}
            <div
              data-theme="dark"
              class="p-4 rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-50 flex flex-col gap-3"
              style={{ "color-scheme": "dark" }}
            >
              <div class="text-[10px] font-mono text-neutral-400 font-bold">DARK MODE</div>
              <div
                class={`p-4 rounded-lg border ${sandboxBorderIntent()} ${sandboxBgIntent()} ${sandboxTextIntent()} rl-color-${sandboxAccentColor()} flex flex-col gap-3`}
              >
                <div class="flex items-center justify-between">
                  <span class="font-bold text-sm">Preview Card</span>
                  <span class="text-[10px] px-2 py-0.5 rounded font-bold bg-[var(--rl-bg)] text-white">
                    {sandboxAccentColor()}
                  </span>
                </div>
                <p class="text-xs">
                  {sandboxBgIntent()} + {sandboxTextIntent()} + {sandboxBorderIntent()}
                </p>
                <div class="flex gap-2">
                  <button
                    type="button"
                    class="px-3 py-1 text-xs font-semibold rounded bg-[var(--rl-bg)] text-white"
                  >
                    Button
                  </button>
                  <button
                    type="button"
                    class="px-3 py-1 text-xs font-semibold rounded border border-[var(--rl-border)] text-[var(--rl-text)]"
                  >
                    Outline
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </div>
  )
}
