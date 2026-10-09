declare module "#db/schema" {
  export const pages: any;
}

declare module "drizzle-orm" {
  export const and: (...args: any[]) => any;
  export const isNull: (column: any) => any;
  export const isNotNull: (column: any) => any;
  export const sql: any;
  export const eq: (column: any, value: any) => any;
}

declare module "@rimelight/cms" {
  export const renderCorpusMarkdown: (db: any, options: any) => Promise<string>;
}
