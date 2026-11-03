import { type Component, createSignal } from "solid-js";
import { useHead } from "@solidjs/web";
import { createPageHead } from "@rimelight/seo/head";
import { RLPageSection } from "@rimelight/ui/components/page-section/RLPageSection.tsx";
import { RLCard } from "@rimelight/ui/components/card/RLCard.tsx";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import Turnstile from "#components/app/Turnstile";
import { t } from "@rimelight/i18n";
import { api } from "#api/client";

export const ContactPage: Component = () => {
  const [contactStatus, setContactStatus] = createSignal<{ text: string; error?: boolean } | null>(
    null,
  );

  let contactFormRef!: HTMLFormElement;

  const handleContactSubmit = async (e: Event) => {
    e.preventDefault();
    if (!contactFormRef) return;

    setContactStatus({ text: "Sending message..." });

    try {
      const res = await api.contact.$post({
        form: Object.fromEntries(new FormData(contactFormRef)) as any,
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        const errorMsg =
          !result.success && "error" in result
            ? (result as any).error
            : "Please check form fields and try again.";
        setContactStatus({
          text: errorMsg || "Please check form fields and try again.",
          error: true,
        });
        return;
      }

      setContactStatus({ text: "Message sent successfully! ✅", error: false });
      contactFormRef.reset();
      // @ts-ignore
      window.turnstile?.reset?.();
    } catch {
      setContactStatus({ text: "Failed to send message. Please try again.", error: true });
    }
  };

  useHead(() =>
    createPageHead({
      title: t("page.contact.meta.title"),
      description: t("page.contact.meta.description"),
    }),
  );

  return (
    <>
      <RLPageSection
        layout="hero"
        title={t("page.contact.hero.title")}
        description={t("page.contact.hero.description")}
        orientation="horizontal"
      />

      <RLPageSection orientation="vertical">
        <div class="max-w-2xl mx-auto w-full">
          {/* Contact Form Card */}
          <RLCard class="p-6 md:p-8 flex flex-col justify-between">
            <div>
              <h2 class="text-2xl font-bold text-[var(--rl-text)] mb-6 flex items-center gap-2">
                <span class="i-lucide-mail size-6 text-primary-500" />
                {t("page.contact.form.title")}
              </h2>

              <form
                ref={(el) => (contactFormRef = el)}
                onSubmit={handleContactSubmit}
                class="flex flex-col gap-4"
              >
                <div class="flex flex-col gap-1">
                  <label for="contact-name" class="text-sm font-medium text-[var(--rl-text-muted)]">
                    {t("page.contact.form.name.label")}
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    placeholder={t("page.contact.form.placeholder.name")}
                    class="w-full px-4 py-2.5 rounded-lg border border-neutral-300 bg-default text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                  />
                </div>

                <div class="flex flex-col gap-1">
                  <label
                    for="contact-email"
                    class="text-sm font-medium text-[var(--rl-text-muted)]"
                  >
                    {t("page.contact.form.email.label")}
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    placeholder={t("page.contact.form.placeholder.email")}
                    class="w-full px-4 py-2.5 rounded-lg border border-neutral-300 bg-default text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                  />
                </div>

                <div class="flex flex-col gap-1">
                  <label
                    for="contact-subject"
                    class="text-sm font-medium text-[var(--rl-text-muted)]"
                  >
                    {t("page.contact.form.subject.label")}
                  </label>
                  <input
                    id="contact-subject"
                    name="subject"
                    type="text"
                    placeholder={t("page.contact.form.placeholder.subject")}
                    class="w-full px-4 py-2.5 rounded-lg border border-neutral-300 bg-default text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                  />
                </div>

                <div class="flex flex-col gap-1">
                  <label
                    for="contact-message"
                    class="text-sm font-medium text-[var(--rl-text-muted)]"
                  >
                    {t("page.contact.form.message.label")}
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={5}
                    required
                    minlength={10}
                    placeholder={t("page.contact.form.placeholder.message")}
                    class="w-full px-4 py-2.5 rounded-lg border border-neutral-300 bg-default text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 transition resize-y min-h-[120px]"
                  />
                </div>

                <Turnstile />

                <RLButton
                  type="submit"
                  color="primary"
                  variant="solid"
                  block={true}
                  leadingIcon="i-lucide-send"
                  label={t("page.contact.form.send.button")}
                  class="mt-2"
                />

                {contactStatus() && (
                  <p
                    class={`text-sm min-h-[1.5rem] mt-2 font-medium ${
                      contactStatus()?.error
                        ? "text-red-500"
                        : contactStatus()?.text.includes("✅")
                          ? "text-green-600 dark:text-green-400"
                          : "text-neutral-500"
                    }`}
                    role="status"
                  >
                    {contactStatus()?.text}
                  </p>
                )}
              </form>
            </div>
          </RLCard>
        </div>
      </RLPageSection>
    </>
  );
};

export default ContactPage;
