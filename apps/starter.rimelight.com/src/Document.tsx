import type { ParentProps } from "solid-js";
import { HydrationScript, useHead } from "@solidjs/web";
import { getDocumentTheme } from "@rimelight/ui/theme";
import { createSeoHead } from "@rimelight/seo/head";
import { getCurrentLocale } from "@rimelight/i18n";
import "virtual:uno.css";

export default function Document(props: ParentProps) {
  useHead(createSeoHead());

  return (
    <html lang={getCurrentLocale()} data-theme={getDocumentTheme()}>
      <head>
        <HydrationScript />
      </head>
      <body>{props.children}</body>
    </html>
  );
}
