import DevLayout from "#layouts/DevLayout";
import { For, Show } from "solid-js";
import { type JSX } from "@solidjs/web";
import { RLButton } from "@rimelight/ui";
import {
  CONSTRUCTION_GUEST_COOKIE,
  buildCspHeader,
  createSecurityHead,
  getSecurityConfig,
  getTurnstileSiteKey,
  isTurnstileEnabled,
} from "@rimelight/security";

const DEMO_NONCE = "abC0123def456GHI";

const formatCsp = (csp: string): string => csp.replace(/;\s*/g, ";\n").trim();

const parseCsp = (csp: string): Record<string, string[]> => {
  const result: Record<string, string[]> = {};
  for (const clause of csp.split("; ")) {
    if (!clause) continue;
    const [directive, ...values] = clause.split(" ");
    result[directive!] = values;
  }
  return result;
};

const summarizeHeadTags = (tags: { tag: string; children?: string }[]): string => {
  const lines = tags.map((t) => {
    const snippet = (t.children ?? "").replace(/\s+/g, " ").trim().slice(0, 84);
    return `${t.tag}${snippet ? `: ${snippet}…` : ""}`;
  });
  return lines.length ? lines.join("\n") : "(no tags)";
};

export default function DevSecurityPage() {
  const config = getSecurityConfig();
  const ratelimitOptions =
    typeof config.ratelimit === "object" && config.ratelimit !== null
      ? config.ratelimit
      : undefined;
  const cspProd = buildCspHeader(config);
  const cspNonce = buildCspHeader(config, DEMO_NONCE);
  const cspTurnstile = buildCspHeader({ ...config, turnstile: true });
  const directives = parseCsp(cspProd);
  const fullHead = createSecurityHead({ devReporter: true });
  const minimalHead = createSecurityHead({
    trustedTypes: false,
    nonceSync: false,
    devReporter: false,
  });

  const sections = (): {
    title: string;
    mono?: boolean;
    output?: string;
    rows: {
      label?: string;
      mono?: boolean;
      code?: string;
      description?: string;
      value?: string;
      content?: JSX.Element;
    }[];
  }[] => [
    {
      title: "Current Values",
      rows: [
        {
          label: "Security Config",
          code: `getSecurityConfig()`,
          description:
            "The plugin options ship as JSON from the virtual module; the same object is consumed by the runtime, middleware, and head injection.",
          value: JSON.stringify(config, null, 2),
        },
        {
          label: "Domain",
          code: `getSecurityConfig().domain`,
          value: String(config.domain ?? "(unset)"),
        },
        {
          label: "Image Sources",
          code: `getSecurityConfig().imgSrc`,
          value: JSON.stringify(config.imgSrc ?? []),
        },
        {
          label: "Rate Limited Routes",
          code: `getSecurityConfig().ratelimit?.routes`,
          value: JSON.stringify(ratelimitOptions?.routes ?? []),
        },
        {
          label: "Rate Limiter",
          code: `typeof getSecurityConfig().ratelimit`,
          value: typeof config.ratelimit,
        },
      ],
    },
    {
      title: "buildCspHeader()",
      mono: true,
      rows: [
        {
          label: "Production CSP",
          code: `buildCspHeader(getSecurityConfig())`,
          description:
            "Default directive set resolved from the active plugin options, without a script nonce.",
          value: formatCsp(cspProd),
        },
        {
          label: "CSP with script nonce",
          code: `buildCspHeader(getSecurityConfig(), "${DEMO_NONCE}")`,
          description:
            "Passing a nonce opts into 'strict-dynamic' mode: first-party scripts are allowed via nonce, then load their own dependencies.",
          value: formatCsp(cspNonce),
        },
        {
          label: "Turnstile enabled",
          code: `buildCspHeader({ ...getSecurityConfig(), turnstile: true })`,
          description:
            "Enabling the Turnstile option relaxes connect-src/frame-src to allow challenges.cloudflare.com.",
          value: formatCsp(cspTurnstile),
        },
      ],
    },
    {
      title: "Directives",
      mono: true,
      rows: Object.entries(directives).map(([directive, values]) => ({
        label: directive,
        mono: true,
        code: `directives["${directive}"]`,
        value: values.length ? values.join(" ") : "\u2014",
      })),
    },
    {
      title: "createSecurityHead()",
      mono: true,
      output: fullHead.html,
      rows: [
        {
          label: "Full head",
          code: `createSecurityHead({ devReporter: true })`,
          description:
            "Emits Trusted Types fallback, nonce sync, and a dev-only CSP violation reporter. In production, nonces/SRI are injected by the middleware via HTMLRewriter instead.",
          value: summarizeHeadTags(fullHead.tags),
        },
        {
          label: "Minimal head",
          code: `createSecurityHead({ trustedTypes: false, nonceSync: false, devReporter: false })`,
          description:
            "All optional scripts disabled; used when the middleware is the only security layer.",
          value: minimalHead.html || "(empty)",
        },
      ],
    },
    {
      title: "Turnstile",
      rows: [
        {
          label: "Enabled",
          code: `isTurnstileEnabled()`,
          description:
            "Requires both TURNSTILE_SITE_KEY and TURNSTILE_SECRET_KEY to be present in the environment.",
          value: String(isTurnstileEnabled()),
        },
        {
          label: "Site Key",
          code: `getTurnstileSiteKey()`,
          description:
            "Resolves the public site key from the environment; used to render the widget on forms.",
          value: getTurnstileSiteKey() ?? "not configured",
        },
      ],
    },
    {
      title: "Construction Mode",
      rows: [
        {
          label: "Guest Cookie",
          code: `CONSTRUCTION_GUEST_COOKIE`,
          description:
            "HMAC-signed guest token set by signInConstructionGuest() when the site is in construction mode.",
          value: CONSTRUCTION_GUEST_COOKIE,
        },
        {
          label: "Passphrase auth",
          code: `submitConstructionPassphrase({ passphrase: "••••", rememberMe: true })`,
          description:
            "Client helper that POSTs the passphrase to the guest sign-in endpoint for a session cookie.",
          value: "POST /api/construction-guest",
        },
      ],
    },
    {
      title: "Public Endpoints",
      rows: [
        {
          label: "Security policy",
          code: `/.well-known/security.txt`,
          description:
            "RFC 9116 security.txt emitted by the seo plugin using the configured security contact.",
          content: (
            <div class="flex gap-sm">
              <RLButton
                variant="soft"
                color="neutral"
                href="/.well-known/security.txt"
                label=".well-known/security.txt"
                rel="external"
              />
              <RLButton
                variant="soft"
                color="neutral"
                href="/security.txt"
                label="/security.txt"
                rel="external"
              />
            </div>
          ),
        },
      ],
    },
  ];

  return (
    <DevLayout>
      <div class="flex flex-col gap-2xl">
        <header class="flex flex-col gap-xs">
          <h1 class="text-3xl text-highlighted">Security</h1>
          <p class="text-sm text-muted">
            Verifying @rimelight/security config resolution, generated CSP headers, nonce and
            Trusted Types head injection, and Turnstile / construction runtime flags.
          </p>
        </header>

        <For each={sections()}>
          {(section) => (
            <section class="bg-elevated/20">
              <header class="bg-elevated/40 px-xl py-sm">
                <h2 class="text-xs text-muted">
                  {section.mono ? <code>{section.title}</code> : section.title}
                </h2>
              </header>
              <hr class="border-default" />
              <div class="flex flex-col">
                <For each={section.rows}>
                  {(row, index) => (
                    <>
                      <Show when={index() > 0}>
                        <hr class="border-default" />
                      </Show>
                      <div class="flex items-start gap-xl px-xl py-md">
                        <div class="flex min-w-0 flex-1 flex-col gap-xs">
                          <Show when={row.label}>
                            {row.mono ? (
                              <code class="text-sm text-highlighted">{row.label}</code>
                            ) : (
                              <span class="text-sm text-highlighted">{row.label}</span>
                            )}
                          </Show>
                          <Show when={row.code}>
                            <pre class="whitespace-pre-wrap break-words text-xs text-muted">
                              {row.code}
                            </pre>
                          </Show>
                          <Show when={row.description}>
                            <p class="text-xs text-muted">{row.description}</p>
                          </Show>
                        </div>
                        <div class="min-w-0 text-sm text-highlighted">
                          <Show when={row.value}>
                            <pre class="whitespace-pre-wrap break-words">{row.value}</pre>
                          </Show>
                          {row.content}
                        </div>
                      </div>
                    </>
                  )}
                </For>
              </div>
              <Show when={section.output}>
                <hr class="border-default" />
                <div class="px-xl py-md">
                  <h3 class="mb-xs text-xs text-muted">Rendered output</h3>
                  <pre class="max-h-[30rem] overflow-auto whitespace-pre-wrap break-words rounded-md bg-elevated/40 px-sm py-xs font-mono text-xs text-muted">
                    {section.output}
                  </pre>
                </div>
              </Show>
            </section>
          )}
        </For>
      </div>
    </DevLayout>
  );
}
