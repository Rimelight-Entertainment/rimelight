import { handle } from "@astrojs/cloudflare/handler"

export default {
  async fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext): Promise<Response> {
    return handle(request, env, ctx)
  }
} satisfies ExportedHandler<Cloudflare.Env>
