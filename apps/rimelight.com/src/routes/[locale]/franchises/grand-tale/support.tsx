import { type Component } from "solid-js"
import GrandTaleLayout from "#layouts/GrandTaleLayout"

export const GrandTaleSupportPage: Component = () => {
  return (
    <GrandTaleLayout
      title="Grand Tale Support"
      description="Get help with your Grand Tale account and technical issues"
    >
      <div class="max-w-4xl mx-auto px-4 py-20">
        <h1 class="text-4xl font-extrabold text-white uppercase tracking-tight mb-4">
          Grand Tale Support
        </h1>
        <p class="text-neutral-400">Search troubleshooting guides or submit a support ticket.</p>
      </div>
    </GrandTaleLayout>
  )
}

export default GrandTaleSupportPage
