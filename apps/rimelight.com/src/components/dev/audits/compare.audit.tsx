import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLCompare } from "@rimelight/ui/components/compare/RLCompare.tsx";
import { RLBadge } from "@rimelight/ui/components/badge/RLBadge.tsx";
import { AUDIT_COLORS, type ComponentAuditDefinition } from "./types";
import { t } from "@rimelight/i18n";

const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;
const VARIANTS = ["solid", "outline", "subtle", "ghost"] as const;
const ORIENTATIONS = ["horizontal", "vertical"] as const;
const COLORS = AUDIT_COLORS;

const IMG_BEFORE =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80";
const IMG_AFTER =
  "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80";

export const CompareSandbox = (): JSX.Element => {
  const [orientation, setOrientation] = createSignal<(typeof ORIENTATIONS)[number]>("horizontal");
  const [size, setSize] = createSignal<(typeof SIZES)[number]>("md");
  const [variant, setVariant] = createSignal<(typeof VARIANTS)[number]>("solid");
  const [color, setColor] = createSignal<string>("primary");
  const [value, setValue] = createSignal(50);
  const [showLabels, setShowLabels] = createSignal(true);
  const [hover, setHover] = createSignal(false);
  const [autoplay, setAutoplay] = createSignal(false);
  const [disabled, setDisabled] = createSignal(false);
  const [showHandle, setShowHandle] = createSignal(true);
  const [showDivider, setShowDivider] = createSignal(true);

  return (
    <div class="flex flex-col gap-6">
      {/* Control Toolbar */}
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-4 text-xs">
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">{t("app.text.orientation")}</span>
          <For each={ORIENTATIONS}>
            {(o) => (
              <button
                type="button"
                onClick={() => setOrientation(o)}
                class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                  orientation() === o
                    ? "bg-primary text-inverted font-bold"
                    : "bg-elevated text-muted hover:text-highlighted border border-default"
                }`}
              >
                {o}
              </button>
            )}
          </For>
        </div>

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

        <div class="flex items-center gap-3 flex-wrap">
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showLabels()}
              onInput={(e) => setShowLabels(e.currentTarget.checked)}
              onChange={(e) => setShowLabels(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.labels")}</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={hover()}
              onInput={(e) => setHover(e.currentTarget.checked)}
              onChange={(e) => setHover(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.hover")}</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={autoplay()}
              onInput={(e) => setAutoplay(e.currentTarget.checked)}
              onChange={(e) => setAutoplay(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.autoplay")}</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={disabled()}
              onInput={(e) => setDisabled(e.currentTarget.checked)}
              onChange={(e) => setDisabled(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.disabled")}</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showHandle()}
              onInput={(e) => setShowHandle(e.currentTarget.checked)}
              onChange={(e) => setShowHandle(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.handle")}</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showDivider()}
              onInput={(e) => setShowDivider(e.currentTarget.checked)}
              onChange={(e) => setShowDivider(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.divider")}</span>
          </label>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-muted">{t("app.text.value")}</span>
          <input
            type="range"
            min="0"
            max="100"
            value={value()}
            onInput={(e) => setValue(Number(e.currentTarget.value))}
            class="w-24 accent-primary"
          />
          <span class="font-mono text-muted">{Math.round(value())}%</span>
        </div>
      </div>

      {/* Component Sandbox */}
      <div class="max-w-2xl w-full mx-auto aspect-video">
        <RLCompare
          value={value()}
          onValueChange={setValue}
          orientation={orientation()}
          size={size()}
          variant={variant()}
          color={color()}
          hover={hover()}
          autoplay={autoplay()}
          disabled={disabled()}
          showHandle={showHandle()}
          showDivider={showDivider()}
          showLabels={showLabels()}
          beforeLabelSlot="Before (Day)"
          afterLabelSlot="After (Sunset)"
          beforeSrc={IMG_BEFORE}
          afterSrc={IMG_AFTER}
          class="w-full h-full shadow-lg"
        />
      </div>
    </div>
  );
};

export const compareAudit: ComponentAuditDefinition = {
  id: "compare",
  name: "Compare",
  category: "Media & Visuals",
  status: "Auditing",
  description:
    "An interactive before-and-after comparison slider supporting images, rich JSX components, keyboard navigation, touch dragging, autoplay, and customizable handles.",
  importPath: "@rimelight/ui/components/compare/RLCompare.tsx",
  renderSandbox: () => <CompareSandbox />,
  testScenarios: [
    {
      id: "basic-image-comparison",
      get title() {
        return t("app.text.basic-image-comparison");
      },
      get description() {
        return t("app.text.standard-horizontal-split-comparing-two-photos-w");
      },
      render: () => (
        <RLCompare
          beforeSrc={IMG_BEFORE}
          afterSrc={IMG_AFTER}
          beforeLabelSlot="Original"
          afterLabelSlot="Retouched"
          class="w-full max-w-xl aspect-video"
        />
      ),
    },
    {
      id: "vertical-orientation",
      get title() {
        return t("app.text.vertical-split-orientation");
      },
      get description() {
        return t("app.text.vertical-split-slider-moving-top-to-bottom-with");
      },
      render: () => (
        <RLCompare
          orientation="vertical"
          beforeSrc={IMG_BEFORE}
          afterSrc={IMG_AFTER}
          beforeLabelSlot="Top (Day)"
          afterLabelSlot="Bottom (Sunset)"
          class="w-full max-w-md h-80"
        />
      ),
    },
    {
      id: "all-sizes",
      get title() {
        return t("app.text.all-sizes-xs-sm-md-lg-xl");
      },
      description:
        "Showcases different sizes affecting handle dimensions, divider weight, and label sizing.",
      render: () => (
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <For each={SIZES}>
            {(s) => (
              <div class="flex flex-col gap-1">
                <span class="text-xs font-mono text-muted">size: {s}</span>
                <RLCompare
                  size={s}
                  beforeSrc={IMG_BEFORE}
                  afterSrc={IMG_AFTER}
                  beforeLabelSlot="Before"
                  afterLabelSlot="After"
                  class="w-full aspect-video"
                />
              </div>
            )}
          </For>
        </div>
      ),
    },
    {
      id: "all-variants",
      get title() {
        return t("app.text.visual-variants-solid-outline-subtle-glass");
      },
      get description() {
        return t("app.text.handle-and-divider-styling-variants-across-solid");
      },
      render: () => (
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <For each={VARIANTS}>
            {(v) => (
              <div class="flex flex-col gap-1">
                <span class="text-xs font-mono text-muted">variant: {v}</span>
                <RLCompare
                  variant={v}
                  color="primary"
                  beforeSrc={IMG_BEFORE}
                  afterSrc={IMG_AFTER}
                  beforeLabelSlot="Before"
                  afterLabelSlot="After"
                  class="w-full aspect-video"
                />
              </div>
            )}
          </For>
        </div>
      ),
    },
    {
      id: "rich-jsx-content-comparison",
      get title() {
        return t("app.text.rich-jsx-content-comparison");
      },
      get description() {
        return t("app.text.compares-arbitrary-dom-jsx-components-such-as-li");
      },
      render: () => (
        <RLCompare
          defaultValue={45}
          leadingSlot={
            <div class="w-full h-full bg-slate-950 text-slate-100 p-6 flex flex-col justify-between">
              <div>
                <span class="text-xs font-mono uppercase tracking-wider text-primary">
                  Dark Mode Theme
                </span>
                <h4 class="text-lg font-bold mt-1">{"Modern Analytics Dashboard"}</h4>
                <p class="text-xs text-slate-400 mt-2">
                  Optimized for low-light environments with high contrast data accents.
                </p>
              </div>
              <div class="flex items-center gap-2">
                <RLBadge label="Dark Palette" color="primary" variant="solid" />
                <RLBadge label="Active" color="success" variant="subtle" />
              </div>
            </div>
          }
          trailingSlot={
            <div class="w-full h-full bg-slate-50 text-slate-900 p-6 flex flex-col justify-between">
              <div>
                <span class="text-xs font-mono uppercase tracking-wider text-sky-600">
                  Light Mode Theme
                </span>
                <h4 class="text-lg font-bold mt-1">{"Modern Analytics Dashboard"}</h4>
                <p class="text-xs text-slate-600 mt-2">
                  Clean, crisp daylight rendering with balanced neutral typography.
                </p>
              </div>
              <div class="flex items-center gap-2">
                <RLBadge label="Light Palette" color="info" variant="solid" />
                <RLBadge label="Active" color="success" variant="subtle" />
              </div>
            </div>
          }
          beforeLabelSlot="Dark Theme"
          afterLabelSlot="Light Theme"
          class="w-full max-w-xl h-64 border border-default shadow-md"
        />
      ),
    },
    {
      id: "hover-mode",
      get title() {
        return t("app.text.hover-interaction-mode");
      },
      get description() {
        return t("app.text.divider-tracks-mouse-pointer-movement-automatica");
      },
      render: () => (
        <RLCompare
          hover={true}
          beforeSrc={IMG_BEFORE}
          afterSrc={IMG_AFTER}
          beforeLabelSlot="Hover over me"
          afterLabelSlot="Auto tracking"
          class="w-full max-w-xl aspect-video"
        />
      ),
    },
    {
      id: "autoplay-mode",
      get title() {
        return t("app.text.autoplay-mode");
      },
      get description() {
        return t("app.text.continuously-oscillates-the-split-position-in-a");
      },
      render: () => (
        <RLCompare
          autoplay={true}
          autoplayDuration={4000}
          beforeSrc={IMG_BEFORE}
          afterSrc={IMG_AFTER}
          beforeLabelSlot="Day"
          afterLabelSlot="Sunset"
          class="w-full max-w-xl aspect-video"
        />
      ),
    },
    {
      id: "custom-handle-slot",
      get title() {
        return t("app.text.custom-handle-slot");
      },
      get description() {
        return t("app.text.custom-handle-element-displaying-live-percentage");
      },
      render: () => (
        <RLCompare
          beforeSrc={IMG_BEFORE}
          afterSrc={IMG_AFTER}
          handleSlot={({ value }) => (
            <div class="px-2 py-1 bg-primary text-inverted text-xs font-mono font-bold rounded-full shadow-lg border border-white/20 whitespace-nowrap">
              {Math.round(value)}%
            </div>
          )}
          class="w-full max-w-xl aspect-video"
        />
      ),
    },
    {
      id: "disabled-state",
      get title() {
        return t("app.text.disabled-state");
      },
      get description() {
        return t("app.text.static-non-interactive-comparison-slider-locked");
      },
      render: () => (
        <RLCompare
          disabled={true}
          value={35}
          beforeSrc={IMG_BEFORE}
          afterSrc={IMG_AFTER}
          beforeLabelSlot="Locked"
          afterLabelSlot="Disabled"
          class="w-full max-w-xl aspect-video"
        />
      ),
    },
  ],
  checklist: [
    {
      criterion: "API and slot pattern parity",
      status: "pass",
      notes:
        "Full support for value, defaultValue, min, max, step, orientation, leadingSlot/trailingSlot, beforeSrc/afterSrc, label slots, custom handles, hover, autoplay, disabled, sizes, variants, and colors.",
    },
    {
      criterion: "Full WAI-ARIA compliance",
      status: "pass",
      notes:
        "Handle implements role='slider', aria-valuenow, aria-valuemin, aria-valuemax, aria-valuetext, aria-orientation, aria-label/aria-labelledby, aria-disabled, and full keyboard navigation (arrows, page up/down, home, end).",
    },
    {
      criterion: "Theme token resolution",
      status: "pass",
      notes:
        "Theme classes live solely in compare.theme.ts; dynamic clipping and positioning use CSS transforms and clip-path.",
    },
    {
      criterion: "No innerHTML / dangerouslySetInnerHTML",
      status: "pass",
      notes: "Pure Solid JSX reactive rendering.",
    },
    {
      criterion: "No hydration mismatches",
      status: "pass",
      notes: "Deterministic initial state and SSR safe.",
    },
    {
      criterion: "Audited components render bare",
      status: "pass",
      notes:
        "Component instances in audit scenarios are rendered directly with no harness wrappers.",
    },
  ],
};
