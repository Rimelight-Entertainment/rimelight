# i18n Simplification Plan for starter.rimelight.com

## Summary

The starter.rimelight.com pages currently use two i18n patterns:

1. **Old pattern**: `useI18n(componentName, fallbackObject)` with inline fallback messages defined within the page/component
2. **New pattern**: `t("key")` for direct string lookups from centralized translation files

This plan simplifies all old-pattern usages by moving inline messages to the centralized `translations/*.json` files and replacing `useI18n` + `messages` object access with `t()` where appropriate.

---

## Old Pattern Files Identified

### 1. Pages using `useI18n()` with inline fallback objects (third argument)

These files pass a third argument to `useI18n()` containing inline fallback translations. This is the primary "within-page messages" pattern to eliminate.

| File                                    | Component Key       | Inline Keys Count |
| --------------------------------------- | ------------------- | ----------------- |
| `src/pages/[locale]/auth/sign-in.astro` | `page_auth_sign-in` | ~30               |
| `src/pages/[locale]/auth/sign-up.astro` | `page_auth_sign-up` | ~40               |
| `src/pages/[locale]/chat.astro`         | `chat_page`         | ~15               |
| `src/pages/[locale]/blog/index.astro`   | `blog`              | ~4                |
| `src/pages/[locale]/legal/index.astro`  | `legal`             | ~3                |

### 2. Pages using `useI18n()` with `messages` object (no inline fallbacks, but old messages pattern)

These use `useI18n("key")` and access `messages.key` instead of `t("key")`.

| File                                    | Component Key       |
| --------------------------------------- | ------------------- |
| `src/pages/[locale]/about.astro`        | `page_about`        |
| `src/pages/[locale]/contact.astro`      | `page_contact`      |
| `src/pages/[locale]/construction.astro` | `page_construction` |
| `src/pages/[locale]/i18n-test.astro`    | `page_test`         |
| `src/components/app/AppHeader.astro`    | `app_header`        |
| `src/components/app/AppFooter.astro`    | `app_footer`        |

### 3. Email messages with hardcoded English regardless of locale

| File                         | Issue                                                    |
| ---------------------------- | -------------------------------------------------------- |
| `src/auth/email/messages.ts` | `getEmailMessages()` always returns English translations |

### 4. Hardcoded English strings in templates

| File                                           | Hardcoded Strings                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/pages/[locale]/contact.astro`             | "Your Name *", "Email Address *", "Subject (Optional)", "Message *", "Send Message", "Upload Attachment", "Select File"                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `src/pages/[locale]/dashboard.astro`           | "Overview", "Users", "Orders", "Products", "Analytics", "Settings", "Dashboard Analytics", "Recent Orders", "Team Messages", "Revenue Analytics", "Recent Activity Log", "Users Management", "Order History", "Product Catalog", "Application Settings", "Last 30 days", "All Time", "This Month", "This Week", "Export Report", "Add New Item", "Add User", "Add Product", "Total Revenue", "Active Users", "Conversion Rate", "Avg. Order", "Password reset requested", "API rate limit exceeded", "Database backup completed", "System update installed", "General Settings", "Site Name", "Site Description", "Time Zone", "Security", "Password Policy", "Two-Factor Auth", "Sessions", "Notifications", "Email", "Push", "SMS", "Configure", "Dashboard Overview", "Sign in", "Sign up", "Sign in failed", "Signed in successfully", "Connection error", "Please check form fields and try again." |
| `src/components/auth/AuthSignInForm.astro`     | `?? "E-mail"`, `?? "your@email.com"`, `?? "Recover email"`, `?? "Password"`, `?? "Forgot password?"`, `?? "Remember me"`, `?? "Sign in"`, `?? "By signing in you agree to our"`, `?? "Terms of Service"`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `src/components/auth/AuthSignUpForm.astro`     | `?? "E-mail"`, `?? "your@email.com"`, `?? "Username"`, `?? "First name"`, `?? "Last name"`, `?? "Password"`, `?? "Confirm password"`, `?? "At least 8 characters"`, `?? "At least 1 number"`, `?? "At least 1 lowercase letter"`, `?? "At least 1 uppercase letter"`, `?? "At least 1 special character"`, `?? "I agree to the"`, `?? "Terms of Service"`, `?? "Subscribe to newsletter"`, `?? "Next"`, `?? "Previous"`, `?? "Sign up"`                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `src/components/auth/ConstructionSignIn.astro` | `emailLabel = "E-mail"`, `emailPlaceholder = "your@email.com"`, `passwordLabel = "Password"`, `rememberMeLabel = "Remember me"`, `signInButtonLabel = "Sign In"`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |

---

## Simplification Steps

### Step 1: Move inline fallback objects into `translations/en.json`

For each page that uses `useI18n(componentName, fallbackObject)`, add the keys to `translations/en.json` under the appropriate component key.

**Files to update:**

- `src/translations/en.json` — add keys for:
  - `page_auth_sign-in` (all ~30 keys from sign-in.astro)
  - `page_auth_sign-up` (all ~40 keys from sign-up.astro)
  - `chat_page` (all ~15 keys from chat.astro)
  - `blog` (all ~4 keys from blog/index.astro)
  - `legal` (all ~3 keys from legal/index.astro)

**Files to simplify:**

- `src/pages/[locale]/auth/sign-in.astro` — remove third argument from `useI18n()`
- `src/pages/[locale]/auth/sign-up.astro` — remove third argument from `useI18n()`
- `src/pages/[locale]/chat.astro` — remove third argument from `useI18n()`
- `src/pages/[locale]/blog/index.astro` — remove third argument from `useI18nAsync()`
- `src/pages/[locale]/legal/index.astro` — remove third argument from `useI18nAsync()`

### Step 2: Add missing translations to `pt.json` and `es.json`

For each key added to `en.json` in Step 1, add Portuguese and Spanish translations.

**Files to update:**

- `src/translations/pt.json`
- `src/translations/es.json`

### Step 3: Replace `useI18n` + `messages` pattern with `t()` in pages

Replace the `useI18n("key")` + `messages.key` pattern with `t("key")` in pages that currently use it.

**Files to update:**

- `src/pages/[locale]/about.astro` — replace `useI18n("page_about")` + `messages.title` with `t("page_about.title")` etc.
- `src/pages/[locale]/contact.astro` — replace `useI18n("page_contact")` + `messages.title` with `t("page_contact.title")` etc.
- `src/pages/[locale]/construction.astro` — replace `useI18n("page_construction")` + `messages.meta_title` with `t("page_construction.meta_title")` etc.
- `src/pages/[locale]/i18n-test.astro` — replace `useI18n("page_test")` + `messages.title` with `t("page_test.title")` etc.
- `src/components/app/AppHeader.astro` — replace `useI18n("app_header")` + `messages["link-groups_center_foundations_label"]` with `t("app_header.link-groups_center_foundations_label")` etc.
- `src/components/app/AppFooter.astro` — replace `useI18n("app_footer")` + `messages["links_resources_label"]` with `t("app_footer.links_resources_label")` etc.

### Step 4: Move hardcoded English strings into `translations/en.json`

Add translation keys for all hardcoded English strings found in templates.

**New keys to add to `en.json`:**

- `page_contact.contact_form_name_label` = "Your Name *"
- `page_contact.contact_form_email_label` = "Email Address *"
- `page_contact.contact_form_subject_label` = "Subject (Optional)"
- `page_contact.contact_form_message_label` = "Message *"
- `page_contact.contact_form_send_button` = "Send Message"
- `page_contact.upload_form_title` = "Upload a File" (already exists)
- `page_contact.upload_form_description` = "Share documents or images directly with us (PNG, JPEG, WEBP, or PDF up to 5 MB)." (already exists)
- `page_contact.upload_form_file_label` = "Select File"
- `page_contact.upload_form_upload_button` = "Upload Attachment"
- `page_contact.contact_form_placeholder_name` = "John Doe"
- `page_contact.contact_form_placeholder_email` = "john@example.com"
- `page_contact.contact_form_placeholder_subject` = "How can we help?"
- `page_contact.contact_form_placeholder_message` = "Write your message here..."

- `dashboard.*` keys for all hardcoded dashboard strings (see dashboard.astro for full list)

**Files to update:**

- `src/pages/[locale]/contact.astro` — replace hardcoded strings with `t()` calls
- `src/pages/[locale]/dashboard.astro` — replace hardcoded strings with `t()` calls
- `src/components/auth/AuthSignInForm.astro` — remove `??` fallback strings, use `t()` instead
- `src/components/auth/AuthSignUpForm.astro` — remove `??` fallback strings, use `t()` instead
- `src/components/auth/ConstructionSignIn.astro` — remove `??` fallback strings, use `t()` instead

### Step 5: Fix `getEmailMessages()` to be locale-aware

The `src/auth/email/messages.ts` file currently returns English translations regardless of locale. It should read from the translation files instead.

**Changes:**

- `src/auth/email/messages.ts` — import translations and return locale-specific messages
- Add `email_common`, `email_verification`, `email_password_reset`, `email_signup_notification` keys to `pt.json` and `es.json` (currently missing)

### Step 6: Remove unused `useI18n` imports where `t()` replaces it

After replacing `useI18n` + `messages` with `t()`, remove the `useI18n` import from files that no longer need it.

---

## Translation File Key Structure (Target)

After simplification, all translation keys should live in `src/translations/*.json` under the component key namespace, with no inline fallback objects in any page or component.

Example structure in `en.json`:

```json
{
  "page_auth_sign-in": {
    "meta_title": "Sign in",
    "sign-in_title": "Sign in",
    "sign-in_description": "Sign in to your account",
    ...
  },
  "page_contact": {
    "title": "Contact Us",
    "contact_form_name_label": "Your Name *",
    ...
  },
  "chat_page": {
    "title": "Real-time Chat",
    ...
  },
  "blog": {
    "title": "Blog",
    ...
  },
  "legal": {
    "title": "Legal",
    ...
  }
}
```

---

## Expected Outcome

After this simplification:

1. No page or component will define inline fallback translation objects
2. All translation keys will be centralized in `src/translations/*.json`
3. Pages will use `t()` for direct lookups instead of `useI18n()` + `messages` object
4. All hardcoded English strings in templates will be replaced with `t()` calls
5. Email messages will be locale-aware
6. `pt.json` and `es.json` will have complete translations for all keys
