import { type Component, createSignal } from "solid-js"
import BlankLayout from "#layouts/BlankLayout"
import { RLCard } from "@rimelight/ui/components/card/RLCard.tsx"
import { RLFormField } from "@rimelight/ui/components/form-field/RLFormField.tsx"
import { RLInput } from "@rimelight/ui/components/input/RLInput.tsx"
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx"
import { RLCheckbox } from "@rimelight/ui/components/checkbox/RLCheckbox.tsx"
import { RLLogo } from "@rimelight/ui/components/logo/RLLogo.tsx"
import { t } from "@rimelight/i18n"

export const ConstructionPage: Component = () => {
  const [email, setEmail] = createSignal("")
  const [agreed, setAgreed] = createSignal(false)

  return (
    <BlankLayout
      title={t("page_under_construction.title")}
      description={t("page_under_construction.description")}
    >
      <div class="min-h-screen flex items-center justify-center p-4 bg-neutral-950">
        <RLCard class="w-full max-w-md p-8 bg-neutral-900 border-neutral-800">
          <div class="flex flex-col items-center text-center gap-6">
            <RLLogo variant="logomark" class="h-16 w-auto text-primary-500" />
            <h1 class="text-2xl font-bold text-white">{t("page_under_construction.title")}</h1>
            <p class="text-neutral-400 text-sm">{t("page_under_construction.description")}</p>

            <form class="w-full flex flex-col gap-4 mt-2" onSubmit={(e) => e.preventDefault()}>
              <RLFormField label={t("common.email") || "Email"}>
                <RLInput
                  type="email"
                  placeholder="you@example.com"
                  value={email()}
                  onInput={(e: any) => setEmail(e.currentTarget?.value || "")}
                />
              </RLFormField>

              <div class="flex items-center gap-2 text-left">
                <RLCheckbox
                  checked={agreed()}
                  onChange={(e) => setAgreed(e.currentTarget.checked)}
                  label="Notify me when site goes live"
                />
              </div>

              <RLButton
                label="Subscribe"
                color="primary"
                variant="solid"
                type="submit"
                class="w-full mt-2"
              />
            </form>
          </div>
        </RLCard>
      </div>
    </BlankLayout>
  )
}

export default ConstructionPage
