import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLBadge } from "@rimelight/ui/components/badge/RLBadge.tsx";
import type { ComponentAuditDefinition } from "./types";

const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;
const VARIANTS = ["solid", "outline", "soft", "subtle", "ghost"] as const;
const COLORS = ["primary", "secondary", "success", "info", "warning", "error", "neutral"] as const;
const SHAPES = ["pill", "rounded", "square"] as const;

export const BadgeSandbox = (): JSX.Element => {
  const [size, setSize] = createSignal<(typeof SIZES)[number]>("md");
  const [variant, setVariant] = createSignal<(typeof VARIANTS)[number]>("solid");
  const [color, setColor] = createSignal<(typeof COLORS)[number]>("primary");
  const [shape, setShape] = createSignal<(typeof SHAPES)[number]>("pill");
  const [square, setSquare] = createSignal(false);
  const [hasLeadingIcon, setHasLeadingIcon] = createSignal(false);
  const [hasTrailingIcon, setHasTrailingIcon] = createSignal(false);
  const [hasAvatar, setHasAvatar] = createSignal(false);
  const [label, setLabel] = createSignal("Badge");

  return (
    <div class="flex flex-col gap-6">
      {/* Control Toolbar */}
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-4 text-xs">
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

        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">Corner Shape:</span>
          <For each={SHAPES}>
            {(sh) => (
              <button
                type="button"
                onClick={() => setShape(sh)}
                class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                  shape() === sh
                    ? "bg-primary text-inverted font-bold"
                    : "bg-elevated text-muted hover:text-highlighted border border-default"
                }`}
              >
                {sh}
              </button>
            )}
          </For>
        </div>

        <div class="flex items-center gap-3">
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={square()}
              onInput={(e) => setSquare(e.currentTarget.checked)}
              onChange={(e) => setSquare(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">Square (Equal Padding)</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={hasLeadingIcon()}
              onInput={(e) => setHasLeadingIcon(e.currentTarget.checked)}
              onChange={(e) => setHasLeadingIcon(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">Leading Icon</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={hasTrailingIcon()}
              onInput={(e) => setHasTrailingIcon(e.currentTarget.checked)}
              onChange={(e) => setHasTrailingIcon(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">Trailing Icon</span>
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
        </div>

        <div class="flex items-center gap-2">
          <span class="text-muted">Label:</span>
          <input
            type="text"
            value={label()}
            onInput={(e) => setLabel(e.currentTarget.value)}
            class="px-2 py-1 rounded bg-elevated border border-default text-highlighted text-xs w-28"
          />
          <button
            type="button"
            onClick={() => setLabel("")}
            class="px-1.5 py-0.5 rounded text-[11px] bg-elevated text-muted hover:text-highlighted border border-default"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div class="p-8 rounded-xl border border-default bg-elevated/10 flex flex-wrap items-center justify-center gap-6">
        <RLBadge
          size={size()}
          variant={variant()}
          color={color()}
          shape={shape()}
          square={square()}
          leadingIcon={hasLeadingIcon() ? "rocket" : undefined}
          trailingIcon={hasTrailingIcon() ? "arrow-right" : undefined}
          avatar={hasAvatar() ? { src: "https://github.com/nuxt.png", alt: "Nuxt" } : undefined}
          label={label() || undefined}
        />
      </div>
    </div>
  );
};

export const badgeAudit: ComponentAuditDefinition = {
  id: "badge",
  name: "Badge",
  category: "Data Display",
  status: "Passed",
  description:
    "A short badge / chip to represent status, category, counters, or indicators with icons, avatars, solid/outline/soft/subtle/ghost variants, square equal-padding mode, and full accessibility.",
  importPath: "@rimelight/ui/components/badge/RLBadge.tsx",
  renderSandbox: () => <BadgeSandbox />,
  testScenarios: [
    {
      id: "variants-and-colors",
      title: "Variants & Colors Matrix",
      description:
        "All visual variants across all built-in semantic colors (primary, secondary, success, info, warning, error, neutral).",
      render: () => (
        <div class="flex flex-col gap-3">
          <For each={VARIANTS}>
            {(v) => (
              <div class="flex items-center gap-2 flex-wrap">
                <span class="w-16 text-[11px] font-mono text-muted uppercase">{v}</span>
                <For each={COLORS}>{(c) => <RLBadge variant={v} color={c} label={c} />}</For>
              </div>
            )}
          </For>
        </div>
      ),
    },
    {
      id: "sizes",
      title: "All Size Scales (xs to xl)",
      description:
        "Scales font size, padding, spacing, and nested icon/avatar dimensions proportionally.",
      render: () => (
        <div class="flex items-center gap-3 flex-wrap">
          <For each={SIZES}>{(s) => <RLBadge size={s} icon="rocket" label={`Size ${s}`} />}</For>
        </div>
      ),
    },
    {
      id: "icons-and-positions",
      title: "Icons & Positioning",
      description:
        "Leading icon, trailing icon, both leading and trailing icons simultaneously, and icon-only badge.",
      render: () => (
        <div class="flex items-center gap-3 flex-wrap">
          <RLBadge icon="rocket" label="Leading Icon" />
          <RLBadge trailingIcon="arrow-right" label="Trailing Icon" />
          <RLBadge icon="star" trailingIcon="check" label="Both Icons" />
          <RLBadge icon="bell" square aria-label="Notifications" />
        </div>
      ),
    },
    {
      id: "avatar",
      title: "Avatar Integration",
      description: "Renders leading avatars inside badge with proportional sizing (3xs and 2xs).",
      render: () => (
        <div class="flex items-center gap-3 flex-wrap">
          <RLBadge
            avatar={{ src: "https://github.com/nuxt.png", alt: "Nuxt" }}
            color="neutral"
            variant="outline"
            label="Nuxt"
          />
          <RLBadge
            avatar={{ src: "https://github.com/benjamincanac.png", alt: "Benjamin" }}
            color="primary"
            variant="soft"
            label="Benjamin"
          />
          <RLBadge avatar={{ alt: "John Doe" }} color="success" variant="subtle" label="John Doe" />
        </div>
      ),
    },
    {
      id: "shapes-and-square",
      title: "Corner Shapes & Square Mode",
      description:
        "Pill (rounded-full), Rounded (rounded-md), and Square (rounded-none) corner shapes, plus equal-padding square badges.",
      render: () => (
        <div class="flex items-center gap-3 flex-wrap">
          <RLBadge shape="pill" label="Pill (rounded-full)" />
          <RLBadge shape="rounded" label="Rounded (rounded-md)" />
          <RLBadge shape="square" label="Square (rounded-none)" />
          <RLBadge square label="99+" color="error" />
          <RLBadge square icon="star" color="warning" shape="pill" />
          <RLBadge square icon="check" color="success" shape="square" />
        </div>
      ),
    },
    {
      id: "polymorphic-as",
      title: "Polymorphic Element (as prop)",
      description: "Renders as anchor link, button, or custom HTML tag.",
      render: () => (
        <div class="flex items-center gap-3 flex-wrap">
          <RLBadge as="a" href="#badge-link" label="Link Badge" color="info" />
          <RLBadge as="button" type="button" label="Interactive Badge" color="secondary" />
        </div>
      ),
    },
  ],
  checklist: [
    {
      criterion: "Nuxt UI v4 API parity (Badge)",
      status: "pass",
      notes:
        "Supports as, label, color, variant, size, square, icon, avatar, leading, leadingIcon, trailing, trailingIcon, ui, class.",
    },
    {
      criterion: "Slot pattern parity (leading, default, trailing)",
      status: "pass",
      notes: "Full JSX slot support for leading, default label/children, and trailing.",
    },
    {
      criterion: "Custom user defined colors support",
      status: "pass",
      notes:
        "Supports theme colors (primary, secondary, success, info, warning, error, neutral) and custom user color ramps via color: 'auto' CSS variable tokens.",
    },
    {
      criterion: "Full WAI-ARIA compliance",
      status: "pass",
      notes:
        "Forwards all aria attributes; automatically sets aria-hidden='true' on decorative leading/trailing icons.",
    },
    {
      criterion: "No inline styles (CSP-safe, UnoCSS only)",
      status: "pass",
      notes: "All styling encapsulated in badge.theme.ts without inline style attributes.",
    },
    {
      criterion: "No innerHTML / dangerouslySetInnerHTML",
      status: "pass",
      notes: "Pure Solid JSX reactive rendering.",
    },
    {
      criterion: "No hydration mismatches",
      status: "pass",
      notes: "Deterministic dynamic() tag and createMemo() class resolution.",
    },
    {
      criterion: "Audited components render bare (no harness wrappers)",
      status: "pass",
      notes: "All scenario renders return bare components directly.",
    },
  ],
};
