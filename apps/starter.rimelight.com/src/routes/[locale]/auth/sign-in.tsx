import { type Component, createEffect } from "solid-js";

export const SignInPage: Component = () => {
  createEffect(
    () => true,
    () => {
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    },
  );
  return null;
};

export default SignInPage;
