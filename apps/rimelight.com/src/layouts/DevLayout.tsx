import { type Component, Show } from "solid-js";
import { type JSX } from "@solidjs/web";
import AppLayout from "#layouts/AppLayout";
import { getLocaleUrl } from "@rimelight/i18n";
import { RLContainer, RLHeader, RLLogo } from "@rimelight/ui";

export const DEV_BRAND = "Rimelight Developer Workspace";

export interface DevLayoutProps {
  title?: string;
  description?: string;
  actions?: JSX.Element;
  children?: JSX.Element;
}

export const DevLayout: Component<DevLayoutProps> = (props) => {
  return (
    <AppLayout
      title={`${props.title ?? DEV_BRAND} | Dev`}
      description={props.description}
      noindex={true}
    >
      <RLHeader
        stackIndex={2}
        fixed={true}
        class="bg-primary-400"
        left={
          <a href={getLocaleUrl("/dev")} class="flex flex-row items-center gap-3 min-w-0">
            <RLLogo as="span" variant="logomark" mode="color" class="h-5 w-auto" alt={DEV_BRAND} />
            <span class="font-mono text-xs font-bold leading-none text-highlighted">
              {DEV_BRAND}
            </span>
            <Show when={props.title}>
              <span class="font-mono text-xs leading-none text-muted/40">/</span>
              <span class="truncate font-mono text-xs leading-none text-muted">{props.title}</span>
            </Show>
          </a>
        }
        right={<div class="flex items-center gap-2">{props.actions}</div>}
      />
      <RLContainer class="py-xl">{props.children}</RLContainer>
    </AppLayout>
  );
};

export default DevLayout;
