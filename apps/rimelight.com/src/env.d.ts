// Bindings declared in cloudflare.config.ts. `cf workers types` does not infer them into `Env`
// yet, so they are declared here and merged into the generated `Cloudflare.Env`.
// Keep this list in step with cloudflare.config.ts.
declare namespace Cloudflare {
  interface Env {
    AUTH0_DOMAIN: string;
    AUTH0_CLIENT_ID: string;
    AUTH0_CLIENT_SECRET: string;
    AUTH0_AUDIENCE: string;
    AUTH0_SECRET: string;
    RATE_LIMIT: RateLimit;
    RATE_LIMIT_LOGIN: RateLimit;
    HYPERDRIVE: Hyperdrive;
    DATABASE_URL: string;
  }
}
