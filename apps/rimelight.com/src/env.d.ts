// Enables importing `.astro` components inside `.ts` files (e.g., email rendering)
declare module "*.astro" {
  export default {} as import("astro/runtime/server").AstroComponentFactory
}

declare module "virtual:rimelight-ui-docs-meta" {
  const meta: Record<string, any>
  export default meta
}
