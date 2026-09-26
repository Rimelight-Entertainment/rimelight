import { type Component, createResource } from "solid-js"
import AppLayout from "#layouts/AppLayout"
import AppError from "#components/app/AppError"
import { auth } from "@rimelight/auth"

export const Page403: Component = () => {
  const [session] = createResource(async () => {
    try {
      return await auth.getSession()
    } catch {
      return null
    }
  })

  return (
    <AppLayout
      title="403 - Access Denied"
      description="Your account does not have administrator privileges required to access this page."
    >
      <AppError
        code={403}
        title="Access Denied"
        description="Your account does not have administrator privileges required to access this page."
        userEmail={session()?.email || ""}
        requiredRole="admin"
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

export default Page403
