declare module "*.astro" {
  const component: any
  export default component
}

declare module "virtual:rimelight-cms/parent-layout" {
  const layout: any
  export default layout
}

declare module "virtual:rimelight-cms/db" {
  export const db: any
}

declare module "virtual:rimelight-cms/storage" {
  export const storageConfig: any
}
