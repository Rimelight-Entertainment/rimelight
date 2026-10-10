declare module "virtual:rimelight-auth" {
  export const config: import("./types").AuthPluginConfig;
  export default config;
}

declare module "virtual:rimelight-auth/server" {
  export const auth: import("./types").AuthAdapter;
  export const authAdapter: import("./types").AuthAdapter;
  export default auth;
}
