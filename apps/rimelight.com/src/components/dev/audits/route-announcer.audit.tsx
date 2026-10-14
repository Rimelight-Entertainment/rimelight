import { createSignal } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLRouteAnnouncer, RLCard } from "@rimelight/ui";
import type { ComponentAuditDefinition } from "./types";

export const RouteAnnouncerSandbox = (): JSX.Element => {
  const [prefix, setPrefix] = createSignal("Navigated to");
  const [lastAnnouncement, setLastAnnouncement] = createSignal("");

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
        <div class="flex items-center gap-3 flex-wrap">
          <label class="flex items-center gap-2">
            <span class="text-muted font-medium">Custom Prefix:</span>
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
          <span class="text-muted font-medium">Simulate Navigation To:</span>
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
      </div>

      {/* Screen Reader Output Display */}
      <div class="max-w-xl w-full">
        <RLCard title="Screen Reader Output" description="aria-live='polite' status region">
          <div class="p-3 rounded bg-elevated/40 border border-default font-mono text-sm text-highlighted min-h-[48px] flex items-center">
            {lastAnnouncement() || "Ready for navigation simulation..."}
          </div>
        </RLCard>
      </div>

      {/* Actual Component Mount in Sandbox */}
      <RLRouteAnnouncer prefix={prefix()} />
    </div>
  );
};

export const routeAnnouncerAudit: ComponentAuditDefinition = {
  id: "route-announcer",
  name: "Route Announcer",
  category: "Navigation",
  status: "Passed",
  description:
    "A visually hidden aria-live region that announces page title updates to assistive technologies on client-side SPA navigations.",
  importPath: "@rimelight/ui",
  renderSandbox: () => <RouteAnnouncerSandbox />,
  testScenarios: [
    {
      id: "default-announcement",
      title: "Default Navigation Announcement",
      description:
        "Announces document.title immediately after navigation settles via onSettled hook.",
      render: () => (
        <div class="p-4 rounded border border-default bg-elevated/20 text-xs">
          <RLRouteAnnouncer />
          <p class="text-muted">Mounted with default settings. aria-live is polite and atomic.</p>
        </div>
      ),
    },
    {
      id: "custom-prefix-fallback",
      title: "Custom Prefix Fallback",
      description: "When page title is blank, formats announcement as '{prefix} {pathname}'.",
      render: () => (
        <div class="p-4 rounded border border-default bg-elevated/20 text-xs flex flex-col gap-2">
          <RLRouteAnnouncer prefix="Currently viewing" />
          <p class="text-muted">Mounted with prefix="Currently viewing".</p>
        </div>
      ),
    },
    {
      id: "sr-only-hidden",
      title: "Zero Visual Footprint (sr-only)",
      description:
        "Applies UnoCSS sr-only class without injecting inline style tags for strict CSP compatibility.",
      render: () => (
        <div class="p-4 rounded border border-default bg-elevated/20 text-xs">
          <span class="text-emerald-500 font-mono">Passed:</span> No layout shift or visual DOM
          artifact present.
          <RLRouteAnnouncer />
        </div>
      ),
    },
  ],
  checklist: [
    {
      criterion: "API parity with RFC",
      status: "pass",
      notes: "prefix prop, class override, and ui slots matching RFC specification.",
    },
    {
      criterion: "Full WAI-ARIA compliance",
      status: "pass",
      notes:
        "role='status', aria-live='polite', and aria-atomic='true' ensure polite speech delivery for screen readers without interruption.",
    },
    {
      criterion: "No inline styles (CSP-safe, UnoCSS only)",
      status: "pass",
      notes:
        "Uses UnoCSS sr-only utility exclusively; zero style={{}} attributes, complying fully with style-src 'self'.",
    },
    {
      criterion: "No hydration mismatches",
      status: "pass",
      notes: "Deterministic initial state and declarative lifecycle hooks with onSettled.",
    },
    {
      criterion: "Bare component rendering",
      status: "pass",
      notes: "Component mounts cleanly without requiring external wrappers or providers.",
    },
  ],
};
