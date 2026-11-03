import { createSignal, For, Show } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLRouteAnnouncer } from "@rimelight/ui/components/route-announcer/RLRouteAnnouncer.tsx";
import type { RLRouteAnnouncerProgressSize } from "@rimelight/ui/components/route-announcer/route-announcer.types.ts";
import { AUDIT_COLORS, type ComponentAuditDefinition } from "./types";
import { t } from "@rimelight/i18n";

const SIZES: RLRouteAnnouncerProgressSize[] = ["xs", "sm", "md", "lg"];
const COLORS = AUDIT_COLORS;

export const RouteAnnouncerSandbox = (): JSX.Element => {
  const [prefix, setPrefix] = createSignal("Navigated to");
  const [lastAnnouncement, setLastAnnouncement] = createSignal("");
  const [progressEnabled, setProgressEnabled] = createSignal(true);
  const [selectedColor, setSelectedColor] = createSignal<string>("primary");
  const [selectedSize, setSelectedSize] = createSignal<RLRouteAnnouncerProgressSize>("sm");
  const [isSimulatedRouting, setIsSimulatedRouting] = createSignal(true);

  const triggerSimulation = (title: string, path: string) => {
    if (typeof document !== "undefined") {
      document.title = title;
    }
    const resolved = title || `${prefix()} ${path}`.trim();
    setLastAnnouncement(resolved);
  };

  return (
    <div class="flex flex-col gap-6">
      {/* Control Toolbar */}
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-col gap-4 text-xs">
        {/* Announcer Controls */}
        <div class="flex items-center gap-3 flex-wrap">
          <label class="flex items-center gap-2">
            <span class="text-muted font-medium">{t("app.text.custom-prefix")}</span>
            <input
              type="text"
              value={prefix()}
              onInput={(e) => setPrefix(e.currentTarget.value)}
              class="px-2 py-1 rounded bg-elevated border border-default font-mono text-xs text-foreground focus:outline-none focus:border-primary"
            />
          </label>
        </div>

        {/* Quick Nav Simulation Buttons */}
        <div class="flex flex-col gap-2">
          <span class="text-muted font-medium">{t("app.text.simulate-navigation")}</span>
          <div class="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => triggerSimulation("Home | Rimelight", "/")}
              class="px-2.5 py-1 rounded bg-elevated border border-default hover:border-primary font-mono text-xs transition-colors"
            >
              / (Home)
            </button>
            <button
              type="button"
              onClick={() =>
                triggerSimulation("Company Wiki & Lore", "/franchises/grand-tale/wiki")
              }
              class="px-2.5 py-1 rounded bg-elevated border border-default hover:border-primary font-mono text-xs transition-colors"
            >
              /wiki (Grand Tale)
            </button>
            <button
              type="button"
              onClick={() => triggerSimulation("", "/company/legal/privacy-policy")}
              class="px-2.5 py-1 rounded bg-elevated border border-default hover:border-primary font-mono text-xs transition-colors"
            >
              /legal (Empty Title Fallback)
            </button>
          </div>
        </div>

        <div class="border-t border-default/50 pt-3 flex flex-col gap-3">
          {/* Progress Bar Toggle */}
          <div class="flex items-center gap-4 flex-wrap">
            <label class="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={progressEnabled()}
                onInput={(e) => setProgressEnabled(e.currentTarget.checked)}
                onChange={(e) => setProgressEnabled(e.currentTarget.checked)}
                class="rounded border-default"
              />
              <span class="text-muted font-medium">{t("app.text.enable-visual-progress-bar")}</span>
            </label>

            <Show when={progressEnabled()}>
              <button
                type="button"
                onClick={() => setIsSimulatedRouting((prev) => !prev)}
                class={`px-2.5 py-0.5 rounded text-xs font-mono font-medium transition-colors border ${
                  isSimulatedRouting()
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                    : "bg-rose-500/20 text-rose-400 border-rose-500/40"
                }`}
              >
                {isSimulatedRouting() ? "Simulated Routing: ACTIVE" : "Simulated Routing: IDLE"}
              </button>
            </Show>
          </div>

          <Show when={progressEnabled()}>
            {/* Colors */}
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-muted font-medium mr-1">{t("app.text.progress-color")}</span>
              <For each={COLORS}>
                {(c) => (
                  <button
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                      selectedColor() === c
                        ? "bg-primary text-inverted font-bold"
                        : "bg-elevated text-muted hover:text-highlighted border border-default"
                    }`}
                  >
                    {c}
                  </button>
                )}
              </For>
            </div>

            {/* Sizes */}
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-muted font-medium mr-1">{t("app.text.progress-size")}</span>
              <For each={SIZES}>
                {(s) => (
                  <button
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                      selectedSize() === s
                        ? "bg-primary text-inverted font-bold"
                        : "bg-elevated text-muted hover:text-highlighted border border-default"
                    }`}
                  >
                    {s} ({s === "xs" ? "h-0.5" : s === "sm" ? "h-1" : s === "md" ? "h-1.5" : "h-2"})
                  </button>
                )}
              </For>
            </div>
          </Show>
        </div>
      </div>

      {/* Screen Reader Output Display */}
      <div class="p-6 rounded-xl border border-default bg-elevated/10 flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-mono uppercase tracking-wider text-muted">
            Screen Reader Announcement (aria-live='polite')
          </span>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            role="status" aria-atomic="true"
          </span>
        </div>
        <div class="p-3 rounded bg-elevated/40 border border-default font-mono text-sm text-highlighted min-h-[48px] flex items-center">
          {lastAnnouncement() || "Ready for navigation simulation..."}
        </div>
        <p class="text-[11px] text-muted">
          Screen readers will announce page updates when navigation settles.
        </p>
      </div>

      {/* Simulated Top Loading Bar Preview */}
      <Show when={progressEnabled()}>
        <div
          class={`p-6 rounded-xl border border-default bg-elevated/10 flex flex-col gap-3 rl-color-${selectedColor()}`}
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-mono uppercase tracking-wider text-muted">
              Visual Navigation Progress Preview
            </span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/30">
              role="progressbar" size="{selectedSize()}"
            </span>
          </div>

          <div class="relative w-full h-20 rounded border border-default bg-elevated/30 overflow-hidden flex flex-col">
            <Show when={isSimulatedRouting()}>
              <div
                role="progressbar"
                aria-label={t("app.text.simulated-loading")}
                class={`w-full overflow-hidden ${
                  selectedSize() === "xs"
                    ? "h-0.5"
                    : selectedSize() === "sm"
                      ? "h-1"
                      : selectedSize() === "md"
                        ? "h-1.5"
                        : "h-2"
                }`}
              >
                <div class="h-full w-full origin-left-right animate-pulse bg-[var(--rl-bg)]" />
              </div>
            </Show>
            <div class="flex-1 flex items-center justify-center p-3 text-center">
              <span class="text-xs text-muted font-mono">
                {isSimulatedRouting()
                  ? "Simulating active async page routing..."
                  : "Page routing completed. Progress bar unmounted."}
              </span>
            </div>
          </div>
        </div>
      </Show>

      {/* Actual Component Mount in Sandbox */}
      <RLRouteAnnouncer
        prefix={prefix()}
        progress={
          progressEnabled()
            ? {
                color: selectedColor(),
                size: selectedSize(),
              }
            : false
        }
      />
    </div>
  );
};

export const routeAnnouncerAudit: ComponentAuditDefinition = {
  id: "route-announcer",
  name: "Route Announcer",
  category: "Navigation",
  status: "Passed",
  description:
    "Unified routing feedback component providing accessible aria-live screen reader announcements and an optional Nuxt-style top progress bar during async page transitions.",
  importPath: "@rimelight/ui",
  renderSandbox: () => <RouteAnnouncerSandbox />,
  testScenarios: [
    {
      id: "unified-default",
      get title() {
        return t("app.text.default-navigation-feedback");
      },
      get description() {
        return t("app.text.screen-reader-live-announcements-enabled-with-de");
      },
      render: () => (
        <div class="p-4 rounded border border-default bg-elevated/20 text-xs">
          <RLRouteAnnouncer />
          <p class="text-muted">
            {"Mounted with default settings. aria-live is polite and atomic."}
          </p>
        </div>
      ),
    },
    {
      id: "announcer-only",
      get title() {
        return t("app.text.announcer-only-headless");
      },
      get description() {
        return t("app.text.visual-progress-bar-disabled-via-progress-false");
      },
      render: () => (
        <div class="p-4 rounded border border-default bg-elevated/20 text-xs">
          <RLRouteAnnouncer progress={false} />
          <p class="text-muted">Mounted with progress=false for zero visual footprint.</p>
        </div>
      ),
    },
    {
      id: "custom-styling",
      get title() {
        return t("app.text.configured-progress-color-size");
      },
      description:
        "Supports discrete semantic sizes (xs to lg) and all design system theme colors.",
      render: () => (
        <div class="p-4 rounded border border-default bg-elevated/20 text-xs flex flex-col gap-2">
          <RLRouteAnnouncer color="secondary" size="md" />
          <p class="text-muted">Customized color='secondary' and size='md'.</p>
        </div>
      ),
    },
  ],
  checklist: [
    {
      criterion: "Unified API parity",
      status: "pass",
      notes: "prefix, progress boolean or options object, color, size, and custom slots.",
    },
    {
      criterion: "Full WAI-ARIA compliance",
      status: "pass",
      notes:
        "aria-live='polite', aria-atomic='true', role='status' for announcer, and role='progressbar' for visual transition feedback.",
    },
    {
      criterion: "100% CSP Safe (Zero Inline Styles)",
      status: "pass",
      notes:
        "All visual bar dimensions handled through UnoCSS semantic sizing classes with color: 'auto' tokens, avoiding style={{}} attributes entirely.",
    },
    {
      criterion: "Conditional DOM Cleanup",
      status: "pass",
      notes: "Visual progress bar unmounts cleanly when routing is idle.",
    },
  ],
};
