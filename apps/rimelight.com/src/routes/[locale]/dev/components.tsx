import { untrack, type Component } from "solid-js";
import { useSearchParams } from "@solidjs/router";
import DevLayout from "#layouts/DevLayout";
import ComponentAuditShell from "../../../components/dev/ComponentAuditShell.tsx";

export const DevComponentsPage: Component = () => {
  const [searchParams] = useSearchParams();
  const requestedComp = () => {
    const c = searchParams["comp"];
    return (Array.isArray(c) ? c[0] : c) || "accordion";
  };

  return (
    <DevLayout
      title="Component Audit Hub"
      description="Isolated testing, interactive sandboxes, and quality checklists for Rimelight UI components"
      currentSection="components"
      maxWidth="7xl"
    >
      <ComponentAuditShell initialComponentId={untrack(requestedComp)} />
    </DevLayout>
  );
};

export default DevComponentsPage;
