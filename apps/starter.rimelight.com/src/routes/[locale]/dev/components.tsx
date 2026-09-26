import { type Component } from "solid-js"
import { useSearchParams } from "@solidjs/router"
import { Title, Meta } from "@solidjs/meta"
import ComponentAuditShell from "../../../components/dev/ComponentAuditShell.tsx"

export const DevComponentsPage: Component = () => {
  const [searchParams] = useSearchParams()
  const requestedComp = () => {
    const c = searchParams["comp"]
    return (Array.isArray(c) ? c[0] : c) || "accordion"
  }

  return (
    <>
      <Title>Component Testing</Title>
      <Meta name="description" content="Barebones testing page for Rimelight UI components" />
      <Meta name="robots" content="noindex, nofollow" />
      <main class="container mx-auto px-4 py-8">
        <ComponentAuditShell initialComponentId={requestedComp()} />
      </main>
    </>
  )
}

export default DevComponentsPage
