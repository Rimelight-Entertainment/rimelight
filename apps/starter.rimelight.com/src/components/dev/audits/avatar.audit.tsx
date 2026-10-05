import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLAvatar } from "@rimelight/ui/components/avatar/RLAvatar.tsx";
import { RLAvatarGroup } from "@rimelight/ui/components/avatar-group/RLAvatarGroup.tsx";
import { RLPopover } from "@rimelight/ui/components/popover/RLPopover.tsx";
import { AUDIT_COLORS, type ComponentAuditDefinition } from "./types";

const SIZES = ["3xs", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"] as const;
const COLORS = AUDIT_COLORS;

export const AvatarSandbox = (): JSX.Element => {
  const [size, setSize] = createSignal<(typeof SIZES)[number]>("md");
  const [color, setColor] = createSignal<string>("neutral");
  const [showSrc, setShowSrc] = createSignal(true);
  const [chipColor, setChipColor] = createSignal<string>("success");
  const [showChip, setShowChip] = createSignal(true);

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
          <span class="text-muted mr-1">Chip Color:</span>
          <For each={COLORS}>
            {(c) => (
              <button
                type="button"
                onClick={() => setChipColor(c)}
                class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                  chipColor() === c
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
              checked={showSrc()}
              onChange={(e) => setShowSrc(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">Image Src</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showChip()}
              onChange={(e) => setShowChip(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">Chip</span>
          </label>
        </div>
      </div>

      {/* Preview Area */}
      <div class="p-8 rounded-xl border border-default bg-elevated/10 flex flex-wrap items-center justify-center gap-6">
        <RLAvatar
          src={showSrc() ? "https://github.com/benjamincanac.png" : undefined}
          alt="Benjamin Canac"
          size={size()}
          color={color()}
          chip={showChip() ? { inset: true, color: chipColor() } : undefined}
        />

        <RLAvatar
          alt="John Doe"
          size={size()}
          color={color()}
          chip={showChip() ? { inset: true, color: chipColor() } : undefined}
        />

        <RLAvatar
          icon="star"
          size={size()}
          color={color()}
          chip={showChip() ? { inset: true, color: chipColor() } : undefined}
        />

        <RLAvatar
          text="+5"
          size={size()}
          color={color()}
          chip={showChip() ? { inset: true, color: chipColor() } : undefined}
        />
      </div>
    </div>
  );
};

export const avatarAudit: ComponentAuditDefinition = {
  id: "avatar",
  name: "Avatar & AvatarGroup",
  category: "Media & Visuals",
  status: "Passed",
  description:
    "An img element with fallback initials/icons/text, auto color inheritance via CSS variables (color: auto), dynamic polymorphic element rendering, chip integration, and avatar stacking groups with max +X counter.",
  importPath: "@rimelight/ui/components/avatar/RLAvatar.tsx",
  renderSandbox: () => <AvatarSandbox />,
  testScenarios: [
    {
      id: "image-and-fallbacks",
      title: "Image & Fallback Progression",
      description:
        "Demonstrates image source, text override, alt initials, custom icon, and default user icon.",
      render: () => (
        <div class="flex items-center gap-4 flex-wrap">
          <RLAvatar src="https://github.com/benjamincanac.png" alt="Benjamin Canac" />
          <RLAvatar text="+1" alt="Benjamin Canac" />
          <RLAvatar alt="Benjamin Canac" />
          <RLAvatar icon="star" />
          <RLAvatar />
        </div>
      ),
    },
    {
      id: "sizes",
      title: "All Size Variants (3xs to 3xl)",
      description: "From 3xs (16px) up to 3xl (48px) with proportional typography and badges.",
      render: () => (
        <div class="flex items-center gap-3 flex-wrap">
          {SIZES.map((s) => (
            <RLAvatar alt="Size Test" size={s} />
          ))}
        </div>
      ),
    },
    {
      id: "colors",
      title: "Theme Colors & User Palettes",
      description:
        "Supports built-in colors and custom user color ramps via color: 'auto' CSS variable tokens.",
      render: () => (
        <div class="flex items-center gap-3 flex-wrap">
          {COLORS.map((c) => (
            <span class="inline-flex">
              <RLAvatar alt={c} color={c} />
            </span>
          ))}
        </div>
      ),
    },
    {
      id: "chip-and-badge",
      title: "Chip & Badge Badging",
      description:
        "Avatars with integrated RLChip component: inset status indicator, counter badges, and custom corner positions.",
      render: () => (
        <div class="flex items-center gap-6 flex-wrap">
          <RLAvatar
            src="https://github.com/benjamincanac.png"
            alt="Ben"
            chip={{ inset: true, color: "success" }}
          />
          <RLAvatar alt="Alex" chip={{ inset: true, color: "warning" }} />
          <RLAvatar alt="John Doe" chip={{ inset: true, color: "error" }} />
          <RLAvatar alt="Sam" chip={{ color: "primary", position: "top-right" }} />
          <RLAvatar alt="Taylor" badge="3" badgeColor="primary" badgePosition="top-right" />
        </div>
      ),
    },
    {
      id: "profile-wrapper",
      title: "Title & Subtitle Profile Layout",
      description: "Renders adjacent name and description when title or subtitle are provided.",
      render: () => (
        <RLAvatar
          src="https://github.com/benjamincanac.png"
          alt="Daniel Marchi"
          title="Daniel Marchi"
          subtitle="Lead Developer"
        />
      ),
    },
    {
      id: "avatar-group-popover",
      title: "AvatarGroup with Hover Popover Profile",
      description:
        "Hovering over an avatar in the group displays an RLPopover with Title & Subtitle details.",
      render: () => (
        <RLAvatarGroup size="lg" max={4}>
          <RLPopover
            mode="hover"
            placement="top"
            trigger={<RLAvatar src="https://github.com/benjamincanac.png" alt="Benjamin Canac" />}
          >
            <RLAvatar
              src="https://github.com/benjamincanac.png"
              alt="Benjamin Canac"
              title="Benjamin Canac"
              subtitle="Core Maintainer"
            />
          </RLPopover>

          <RLPopover mode="hover" placement="top" trigger={<RLAvatar alt="Daniel Marchi" />}>
            <RLAvatar
              src="https://github.com/benjamincanac.png"
              alt="Daniel Marchi"
              title="Daniel Marchi"
              subtitle="Lead Developer"
            />
          </RLPopover>

          <RLPopover mode="hover" placement="top" trigger={<RLAvatar alt="Hugo Richard" />}>
            <RLAvatar
              alt="Hugo Richard"
              title="Hugo Richard"
              subtitle="Design Engineer"
              color="secondary"
            />
          </RLPopover>

          <RLPopover mode="hover" placement="top" trigger={<RLAvatar alt="Sebastien Chopin" />}>
            <RLAvatar
              alt="Sebastien Chopin"
              title="Sebastien Chopin"
              subtitle="CEO NuxtLabs"
              color="success"
            />
          </RLPopover>

          <RLAvatar alt="Anthony Fu" />
          <RLAvatar alt="Pooya Parsa" />
        </RLAvatarGroup>
      ),
    },
    {
      id: "avatar-group-sizes",
      title: "AvatarGroup Across Different Sizes",
      description:
        "Avatar groups across sm, md, lg, and xl sizes showing solid background ring separation without transparency overlap.",
      render: () => (
        <div class="flex flex-col gap-4">
          <RLAvatarGroup size="sm" max={3}>
            <RLAvatar src="https://github.com/benjamincanac.png" alt="Benjamin Canac" />
            <RLAvatar alt="Hugo Richard" />
            <RLAvatar alt="Sebastien Chopin" />
            <RLAvatar alt="Anthony Fu" />
          </RLAvatarGroup>
          <RLAvatarGroup size="md" max={3}>
            <RLAvatar src="https://github.com/benjamincanac.png" alt="Benjamin Canac" />
            <RLAvatar alt="Hugo Richard" />
            <RLAvatar alt="Sebastien Chopin" />
            <RLAvatar alt="Anthony Fu" />
          </RLAvatarGroup>
          <RLAvatarGroup size="lg" max={3}>
            <RLAvatar src="https://github.com/benjamincanac.png" alt="Benjamin Canac" />
            <RLAvatar alt="Hugo Richard" />
            <RLAvatar alt="Sebastien Chopin" />
            <RLAvatar alt="Anthony Fu" />
          </RLAvatarGroup>
        </div>
      ),
    },
    {
      id: "avatar-group",
      title: "AvatarGroup with Max Counter & Chips",
      description:
        "Stacks avatars with negative margin overlap in flex-row-reverse order and displays +X badge when max is exceeded.",
      render: () => (
        <RLAvatarGroup max={3}>
          <RLAvatar
            src="https://github.com/benjamincanac.png"
            alt="Benjamin Canac"
            chip={{ inset: true, color: "success" }}
          />
          <RLAvatar alt="Hugo Richard" chip={{ inset: true, color: "warning" }} />
          <RLAvatar alt="Sebastien Chopin" chip={{ inset: true, color: "error" }} />
          <RLAvatar alt="Anthony Fu" />
          <RLAvatar alt="Pooya Parsa" />
        </RLAvatarGroup>
      ),
    },
    {
      id: "avatar-group-items",
      title: "AvatarGroup with Items Array",
      description: "Declarative items array prop rendering with automated limit.",
      render: () => (
        <RLAvatarGroup
          max={2}
          items={[
            { src: "https://github.com/benjamincanac.png", alt: "Benjamin Canac" },
            { alt: "Hugo Richard" },
            { alt: "Sebastien Chopin" },
          ]}
        />
      ),
    },
  ],
  checklist: [
    {
      criterion: "Nuxt UI v4 API parity (Avatar & AvatarGroup)",
      status: "pass",
      notes:
        "Matches src, alt, icon, text, size, color, chip, loading, referrerpolicy, crossorigin, decoding, width, height, as, max, items, ui.",
    },
    {
      criterion: "Fallback resolution cascade",
      status: "pass",
      notes: "Resolves text -> fallback -> initials -> alt initials -> icon -> default user icon.",
    },
    {
      criterion: "Custom user defined colors support",
      status: "pass",
      notes:
        "Uses color: 'auto' in RLAvatarTheme with CSS variables (--rl-bg, --rl-text) and rl-color-* classes for full custom palette support.",
    },
    {
      criterion: "Full WAI-ARIA compliance",
      status: "pass",
      notes:
        "Accessible role='img' and aria-label derived from alt/label/title for visual fallbacks; aria-hidden on decorative icons and counters.",
    },
    {
      criterion: "No inline styles (CSP-safe, UnoCSS only)",
      status: "pass",
      notes: "All styling encapsulated in theme files (avatar.theme.ts, avatar-group.theme.ts).",
    },
    {
      criterion: "No innerHTML / dangerouslySetInnerHTML",
      status: "pass",
      notes: "Clean Solid JSX rendering throughout.",
    },
    {
      criterion: "No hydration mismatches",
      status: "pass",
      notes: "Deterministic signals, createMemo, and dynamic() primitives.",
    },
    {
      criterion: "Audited components render bare (no harness wrappers)",
      status: "pass",
      notes: "All scenario renders return bare components directly.",
    },
  ],
};
