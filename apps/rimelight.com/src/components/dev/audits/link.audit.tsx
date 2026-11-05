import { createSignal } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLLink } from "@rimelight/ui/components/link/RLLink.tsx";
import type { ComponentAuditDefinition } from "./types";
import { t } from "@rimelight/i18n";

export const LinkSandbox = (): JSX.Element => {
  const [label, setLabel] = createSignal("Read the docs");
  const [isExternal, setIsExternal] = createSignal(false);
  const [hasLeadingIcon, setHasLeadingIcon] = createSignal(true);
  const [hasTrailingIcon, setHasTrailingIcon] = createSignal(false);
  const [isActive, setIsActive] = createSignal(false);
  const [isDisabled, setIsDisabled] = createSignal(false);

  return (
    <div class="flex flex-col gap-6">
      {/* Control Toolbar */}
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-col gap-3 text-xs">
        {/* Toggles */}
        <div class="flex items-center gap-4 flex-wrap">
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isExternal()}
              onInput={(e) => setIsExternal(e.currentTarget.checked)}
              onChange={(e) => setIsExternal(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">external</span>
          </label>

          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={hasLeadingIcon()}
              onInput={(e) => setHasLeadingIcon(e.currentTarget.checked)}
              onChange={(e) => setHasLeadingIcon(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.icon")}</span>
          </label>

          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={hasTrailingIcon()}
              onInput={(e) => setHasTrailingIcon(e.currentTarget.checked)}
              onChange={(e) => setHasTrailingIcon(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.trailing")}</span>
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
              checked={isDisabled()}
              onInput={(e) => setIsDisabled(e.currentTarget.checked)}
              onChange={(e) => setIsDisabled(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.disabled")}</span>
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
      <RLLink
        label={label()}
        href={isExternal() ? "https://rimelight.com" : "/dev/components?comp=link"}
        leadingIcon={hasLeadingIcon() ? "book-open" : undefined}
        trailingIcon={hasTrailingIcon() ? "arrow-right" : undefined}
        active={isActive()}
        disabled={isDisabled()}
      />
    </div>
  );
};

export const linkAudit: ComponentAuditDefinition = {
  id: "link",
  name: "Link",
  category: "Navigation",
  status: "Passed",
  description:
    "An anchor for navigation. Handles locale-aware hrefs, external links with a new-tab hint, active and disabled states, and icon and slot overrides.",
  importPath: "@rimelight/ui/components/link/RLLink.tsx",
  renderSandbox: () => <LinkSandbox />,
  testScenarios: [
    {
      id: "internal-and-external",
      get title() {
        return t("app.text.internal-external-links");
      },
      description:
        "Internal links stay in the same tab. External links open in a new tab with a safe rel and a screen-reader hint.",
      render: () => (
        <div class="flex items-center gap-4 flex-wrap">
          <RLLink href="/dev/components" label="Internal link" />
          <RLLink href="https://rimelight.com" label="External link" />
          <RLLink
            href="https://rimelight.com"
            label="Named external"
            aria-label="Rimelight website"
          />
        </div>
      ),
    },
    {
      id: "rel-and-target",
      get title() {
        return t("app.text.rel-target-controls");
      },
      description:
        "noRel removes the rel attribute, rel overrides it, and target replaces the default new-tab behavior.",
      render: () => (
        <div class="flex items-center gap-4 flex-wrap">
          <RLLink href="https://rimelight.com" label="Default rel" />
          <RLLink href="https://rimelight.com" label="No rel" noRel />
          <RLLink href="https://rimelight.com" label="Same tab" target="_self" />
        </div>
      ),
    },
    {
      id: "localize",
      get title() {
        return t("app.text.localize-href");
      },
      description:
        "Internal hrefs are localized by default. localize={false} keeps the href exactly as given.",
      render: () => (
        <div class="flex items-center gap-4 flex-wrap">
          <RLLink href="/dev/components" label="Localized" />
          <RLLink href="/dev/components" label="Verbatim" localize={false} />
        </div>
      ),
    },
    {
      id: "icons-and-slots",
      get title() {
        return t("app.text.icons-slots");
      },
      description:
        "Leading and trailing icons, leadingSlot and trailingSlot overrides, and the external icon toggle.",
      render: () => (
        <div class="flex items-center gap-4 flex-wrap">
          <RLLink href="/dev/components" label="Leading icon" leadingIcon="book-open" />
          <RLLink href="/dev/components" label="Trailing icon" trailingIcon="arrow-right" />
          <RLLink
            href="/dev/components"
            leadingSlot={<span class="text-sm">✨</span>}
            trailingSlot={<span class="text-xs">NEW</span>}
          >
            Custom slots
          </RLLink>
          <RLLink href="https://rimelight.com" label="Hide external icon" noExternalIcon />
        </div>
      ),
    },
    {
      id: "active-and-disabled",
      get title() {
        return t("app.text.active-disabled-states");
      },
      description:
        "Active links carry aria-current (page by default, or the current value). Disabled links drop the href and report aria-disabled.",
      render: () => (
        <div class="flex items-center gap-4 flex-wrap">
          <RLLink href="/dev/components" label="Active" active />
          <RLLink href="/dev/components" label="Current step" active current="step" />
          <RLLink href="/dev/components" label="Disabled" disabled />
        </div>
      ),
    },
  ],
  checklist: [
    {
      criterion: "API parity (Link)",
      status: "pass",
      notes:
        "label, children, href, localize, external, externalIcon, noExternalIcon, target, rel, noRel, current, active, disabled, leadingIcon, leadingSlot, trailingIcon, trailingSlot, class, ref, aria-label.",
    },
    {
      criterion: "Full WAI-ARIA compliance",
      status: "pass",
      notes:
        "Native anchor semantics. aria-current set when active. aria-disabled and no href when disabled. Decorative icons aria-hidden. Screen-reader hint for links opening a new tab, suppressed when an explicit aria-label carries the name.",
    },
    {
      criterion: "Secure external links",
      status: "pass",
      notes: 'External links default to rel="noopener noreferrer". noRel or rel="" omits rel.',
    },
    {
      criterion: "No inline styles (CSP-safe, UnoCSS only)",
      status: "pass",
      notes: "No inline style attributes; styling lives in link.theme.ts.",
    },
    {
      criterion: "Exclusively named exports",
      status: "pass",
      notes: "RLLink, RLLinkProps and link.helpers exports are all named.",
    },
    {
      criterion: "Audited components render bare (no harness wrappers)",
      status: "pass",
      notes:
        "The sandbox preview renders a bare RLLink; only the control panel and test-scenario grids are layout containers.",
    },
  ],
};
