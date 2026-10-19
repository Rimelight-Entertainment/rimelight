import { createSignal, For, Show } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLMain } from "@rimelight/ui/components/main/RLMain.tsx";
import type { ComponentAuditDefinition } from "./types";

const TAGS = ["main", "div", "section", "article"] as const;
const HEIGHT_CAP = "max-h-64 overflow-y-auto";

const MainContent = (): JSX.Element => (
  <div class="flex flex-col items-center justify-center gap-2 p-xl text-center">
    <h1 class="text-xl font-bold text-highlighted">Main content area</h1>
    <p class="text-sm text-muted max-w-md">
      The main element fills the available viewport height below the header via the
      --rl-header-height CSS variable.
    </p>
  </div>
);

export const MainSandbox = (): JSX.Element => {
  const [tag, setTag] = createSignal<(typeof TAGS)[number]>("main");
  const [hasContent, setHasContent] = createSignal(true);
  const [customClass, setCustomClass] = createSignal("");
  const [overrideHeight, setOverrideHeight] = createSignal(true);

  return (
    <div class="flex flex-col gap-6">
      {/* Control Toolbar */}
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-4 text-xs">
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">Element (as):</span>
          <For each={TAGS}>
            {(t) => (
              <button
                type="button"
                onClick={() => setTag(t)}
                class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                  tag() === t
                    ? "bg-primary text-inverted font-bold"
                    : "bg-elevated text-muted hover:text-highlighted border border-default"
                }`}
              >
                {t}
              </button>
            )}
          </For>
        </div>

        <div class="flex items-center gap-3">
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={hasContent()}
              onInput={(e) => setHasContent(e.currentTarget.checked)}
              onChange={(e) => setHasContent(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">Children</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={overrideHeight()}
              onInput={(e) => setOverrideHeight(e.currentTarget.checked)}
              onChange={(e) => setOverrideHeight(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">Cap height (ui override)</span>
          </label>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-muted">Class:</span>
          <input
            type="text"
            value={customClass()}
            onInput={(e) => setCustomClass(e.currentTarget.value)}
            placeholder="e.g. bg-elevated/10 rounded-xl border border-default"
            class="px-2 py-1 rounded bg-elevated border border-default text-highlighted text-xs w-96"
          />
        </div>
      </div>

      {/* Preview (bare) */}
      <Show when={hasContent()}>
        <RLMain
          as={tag()}
          class={customClass() || undefined}
          ui={overrideHeight() ? { root: HEIGHT_CAP } : undefined}
        >
          <MainContent />
        </RLMain>
      </Show>
      <Show when={!hasContent()}>
        <RLMain
          as={tag()}
          class={customClass() || undefined}
          ui={overrideHeight() ? { root: HEIGHT_CAP } : undefined}
        />
      </Show>
    </div>
  );
};

export const mainAudit: ComponentAuditDefinition = {
  id: "main",
  name: "Main",
  category: "Layout",
  status: "Auditing",
  description:
    "A main element that fills the available viewport height below the header, using the --rl-header-height CSS variable, with polymorphic rendering, ui slot overrides, and attribute forwarding.",
  importPath: "@rimelight/ui/components/main/RLMain.tsx",
  renderSandbox: () => <MainSandbox />,
  testScenarios: [
    {
      id: "default-main",
      title: "Default <main> Element",
      description:
        'Renders a bare <main> with data-slot="root" and the viewport-height min-h class computed from --rl-header-height. Intentionally uncapped to verify the true fill behavior.',
      render: () => (
        <RLMain>
          <MainContent />
        </RLMain>
      ),
    },
    {
      id: "default-slot-children",
      title: "Default Slot (children)",
      description:
        "The single default slot accepts arbitrary children — elements, text, and nested components render inside the root.",
      render: () => (
        <RLMain class="border border-default">
          <nav aria-label="Slot breadcrumb" class="p-md border-b border-default text-xs text-muted">
            Slot content: nav element
          </nav>
          <h2 class="p-md text-lg font-semibold text-highlighted">Slot content: heading</h2>
          <p class="px-md pb-md text-sm text-muted">Slot content: paragraph with text.</p>
        </RLMain>
      ),
    },
    {
      id: "polymorphic-as",
      title: "Polymorphic Element (as prop)",
      description:
        "Renders as div, section, or article while preserving theme classes. Height capped via the ui override for readability.",
      render: () => (
        <>
          <For each={TAGS}>
            {(t) => (
              <RLMain as={t} ui={{ root: HEIGHT_CAP }} class="border border-default bg-elevated/10">
                <span class="block p-md text-xs font-mono text-muted">rendered as &lt;{t}&gt;</span>
              </RLMain>
            )}
          </For>
        </>
      ),
    },
    {
      id: "class-and-ui-overrides",
      title: "Custom Class & ui Slot Overrides",
      description:
        "class merges onto the resolved theme classes; ui.root overrides or extends the root slot (string and functional forms).",
      render: () => (
        <>
          <RLMain class="border-2 border-primary rounded-xl bg-primary/5">
            <span class="block p-md text-xs text-muted">custom class merged with theme base</span>
          </RLMain>
          <RLMain ui={{ root: "border-2 border-secondary rounded-xl bg-secondary/5" }}>
            <span class="block p-md text-xs text-muted">ui.root string override</span>
          </RLMain>
          <RLMain
            ui={{
              root: (base: string) => `${base} border-2 border-success rounded-xl bg-success/5`,
            }}
          >
            <span class="block p-md text-xs text-muted">ui.root functional override</span>
          </RLMain>
        </>
      ),
    },
    {
      id: "attribute-forwarding",
      title: "Attribute & Accessibility Forwarding",
      description:
        "Forwards id, role, aria-label, and data attributes to the root element; internal props (as, ui, class) never leak to the DOM.",
      render: () => (
        <RLMain
          id="audit-main"
          role="region"
          aria-label="Application main content"
          data-testid="main-forwarding"
          class="border border-default"
        >
          <span class="block p-md text-xs text-muted">
            inspect the DOM for forwarded attributes
          </span>
        </RLMain>
      ),
    },
    {
      id: "empty-main",
      title: "Empty Main",
      description: "Renders a self-contained empty <main> with no children.",
      render: () => <RLMain class="border border-dashed border-default" />,
    },
  ],
  checklist: [
    {
      criterion: "Full API parity (as, ui, class, children)",
      status: "pass",
      notes:
        'Supports as (default "main"), ui.root slot override, class, and default children slot.',
    },
    {
      criterion: "Slot pattern parity (default slot only)",
      status: "pass",
      notes: "Children render inside the single root element.",
    },
    {
      criterion: "Polymorphic as prop",
      status: "pass",
      notes: 'Root renders props.as ?? "main" via dynamic(); explicit as="main" renders <main>.',
    },
    {
      criterion: "Viewport-height theme contract",
      status: "pass",
      notes:
        "Theme applies min-h-[calc(100vh-var(--rl-header-height))] entirely from main.theme.ts; pairs with the header component's height variable.",
    },
    {
      criterion: "Full WAI-ARIA compliance",
      status: "pass",
      notes: "Semantic <main> landmark by default; all aria attributes forwarded untouched.",
    },
    {
      criterion: "No inline styles (CSP-safe, UnoCSS only)",
      status: "pass",
      notes: "All styling lives in main.theme.ts; no style attributes.",
    },
    {
      criterion: "No innerHTML / dangerouslySetInnerHTML",
      status: "pass",
      notes: "Pure Solid JSX rendering.",
    },
    {
      criterion: "No hydration mismatches",
      status: "pass",
      notes:
        "Deterministic dynamic() tag and createMemo() class resolution; no random or time-based values.",
    },
    {
      criterion: "Audited components render bare (no harness wrappers)",
      status: "pass",
      notes:
        "Scenario renders return RLMain directly (fragments only where multiple bare instances are shown).",
    },
  ],
};
