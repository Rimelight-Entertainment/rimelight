import { type Component, createEffect } from "solid-js"

export const SignOutPage: Component = () => {
  createEffect(
    () => true,
    () => {
      if (typeof window !== "undefined") {
        window.location.href = "/"
      }
    }
  )
  return null
}

export default SignOutPage
