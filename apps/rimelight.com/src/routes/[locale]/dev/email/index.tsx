import { type Component, For, createSignal } from "solid-js";
import DevLayout from "#layouts/DevLayout";
import { getCurrentLocale } from "@rimelight/i18n";

const links = [
  ["verification", "Verify Email"],
  ["password-reset", "Password Reset"],
  ["signup-notification", "Sign-up Notification"],
];

export const DevEmailIndexPage: Component = () => {
  const locale = getCurrentLocale();
  const [statusMap, setStatusMap] = createSignal<Record<string, { text: string; error?: boolean }>>(
    {},
  );
  const [loadingMap, setLoadingMap] = createSignal<Record<string, boolean>>({});

  const sendTest = async (template: string) => {
    setLoadingMap((prev) => ({ ...prev, [template]: true }));
    setStatusMap((prev) => ({ ...prev, [template]: { text: "Sending..." } }));

    try {
      const response = await fetch("/api/dev/email/preview/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template, locale }),
      });
      const raw = await response.text();
      let result: { ok?: boolean; error?: string };
      try {
        result = JSON.parse(raw);
      } catch {
        throw new Error(raw || `Request failed with status ${response.status}`);
      }
      if (!response.ok) throw new Error(result.error ?? "Unable to send test email");
      setStatusMap((prev) => ({ ...prev, [template]: { text: "Test email sent." } }));
    } catch (err) {
      setStatusMap((prev) => ({
        ...prev,
        [template]: {
          text: err instanceof Error ? err.message : "Unable to send test email",
          error: true,
        },
      }));
    } finally {
      setLoadingMap((prev) => ({ ...prev, [template]: false }));
    }
  };

  return (
    <DevLayout
      title="Email Templates Preview"
      description="Preview and send test transactional email templates"
      currentSection="email"
      maxWidth="xl"
    >
      <div class="flex flex-col gap-6">
        <div class="border-b border-default pb-4">
          <h1 class="text-2xl font-bold text-highlighted">Email Templates Preview</h1>
          <p class="text-xs text-muted mt-1">
            Validate HTML rendering across email clients and trigger test dispatches.
          </p>
        </div>

        <For each={links}>
          {([tplPath, title]) => {
            const pathKey = tplPath || "";
            return (
              <article class="bg-elevated/20 border border-default rounded-xl p-6 shadow-xs">
                <h2 class="text-lg font-bold text-highlighted mb-4">{title}</h2>
                <div class="flex flex-wrap gap-3">
                  <a
                    href={`/${locale}/dev/email/${pathKey}`}
                    class="inline-block px-4 py-2 bg-primary text-inverted text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Open Preview
                  </a>
                  <button
                    type="button"
                    disabled={Boolean(loadingMap()[pathKey])}
                    onClick={() => sendTest(pathKey)}
                    class="inline-block px-4 py-2 bg-elevated hover:bg-elevated/80 border border-default text-toned text-xs font-medium rounded-lg cursor-pointer disabled:opacity-50 transition-colors"
                  >
                    Send Test Email
                  </button>
                </div>
                <p
                  class="min-h-5 mt-3 text-xs font-mono"
                  style={{
                    color: statusMap()[pathKey]?.error
                      ? "var(--rl-error-500)"
                      : "var(--rl-success-500)",
                  }}
                >
                  {statusMap()[pathKey]?.text || ""}
                </p>
              </article>
            );
          }}
        </For>
      </div>
    </DevLayout>
  );
};

export default DevEmailIndexPage;
