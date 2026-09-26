import { type Component } from "solid-js"
import AppLayout from "#layouts/AppLayout"
import AppError from "#components/app/AppError"

export const Page401: Component = () => {
  return (
    <AppLayout
      title="401 - Authentication Required"
      description="You must be signed in to access this page."
    >
      <AppError
        code={401}
        title="Authentication Required"
        description="You must be signed in to access this page."
        actions={[
          {
            label: "Go to Home Page",
            href: "/",
            variant: "solid",
            color: "primary",
            icon: "home"
          }
        ]}
      />
    </AppLayout>
  )
}

export default Page401
