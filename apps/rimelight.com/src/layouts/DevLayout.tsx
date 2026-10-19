import { type Component, Show } from "solid-js";
import { type JSX } from "@solidjs/web";
import AppLayout from "#layouts/AppLayout";
import { t, getLocaleUrl } from "@rimelight/i18n";
import { RLContainer, RLHeader, RLLogo } from "@rimelight/ui";

export interface DevLayoutProps {
  title?: string;
  description?: string;
  actions?: JSX.Element;
  children?: JSX.Element;
}

export const DevLayout: Component<DevLayoutProps> = (props) => {
  return (
    <AppLayout
      title={`${props.title ?? t("dev_layout.brand")} | Dev`}
      description={props.description}
      noindex={true}
    >
      <RLHeader
        stackIndex={1}
        fixed={true}
        class="bg-primary-400"
        left={
          <a href={getLocaleUrl("/dev")} class="flex flex-row items-center gap-sm min-w-0">
            <RLLogo
              as="span"
              variant="logomark"
              mode="color"
              class="h-8 w-auto"
              alt={t("dev_layout.brand")}
            />
            <span class="truncate font-bold text-highlighted">{t("dev_layout.brand")}</span>
            <Show when={props.title}>
              <span class="text-toned">/</span>
              <span class="truncate text-toned">{props.title}</span>
            </Show>
          </a>
        }
        right={<div class="flex items-center gap-sm">{props.actions}</div>}
      />
      <RLContainer class="py-xl">{props.children}</RLContainer>
    </AppLayout>
  );
};

export default DevLayout;
