/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

// Enables importing .astro components inside .ts files (e.g., email rendering)
declare module "*.astro" {
  export default {} as import("astro/runtime/server").AstroComponentFactory;
}

declare module "astro:i18n" {
  export function getRelativeLocaleUrl(locale: string, path?: string): string;
  export function getAbsoluteLocaleUrl(locale: string, path?: string): string;
}

declare module "@rimelight/i18n:runtime" {
  export * from "@rimelight/i18n/runtime";
}
