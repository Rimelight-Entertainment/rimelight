declare module "virtual:rimelight-cms" {
  export const routePrefix: string;
  export const storageConfig: import("./storage/index").StorageConfig;
  export const cmsOptions: {
    routePrefix: string;
    storage: import("./storage/index").StorageConfig;
  };
  export default cmsOptions;
}

declare module "virtual:rimelight-cms/db" {
  export const db: any;
  const defaultExport: any;
  export default defaultExport;
}
