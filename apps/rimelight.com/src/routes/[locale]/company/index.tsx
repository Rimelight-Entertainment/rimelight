import { type Component } from "solid-js"
import AppLayout from "#layouts/AppLayout"

export const CompanyIndexPage: Component = () => {
  return (
    <AppLayout title="Company" description="About Rimelight Entertainment">
      <div class="max-w-7xl mx-auto px-4 py-16">
        <h1 class="text-4xl font-extrabold text-white">Rimelight Entertainment</h1>
        <p class="text-neutral-400 mt-4 text-lg">
          Creating worlds, interactive entertainment, and open technologies.
        </p>
      </div>
    </AppLayout>
  )
}

export default CompanyIndexPage
