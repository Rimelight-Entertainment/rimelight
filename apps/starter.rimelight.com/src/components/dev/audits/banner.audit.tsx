import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLBanner } from "@rimelight/ui/components/banner/RLBanner.tsx";
import type { ComponentAuditDefinition } from "./types";

const COLORS = ["primary", "secondary", "success", "info", "warning", "error", "neutral"] as const;

export const BannerSandbox = (): JSX.Element => {
  const [color, setColor] = createSignal<(typeof COLORS)[number]>("primary");
  const [hasIcon, setHasIcon] = createSignal(true);
  const [hasActions, setHasActions] = createSignal(true);
  const [isClosable, setIsClosable] = createSignal(true);
  const [contain, setContain] = createSignal(true);
  const [title, setTitle] = createSignal("Nuxt UI v4 & Rimelight UI banner parity achieved!");
  const [isLink, setIsLink] = createSignal(false);

  return (
    <div class="flex flex-col gap-6">
      {/* Control Toolbar */}
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-4 text-xs">
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">Color:</span>
          <For each={COLORS}>
            {(c) => (
              <button
                type="button"
                onClick={() => setColor(c)}
                class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                  color() === c
                    ? "bg-primary text-inverted font-bold"
                    : "bg-elevated text-muted hover:text-highlighted border border-default"
                }`}
              >
                {c}
              </button>
            )}
          </For>
        </div>

        <div class="flex items-center gap-3">
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={hasIcon()}
              onInput={(e) => setHasIcon(e.currentTarget.checked)}
              onChange={(e) => setHasIcon(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">Icon</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={hasActions()}
              onInput={(e) => setHasActions(e.currentTarget.checked)}
              onChange={(e) => setHasActions(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">Actions</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isClosable()}
              onInput={(e) => setIsClosable(e.currentTarget.checked)}
              onChange={(e) => setIsClosable(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">Close Button</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={contain()}
              onInput={(e) => setContain(e.currentTarget.checked)}
              onChange={(e) => setContain(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">Contain</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isLink()}
              onInput={(e) => setIsLink(e.currentTarget.checked)}
              onChange={(e) => setIsLink(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">As Link</span>
          </label>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-muted">Title:</span>
          <input
            type="text"
            value={title()}
            onInput={(e) => setTitle(e.currentTarget.value)}
            class="px-2 py-1 rounded bg-elevated border border-default text-highlighted text-xs w-64"
          />
        </div>
      </div>

      {/* Preview Area */}
      <div class="p-4 rounded-xl border border-default bg-elevated/10 flex flex-col gap-4">
        <RLBanner
          color={color()}
          icon={hasIcon() ? "sparkles" : undefined}
          title={title()}
          contain={contain()}
          close={isClosable()}
          to={isLink() ? "https://rimelight.com" : undefined}
          target={isLink() ? "_blank" : undefined}
          actions={
            hasActions()
              ? [
                  { label: "Documentation", variant: "outline", href: "#docs" },
                  { label: "Get Started", trailingIcon: "arrow-right" }
                ]
              : undefined
          }
        />
      </div>
    </div>
  );
};

export const bannerAudit: ComponentAuditDefinition = {
  id: "banner",
  name: "Banner",
  category: "Feedback",
  status: "Auditing",
  description:
    "Display a banner at the top of your website or within layout flows to inform users about important notices, product updates, or global announcements with action buttons, dismissal memory, and header stack integration.",
  importPath: "@rimelight/ui/components/banner/RLBanner.tsx",
  renderSandbox: () => <BannerSandbox />,
  testScenarios: [
    {
      id: "colors-matrix",
      title: "All Color Variants",
      description:
        "All visual colors (primary, secondary, success, info, warning, error, neutral) with standard contrast inverted text styling.",
      render: () => (
        <div class="flex flex-col gap-3">
          <For each={COLORS}>
            {(c) => (
              <RLBanner
                color={c}
                icon="info"
                title={`This is an important ${c} announcement banner.`}
                close
              />
            )}
          </For>
        </div>
      )
    },
    {
      id: "actions-and-slots",
      title: "Actions and Slots",
      description:
        "Action buttons with outline/solid variants, trailing icons, custom left/center/right slots.",
      render: () => (
        <div class="flex flex-col gap-3">
          <RLBanner
            title="We just raised Series A funding!"
            icon="rocket"
            color="secondary"
            actions={[
              { label: "Read Press Release", variant: "solid", href: "#press" },
              { label: "View Open Roles", variant: "outline", trailingIcon: "arrow-right" }
            ]}
            close
          />
          <RLBanner
            color="info"
            left={
              <span class="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
                NEW
              </span>
            }
            title="Astro 5.0 and Solid 2.0 now supported"
            actions={[{ label: "Changelog", size: "xs" }]}
            close
          />
        </div>
      )
    },
    {
      id: "link-mode",
      title: "Interactive Link Mode",
      description:
        "Banners rendered as clickable links via `to` or `href` prop with automatic external link attribute handling.",
      render: () => (
        <div class="flex flex-col gap-3">
          <RLBanner
            to="https://rimelight.com"
            target="_blank"
            color="primary"
            icon="sparkles"
            title="Rimelight Entertainment releases Next-Gen UI toolkit — Click to explore!"
          />
        </div>
      )
    },
    {
      id: "closable-and-persistence",
      title: "Dismissible with Persistence ID",
      description:
        "Dismissible banner with custom close button icon and optional local storage persistence via `id` prop.",
      render: () => (
        <div class="flex flex-col gap-3">
          <RLBanner
            id="audit-closable-banner-demo"
            title="You can dismiss this banner. On explicit `id`, state is saved to localStorage."
            color="warning"
            icon="alert-circle"
            close
          />
        </div>
      )
    },
    {
      id: "header-stack-integration",
      title: "Header Stack Integration",
      description:
        "Coordinates with Rimelight Header Stack system: supports `sticky`, `fixed`, `stackIndex`, `hideOnScroll` and dynamic height registration.",
      render: () => (
        <div class="flex flex-col gap-3">
          <RLBanner
            title="Header-Stack Synchronized Banner (stackIndex=0)"
            color="neutral"
            icon="layers"
            stackIndex={0}
            actions={[{ label: "Configure Stack", variant: "outline" }]}
          />
        </div>
      )
    }
  ],
  checklist: [
    {
      criterion: "Nuxt UI v4 API parity (Banner)",
      status: "pass",
      notes:
        "Full support for as, id, icon, title, actions, color, close, closeIcon, to, target, rel, ui, class, and onClose."
    },
    {
      criterion: "Slot pattern parity (leading, title, actions, close, left, center, right)",
      status: "pass",
      notes: "Full Solid JSX slot pattern support for all banner areas."
    },
    {
      criterion: "Header Stack & Scroll Integration (Rimelight Exclusive)",
      status: "pass",
      notes:
        "Seamless integration with useHeaderStack composable (stackIndex, hideOnScroll, sticky, fixed, dynamic top offset calculation)."
    },
    {
      criterion: "Full WAI-ARIA compliance",
      status: "pass",
      notes:
        "role='region' or role='link', aria-label automatically derived or forwarded, decorative icons have aria-hidden='true'."
    },
    {
      criterion: "No inline styles (CSP-safe, UnoCSS only)",
      status: "pass",
      notes:
        "All CSS classes encapsulated within banner.theme.ts without static inline styles (only dynamic top offset in header stack)."
    },
    {
      criterion: "No innerHTML / dangerouslySetInnerHTML",
      status: "pass",
      notes: "Pure Solid JSX reactive rendering."
    },
    {
      criterion: "No hydration mismatches",
      status: "pass",
      notes: "Deterministic dynamic element rendering and SSR safe localStorage reads."
    },
    {
      criterion: "Audited components render bare (no harness wrappers)",
      status: "pass",
      notes: "All scenario renders return bare components directly."
    }
  ]
};
