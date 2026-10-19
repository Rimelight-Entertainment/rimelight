import { untrack, type Component } from "solid-js";
import { useSearchParams } from "@solidjs/router";
import DevLayout from "#layouts/DevLayout";
import ComponentAuditShell from "#components/dev/ComponentAuditShell.tsx";
import { t } from "@rimelight/i18n";

export const DevComponentsPage: Component = () => {
  const [searchParams] = useSearchParams();
  const requestedComp = () => {
    const c = searchParams["comp"];
    return (Array.isArray(c) ? c[0] : c) || "accordion";
  };

  return (
    <DevLayout title={t("dev_components.title")} description={t("dev_components.description")}>
      <div class="flex flex-col gap-2xl">
        <header class="flex flex-col gap-xs">
          <h1 class="text-3xl text-highlighted">{t("dev_components.title")}</h1>
          <p class="text-sm text-muted">{t("dev_components.description")}</p>
        </header>

        <ComponentAuditShell initialComponentId={untrack(requestedComp)} />
      </div>
    </DevLayout>
  );
};

export default DevComponentsPage;
