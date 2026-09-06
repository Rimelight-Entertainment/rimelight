// Enables importing .astro components inside .ts files (e.g., email rendering)
declare module "*.astro" {
  export default {} as import("astro/runtime/server").AstroComponentFactory
}

declare module "@rimelight/i18n:runtime" {
  export * from "./runtime"
}
