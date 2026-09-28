import { type Component } from "solid-js"
import AppLayout from "#layouts/AppLayout"

export const StudioPartnershipsPage: Component = () => {
  return (
    <AppLayout title="Studio Partnerships" description="Partner with Rimelight Entertainment">
      <div class="max-w-7xl mx-auto px-4 py-16">
        <h1 class="text-4xl font-extrabold text-white">Studio Partnerships</h1>
        <p class="text-neutral-400 mt-4 text-lg">
          Collaborate on publishing, technology co-development, and creative ventures.
        </p>
      </div>
    </AppLayout>
  )
}

export default StudioPartnershipsPage
