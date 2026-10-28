import { type RouteSectionProps } from "@solidjs/router";
import { t, getLocaleUrl } from "@rimelight/i18n";
import { RLContainer, RLHeader, RLLogo } from "@rimelight/ui";

export default function DevRouteLayout(props: RouteSectionProps) {
  return (
    <>
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
              alt={t("page.dev.layout.brand")}
            />
            <span class="truncate font-bold text-highlighted">{t("page.dev.layout.brand")}</span>
          </a>
        }
      />
      <RLContainer class="py-xl">{props.children}</RLContainer>
    </>
  );
}
