/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare module "*.astro" {
  import type { AstroComponentFactory } from "astro/runtime/server";
  const AstroComponent: AstroComponentFactory;
  export default AstroComponent;
}
