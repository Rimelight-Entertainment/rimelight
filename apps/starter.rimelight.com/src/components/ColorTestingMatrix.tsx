import { createSignal, For, Show } from "solid-js";

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
  "source",
] as const;

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
  "950",
] as const;

export const INTENTS = [
  "default",
  "muted",
  "elevated",
  "accented",
  "dimmed",
  "toned",
  "highlighted",
  "inverted",
] as const;

export default function ColorTestingMatrix() {
  const [activeTab, setActiveTab] = createSignal<
    "intents" | "palettes" | "matrix" | "variants" | "sandbox"
  >("sandbox");
  const [selectedMatrixPalette, setSelectedMatrixPalette] = createSignal<string>("neutral");
  const [copiedToken, setCopiedToken] = createSignal<string | null>(null);

  // Sandbox State
  const [sandboxBgIntent, setSandboxBgIntent] = createSignal<string>("bg-default");
  const [sandboxTextIntent, setSandboxTextIntent] = createSignal<string>("text-default");
  const [sandboxBorderIntent, setSandboxBorderIntent] = createSignal<string>("border-default");
  const [sandboxAccentColor, setSandboxAccentColor] = createSignal<string>("primary");
  const [sandboxVariantBg, setSandboxVariantBg] = createSignal<string>("bg-default");
  const [sandboxActiveTab, setSandboxActiveTab] = createSignal<number>(0);

  const copyToClipboard = (text: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedToken(text);
    setTimeout(() => setCopiedToken(null), 1500);
  };

  const isInvalidInvertedPair = (row: string, col: string) => {
    if (row === "inverted" && col !== "inverted") return true;
    if (row !== "inverted" && col === "inverted") return true;
    return false;
  };

  const renderSandboxShowcase = () => {
    const accentClass = () => `rl-color-${sandboxAccentColor()}`;

    return (
      <div
        class={`p-5 rounded-2xl border ${sandboxBorderIntent()} ${sandboxBgIntent()} ${sandboxTextIntent()} ${accentClass()} flex flex-col gap-6 transition-all`}
      >
        {/* 1. Main Card with Heading, Badges, and Action Buttons */}
        <div class="p-4 rounded-xl border border-default bg-elevated shadow-sm flex flex-col gap-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-bold text-base text-highlighted">Surface & Card Component</h3>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--rl-bg)] text-white capitalize">
                  {sandboxAccentColor()}
                </span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold border border-[var(--rl-border)] text-[var(--rl-text)]">
                  Outline
                </span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--rl-bg)]/15 text-[var(--rl-text)]">
                  Subtle
                </span>
              </div>
              <p class="text-xs text-muted mt-1">
                Testing <code class="font-mono text-primary">{sandboxBgIntent()}</code> with{" "}
                <code class="font-mono text-primary">{sandboxTextIntent()}</code> and{" "}
                <code class="font-mono text-primary">.{accentClass()}</code>.
              </p>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div class="flex flex-wrap items-center gap-2 pt-1 border-t border-default/40">
            <button
              type="button"
              class="px-3 py-1.5 text-xs font-bold rounded-lg bg-[var(--rl-bg)] text-white hover:bg-[var(--rl-bg-hover)] shadow-xs transition-colors"
            >
              Solid Button
            </button>
            <button
              type="button"
              class="px-3 py-1.5 text-xs font-bold rounded-lg border border-[var(--rl-border)] text-[var(--rl-text)] hover:bg-[var(--rl-bg)]/10 transition-colors"
            >
              Outline Button
            </button>
            <button
              type="button"
              class="px-3 py-1.5 text-xs font-bold rounded-lg bg-[var(--rl-bg)]/12 text-[var(--rl-text)] hover:bg-[var(--rl-bg)]/20 transition-colors"
            >
              Soft Button
            </button>
            <button
              type="button"
              class="px-3 py-1.5 text-xs font-bold rounded-lg text-[var(--rl-text)] hover:bg-[var(--rl-bg)]/10 transition-colors"
            >
              Ghost
            </button>
            <button
              type="button"
              class="px-2 py-1.5 text-xs font-bold text-[var(--rl-text)] underline hover:opacity-80"
            >
              Link Action
            </button>
          </div>
        </div>

        {/* 2. Tabs Component Preview */}
        <div class="flex flex-col gap-2">
          <span class="text-[11px] font-bold text-muted uppercase tracking-wider">
            RLTabs Component (Pill & Underline)
          </span>
          <div class="flex flex-col gap-3 p-3 rounded-xl border border-default bg-elevated">
            {/* Pill Tabs */}
            <div class="flex items-center gap-1 bg-muted/60 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setSandboxActiveTab(0)}
                class={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  sandboxActiveTab() === 0
                    ? "bg-default text-highlighted shadow-xs"
                    : "text-muted hover:text-highlighted"
                }`}
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => setSandboxActiveTab(1)}
                class={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  sandboxActiveTab() === 1
                    ? "bg-default text-highlighted shadow-xs"
                    : "text-muted hover:text-highlighted"
                }`}
              >
                Analytics
              </button>
              <button
                type="button"
                onClick={() => setSandboxActiveTab(2)}
                class={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  sandboxActiveTab() === 2
                    ? "bg-default text-highlighted shadow-xs"
                    : "text-muted hover:text-highlighted"
                }`}
              >
                Settings
              </button>
            </div>

            {/* Underline Tabs */}
            <div class="flex items-center gap-4 border-b border-default text-xs font-semibold">
              <span class="border-b-2 border-[var(--rl-border)] text-[var(--rl-text)] pb-1.5">
                Active Tab
              </span>
              <span class="text-muted pb-1.5 hover:text-highlighted cursor-pointer">
                Inactive Tab
              </span>
              <span class="text-dimmed pb-1.5">Disabled Tab</span>
            </div>
          </div>
        </div>

        {/* 3. Stepper Component Preview */}
        <div class="flex flex-col gap-2">
          <span class="text-[11px] font-bold text-muted uppercase tracking-wider">
            RLStepper Component
          </span>
          <div class="p-3 rounded-xl border border-default bg-elevated flex items-center justify-between gap-2">
            {/* Step 1: Completed */}
            <div class="flex items-center gap-2">
              <div class="size-7 rounded-full bg-[var(--rl-bg)] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                ✓
              </div>
              <div class="flex flex-col">
                <span class="text-xs font-bold text-highlighted">Account</span>
                <span class="text-[10px] text-dimmed">Completed</span>
              </div>
            </div>

            <div class="flex-1 h-0.5 bg-[var(--rl-bg)] mx-2" />

            {/* Step 2: Active */}
            <div class="flex items-center gap-2">
              <div class="size-7 rounded-full bg-[var(--rl-bg)] text-white flex items-center justify-center text-xs font-bold shadow-xs ring-2 ring-[var(--rl-ring)]/40">
                2
              </div>
              <div class="flex flex-col">
                <span class="text-xs font-bold text-highlighted">Profile</span>
                <span class="text-[10px] text-muted">In Progress</span>
              </div>
            </div>

            <div class="flex-1 h-0.5 bg-muted mx-2" />

            {/* Step 3: Upcoming */}
            <div class="flex items-center gap-2">
              <div class="size-7 rounded-full bg-muted border border-default text-muted flex items-center justify-center text-xs font-bold">
                3
              </div>
              <div class="flex flex-col">
                <span class="text-xs text-muted">Finish</span>
                <span class="text-[10px] text-dimmed">Pending</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Form Controls, Recessed Wells, and Floating Popover */}
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Form Controls Column */}
          <div class="p-3.5 rounded-xl border border-default bg-elevated flex flex-col gap-3">
            <span class="text-[11px] font-bold text-muted uppercase tracking-wider">
              Form Inputs & Wells
            </span>

            {/* Text Input with Sunken Well */}
            <div class="flex flex-col gap-1">
              <label class="text-xs font-bold text-toned">Search Query</label>
              <div class="relative">
                <input
                  type="text"
                  value="Rimelight UI"
                  class="w-full bg-muted border border-default rounded-lg px-3 py-1.5 text-xs text-highlighted focus:outline-none focus:ring-2 focus:ring-[var(--rl-ring)]"
                />
              </div>
            </div>

            {/* Checkbox & Radio Controls */}
            <div class="flex items-center gap-4 pt-1">
              <label class="flex items-center gap-2 text-xs font-medium text-default cursor-pointer">
                <input type="checkbox" checked class="size-4 rounded accent-[var(--rl-bg)]" />
                <span>Remember me</span>
              </label>

              <label class="flex items-center gap-2 text-xs font-medium text-default cursor-pointer">
                <input type="radio" checked class="size-4 accent-[var(--rl-bg)]" />
                <span>Option A</span>
              </label>
            </div>
          </div>

          {/* Floating Popover / Dropdown Menu Preview */}
          <div class="p-3.5 rounded-xl border border-default bg-elevated flex flex-col gap-2.5">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold text-muted uppercase tracking-wider">
                RLPopover / Dropdown
              </span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-tooltip text-inverted">
                Tooltip Peak
              </span>
            </div>

            {/* Floating Menu simulation */}
            <div class="p-1 rounded-lg border border-default bg-elevated shadow-md flex flex-col gap-0.5 text-xs">
              <div class="px-2.5 py-1.5 rounded-md hover:bg-accented hover:text-highlighted flex items-center justify-between cursor-pointer">
                <span class="font-medium text-highlighted">Profile Settings</span>
                <span class="text-[10px] font-mono text-dimmed">⌘P</span>
              </div>
              <div class="px-2.5 py-1.5 rounded-md hover:bg-accented hover:text-highlighted flex items-center justify-between cursor-pointer">
                <span class="font-medium text-highlighted">Appearance</span>
                <span class="text-[10px] font-mono text-dimmed">⌘T</span>
              </div>
              <div class="h-px border-t border-default my-0.5" />
              <div class="px-2.5 py-1.5 rounded-md text-error-600 hover:bg-error-500/10 flex items-center justify-between cursor-pointer">
                <span>Sign Out</span>
                <span class="text-[10px] font-mono text-dimmed">⌥Q</span>
              </div>
            </div>
          </div>
        </div>

        {/* 5. RLQuote & RLCallout / Toast Preview */}
        <div class="flex flex-col gap-3">
          {/* Callout / Toast */}
          <div class="p-3.5 rounded-xl border border-[var(--rl-border)]/30 bg-[var(--rl-bg)]/10 flex items-center justify-between gap-3">
            <div class="flex items-center gap-2.5">
              <span class="size-2 rounded-full bg-[var(--rl-bg)]" />
              <div class="flex flex-col">
                <span class="text-xs font-bold text-[var(--rl-text)]">System Notification</span>
                <span class="text-[11px] text-muted">
                  All components dynamically resolve against theme.
                </span>
              </div>
            </div>
            <span class="text-xs font-bold text-[var(--rl-text)] underline cursor-pointer">
              Dismiss
            </span>
          </div>

          {/* Blockquote */}
          <div class="border-y-2 border-default py-3 px-4 flex flex-col">
            <blockquote class="text-sm font-medium italic text-highlighted">
              "The design system should make doing the right thing effortless and accessible by
              default."
            </blockquote>
            <span class="text-xs font-mono text-right text-muted mt-1">
              — Rimelight UI Core Team
            </span>
          </div>
        </div>
      </div>
    );
  };

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
            onClick={() => setActiveTab("sandbox")}
            class={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              activeTab() === "sandbox"
                ? "bg-default text-highlighted shadow-xs"
                : "text-muted hover:text-highlighted"
            }`}
          >
            1. Dual Sandbox (All Comps)
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
            2. Intents (8×8 Table)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("palettes")}
            class={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              activeTab() === "palettes"
                ? "bg-default text-highlighted shadow-xs"
                : "text-muted hover:text-highlighted"
            }`}
          >
            3. Palettes
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
            4. Shade Matrix (11×11)
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
            5. Component Variants
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

      {/* 1. DUAL SANDBOX TAB (ALL COMPONENTS SIDE BY SIDE) */}
      <Show when={activeTab() === "sandbox"}>
        <div class="flex flex-col gap-5">
          {/* Controls Bar */}
          <div class="flex flex-wrap gap-3 p-3 bg-muted rounded-xl text-xs font-mono">
            <div class="flex items-center gap-1.5">
              <span class="text-muted">Surface BG:</span>
              <select
                value={sandboxBgIntent()}
                onChange={(e) => setSandboxBgIntent(e.currentTarget.value)}
                class="bg-default border border-default rounded px-2 py-1 text-highlighted font-semibold"
              >
                <For each={INTENTS}>
                  {(intent) => <option value={`bg-${intent}`}>bg-{intent}</option>}
                </For>
              </select>
            </div>

            <div class="flex items-center gap-1.5">
              <span class="text-muted">Text Intent:</span>
              <select
                value={sandboxTextIntent()}
                onChange={(e) => setSandboxTextIntent(e.currentTarget.value)}
                class="bg-default border border-default rounded px-2 py-1 text-highlighted font-semibold"
              >
                <For each={INTENTS}>
                  {(intent) => <option value={`text-${intent}`}>text-{intent}</option>}
                </For>
              </select>
            </div>

            <div class="flex items-center gap-1.5">
              <span class="text-muted">Border Intent:</span>
              <select
                value={sandboxBorderIntent()}
                onChange={(e) => setSandboxBorderIntent(e.currentTarget.value)}
                class="bg-default border border-default rounded px-2 py-1 text-highlighted font-semibold"
              >
                <For each={INTENTS}>
                  {(intent) => <option value={`border-${intent}`}>border-{intent}</option>}
                </For>
              </select>
            </div>

            <div class="flex items-center gap-1.5">
              <span class="text-muted">Accent Color:</span>
              <select
                value={sandboxAccentColor()}
                onChange={(e) => setSandboxAccentColor(e.currentTarget.value)}
                class="bg-default border border-default rounded px-2 py-1 text-highlighted capitalize font-semibold"
              >
                <For each={PALETTES}>{(pal) => <option value={pal}>{pal}</option>}</For>
              </select>
            </div>
          </div>

          {/* Side by side light/dark container */}
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Forced Light Mode Viewport */}
            <div
              data-theme="light"
              class="p-5 rounded-2xl border border-neutral-300 bg-white text-neutral-900 flex flex-col gap-4 shadow-xl relative overflow-hidden"
              style={{ "color-scheme": "light" }}
            >
              <div class="flex items-center justify-between pb-3 border-b border-neutral-200">
                <div class="flex items-center gap-2">
                  <span class="size-2.5 rounded-full bg-amber-500" />
                  <span class="text-xs font-mono font-bold uppercase tracking-wider text-neutral-900">
                    Forced Light Mode Viewport
                  </span>
                </div>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                  data-theme="light"
                </span>
              </div>

              {renderSandboxShowcase()}
            </div>

            {/* Forced Dark Mode Viewport */}
            <div
              data-theme="dark"
              class="p-5 rounded-2xl border border-neutral-800 bg-neutral-950 text-neutral-50 flex flex-col gap-4 shadow-xl relative overflow-hidden"
              style={{ "color-scheme": "dark" }}
            >
              <div class="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div class="flex items-center gap-2">
                  <span class="size-2.5 rounded-full bg-indigo-400" />
                  <span class="text-xs font-mono font-bold uppercase tracking-wider text-neutral-100">
                    Forced Dark Mode Viewport
                  </span>
                </div>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 text-neutral-400">
                  data-theme="dark"
                </span>
              </div>

              {renderSandboxShowcase()}
            </div>
          </div>
        </div>
      </Show>

      {/* 2. INTENTS (8x8) TAB */}
      <Show when={activeTab() === "intents"}>
        <div class="flex flex-col gap-6">
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
                        {(col) => {
                          const isInvalid = isInvalidInvertedPair(row, col);
                          return (
                            <td class="p-1 border-r border-default last:border-r-0">
                              <div
                                class={`p-2 rounded border border-default bg-${row} text-${col} flex flex-col justify-between h-14 cursor-pointer relative overflow-hidden`}
                                onClick={() => copyToClipboard(`bg-${row} text-${col}`)}
                                title={
                                  isInvalid
                                    ? `Warning: Inverted mismatch (bg-${row} + text-${col})`
                                    : `bg-${row} text-${col}`
                                }
                              >
                                <div class="flex items-center justify-between">
                                  <span class="text-xs font-bold font-sans">Aa Sample</span>
                                  <Show when={isInvalid}>
                                    <span class="text-[7px] font-mono font-black uppercase px-1 rounded bg-red-500/20 text-red-500 border border-red-500/40">
                                      Mismatch
                                    </span>
                                  </Show>
                                </div>
                                <span class="text-[8px] font-mono opacity-60">
                                  {row} / {col}
                                </span>
                              </div>
                            </td>
                          );
                        }}
                      </For>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>

          {/* Surface Elevation Stacking Example */}
          <div class="flex flex-col gap-3 pt-2 border-t border-default">
            <span class="text-xs font-mono font-bold text-highlighted">
              Surface Elevation Stacking (Canvas &rarr; Card &rarr; Recessed Well &rarr; Active
              Item):
            </span>

            {/* Level 1: Canvas */}
            <div class="bg-default border border-default rounded-2xl p-5 shadow-xs flex flex-col gap-4">
              <div class="flex items-center justify-between">
                <span class="text-xs font-mono font-bold text-muted">
                  Canvas Surface (bg-default)
                </span>
                <span class="text-xs text-default font-semibold">Body Copy (text-default)</span>
              </div>

              {/* Level 2: Elevated Card */}
              <div class="bg-elevated border border-default rounded-xl p-4 shadow-sm flex flex-col gap-3">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-mono font-bold text-highlighted">
                    Elevated Card (bg-elevated)
                  </span>
                  <span class="text-xs text-muted">Card Subtitle (text-muted)</span>
                </div>

                {/* Level 3: Muted Recessed Well */}
                <div class="bg-muted border border-default rounded-lg p-3 flex items-center justify-between">
                  <span class="text-xs font-mono text-muted">
                    Recessed Well / Code / Search (bg-muted)
                  </span>
                  <span class="text-xs text-dimmed font-mono">Placeholder (text-dimmed)</span>
                </div>

                {/* Level 4: Accented Active Sub-Surface */}
                <div class="bg-accented border border-default rounded-lg p-3 flex items-center justify-between">
                  <span class="text-xs font-mono font-bold text-highlighted">
                    Active Item / Sub-Surface (bg-accented)
                  </span>
                  <span class="text-xs font-bold text-highlighted">
                    Active Heading (text-highlighted)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Show>

      {/* 3. PALETTES TAB */}
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
                      const varName = `--rl-${pal}-${s}`;
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
                      );
                    }}
                  </For>
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>

      {/* 4. SHADE MATRIX (11x11) TAB */}
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
                  {(bgShade) => (
                    <tr class="border-b border-default last:border-b-0">
                      <td class="p-1.5 text-xs font-mono font-bold text-highlighted border-r border-default bg-muted/40">
                        {bgShade}
                      </td>
                      <For each={SHADES}>
                        {(txtShade) => (
                          <td class="p-0.5 border-r border-default last:border-r-0">
                            <div
                              class="h-10 flex flex-col justify-between items-center p-1 text-center cursor-pointer transition-transform hover:scale-105"
                              style={{
                                background: `var(--rl-${selectedMatrixPalette()}-${bgShade})`,
                                color: `var(--rl-${selectedMatrixPalette()}-${txtShade})`,
                              }}
                              onClick={() =>
                                copyToClipboard(
                                  `bg-${selectedMatrixPalette()}-${bgShade} text-${selectedMatrixPalette()}-${txtShade}`,
                                )
                              }
                              title={`bg-${selectedMatrixPalette()}-${bgShade} text-${selectedMatrixPalette()}-${txtShade}`}
                            >
                              <span class="text-xs font-bold">Aa</span>
                              <span class="text-[7px] font-mono opacity-70">
                                {bgShade}/{txtShade}
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
        </div>
      </Show>

      {/* 5. COMPONENT VARIANTS TAB */}
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
                const colorClass = `rl-color-${pal}`;
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
                );
              }}
            </For>
          </div>
        </div>
      </Show>
    </div>
  );
}
