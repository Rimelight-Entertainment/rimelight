import { untrack, type Component } from "solid-js";
import { useSearchParams } from "@solidjs/router";
import { useHead } from "@solidjs/web";
import { createSeoHead } from "@rimelight/seo/head";
import ComponentAuditShell from "../../../components/dev/ComponentAuditShell.tsx";

export const DevComponentsPage: Component = () => {
  const [searchParams] = useSearchParams();
  const requestedComp = () => {
    const c = searchParams["comp"];
    return (Array.isArray(c) ? c[0] : c) || "accordion";
  };

  useHead(
    createSeoHead({
      title: "Component Testing",
      description: "Barebones testing page for Rimelight UI components",
      noindex: true,
    }).tags,
  );

  return (
    <>
      <main class="container mx-auto px-4 py-8">
        <ComponentAuditShell initialComponentId={untrack(requestedComp)} />
      </main>
    </>
  );
};

export default DevComponentsPage;
