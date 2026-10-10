import { type Component, createSignal } from "solid-js";
import BlankLayout from "#layouts/BlankLayout";
import { getCurrentLocale, getLocaleUrl, getLocales, t } from "@rimelight/i18n";
import { RLLocaleSelector } from "@rimelight/ui";

export const DebugLocalePage: Component = () => {
  const [value] = createSignal(getCurrentLocale());

  const currentPath = () => {
    if (typeof window === "undefined") return "/";
    return window.location.pathname;
  };

  const handleNative = (e: Event & { currentTarget: HTMLSelectElement }) => {
    const code = e.currentTarget.value;
    const path = currentPath();
    const segments = path.split("/").filter(Boolean);
    const known = ["en", "pt"];
    if (segments.length > 0 && known.includes(segments[0]!)) {
      segments[0] = code;
      window.location.href = `/${segments.join("/")}`;
    } else {
      window.location.href = `/${code}${path}`;
    }
  };

  const handleI18n = (code: string) => {
    window.location.href = getLocaleUrl(`/${code}`, { locale: code });
  };

  return (
    <BlankLayout title="Locale Debug">
      <div class="p-8 flex flex-col gap-6 max-w-xl">
        <div class="flex flex-col gap-2">
          <h1 class="text-xl font-bold">Bare locale debug</h1>
          <div>Current Locale: {getCurrentLocale()}</div>
          <div>Pathname: {currentPath()}</div>
          <div>Available Locales: {JSON.stringify(getLocales())}</div>
          <div>Sample Text: {t("app_header.links_home_label")}</div>
        </div>

        <div class="flex flex-col gap-2">
          <h2 class="font-semibold">RLLocaleSelector (Component Under Test)</h2>
          <div class="flex flex-col gap-3 p-4 border rounded bg-default">
            <div>
              <div class="text-xs text-neutral-400 mb-1">
                Default (locales from @rimelight/i18n, currentLocale={getCurrentLocale()}):
              </div>
              <RLLocaleSelector locales={getLocales()} currentLocale={getCurrentLocale()} />
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <h2 class="font-semibold">Native select (manual URL rewrite)</h2>
          <select class="border rounded p-2 max-w-xs" value={value()} onChange={handleNative}>
            <option value="en">en</option>
            <option value="pt">pt</option>
          </select>
        </div>

        <div class="flex flex-col gap-2">
          <h2 class="font-semibold">i18n getLocaleUrl (locale=code)</h2>
          <div class="flex gap-2">
            <button class="border rounded p-2" onClick={() => handleI18n("en")}>
              Go to /en (via getLocaleUrl)
            </button>
            <button class="border rounded p-2" onClick={() => handleI18n("pt")}>
              Go to /pt (via getLocaleUrl)
            </button>
          </div>
          <div class="text-xs text-neutral-500">Clicking uses getLocaleUrl with locale param.</div>
        </div>
      </div>
    </BlankLayout>
  );
};

export default DebugLocalePage;
