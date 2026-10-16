declare module "virtual:rimelight-security" {
  export const config: import("./types").SecurityConfig;
  export const manifest: Record<string, string>;
  export default config;
}
