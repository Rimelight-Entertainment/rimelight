declare module "virtual:rimelight-security" {
  export interface RimelightSecurityVirtualConfig {
    config: import("./types").SecurityConfig;
    manifest: Record<string, string>;
  }

  export const config: import("./types").SecurityConfig;
  export const manifest: Record<string, string>;
  const defaultExport: RimelightSecurityVirtualConfig;
  export default defaultExport;
}
