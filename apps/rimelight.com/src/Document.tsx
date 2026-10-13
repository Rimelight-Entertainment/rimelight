import type { ParentProps } from "solid-js";
import { HydrationScript, useHead } from "@solidjs/web";
import { createUiHead } from "@rimelight/ui/head";
import { createSecurityHead } from "@rimelight/security/head";
import { createSeoHead } from "@rimelight/seo/head";
import { getCurrentLocale } from "@rimelight/i18n";
import "virtual:uno.css";

export default function Document(props: ParentProps) {
  useHead([...createSeoHead().tags, ...createSecurityHead(), ...createUiHead()]);

  return (
    <html lang={getCurrentLocale()}>
      <head>
        <HydrationScript />
      </head>
      <body class="isolate">{props.children}</body>
    </html>
  );
}
