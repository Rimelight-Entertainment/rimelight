import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLBanner } from "@rimelight/ui/components/banner/RLBanner.tsx";
import { AUDIT_COLORS, type ComponentAuditDefinition } from "./types";
import { t } from "@rimelight/i18n";

const COLORS = AUDIT_COLORS;

export const BannerSandbox = (): JSX.Element => {
  const [color, setColor] = createSignal<string>("primary");
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
          <span class="text-muted mr-1">{t("app.text.color")}</span>
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
            <span class="text-muted">{t("app.text.icon")}</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={hasActions()}
              onInput={(e) => setHasActions(e.currentTarget.checked)}
              onChange={(e) => setHasActions(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.actions")}</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isClosable()}
              onInput={(e) => setIsClosable(e.currentTarget.checked)}
              onChange={(e) => setIsClosable(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.close-button")}</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={contain()}
              onInput={(e) => setContain(e.currentTarget.checked)}
              onChange={(e) => setContain(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.contain")}</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isLink()}
              onInput={(e) => setIsLink(e.currentTarget.checked)}
              onChange={(e) => setIsLink(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.as-link")}</span>
          </label>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-muted">{t("app.text.title")}</span>
          <input
            type="text"
            value={title()}
            onInput={(e) => setTitle(e.currentTarget.value)}
            class="px-2 py-1 rounded bg-elevated border border-default text-highlighted text-xs w-64"
          />
        </div>
      </div>

      {/* Preview (bare) */}
      <RLBanner
        color={color()}
        icon={hasIcon() ? "star" : undefined}
        title={title()}
        contain={contain()}
        dismissible={isClosable()}
        href={isLink() ? "https://rimelight.com" : undefined}
        target={isLink() ? "_blank" : undefined}
        actions={
          hasActions()
            ? [
                { label: t("app.text.documentation"), variant: "outline", href: "#docs" },
                { label: t("app.text.get-started"), trailingIcon: "arrow-right" },
              ]
            : undefined
        }
      />
    </div>
  );
};

export const bannerAudit: ComponentAuditDefinition = {
  id: "banner",
  name: "Banner",
  category: "Feedback",
  status: "Passed",
  description:
    "Display a banner at the top of your website or within layout flows to inform users about important notices, product updates, or global announcements with action buttons, dismissal memory, and header stack integration.",
  importPath: "@rimelight/ui/components/banner/RLBanner.tsx",
  renderSandbox: () => <BannerSandbox />,
  testScenarios: [
    {
      id: "colors-matrix",
      get title() {
        return t("app.text.all-color-variants");
      },
      description:
        "All visual colors (primary, secondary, success, info, warning, error, neutral) with standard contrast inverted text styling.",
      render: () => (
        <div class="flex flex-col gap-3">
          <For each={COLORS}>
            {(c) => (
              <span class="block">
                <RLBanner
                  color={c}
                  icon="info"
                  title={`This is an important ${c} announcement banner.`}
                  dismissible
                />
              </span>
            )}
          </For>
        </div>
      ),
    },
    {
      id: "actions-and-slots",
      get title() {
        return t("app.text.actions-and-slots");
      },
      description:
        "Action buttons with outline/solid variants, trailing icons, custom left/center/right slots.",
      render: () => (
        <div class="flex flex-col gap-3">
          <RLBanner
            title={"We just raised Series A funding!"}
            icon="rocket"
            color="secondary"
            actions={[
              {
                get label() {
                  return t("app.text.read-press-release");
                },
                variant: "solid",
                href: "#press",
              },
              {
                get label() {
                  return t("app.text.view-open-roles");
                },
                variant: "outline",
                trailingIcon: "arrow-right",
              },
            ]}
            dismissible
          />
          <RLBanner
            color="info"
            leadingSlot={
              <span class="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
                NEW
              </span>
            }
            title={"Solid 2.0 and UnoCSS now supported"}
            actions={[
              {
                get label() {
                  return t("app.text.changelog");
                },
                size: "xs",
              },
            ]}
            dismissible
          />
        </div>
      ),
    },
    {
      id: "custom-slots",
      get title() {
        return t("app.text.slot-overrides-leading-title-actions-close");
      },
      description:
        "Nuxt UI slots replace their default content: `leading` replaces the icon, `titleSlot` the title, `actionsSlot` the actions and `closeSlot` the close button.",
      render: () => (
        <RLBanner
          color="success"
          iconSlot={<span aria-hidden="true">🎉</span>}
          titleSlot={
            <span>
              Custom <strong>title</strong> slot
            </span>
          }
          actionsSlot={<a href="#custom-action">{"Custom action"}</a>}
          closeSlot={<span>(custom close slot)</span>}
        />
      ),
    },
    {
      id: "center-slot",
      title: "Center slot",
      description: "`centerSlot` replaces the whole center area, including the icon and title.",
      render: () => (
        <RLBanner
          color="info"
          centerSlot={<span class="text-sm">{"Custom center content replacing the title."}</span>}
        />
      ),
    },
    {
      id: "trailing-slot",
      title: "Trailing slot",
      description: "`trailingSlot` renders content on the right edge, before the actions.",
      render: () => (
        <RLBanner
          color="warning"
          title="Trailing slot"
          trailingSlot={<span class="text-xs font-bold uppercase">{"Trailing"}</span>}
        />
      ),
    },
    {
      id: "link-mode",
      get title() {
        return t("app.text.interactive-link-mode");
      },
      description:
        "`href` renders a full-surface overlay link labelled by the title, so actions and the close button stay valid, independently focusable controls.",
      render: () => (
        <RLBanner
          href="https://rimelight.com"
          target="_blank"
          color="primary"
          icon="star"
          title={"Rimelight Entertainment releases Next-Gen UI toolkit — Click to explore!"}
          actions={[
            {
              get label() {
                return t("app.text.secondary-action");
              },
              variant: "outline",
            },
          ]}
          dismissible
        />
      ),
    },
    {
      id: "closable-and-persistence",
      get title() {
        return t("app.text.dismissible-with-persistence-id");
      },
      description:
        "Custom close icon; with an explicit `id`, dismissal is saved to localStorage (`banner-<id>`). Clear it from devtools to see it again.",
      render: () => (
        <RLBanner
          id="audit-closable-banner-demo"
          title={"You can dismiss this banner. On explicit `id`, state is saved to localStorage."}
          color="warning"
          icon="alert-circle"
          closeIcon="x"
          dismissible
        />
      ),
    },
    {
      id: "header-stack-integration",
      get title() {
        return t("app.text.header-stack-integration");
      },
      description:
        "Coordinates with Rimelight Header Stack system: supports `sticky`, `fixed`, `stackIndex`, `hideOnScroll` and dynamic height registration.",
      render: () => (
        <RLBanner
          title={"Header-Stack Synchronized Banner (stackIndex=0)"}
          color="neutral"
          icon="layers"
          stackIndex={0}
          actions={[
            {
              get label() {
                return t("app.text.configure-stack");
              },
              variant: "outline",
            },
          ]}
        />
      ),
    },
  ],
  checklist: [
    {
      criterion: "Nuxt UI v4 API parity (Banner)",
      status: "pass",
      notes:
        "as, id, icon, title, actions (neutral/xs defaults), color, dismissible (md/neutral/ghost defaults), closeIcon, href, target, rel, ui, class, onDismiss. Differences: `href` accepts strings only; slots are props (`leadingSlot`, `titleSlot`, `actionsSlot`, `closeSlot`).",
    },
    {
      criterion:
        "Slot pattern parity (leading, title, actions, close) + extras (left, center, right, default)",
      status: "pass",
      notes: "Slots replace their default content like Nuxt UI. Extra `content`/`link` ui keys.",
    },
    {
      criterion: "Header Stack & Scroll Integration (Rimelight Exclusive)",
      status: "pass",
      notes:
        "useHeaderStack registration (stackIndex, hideOnScroll, sticky, fixed). Collapse via data-collapsed theme classes; top offset via CSSOM.",
    },
    {
      criterion: "Full WAI-ARIA compliance",
      status: "pass",
      notes:
        "role='region' auto aria-labelledby the title (or ariaLabel fallback); overlay link labelled by title; no interactive content nested in <a>; decorative icons aria-hidden.",
    },
    {
      criterion: "No inline styles (CSP-safe, UnoCSS only)",
      status: "pass",
      notes:
        "No style attribute rendered; dynamic top uses element.style (CSSOM), which CSP allows.",
    },
    {
      criterion: "No innerHTML / dangerouslySetInnerHTML",
      status: "pass",
      notes: "Pure Solid JSX reactive rendering.",
    },
    {
      criterion: "No hydration mismatches",
      status: "pass",
      notes:
        "Dismissed state always starts false; localStorage read after settle (head script hides pre-hydration). Fallback ids via createUniqueId.",
    },
    {
      criterion: "Audited components render bare (no harness wrappers)",
      status: "pass",
      notes: "Single-banner scenarios render bare; the color matrix only uses a flex list.",
    },
  ],
};
