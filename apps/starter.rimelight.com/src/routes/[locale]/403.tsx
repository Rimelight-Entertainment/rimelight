import { type Component, createSignal, onSettled } from "solid-js"
import AppLayout from "#layouts/AppLayout"
import AppError from "#components/app/AppError"
import { authClient } from "@rimelight/auth"

export const Page403: Component = () => {
  const [userEmail, setUserEmail] = createSignal("")
  onSettled(() => {
    void authClient
      .getMe()
      .then((user) => {
        if (user?.email) setUserEmail(user.email)
      })
      .catch(() => {})
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
        userEmail={userEmail()}
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
