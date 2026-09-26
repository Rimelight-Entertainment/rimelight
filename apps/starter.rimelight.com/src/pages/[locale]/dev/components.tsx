import { type Component } from "solid-js"
import { useSearchParams } from "@solidjs/router"
import AppLayout from "#layouts/AppLayout"
import ComponentAuditShell from "../../../components/dev/ComponentAuditShell.tsx"

export const DevComponentsPage: Component = () => {
  const [searchParams] = useSearchParams()
  const requestedComp = () => {
    const c = searchParams["comp"]
    return (Array.isArray(c) ? c[0] : c) || "accordion"
  }

  return (
    <AppLayout title="Component Testing" description="Testing page for Rimelight UI components">
      <main class="container mx-auto px-4 py-8">
        <ComponentAuditShell initialComponentId={requestedComp()} />
      </main>
    </AppLayout>
  )
}

export default DevComponentsPage
