import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { AUDIT_COLORS, type ComponentAuditDefinition } from "./types";
import { t } from "@rimelight/i18n";

const COLORS = AUDIT_COLORS;
const VARIANTS = ["solid", "outline", "soft", "subtle", "ghost", "link"] as const;
const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;
const SHAPES = ["square", "rounded", "pill"] as const;

export const ButtonSandbox = (): JSX.Element => {
  const [color, setColor] = createSignal<string>("primary");
  const [variant, setVariant] = createSignal<(typeof VARIANTS)[number]>("solid");
  const [size, setSize] = createSignal<(typeof SIZES)[number]>("md");
  const [shape, setShape] = createSignal<(typeof SHAPES)[number]>("rounded");
  const [label, setLabel] = createSignal("Button Action");
  const [hasIcon, setHasIcon] = createSignal(true);
  const [isTrailing, setIsTrailing] = createSignal(false);
  const [hasAvatar, setHasAvatar] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(false);
  const [loadingAuto, setLoadingAuto] = createSignal(false);
  const [isDisabled, setIsDisabled] = createSignal(false);
  const [isBlock, setIsBlock] = createSignal(false);
  const [isActive, setIsActive] = createSignal(false);
  const [isLink, setIsLink] = createSignal(false);

  return (
    <div class="flex flex-col gap-6">
      {/* Control Toolbar */}
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-col gap-3 text-xs">
        {/* Colors */}
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

        {/* Variants */}
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">{t("app.text.variant")}</span>
          <For each={VARIANTS}>
            {(v) => (
              <button
                type="button"
                onClick={() => setVariant(v)}
                class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                  variant() === v
                    ? "bg-primary text-inverted font-bold"
                    : "bg-elevated text-muted hover:text-highlighted border border-default"
                }`}
              >
                {v}
              </button>
            )}
          </For>
        </div>

        {/* Sizes */}
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">{t("app.text.size")}</span>
          <For each={SIZES}>
            {(s) => (
              <button
                type="button"
                onClick={() => setSize(s)}
                class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                  size() === s
                    ? "bg-primary text-inverted font-bold"
                    : "bg-elevated text-muted hover:text-highlighted border border-default"
                }`}
              >
                {s}
              </button>
            )}
          </For>
        </div>

        {/* Shapes */}
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">shape</span>
          <For each={SHAPES}>
            {(s) => (
              <button
                type="button"
                onClick={() => setShape(s)}
                class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                  shape() === s
                    ? "bg-primary text-inverted font-bold"
                    : "bg-elevated text-muted hover:text-highlighted border border-default"
                }`}
              >
                {s}
              </button>
            )}
          </For>
        </div>

        {/* Toggles */}
        <div class="flex items-center gap-4 flex-wrap">
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
              checked={isTrailing()}
              onInput={(e) => setIsTrailing(e.currentTarget.checked)}
              onChange={(e) => setIsTrailing(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.trailing")}</span>
          </label>

          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={hasAvatar()}
              onInput={(e) => setHasAvatar(e.currentTarget.checked)}
              onChange={(e) => setHasAvatar(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.avatar")}</span>
          </label>

          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isLoading()}
              onInput={(e) => setIsLoading(e.currentTarget.checked)}
              onChange={(e) => setIsLoading(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.loading-8f26")}</span>
          </label>

          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={loadingAuto()}
              onInput={(e) => setLoadingAuto(e.currentTarget.checked)}
              onChange={(e) => setLoadingAuto(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.loadingauto")}</span>
          </label>

          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isDisabled()}
              onInput={(e) => setIsDisabled(e.currentTarget.checked)}
              onChange={(e) => setIsDisabled(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.disabled")}</span>
          </label>

          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isBlock()}
              onInput={(e) => setIsBlock(e.currentTarget.checked)}
              onChange={(e) => setIsBlock(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.block")}</span>
          </label>

          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive()}
              onInput={(e) => setIsActive(e.currentTarget.checked)}
              onChange={(e) => setIsActive(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.active-a733")}</span>
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

          <div class="flex items-center gap-2">
            <span class="text-muted">{t("app.text.label")}</span>
            <input
              type="text"
              value={label()}
              onInput={(e) => setLabel(e.currentTarget.value)}
              class="px-2 py-0.5 rounded bg-elevated border border-default text-highlighted text-xs w-40"
            />
          </div>
        </div>
      </div>

      {/* Preview (bare) */}
      <RLButton
        color={color()}
        variant={variant()}
        size={size()}
        shape={shape()}
        label={label() || undefined}
        icon={
          hasIcon() && !hasAvatar() ? (isTrailing() ? "arrow-right" : "i-lucide-rocket") : undefined
        }
        trailing={isTrailing()}
        avatar={hasAvatar() ? { src: "https://github.com/nuxt.png" } : undefined}
        loading={isLoading()}
        loadingAuto={loadingAuto()}
        disabled={isDisabled()}
        block={isBlock()}
        active={isActive()}
        href={isLink() ? "https://rimelight.com" : undefined}
        target={isLink() ? "_blank" : undefined}
        onClick={
          loadingAuto()
            ? () => new Promise<void>((resolve) => setTimeout(resolve, 1500))
            : undefined
        }
      />
    </div>
  );
};

export const buttonAudit: ComponentAuditDefinition = {
  id: "button",
  name: "Button",
  category: "Form & Input",
  status: "Passed",
  description:
    "A button element that can act as a link or trigger an action, supporting full props, compound variants, active states, loading-auto promises, and complete WAI-ARIA compliance.",
  importPath: "@rimelight/ui/components/button/RLButton.tsx",
  renderSandbox: () => <ButtonSandbox />,
  testScenarios: [
    {
      id: "color-variant-matrix",
      get title() {
        return t("app.text.color-variant-matrix");
      },
      description:
        "All 7 semantic color scales across all 6 visual variants (solid, outline, soft, subtle, ghost, link).",
      render: () => (
        <div class="flex flex-col gap-4">
          <For each={VARIANTS}>
            {(v) => (
              <div class="flex items-center gap-2 flex-wrap">
                <span class="w-16 text-xs text-muted font-mono uppercase">{v}:</span>
                {COLORS.map((c) => (
                  <span class="inline-flex">
                    <RLButton color={c} variant={v} label={`${c}`} size="sm" />
                  </span>
                ))}
              </div>
            )}
          </For>
        </div>
      ),
    },
    {
      id: "size-spectrum",
      get title() {
        return t("app.text.size-spectrum-xs-to-xl");
      },
      description:
        "Button sizing scale from xs to xl with proportional icon sizes, padding, and centered vertical alignment.",
      render: () => (
        <div class="flex items-center gap-3 flex-wrap items-end">
          <For each={SIZES}>
            {(s) => (
              <RLButton
                size={s}
                color="primary"
                variant="solid"
                icon="i-lucide-rocket"
                label={`Size ${s}`}
              />
            )}
          </For>
        </div>
      ),
    },
    {
      id: "shape-spectrum",
      title: "Shape spectrum",
      description:
        "The three shapes: square, rounded (default), and pill. An icon-only button without a label defaults to square.",
      render: () => (
        <div class="flex items-center gap-3 flex-wrap">
          <For each={SHAPES}>
            {(s) => <RLButton shape={s} label={s} color="primary" variant="solid" />}
          </For>
          <RLButton icon="star" aria-label="Favorite" variant="subtle" color="warning" />
        </div>
      ),
    },
    {
      id: "icon-and-avatar-variations",
      get title() {
        return t("app.text.icons-avatars");
      },
      description: "Leading icon, trailing icon, leading avatar, and icon-only button modes.",
      render: () => (
        <div class="flex items-center gap-3 flex-wrap">
          <RLButton icon="search" label="Search" />
          <RLButton icon="arrow-right" trailing label="Continue" color="secondary" />
          <RLButton
            leadingIcon="sparkles"
            trailingIcon="chevron-down"
            label="Generate AI"
            variant="soft"
          />
          <RLButton
            avatar={{ src: "https://github.com/nuxt.png" }}
            label="User Profile"
            variant="outline"
            color="neutral"
          />
          <RLButton icon="i-lucide-trash" aria-label="Delete" variant="ghost" color="error" />
        </div>
      ),
    },
    {
      id: "loading-states",
      get title() {
        return t("app.text.loading-loadingauto-states");
      },
      description:
        "Leading and trailing spinner loaders, a custom loading icon, and automatic promise resolution with loadingAuto.",
      render: () => (
        <div class="flex items-center gap-3 flex-wrap">
          <RLButton loading label="Processing..." color="primary" />
          <RLButton loading trailing label="Submitting..." color="success" />
          <RLButton
            loadingAuto
            label="Click for 1.5s Async"
            color="secondary"
            variant="outline"
            onClick={() => new Promise<void>((resolve) => setTimeout(resolve, 1500))}
          />
          <RLButton loading aria-label="Loading action" />
        </div>
      ),
    },
    {
      id: "active-state",
      get title() {
        return t("app.text.interactive-link-active-state");
      },
      description:
        "Polymorphic anchor mode via `href` with target, rel, activeClass, and custom activeColor/activeVariant.",
      render: () => (
        <div class="flex items-center gap-3 flex-wrap">
          <RLButton
            href="https://rimelight.com"
            target="_blank"
            icon="external-link"
            trailing
            label="External Link"
            variant="outline"
          />
          <RLButton
            href="/dev/components?comp=button"
            active
            activeColor="success"
            activeVariant="solid"
            label="Active Route Button"
          />
          <RLButton active activeColor="success" activeVariant="solid" label="Active Button" />
          <RLButton
            active
            activeClass="ring-2 ring-primary font-bold"
            variant="ghost"
            label="Custom Active Class"
          />
        </div>
      ),
    },
    {
      id: "field-group",
      get title() {
        return t("app.text.field-group-segmenting");
      },
      description:
        "Seamless horizontal and vertical grouping with proper border radius removal on outer edges and border-overlap collapse on inner edges.",
      render: () => (
        <div class="flex flex-col gap-4">
          <div class="inline-flex">
            <RLButton fieldGroup="horizontal" label="Left" variant="outline" color="neutral" />
            <RLButton fieldGroup="horizontal" label="Middle" variant="outline" color="neutral" />
            <RLButton fieldGroup="horizontal" label="Right" variant="outline" color="neutral" />
          </div>
          <div class="inline-flex flex-col w-48">
            <RLButton fieldGroup="vertical" label="Top Item" variant="soft" color="primary" />
            <RLButton fieldGroup="vertical" label="Middle Item" variant="soft" color="primary" />
            <RLButton fieldGroup="vertical" label="Bottom Item" variant="soft" color="primary" />
          </div>
        </div>
      ),
    },
    {
      id: "custom-slots",
      get title() {
        return t("app.text.custom-slots-ui-overrides");
      },
      description:
        "Slot overrides for leading and trailing elements, default slot content, and extra classes via the class prop.",
      render: () => (
        <div class="flex items-center gap-3 flex-wrap">
          <RLButton
            leadingSlot={<span class="text-sm">✨</span>}
            trailingSlot={<span class="text-xs bg-on-scrim/20 px-1 rounded">HOT</span>}
            class="shadow-lg"
          >
            Special Promotion
          </RLButton>
        </div>
      ),
    },
  ],
  checklist: [
    {
      criterion: "API parity (Button)",
      status: "pass",
      notes:
        "label, color, activeColor, variant, activeVariant, size, shape, block, loading, loadingAuto, loadingIcon, icon, avatar, leading, leadingIcon, leadingSlot, trailing, trailingIcon, trailingSlot, active, activeClass, inactiveClass, href, target, rel, noRel, external, type, as, fieldGroup, class, onClick, ref. onClick accepts a single handler or an array. shape defaults to square for icon-only buttons without a label.",
    },
    {
      criterion: "Slot pattern parity (leading, default, trailing)",
      status: "pass",
      notes:
        "leadingSlot, children (default slot), trailingSlot, plus loading spinner in either position. data-slot names follow the kebab-case convention (root, label, leading-icon, leading-avatar, trailing-icon).",
    },
    {
      criterion: "Full WAI-ARIA compliance",
      status: "pass",
      notes:
        "Native button/link semantics preserved; aria-label and aria-labelledby passthrough (no invented ids); aria-busy when loading; aria-disabled + tabindex=-1 for disabled links and non-native roots; decorative icons aria-hidden; automatic screen-reader hint for links opening a new tab, suppressed whenever an explicit aria-label carries the name.",
    },
    {
      criterion: "No inline styles (CSP-safe, UnoCSS only)",
      status: "pass",
      notes:
        "No inline style attributes; styling solely encapsulated in button.theme.ts (incl. the externalHint slot).",
    },
    {
      criterion: "No innerHTML / dangerouslySetInnerHTML",
      status: "pass",
      notes: "100% reactive JSX.",
    },
    {
      criterion: "No hydration mismatches",
      status: "pass",
      notes: "Pure declarative reactive rendering with deterministic SSR output.",
    },
    {
      criterion: "Exclusively named exports",
      status: "pass",
      notes:
        "RLButton, RLButtonProps, ButtonClickHandler and button.helpers exports are all named.",
    },
    {
      criterion: "Audited components render bare (no harness wrappers)",
      status: "pass",
      notes:
        "The sandbox preview renders a bare RLButton; only the control panel and test-scenario grids are layout containers.",
    },
  ],
};
