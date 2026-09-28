import { type Component, For, createSignal } from "solid-js"
import BlankLayout from "#layouts/BlankLayout"
import { getLocale } from "@rimelight/i18n"

const links = [
  ["verification", "Verify Email"],
  ["password-reset", "Password Reset"],
  ["signup-notification", "Sign-up Notification"]
]

export const DevEmailIndexPage: Component = () => {
  const locale = getLocale()
  const [statusMap, setStatusMap] = createSignal<Record<string, { text: string; error?: boolean }>>(
    {}
  )
  const [loadingMap, setLoadingMap] = createSignal<Record<string, boolean>>({})

  const sendTest = async (template: string) => {
    setLoadingMap((prev) => ({ ...prev, [template]: true }))
    setStatusMap((prev) => ({ ...prev, [template]: { text: "Sending..." } }))

    try {
      const response = await fetch("/api/dev/email/preview/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template, locale })
      })
      const raw = await response.text()
      let result: { ok?: boolean; error?: string }
      try {
        result = JSON.parse(raw)
      } catch {
        throw new Error(raw || `Request failed with status ${response.status}`)
      }
      if (!response.ok) throw new Error(result.error ?? "Unable to send test email")
      setStatusMap((prev) => ({ ...prev, [template]: { text: "Test email sent." } }))
    } catch (err) {
      setStatusMap((prev) => ({
        ...prev,
        [template]: {
          text: err instanceof Error ? err.message : "Unable to send test email",
          error: true
        }
      }))
    } finally {
      setLoadingMap((prev) => ({ ...prev, [template]: false }))
    }
  }

  return (
    <BlankLayout title="Email Templates Preview" description="Preview Rimelight email templates">
      <main class="max-w-xl mx-auto p-10 font-sans">
        <h1 class="text-2xl font-bold text-neutral-100 mb-6">Email Templates Preview</h1>
        <For each={links}>
          {([tplPath, title]) => {
            const pathKey = tplPath || ""
            return (
              <article class="bg-neutral-900 border border-neutral-800 rounded-lg p-6 my-4 shadow-sm">
                <h2 class="text-lg font-bold text-white mb-4">{title}</h2>
                <div class="flex flex-wrap gap-3">
                  <a
                    href={`/${locale}/dev/email/${pathKey}`}
                    class="inline-block px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-md"
                  >
                    Open Preview
                  </a>
                  <button
                    type="button"
                    disabled={Boolean(loadingMap()[pathKey])}
                    onClick={() => sendTest(pathKey)}
                    class="inline-block px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-medium rounded-md cursor-pointer disabled:opacity-50"
                  >
                    Send Test Email
                  </button>
                </div>
                <p
                  class="min-h-5 mt-3 text-xs"
                  style={{
                    color: statusMap()[pathKey]?.error ? "#ef4444" : "#22c55e"
                  }}
                >
                  {statusMap()[pathKey]?.text || ""}
                </p>
              </article>
            )
          }}
        </For>
      </main>
    </BlankLayout>
  )
}

export default DevEmailIndexPage
