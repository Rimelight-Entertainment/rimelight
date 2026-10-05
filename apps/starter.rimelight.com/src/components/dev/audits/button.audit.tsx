import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { AUDIT_COLORS, type ComponentAuditDefinition } from "./types";

const COLORS = AUDIT_COLORS;
const VARIANTS = ["solid", "outline", "soft", "subtle", "ghost", "link"] as const;
const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;

export const ButtonSandbox = (): JSX.Element => {
  const [color, setColor] = createSignal<string>("primary");
  const [variant, setVariant] = createSignal<(typeof VARIANTS)[number]>("solid");
  const [size, setSize] = createSignal<(typeof SIZES)[number]>("md");
  const [label, setLabel] = createSignal("Button Action");
  const [hasIcon, setHasIcon] = createSignal(true);
  const [isTrailing, setIsTrailing] = createSignal(false);
  const [hasAvatar, setHasAvatar] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(false);
  const [loadingAuto, setLoadingAuto] = createSignal(false);
  const [isDisabled, setIsDisabled] = createSignal(false);
  const [isBlock, setIsBlock] = createSignal(false);
  const [isSquare, setIsSquare] = createSignal(false);
  const [isActive, setIsActive] = createSignal(false);
  const [isLink, setIsLink] = createSignal(false);

  return (
    <div class="flex flex-col gap-6">
      {/* Control Toolbar */}
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-col gap-3 text-xs">
        {/* Colors */}
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

        {/* Variants */}
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">Variant:</span>
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
          <span class="text-muted mr-1">Size:</span>
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
            <span class="text-muted">Icon</span>
          </label>

          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isTrailing()}
              onInput={(e) => setIsTrailing(e.currentTarget.checked)}
              onChange={(e) => setIsTrailing(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">Trailing</span>
          </label>

          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={hasAvatar()}
              onInput={(e) => setHasAvatar(e.currentTarget.checked)}
              onChange={(e) => setHasAvatar(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">Avatar</span>
          </label>

          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isLoading()}
              onInput={(e) => setIsLoading(e.currentTarget.checked)}
              onChange={(e) => setIsLoading(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">Loading</span>
          </label>

          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={loadingAuto()}
              onInput={(e) => setLoadingAuto(e.currentTarget.checked)}
              onChange={(e) => setLoadingAuto(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">LoadingAuto</span>
          </label>

          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isDisabled()}
              onInput={(e) => setIsDisabled(e.currentTarget.checked)}
              onChange={(e) => setIsDisabled(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">Disabled</span>
          </label>

          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isBlock()}
              onInput={(e) => setIsBlock(e.currentTarget.checked)}
              onChange={(e) => setIsBlock(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">Block</span>
          </label>

          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isSquare()}
              onInput={(e) => setIsSquare(e.currentTarget.checked)}
              onChange={(e) => setIsSquare(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">Square</span>
          </label>

          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive()}
              onInput={(e) => setIsActive(e.currentTarget.checked)}
              onChange={(e) => setIsActive(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">Active</span>
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

          <div class="flex items-center gap-2">
            <span class="text-muted">Label:</span>
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
        label={label() || undefined}
        icon={hasIcon() && !hasAvatar() ? (isTrailing() ? "arrow-right" : "rocket") : undefined}
        trailing={isTrailing()}
        avatar={hasAvatar() ? { src: "https://github.com/nuxt.png" } : undefined}
        loading={isLoading()}
        loadingAuto={loadingAuto()}
        disabled={isDisabled()}
        block={isBlock()}
        square={isSquare()}
        active={isActive()}
        to={isLink() ? "https://rimelight.com" : undefined}
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
      title: "Color & Variant Matrix",
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
      title: "Size Spectrum (xs to xl)",
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
                icon="rocket"
                label={`Size ${s}`}
              />
            )}
          </For>
        </div>
      ),
    },
    {
      id: "icon-and-avatar-variations",
      title: "Icons & Avatars",
      description:
        "Leading icon, trailing icon, leading avatar, and icon-only square button modes.",
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
          <RLButton icon="star" aria-label="Favorite" variant="subtle" color="warning" />
          <RLButton icon="trash" aria-label="Delete" variant="ghost" color="error" />
        </div>
      ),
    },
    {
      id: "loading-states",
      title: "Loading & LoadingAuto States",
      description:
        "Leading and trailing animated spinner loaders, custom loader icons, and automatic promise resolution with loadingAuto.",
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
          <RLButton loading square aria-label="Loading action" />
        </div>
      ),
    },
    {
      id: "link-and-active-mode",
      title: "Interactive Link & Active State",
      description:
        "Polymorphic anchor mode via `to` / `href` with target, rel, activeClass, and custom activeColor/activeVariant.",
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
            to="/dev/components?comp=button"
            active
            activeColor="success"
            activeVariant="solid"
            label="Active Route Button"
          />
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
      title: "Field Group Segmenting",
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
      id: "custom-slots-and-ui",
      title: "Custom Slots & UI Overrides",
      description:
        "Slot overrides for leading/trailing elements, default slot content, and slot styling via the `ui` prop.",
      render: () => (
        <div class="flex items-center gap-3 flex-wrap">
          <RLButton
            leading={<span class="text-sm">✨</span>}
            trailing={<span class="text-xs bg-white/20 px-1 rounded">HOT</span>}
            ui={{
              base: "shadow-lg",
              label: "tracking-wider uppercase font-bold",
            }}
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
        "label, color, activeColor, variant, activeVariant, size, square, block, loading, loadingAuto, loadingIcon, icon, avatar, leading, leadingIcon, trailing, trailingIcon, active, activeClass, inactiveClass, exactActiveClass, to, href, target, rel, noRel, external, prefetch, disabled, type, as, fieldGroup, ui, class, onClick. onClick accepts a single handler or an array. square uses `square || (!label && !children)` rule.",
    },
    {
      criterion: "Slot pattern parity (leading, default, trailing)",
      status: "pass",
      notes:
        "leadingSlot/leading, children/default slot, trailingSlot/trailing, plus loading spinner in either position. data-slot names follow the repo's kebab-case convention (root, leading-icon, trailing-icon, external-hint).",
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
      notes:
        "100% reactive JSX. Fixed alongside: RLIcon now parses icon markup into Solid JSX (svgMarkup) instead of innerHTML, and RLLayoutGrid builds its indicator/columns through DOM nodes with theme classes instead of innerHTML.",
    },
    {
      criterion: "No hydration mismatches",
      status: "pass",
      notes:
        "Pure declarative reactive rendering, deterministic SSR output (asserted by tests). RLIcon's new JSX path builds identical trees on server and client.",
    },
    {
      criterion: "No cx() calls directly in components",
      status: "pass",
      notes:
        "RLButton merges classes only through RLButtonTheme. Fixed alongside: RLBreadcrumb's cx() calls were replaced by a theme-layer mergeUi helper, and hardcoded classes moved into breadcrumb.theme.ts (overflow, overflowEllipsis, overflowCount).",
    },
    {
      criterion: "Exclusively named exports",
      status: "pass",
      notes: "RLButton, ButtonProps, ButtonClickHandler and button.helpers exports are all named.",
    },
    {
      criterion: "Audited components render bare (no harness wrappers)",
      status: "pass",
      notes:
        "The sandbox preview renders a bare RLButton; only the control panel and test-scenario grids are layout containers.",
    },
  ],
};
