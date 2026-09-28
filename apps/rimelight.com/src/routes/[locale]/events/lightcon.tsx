import { type Component } from "solid-js"
import AppLayout from "#layouts/AppLayout"

export const LightconPage: Component = () => {
  return (
    <AppLayout title="LightCon" description="Annual Rimelight Developer & Community Conference">
      <div class="max-w-7xl mx-auto px-4 py-24 text-center">
        <h1 class="text-5xl font-black text-white uppercase tracking-tight">LightCon</h1>
        <p class="text-neutral-400 mt-4 text-xl">
          The annual celebration of games, tech, and creator culture.
        </p>
      </div>
    </AppLayout>
  )
}

export default LightconPage
