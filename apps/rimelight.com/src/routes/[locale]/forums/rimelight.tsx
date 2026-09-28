import { type Component } from "solid-js"
import AppLayout from "#layouts/AppLayout"

export const RimelightForumsPage: Component = () => {
  return (
    <AppLayout
      title="Rimelight Forums"
      description="Official discussion forums for Rimelight Entertainment"
    >
      <div class="max-w-7xl mx-auto px-4 py-16">
        <h1 class="text-4xl font-extrabold text-white">Rimelight Forums</h1>
        <p class="text-neutral-400 mt-2">
          Join community discussions, share feedback, and connect with developers.
        </p>
      </div>
    </AppLayout>
  )
}

export default RimelightForumsPage
