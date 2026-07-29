/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

// Enables importing `.astro` components inside `.ts` files (e.g., email rendering)
declare module "*.astro" {
  export default {} as import("astro/runtime/server").AstroComponentFactory;
}
