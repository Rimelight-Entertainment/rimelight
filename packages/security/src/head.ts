export type HeadTag =
  | { tag: "title"; children: string; props?: never }
  | {
      tag: "meta";
      props:
        | { name: string; content: string }
        | { property: string; content: string }
        | { charset: string }
        | { "http-equiv": string; content: string };
      children?: never;
    }
  | {
      tag: "link";
      props: { rel: string; href: string; [k: string]: string | undefined };
      children?: never;
    }
  | {
      tag: "script";
      props?:
        | { type?: string | undefined; nonce?: string | undefined; [k: string]: string | undefined }
        | undefined;
      children: string;
    }
  | {
      tag: "style";
      props?: { nonce?: string | undefined; [k: string]: string | undefined } | undefined;
      children: string;
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

export interface SecurityHeadOptions {
  /**
   * Injects the Trusted Types default policy handler. Defaults to true.
   */
  trustedTypes?: boolean | undefined;

  /**
   * Injects the CSP Nonce listener and Astro View Transitions nonce sync listener. Defaults to
   * true.
   */
  nonceSync?: boolean | undefined;

  /**
   * Injects the development CSP violation reporter. Defaults to true in dev mode.
   */
  devReporter?: boolean | undefined;

  /**
   * Optional CSP nonce string to attach to generated head scripts.
   */
  nonce?: string | undefined;
}

const TRUSTED_TYPES_SCRIPT = `(function(){var w=window;if(w.trustedTypes&&w.trustedTypes.createPolicy){try{if(!w.trustedTypes.defaultPolicy){w.trustedTypes.createPolicy("default",{createHTML:function(i){return i;},createScript:function(i){return i;},createScriptURL:function(i){return i;}});}}catch(e){}}})();`;

const NONCE_SYNC_SCRIPT = `(function(){var w=window;if(!w.initialCspNonce){w.initialCspNonce=document.querySelector('meta[name="csp-nonce"]')?.getAttribute('content')||Array.from(document.querySelectorAll('script')).find(function(s){return s.nonce;})?.nonce||document.querySelector('script[nonce]')?.getAttribute('nonce')||document.querySelector('style[nonce]')?.getAttribute('nonce');}document.addEventListener('astro:before-swap',function(e){var incomingNonce=e.newDocument?.querySelector('meta[name="csp-nonce"]')?.getAttribute('content')||Array.from((e.newDocument?.querySelectorAll('script[nonce]')||[])).find(function(s){return s.getAttribute('nonce');})?.getAttribute('nonce');if(incomingNonce){w.initialCspNonce=incomingNonce;}});})();`;

const DEV_REPORTER_SCRIPT = `(function(){function isDevInternal(e){var file=e.sourceFile||"";var sample=e.sample||"";var blocked=e.blockedURI||"";if(file.includes("dev-toolbar")||file.includes("toolbar-")||file.includes("astro_runtime_client"))return true;if(file.includes("vite/client")||file.includes("@vite/client")||file.includes("/@fs/")||file.includes("/@id/"))return true;if(file.includes("node_modules/.vite")||file.includes("client:"))return true;if(blocked.startsWith("ws://")||blocked.startsWith("wss://"))return true;if(sample.includes("--astro-dev-toolbar")||sample.includes("astro-dev-toolbar"))return true;return false;}var reported=new Set();window.addEventListener("securitypolicyviolation",function(e){if(e.disposition!=="report")return;if(isDevInternal(e))return;var key=e.effectiveDirective+":"+(e.blockedURI||e.sample||"");if(reported.has(key))return;reported.add(key);console.warn("%c[Rimelight Security]%c Allowed in DEV, but will fail in PRODUCTION:\\n"+"Directive: "+e.effectiveDirective+"\\n"+(e.blockedURI?"Blocked URI: "+e.blockedURI+"\\n":"")+(e.sourceFile?"Source: "+e.sourceFile+":"+(e.lineNumber||0)+"\\n":"")+(e.sample?"Sample: "+e.sample.slice(0,100)+"\\n":"")+"Fix: Add to imgSrc, scriptResources, styleResources or use nonces in your security configuration","background: #e11d48; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold;","color: inherit; font-weight: normal;");});})();`;

export function createSecurityHead(options: SecurityHeadOptions = {}): HeadResult {
  const {
    trustedTypes = true,
    nonceSync = true,
    devReporter = typeof process !== "undefined" && process.env?.["NODE_ENV"] !== "production",
    nonce,
  } = options;

  const tags: HeadTag[] = [];
  const htmlParts: string[] = [];
  const nonceAttr = nonce ? ` nonce="${nonce}"` : "";
  const scriptProps = nonce ? { nonce } : undefined;

  if (trustedTypes) {
    tags.push({
      tag: "script",
      ...(scriptProps ? { props: scriptProps } : {}),
      children: TRUSTED_TYPES_SCRIPT,
    });
    htmlParts.push(`<script${nonceAttr}>${TRUSTED_TYPES_SCRIPT}</script>`);
  }

  if (nonceSync) {
    tags.push({
      tag: "script",
      ...(scriptProps ? { props: scriptProps } : {}),
      children: NONCE_SYNC_SCRIPT,
    });
    htmlParts.push(`<script${nonceAttr}>${NONCE_SYNC_SCRIPT}</script>`);
  }

  if (devReporter) {
    tags.push({
      tag: "script",
      ...(scriptProps ? { props: scriptProps } : {}),
      children: DEV_REPORTER_SCRIPT,
    });
    htmlParts.push(`<script${nonceAttr}>${DEV_REPORTER_SCRIPT}</script>`);
  }

  return {
    html: htmlParts.join("\n"),
    tags,
  };
}
