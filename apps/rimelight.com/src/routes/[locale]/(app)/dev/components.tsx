import { untrack, type Component } from "solid-js";
import { useSearchParams } from "@solidjs/router";
import ComponentAuditShell from "#components/dev/ComponentAuditShell.tsx";
import { t } from "@rimelight/i18n";

export const DevComponentsPage: Component = () => {
  const [searchParams] = useSearchParams();
  const requestedComp = () => {
    const c = searchParams["comp"];
    return (Array.isArray(c) ? c[0] : c) || "accordion";
  };

  return (
    <div class="flex flex-col gap-2xl">
      <header class="flex flex-col gap-xs">
        <h1 class="text-3xl text-highlighted">{t("page.dev.components.title")}</h1>
        <p class="text-sm text-muted">{t("page.dev.components.description")}</p>
      </header>

      <ComponentAuditShell initialComponentId={untrack(requestedComp)} />
    </div>
  );
};

export default DevComponentsPage;
