declare module "cloudflare:workers" {
  /**
   * Ambient Cloudflare Workers env — populated at runtime by the CF runtime.
   */
  export const env: Record<string, any>;
}
