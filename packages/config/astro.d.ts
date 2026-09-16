/// <reference types="astro/client" />

declare module "*.astro" {
  export default {} as import("astro/runtime/server").AstroComponentFactory
}
