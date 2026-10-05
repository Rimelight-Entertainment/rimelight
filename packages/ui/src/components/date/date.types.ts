export interface RLDateProps {
  date: Date | string | number;
  locale?: string;
  options?: Intl.DateTimeFormatOptions;
  class?: string;
  [key: string]: unknown;
}
