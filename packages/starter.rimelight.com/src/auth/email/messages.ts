import en from "@/translations/en.json"
import pt from "@/translations/pt.json"
import es from "@/translations/es.json"

const translations: Record<string, any> = { en, pt, es }

export type EmailMessages = {
  common: typeof en.email_common
  verification: typeof en.email_verification
  passwordReset: typeof en.email_password_reset
  signupNotification: typeof en.email_signup_notification
}

export function getEmailMessages(locale = "en"): EmailMessages {
  const t = translations[locale] ?? en
  return {
    common: t.email_common ?? en.email_common,
    verification: t.email_verification ?? en.email_verification,
    passwordReset: t.email_password_reset ?? en.email_password_reset,
    signupNotification: t.email_signup_notification ?? en.email_signup_notification
  }
}
