import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLLogo } from "@rimelight/ui/components/logo/RLLogo.tsx";
import type { ComponentAuditDefinition } from "./types";

const VARIANTS = ["logomark", "logotype"] as const;
const MODES = ["color", "black", "white"] as const;

export const LogoSandbox = (): JSX.Element => {
  const [variant, setVariant] = createSignal<(typeof VARIANTS)[number]>("logomark");
  const [mode, setMode] = createSignal<(typeof MODES)[number]>("color");

  return (
    <div class="flex flex-col gap-6">
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-4 text-xs">
        <label class="flex items-center gap-2">
          Variant
          <select
            class="rounded border border-default bg-default px-2 py-1"
            value={variant()}
            onChange={(e) => setVariant(e.currentTarget.value as (typeof VARIANTS)[number])}
          >
            <For each={VARIANTS}>{(v) => <option value={v}>{v}</option>}</For>
          </select>
        </label>
        <label class="flex items-center gap-2">
          Mode
          <select
            class="rounded border border-default bg-default px-2 py-1"
            value={mode()}
            onChange={(e) => setMode(e.currentTarget.value as (typeof MODES)[number])}
          >
            <For each={MODES}>{(m) => <option value={m}>{m}</option>}</For>
          </select>
        </label>
      </div>
      <div class="p-8 rounded-xl border border-default bg-elevated/10 flex justify-center">
        <RLLogo variant={variant()} mode={mode()} alt="Rimelight" class="h-16 w-auto" />
      </div>
    </div>
  );
};

export const logoAudit: ComponentAuditDefinition = {
  id: "logo",
  name: "Logo",
  category: "Media & Visuals",
  status: "Auditing",
  description:
    "Brand logo rendered as a link to the home page, with logo set variants, color modes, light/dark switching, and a custom source override.",
  importPath: "@rimelight/ui/components/logo/RLLogo.tsx",
  renderSandbox: () => <LogoSandbox />,
  testScenarios: [
    {
      id: "default-slot",
      title: "Default slot",
      description: "Children render in place of the logo when no logo set resolves.",
      render: () => (
        <RLLogo variant="unconfigured-logo-set" alt="Rimelight">
          Rimelight
        </RLLogo>
      ),
    },
    {
      id: "logomark",
      title: "Logomark",
      description: "Logomark set in color mode.",
      render: () => (
        <RLLogo variant="logomark" mode="color" alt="Rimelight logomark" class="h-12 w-auto" />
      ),
    },
    {
      id: "light-dark",
      title: "Automatic light and dark",
      description: "Without a mode, the light and dark assets switch with the theme.",
      render: () => <RLLogo variant="logomark" alt="Rimelight" class="h-12 w-auto" />,
    },
  ],
  checklist: [
    { criterion: "Root links to href, localized", status: "pending" },
    { criterion: "Root aria-label uses alt", status: "pending" },
    { criterion: "Light/dark images switch with data-theme=dark", status: "pending" },
  ],
};
