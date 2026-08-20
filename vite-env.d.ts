interface ViteTypeOptions {
  strictImportMetaEnv: unknown
}

interface ImportMetaEnv {
  readonly MODE: string
  readonly BASE_URL: string
  readonly PROD: boolean
  readonly DEV: boolean
  readonly SSR: boolean
  readonly VITE_APP_TITLE?: string
  readonly VITE_API_URL?: string
  readonly TURNSTILE_SITE_KEY?: string
  readonly DATABASE_URL?: string
  readonly BETTER_AUTH_SECRET?: string
  readonly BETTER_AUTH_URL?: string
  readonly CONSTRUCTION_MODE?: string
  readonly CONSTRUCTION_AUTH?: string
  readonly CONSTRUCTION_GUEST_EMAIL?: string
  readonly CONSTRUCTION_GUEST_PASSWORD?: string
  readonly GITHUB_TOKEN?: string
  [key: string]: string | boolean | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
