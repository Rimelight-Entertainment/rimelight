/// <reference path="../.astro/types.d.ts" />

declare module "virtual:rimelight-ui" {
  export function getUIConfig(): Record<string, any>
}

// Enables importing .astro components inside .ts files (e.g., email rendering)
declare module "*.astro" {
  export default {} as import("astro/runtime/server").AstroComponentFactory;
}
