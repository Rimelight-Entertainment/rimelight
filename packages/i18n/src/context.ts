import { AsyncLocalStorage } from "node:async_hooks";

export interface I18nContextStore {
  locale: string;
  translations?: Record<string, unknown> | undefined;
}

/**
 * AsyncLocalStorage instance for request-scoped locale and translations context.
 */
export const i18nContext = new AsyncLocalStorage<I18nContextStore>();

/**
 * Returns the active request-scoped i18n store, if currently executing within an i18n context.
 */
export const getI18nStore = (): I18nContextStore | undefined => i18nContext.getStore();
