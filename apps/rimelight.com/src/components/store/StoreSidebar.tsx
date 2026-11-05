import type { Component } from "solid-js";
import { getLocaleUrl } from "@rimelight/i18n";
import { t } from "@rimelight/i18n";

export const StoreSidebar: Component = () => {
  const categories = [
    { label: t("app.text.all-products"), icon: "lucide:grid-3x3", to: "/store" },
    { label: t("app.text.digital-goods"), icon: "lucide:zap", to: "/store/digital" },
  ];

  const supportLinks = [
    { label: t("app.text.shipping-policy"), to: "/company/legal/shipping-policy" },
    { label: t("app.text.contact-support"), to: "/franchises/grand-tale/support" },
  ];

  return (
    <div class="flex flex-col gap-6 p-4">
      <div class="flex flex-col gap-3">
        <h3 class="text-xs font-black uppercase tracking-widest text-gray-400 px-4">
          {t("app.text.browse")}
        </h3>
        <nav class="flex flex-col gap-1">
          {categories.map((cat) => (
            <a
              href={getLocaleUrl(cat.to)}
              class="text-sm font-medium text-gray-600 hover:text-primary-500 px-4 py-2 transition-colors"
            >
              {cat.label}
            </a>
          ))}
        </nav>
      </div>

      <div class="rounded-2xl bg-primary-500/5 border border-primary-500/10 p-5 flex flex-col gap-1">
        <span class="text-xs font-bold text-primary-500/60 uppercase tracking-tight">
          Active Offers
        </span>
        <span class="text-2xl font-black text-primary-600">{t("app.text.10-off")}</span>
        <p class="text-[10px] text-gray-500 leading-tight">
          Apply 'RIMELIGHT' at checkout for your first order.
        </p>
      </div>

      <div class="flex flex-col gap-3 mt-auto">
        <h3 class="text-xs font-black uppercase tracking-widest text-gray-400 px-4">
          {t("app.text.help-center")}
        </h3>
        <nav class="flex flex-col gap-1 px-4 text-sm">
          {supportLinks.map((link) => (
            <a
              href={getLocaleUrl(link.to)}
              class="text-gray-500 hover:text-primary-500 transition-colors py-1"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default StoreSidebar;
