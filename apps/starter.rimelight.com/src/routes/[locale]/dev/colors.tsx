import { type Component } from "solid-js"
import AppLayout from "#layouts/AppLayout"
import ColorTestingMatrix from "../../../components/ColorTestingMatrix.tsx"

export const DevColorsPage: Component = () => {
  return (
    <AppLayout title="Dev Colors" description="Rimelight UI color testing matrix">
      <main class="container mx-auto px-4 py-8">
        <ColorTestingMatrix />
      </main>
    </AppLayout>
  )
}

export default DevColorsPage
