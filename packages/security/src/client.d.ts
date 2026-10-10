declare module "virtual:rimelight-security" {
  export interface RimelightSecurityVirtualConfig {
    config: import("./plugin").RimelightSecurityPluginOptions;
    manifest: Record<string, string>;
  }

  export const config: import("./plugin").RimelightSecurityPluginOptions;
  export const manifest: Record<string, string>;
  const defaultExport: RimelightSecurityVirtualConfig;
  export default defaultExport;
}
