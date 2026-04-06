/// <reference types="astro/client" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PROD: boolean
  readonly DEV: boolean
  // add other env vars here...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

import type { Locale } from "./domain/i18n/schema"

declare global {
  namespace App {
    interface Locals {
      uiLocale: Locale
      translationLocale: Locale
      cfContext: any
      isMissingContent?: boolean
    }
  }

  declare module "astro:content" {
    export interface CollectionEntry<T extends string = any> {
      id: string
      data: any
      slug: string
      body: string
      collection: T
    }
    export const getCollection: (
      collection: string,
      filter?: (entry: CollectionEntry) => boolean
    ) => Promise<CollectionEntry[]>
    export const getEntry: (collection: string, id: string) => Promise<CollectionEntry>
  }

  declare module "cloudflare:workers" {
    export const env: Env
  }

  declare module "~icons/*" {
    import type { AstroComponentFactory } from "astro/runtime/server/index.js"
    const component: AstroComponentFactory
    export default component
  }
}
