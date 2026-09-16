declare module "virtual:rimelight-security-config" {
  export const config: import("./types").SecurityOptions
}

declare module "virtual:sri-manifest" {
  export const manifest: Record<string, string>
}
