import { THEME_FLASH_SCRIPT } from "./theme-flash";

export type HeadTag =
  | { tag: "title"; props: { children: string }; children?: string; key?: string }
  | {
      tag: "meta";
      props:
        | { name: string; content: string }
        | { property: string; content: string }
        | { charset: string }
        | { "http-equiv": string; content: string }
        | Record<string, string | undefined>;
      children?: never;
      key?: string;
    }
  | {
      tag: "link";
      props: { rel: string; href: string; [k: string]: string | undefined };
      children?: never;
      key?: string;
    }
  | {
      tag: "script";
      props: {
        type?: string | undefined;
        nonce?: string | undefined;
        children?: string;
        [k: string]: string | undefined;
      };
      children?: string;
      key?: string;
    }
  | {
      tag: "style";
      props: { nonce?: string | undefined; children?: string; [k: string]: string | undefined };
      children?: never;
      key?: string;
    };

export interface HeadResult {
  /**
   * Sanitized raw HTML ready for direct insertion into <head>.
   */
  readonly html: string;

  /**
   * Strongly-typed tag list for JSX or AST walkers.
   */
  readonly tags: HeadTag[];
}

export interface UiHeadOptions {
  /**
   * Injects the theme mode anti-flash script (data-theme). Defaults to true.
   */
  themeSync?: boolean | undefined;

  /**
   * Optional CSP nonce string to attach to generated head scripts.
   */
  nonce?: string | undefined;
}

/**
 * Generates the document <head> tags for UI runtime systems (anti-theme-flash).
 */
export function createUiHead(options: UiHeadOptions = {}): HeadResult {
  const { themeSync = true, nonce } = options;

  const tags: HeadTag[] = [];
  const htmlParts: string[] = [];
  const nonceAttr = nonce ? ` nonce="${nonce}"` : "";
  const scriptProps = nonce ? { nonce } : undefined;

  if (themeSync) {
    tags.push({
      tag: "script",
      props: { ...scriptProps, children: THEME_FLASH_SCRIPT },
      children: THEME_FLASH_SCRIPT,
    });
    htmlParts.push(`<script${nonceAttr}>${THEME_FLASH_SCRIPT}</script>`);
  }

  return {
    html: htmlParts.join("\n"),
    tags,
  };
}
