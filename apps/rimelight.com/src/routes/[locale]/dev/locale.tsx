import { type Component, createSignal } from "solid-js";
import DevLayout from "#layouts/DevLayout";
import { getCurrentLocale, getLocaleUrl, getLocales, t } from "@rimelight/i18n";
import { RLLocaleSelector } from "@rimelight/ui";

export const DevLocalePage: Component = () => {
  const [value] = createSignal(getCurrentLocale());

  const currentPath = () => {
    if (typeof window === "undefined") return "/";
    return window.location.pathname;
  };

  const handleNative = (e: Event & { currentTarget: HTMLSelectElement }) => {
    const code = e.currentTarget.value;
    const path = currentPath();
    const segments = path.split("/").filter(Boolean);
    const known = ["en", "pt", "es"];
    if (segments.length > 0 && known.includes(segments[0]!)) {
      segments[0] = code;
      window.location.href = `/${segments.join("/")}`;
    } else {
      window.location.href = `/${code}${path}`;
    }
  };

  const handleI18n = (code: string) => {
    window.location.href = getLocaleUrl(`/${code}`, code);
  };

  return (
    <DevLayout
      title="Locale & i18n Diagnostics"
      description="Barebones locale switcher test, URL rewriting diagnostics, and verification of @rimelight/i18n"
      currentSection="locale"
      maxWidth="2xl"
    >
      <div class="flex flex-col gap-6">
        <div class="border-b border-default pb-4">
          <h1 class="text-2xl font-bold text-highlighted">Bare Locale Debug & Diagnostics</h1>
          <p class="text-xs text-muted mt-1">
            Validating i18n URL rewriting, router params, and RLLocaleSelector reactive sync.
          </p>
        </div>

        {/* Runtime Readouts */}
        <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-col gap-2 font-mono text-xs">
          <div class="flex justify-between py-1 border-b border-default/40">
            <span class="text-muted">Current Locale:</span>
            <span class="font-bold text-primary">{getCurrentLocale()}</span>
          </div>
          <div class="flex justify-between py-1 border-b border-default/40">
            <span class="text-muted">Window Pathname:</span>
            <span class="font-bold text-highlighted">{currentPath()}</span>
          </div>
          <div class="flex justify-between py-1 border-b border-default/40">
            <span class="text-muted">Available Locales:</span>
            <span class="font-bold text-highlighted">{JSON.stringify(getLocales())}</span>
          </div>
          <div class="flex justify-between py-1">
            <span class="text-muted">Sample Translation:</span>
            <span class="font-bold text-highlighted">{t("app_header.links_home_label")}</span>
          </div>
        </div>

        {/* Component Under Test */}
        <div class="flex flex-col gap-2">
          <h2 class="text-xs font-mono font-bold text-muted uppercase tracking-wider">
            RLLocaleSelector (Component Under Test)
          </h2>
          <div class="flex flex-col gap-3 p-4 border border-default rounded-xl bg-elevated/20">
            <div class="text-xs text-muted mb-1">
              Default with <code class="font-mono text-primary">getLocales()</code> and{" "}
              <code class="font-mono text-primary">currentLocale={getCurrentLocale()}</code>:
            </div>
            <RLLocaleSelector locales={getLocales()} currentLocale={getCurrentLocale()} />
          </div>
        </div>

        {/* Native Select Manual Rewrite */}
        <div class="flex flex-col gap-2">
          <h2 class="text-xs font-mono font-bold text-muted uppercase tracking-wider">
            Native Select (Manual URL Rewrite)
          </h2>
          <div class="p-4 border border-default rounded-xl bg-elevated/20 flex flex-col gap-2">
            <select
              class="border border-default rounded-lg p-2 text-xs bg-default text-highlighted max-w-xs"
              value={value()}
              onChange={handleNative}
            >
              <option value="en">en (English)</option>
              <option value="pt">pt (Português)</option>
              <option value="es">es (Español)</option>
            </select>
          </div>
        </div>

        {/* getLocaleUrl Direct Test */}
        <div class="flex flex-col gap-2">
          <h2 class="text-xs font-mono font-bold text-muted uppercase tracking-wider">
            i18n getLocaleUrl Direct Links
          </h2>
          <div class="p-4 border border-default rounded-xl bg-elevated/20 flex flex-col gap-3">
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                class="px-3 py-1.5 rounded-lg border border-default bg-default hover:bg-elevated text-xs font-medium"
                onClick={() => handleI18n("en")}
              >
                Go to /en
              </button>
              <button
                type="button"
                class="px-3 py-1.5 rounded-lg border border-default bg-default hover:bg-elevated text-xs font-medium"
                onClick={() => handleI18n("pt")}
              >
                Go to /pt
              </button>
              <button
                type="button"
                class="px-3 py-1.5 rounded-lg border border-default bg-default hover:bg-elevated text-xs font-medium"
                onClick={() => handleI18n("es")}
              >
                Go to /es
              </button>
            </div>
            <div class="text-[11px] text-muted">
              Triggering programmatic navigation via getLocaleUrl with specific target locale
              parameter.
            </div>
          </div>
        </div>
      </div>
    </DevLayout>
  );
};

export default DevLocalePage;
