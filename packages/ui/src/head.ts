import type { HeadTag } from "@solidjs/web";
import { THEME_FLASH_SCRIPT } from "./theme-flash";

export type { HeadTag } from "@solidjs/web";

export function createUiHead(): HeadTag[] {
  return [{ tag: "script", props: { children: THEME_FLASH_SCRIPT } }];
}
