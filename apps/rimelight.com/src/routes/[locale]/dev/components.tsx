import { untrack, type Component } from "solid-js";
import { useSearchParams } from "@solidjs/router";
import DevLayout from "#layouts/DevLayout";
import ComponentAuditShell from "#components/dev/ComponentAuditShell.tsx";

export const DevComponentsPage: Component = () => {
  const [searchParams] = useSearchParams();
  const requestedComp = () => {
    const c = searchParams["comp"];
    return (Array.isArray(c) ? c[0] : c) || "accordion";
  };

  return (
    <DevLayout
      title="Components"
      description="Interactive sandboxes, edge-case test scenarios, WCAG checklists, and prop spec sheets for Rimelight UI components"
    >
      <div class="flex flex-col gap-2xl">
        <header class="flex flex-col gap-xs">
          <h1 class="text-3xl text-highlighted">Components</h1>
          <p class="text-sm text-muted">
            Interactive sandboxes, edge-case test scenarios, WCAG checklists, and prop spec sheets
            for Rimelight UI components.
          </p>
        </header>

        <ComponentAuditShell initialComponentId={untrack(requestedComp)} />
      </div>
    </DevLayout>
  );
};

export default DevComponentsPage;
