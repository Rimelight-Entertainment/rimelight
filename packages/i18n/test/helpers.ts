import { config, setCurrentLocale } from "../src/runtime";

export function setLocaleConfig(options: Partial<typeof config>): void {
  Object.assign(config, options);
  setCurrentLocale(config.defaultLocale);
}

export function setTranslations(
  data: Record<string, Record<string, any>>,
  options?: Partial<typeof config>,
): void {
  for (const k in config.translations) delete config.translations[k];
  Object.assign(config.translations, data);
  if (options) {
    setLocaleConfig(options);
  }
}

export interface MockHonoContext {
  req: {
    raw: Request;
    url: string;
    method: string;
    header: (name: string) => string | undefined;
    query: (name: string) => string | undefined;
  };
  set: (key: string, value: any) => void;
  get: (key: string) => any;
  redirect: (target: string, status?: number) => Response;
  json: (data: any, status?: number) => Response;
}

export function createMockContext(request: Request): MockHonoContext {
  const store = new Map<string, any>();
  const parsedUrl = new URL(request.url);

  return {
    req: {
      raw: request,
      url: request.url,
      method: request.method,
      header: (name: string) => request.headers.get(name) ?? undefined,
      query: (name: string) => parsedUrl.searchParams.get(name) ?? undefined,
    },
    set: (k: string, v: any) => store.set(k, v),
    get: (k: string) => store.get(k),
    redirect: (target: string, status = 302) =>
      new Response(null, { status, headers: { Location: target } }),
    json: (data: any, status = 200) =>
      new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" },
      }),
  };
}
