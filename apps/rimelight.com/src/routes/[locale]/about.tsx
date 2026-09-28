import { type Component } from "solid-js"
import AppLayout from "#layouts/AppLayout"
import { RLDate } from "@rimelight/ui/components/date/RLDate.tsx"
import { RLImage } from "@rimelight/ui/components/image/RLImage.tsx"
import { t } from "@rimelight/i18n"

export const AboutPage: Component = () => {
  return (
    <AppLayout title={t("page_about.title")} description={t("page_about.description")}>
      <article class="max-w-4xl mx-auto px-4 py-16">
        <div class="hero-image mb-8">
          <RLImage
            width={1020}
            height={510}
            src="https://cdn.rimelight.com/images/placeholder.webp"
            alt="About Rimelight"
          />
        </div>
        <div class="prose dark:prose-invert max-w-none">
          <div class="title mb-8">
            <div class="date text-muted mb-2">
              <RLDate date={new Date("August 08 2023")} />
            </div>
            <h1 class="text-4xl font-extrabold tracking-tight">{t("page_about.title")}</h1>
            <hr class="my-4 border-neutral-800" />
          </div>
          <p class="text-lg leading-relaxed text-neutral-300">{t("page_about.description")}</p>
        </div>
      </article>
    </AppLayout>
  )
}

export default AboutPage
