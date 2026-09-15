declare module "*.astro" {
  export default {} as import("astro/runtime/server").AstroComponentFactory
}

declare module "virtual:rimelight-seo-config" {
  const config: import("./integration.js").RimelightSeoOptions
  export default config
}
