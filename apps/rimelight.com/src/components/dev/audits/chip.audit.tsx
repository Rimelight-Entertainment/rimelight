import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLChip } from "@rimelight/ui/components/chip/RLChip.tsx";
import { RLAvatar } from "@rimelight/ui/components/avatar/RLAvatar.tsx";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { AUDIT_COLORS, type ComponentAuditDefinition } from "./types";
import { t } from "@rimelight/i18n";

const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;
const COLORS = AUDIT_COLORS;
const POSITIONS = ["top-right", "bottom-right", "top-left", "bottom-left"] as const;

export const ChipSandbox = (): JSX.Element => {
  const [size, setSize] = createSignal<(typeof SIZES)[number]>("md");
  const [color, setColor] = createSignal<string>("primary");
  const [position, setPosition] = createSignal<(typeof POSITIONS)[number]>("top-right");
  const [inset, setInset] = createSignal(false);
  const [standalone, setStandalone] = createSignal(false);
  const [show, setShow] = createSignal(true);
  const [text, setText] = createSignal("");
  const [wrapperType, setWrapperType] = createSignal<"button" | "avatar">("button");

  return (
    <div class="flex flex-col gap-6">
      {/* Control Toolbar */}
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-4 text-xs">
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

        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">{t("app.text.position")}</span>
          <For each={POSITIONS}>
            {(p) => (
              <button
                type="button"
                onClick={() => setPosition(p)}
                class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                  position() === p
                    ? "bg-primary text-inverted font-bold"
                    : "bg-elevated text-muted hover:text-highlighted border border-default"
                }`}
              >
                {p}
              </button>
            )}
          </For>
        </div>

        <div class="flex items-center gap-3">
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={inset()}
              onInput={(e) => setInset(e.currentTarget.checked)}
              onChange={(e) => setInset(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.inset")}</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={standalone()}
              onInput={(e) => setStandalone(e.currentTarget.checked)}
              onChange={(e) => setStandalone(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.standalone")}</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={show()}
              onInput={(e) => setShow(e.currentTarget.checked)}
              onChange={(e) => setShow(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.show")}</span>
          </label>
        </div>

        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">{t("app.text.wrapped-target")}</span>
          <button
            type="button"
            onClick={() => setWrapperType("button")}
            class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
              wrapperType() === "button"
                ? "bg-primary text-inverted font-bold"
                : "bg-elevated text-muted hover:text-highlighted border border-default"
            }`}
          >
            Button
          </button>
          <button
            type="button"
            onClick={() => setWrapperType("avatar")}
            class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
              wrapperType() === "avatar"
                ? "bg-primary text-inverted font-bold"
                : "bg-elevated text-muted hover:text-highlighted border border-default"
            }`}
          >
            Avatar
          </button>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-muted">{t("app.text.text")}</span>
          <input
            type="text"
            value={text()}
            onInput={(e) => setText(e.currentTarget.value)}
            placeholder={t("app.text.e-g-5-or-99")}
            class="px-2 py-1 rounded bg-elevated border border-default text-highlighted text-xs w-24"
          />
          <button
            type="button"
            onClick={() => setText("")}
            class="px-1.5 py-0.5 rounded text-[11px] bg-elevated text-muted hover:text-highlighted border border-default"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div class="p-8 rounded-xl border border-default bg-elevated/10 flex flex-wrap items-center justify-center gap-6">
        {standalone() ? (
          <RLChip
            size={size()}
            color={color()}
            position={position()}
            inset={inset()}
            standalone={true}
            show={show()}
            text={text() || undefined}
          />
        ) : (
          <RLChip
            size={size()}
            color={color()}
            position={position()}
            inset={inset()}
            show={show()}
            text={text() || undefined}
          >
            {wrapperType() === "avatar" ? (
              <RLAvatar
                src="https://github.com/benjamincanac.png"
                alt={t("app.text.benjamin")}
                size="lg"
              />
            ) : (
              <RLButton
                icon="mail"
                color="neutral"
                variant="subtle"
                aria-label={t("app.text.inbox")}
              />
            )}
          </RLChip>
        )}
      </div>
    </div>
  );
};

export const chipAudit: ComponentAuditDefinition = {
  id: "chip",
  name: "Chip",
  category: "Data Display",
  status: "Passed",
  description:
    "An indicator badge of a numeric value, state, or notification dot positioned relative to wrapped components or standalone inline.",
  importPath: "@rimelight/ui/components/chip/RLChip.tsx",
  renderSandbox: () => <ChipSandbox />,
  testScenarios: [
    {
      id: "colors-and-variants",
      get title() {
        return t("app.text.colors-palettes-matrix");
      },
      description:
        "Indicators across all built-in semantic colors (primary, secondary, success, info, warning, error, neutral) and custom color ramps.",
      render: () => (
        <div class="flex items-center gap-4 flex-wrap">
          <For each={COLORS}>
            {(c) => (
              <RLChip color={c} size="md">
                <RLButton icon="mail" color="neutral" variant="subtle" aria-label={c} />
              </RLChip>
            )}
          </For>
        </div>
      ),
    },
    {
      id: "sizes",
      get title() {
        return t("app.text.all-size-scales-3xs-to-3xl");
      },
      description: "Size scale from xs to xl scaling dimensions and typography proportionally.",
      render: () => (
        <div class="flex items-center gap-4 flex-wrap">
          <For each={SIZES}>
            {(s) => (
              <RLChip size={s} color="primary">
                <RLButton icon="bell" color="neutral" variant="subtle" aria-label={`Size ${s}`} />
              </RLChip>
            )}
          </For>
        </div>
      ),
    },
    {
      id: "positions",
      get title() {
        return t("app.text.positions-all-4-corners");
      },
      description:
        "Indicator positioning at top-right (default), bottom-right, top-left, and bottom-left.",
      render: () => (
        <div class="flex items-center gap-6 flex-wrap">
          <For each={POSITIONS}>
            {(pos) => (
              <RLChip position={pos} color="primary">
                <RLButton icon="user" color="neutral" variant="outline" label={pos} />
              </RLChip>
            )}
          </For>
        </div>
      ),
    },
    {
      id: "inset",
      get title() {
        return t("app.text.inset-mode-for-rounded-elements");
      },
      description:
        "Keeps the chip inside the component boundary for avatars and rounded shapes without negative translation.",
      render: () => (
        <div class="flex items-center gap-6 flex-wrap">
          <RLChip inset color="success" size="lg">
            <RLAvatar src="https://github.com/benjamincanac.png" alt={"User 1"} size="lg" />
          </RLChip>
          <RLChip inset color="warning" position="bottom-right" size="lg">
            <RLAvatar src="https://github.com/nuxt.png" alt={"User 2"} size="lg" />
          </RLChip>
          <RLChip inset color="error" position="bottom-left" size="lg">
            <RLAvatar alt={"Offline"} size="lg" />
          </RLChip>
          <RLChip inset color="neutral" position="top-left" size="lg">
            <RLAvatar alt={"Away"} size="lg" />
          </RLChip>
        </div>
      ),
    },
    {
      id: "text-and-numbers",
      get title() {
        return t("app.text.text-numeric-counters");
      },
      description:
        "Display numeric badge counters or short text strings with automatic proportional expanding min-width.",
      render: () => (
        <div class="flex items-center gap-6 flex-wrap">
          <RLChip text={5} size="xl" color="error">
            <RLButton icon="mail" color="neutral" variant="subtle" aria-label={"5 unread emails"} />
          </RLChip>
          <RLChip text="99+" size="xl" color="primary">
            <RLButton
              icon="bell"
              color="neutral"
              variant="subtle"
              aria-label={"99+ notifications"}
            />
          </RLChip>
          <RLChip text="NEW" size="xl" color="success">
            <RLButton label="Messages" color="neutral" variant="outline" />
          </RLChip>
          <RLChip text="PRO" size="xl" color="neutral">
            <RLAvatar alt={"Member"} size="md" />
          </RLChip>
        </div>
      ),
    },
    {
      id: "standalone",
      get title() {
        return t("app.text.standalone-inline-chips");
      },
      description:
        "Inline status indicators without wrapping a parent element (used in menus, command palettes, and tables).",
      render: () => (
        <div class="flex items-center gap-4 flex-wrap text-sm">
          <span class="flex items-center gap-1.5">
            <RLChip standalone inset color="success" size="sm" /> Online
          </span>
          <span class="flex items-center gap-1.5">
            <RLChip standalone inset color="warning" size="sm" /> Away
          </span>
          <span class="flex items-center gap-1.5">
            <RLChip standalone inset color="error" size="sm" /> Busy
          </span>
          <span class="flex items-center gap-1.5">
            <RLChip standalone inset color="neutral" size="sm" /> Offline
          </span>
          <span class="flex items-center gap-1.5">
            <RLChip standalone text={3} size="xl" color="primary" /> In Queue
          </span>
        </div>
      ),
    },
    {
      id: "visibility-control",
      get title() {
        return t("app.text.controlled-visibility-show-prop");
      },
      get description() {
        return t("app.text.controls-chip-visibility-dynamically-while-prese");
      },
      render: () => (
        <div class="flex items-center gap-6 flex-wrap">
          <RLChip show={true} color="success">
            <RLButton label="Visible Chip (show=true)" color="neutral" variant="subtle" />
          </RLChip>
          <RLChip show={false} color="success">
            <RLButton label="Hidden Chip (show=false)" color="neutral" variant="subtle" />
          </RLChip>
        </div>
      ),
    },
    {
      id: "polymorphic-as",
      get title() {
        return t("app.text.polymorphic-element-as-prop");
      },
      get description() {
        return t("app.text.renders-as-custom-html-tag-such-as-span-or-secti");
      },
      render: () => (
        <div class="flex items-center gap-4 flex-wrap">
          <RLChip as="span" color="primary">
            <span>{"Inline Span Container"}</span>
          </RLChip>
        </div>
      ),
    },
  ],
  checklist: [
    {
      criterion: "Nuxt UI v4 API parity (Chip)",
      status: "pass",
      notes:
        "Full support for as, text, color, size, position, inset, standalone, show, ui, and class.",
    },
    {
      criterion: "Slot pattern parity (default, content)",
      status: "pass",
      notes: "Full JSX slot support for wrapped children and text/textSlot.",
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
      notes: "Forwards all aria attributes and HTML attributes to root container.",
    },
    {
      criterion: "No inline styles (CSP-safe, UnoCSS only)",
      status: "pass",
      notes: "All styling encapsulated in chip.theme.ts without inline style attributes.",
    },
    {
      criterion: "No innerHTML / dangerouslySetInnerHTML",
      status: "pass",
      notes: "Pure Solid JSX reactive rendering.",
    },
    {
      criterion: "No hydration mismatches",
      status: "pass",
      notes: "Deterministic dynamic() element and createMemo() class resolution.",
    },
    {
      criterion: "Audited components render bare (no harness wrappers)",
      status: "pass",
      notes: "All scenario renders return bare components directly.",
    },
  ],
};
