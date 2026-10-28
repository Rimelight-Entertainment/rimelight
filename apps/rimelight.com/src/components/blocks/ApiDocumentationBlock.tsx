import { type Component, Show, For, createSignal, createMemo } from "solid-js";
import type { BaseBlock } from "@rimelight/cms";
import { t } from "@rimelight/i18n";

function filterProps(props: any[], options: { hide?: string[]; show?: string[] }): any[] {
  if (options.show?.length) return props.filter((p: any) => options.show!.includes(p.name));
  if (options.hide?.length) return props.filter((p: any) => !options.hide!.includes(p.name));
  return props;
}

export interface ApiDocumentationBlockProps {
  block: BaseBlock;
  locale?: string;
}

export const ApiDocumentationBlock: Component<ApiDocumentationBlockProps> = (props) => {
  const p = () => (props.block.props || {}) as any;
  const componentName = () => p().componentName;
  const sections = () => p().sections || {};
  const hide = () => p().hide || [];
  const show = () => p().show || [];
  const compMeta = () => props.block.props?.["meta"];
  const themeCode = () => props.block.props?.["themeCode"];

  const filterOpts = () => ({ hide: hide(), show: show() });
  const filteredProps = () => filterProps(compMeta()?.props ?? [], filterOpts());
  const slots = () => compMeta()?.slots ?? [];
  const emits = () => compMeta()?.emits ?? [];

  const [isThemeExpanded, setIsThemeExpanded] = createSignal(false);
  const [changelogError, setChangelogError] = createSignal(false);

  const changelogData = createMemo<any[]>(
    async () => {
      const hasChangelog = sections().changelog;
      const name = componentName();
      if (!hasChangelog || !name) return [];
      try {
        const res = await fetch(`/api/github/changelog?component=${name}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch {
        setChangelogError(true);
        return [];
      }
    },
    { loadingValue: [] },
  );

  const changelogLoading = () => changelogData() === undefined;

  return (
    <div class="api-documentation-wrapper">
      {sections().props !== false && (
        <div class="api-documentation-section mb-6">
          <h3 class="text-lg font-semibold text-highlighted mb-3">{t("app.text.props")}</h3>
          <Show
            when={filteredProps().length > 0}
            fallback={<p class="text-sm italic text-muted">{t("app.text.no-props-to-display")}</p>}
          >
            <div class="overflow-x-auto">
              <table class="w-full text-sm border-collapse">
                <thead>
                  <tr class="border-b border-default">
                    <th class="text-left py-2 px-3 font-semibold">{t("app.text.name")}</th>
                    <th class="text-left py-2 px-3 font-semibold">{t("app.text.type")}</th>
                    <th class="text-left py-2 px-3 font-semibold">{t("app.text.required")}</th>
                    <th class="text-left py-2 px-3 font-semibold">{t("app.text.default")}</th>
                    <th class="text-left py-2 px-3 font-semibold">{t("app.text.description")}</th>
                  </tr>
                </thead>
                <tbody>
                  <For each={filteredProps()}>
                    {(prop) => (
                      <tr class="border-b border-default/50">
                        <td class="py-2 px-3">
                          <span class="font-mono text-sm">{prop.name}</span>
                        </td>
                        <td class="py-2 px-3">
                          <span class="font-mono text-xs text-muted">{prop.type}</span>
                        </td>
                        <td class="py-2 px-3">{prop.required ? "Yes" : "No"}</td>
                        <td class="py-2 px-3">
                          {prop.default !== undefined ? (
                            <span class="font-mono text-xs text-muted">{prop.default}</span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td class="py-2 px-3">{prop.description || "—"}</td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
          </Show>
        </div>
      )}

      {sections().slots !== false && (
        <div class="api-documentation-section mb-6">
          <h3 class="text-lg font-semibold text-highlighted mb-3">{t("app.text.slots")}</h3>
          <Show
            when={slots().length > 0}
            fallback={<p class="text-sm italic text-muted">{t("app.text.no-slots-to-display")}</p>}
          >
            <div class="overflow-x-auto">
              <table class="w-full text-sm border-collapse">
                <thead>
                  <tr class="border-b border-default">
                    <th class="text-left py-2 px-3 font-semibold">{t("app.text.slot")}</th>
                    <th class="text-left py-2 px-3 font-semibold">{t("app.text.type")}</th>
                  </tr>
                </thead>
                <tbody>
                  <For each={slots()}>
                    {(slot) => (
                      <tr class="border-b border-default/50">
                        <td class="py-2 px-3">
                          <span class="font-mono text-sm">{slot.name}</span>
                        </td>
                        <td class="py-2 px-3">
                          {Object.keys(slot.bindings || {}).length > 0 ? (
                            <span class="font-mono text-xs text-muted">
                              {Object.values(slot.bindings)[0] as string}
                            </span>
                          ) : (
                            <span class="text-muted">-</span>
                          )}
                        </td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
          </Show>
        </div>
      )}

      {sections().emits !== false && (
        <div class="api-documentation-section mb-6">
          <h3 class="text-lg font-semibold text-highlighted mb-3">{t("app.text.emits")}</h3>
          <Show
            when={emits().length > 0}
            fallback={
              <p class="text-sm italic text-muted">
                {t("app.text.no-events-emitted-by-this-component")}
              </p>
            }
          >
            <div class="overflow-x-auto">
              <table class="w-full text-sm border-collapse">
                <thead>
                  <tr class="border-b border-default">
                    <th class="text-left py-2 px-3 font-semibold">{t("app.text.event")}</th>
                    <th class="text-left py-2 px-3 font-semibold">{t("app.text.payload")}</th>
                  </tr>
                </thead>
                <tbody>
                  <For each={emits()}>
                    {(emit) => (
                      <tr class="border-b border-default/50">
                        <td class="py-2 px-3">
                          <span class="font-mono text-sm">{emit.name}</span>
                        </td>
                        <td class="py-2 px-3">
                          <span class="font-mono text-xs text-muted">{emit.type}</span>
                        </td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
          </Show>
        </div>
      )}

      {sections().theme !== false && (
        <div class="api-documentation-section mb-6">
          <h3 class="text-lg font-semibold text-highlighted mb-3">{t("app.text.theme")}</h3>
          <Show
            when={themeCode()}
            fallback={
              <p class="text-sm italic text-muted">{t("app.text.no-theme-data-available")}</p>
            }
          >
            <div class="relative border border-default rounded-lg overflow-hidden group mb-6">
              <div
                class="overflow-hidden relative transition-[max-height] duration-300 ease-in-out"
                style={{ "max-height": isThemeExpanded() ? "none" : "240px" }}
              >
                <div class="m-0 border-0 rounded-none">
                  <figure class="m-0 border-0">
                    <pre class="overflow-x-auto m-0 border-0 rounded-none bg-muted p-4">
                      <code class="text-sm font-mono">{themeCode()}</code>
                    </pre>
                  </figure>
                </div>
                <Show when={!isThemeExpanded()}>
                  <div class="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent pointer-events-none transition-opacity duration-300" />
                </Show>
              </div>
              <div
                class={`flex justify-center pb-3 pt-4 ${
                  isThemeExpanded()
                    ? "relative bg-neutral-50 border-t border-default"
                    : "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 via-background/70 to-transparent pt-12"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setIsThemeExpanded(!isThemeExpanded())}
                  class="px-4 py-1.5 text-xs font-semibold text-neutral-50 bg-primary hover:bg-primary/90 border border-default rounded-md shadow-md transition-all duration-200 cursor-pointer"
                >
                  {isThemeExpanded() ? "Hide theme config" : "Show theme config"}
                </button>
              </div>
            </div>
          </Show>
        </div>
      )}

      {sections().changelog && (
        <div class="api-documentation-section mb-6">
          <h3 class="text-lg font-semibold text-highlighted mb-3">{t("app.text.changelog")}</h3>
          <div class="api-changelog-container group">
            <Show when={changelogLoading()}>
              <div class="py-6 flex flex-col gap-4">
                <div class="animate-pulse h-4 bg-muted rounded w-1/4" />
                <div class="animate-pulse h-3 bg-muted rounded w-full" />
                <div class="animate-pulse h-3 bg-muted rounded w-5/6" />
              </div>
            </Show>

            <Show when={!changelogLoading() && changelogError()}>
              <div class="text-sm italic text-muted py-2">
                {t("app.text.failed-to-load-changelog")}
              </div>
            </Show>

            <Show
              when={
                !changelogLoading() && !changelogError() && (changelogData()?.length ?? 0) === 0
              }
            >
              <div class="text-sm italic text-muted py-2">
                {t("app.text.no-recent-changes-found")}
              </div>
            </Show>

            <Show
              when={!changelogLoading() && !changelogError() && (changelogData()?.length ?? 0) > 0}
            >
              <div class="flex flex-col">
                <For each={changelogData() || []}>
                  {(release) => (
                    <div class="mb-4">
                      <Show when={release.tag}>
                        <div class="font-medium text-highlighted text-sm flex items-center mb-2">
                          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold bg-primary/10 text-primary border border-primary/20">
                            {release.tag === "unreleased" ? t("app.text.soon") : release.tag}
                          </span>
                        </div>
                      </Show>
                      <For each={release.commits || []}>
                        {(commit: any) => (
                          <div class="flex items-start gap-2 text-sm py-1">
                            <a
                              href={`https://github.com/Rimelight-Entertainment/rimelight/commit/${commit.sha}`}
                              target="_blank"
                              rel="noreferrer"
                              class="font-mono text-xs px-1.5 py-0.5 bg-muted border border-default rounded text-muted hover:text-highlighted hover:border-default shrink-0"
                            >
                              {commit.sha ? commit.sha.slice(0, 7) : ""}
                            </a>
                            <span class="text-muted text-sm leading-snug pt-0.5">
                              {commit.message}
                            </span>
                          </div>
                        )}
                      </For>
                    </div>
                  )}
                </For>
              </div>
            </Show>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiDocumentationBlock;
