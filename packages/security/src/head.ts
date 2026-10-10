export type HeadTag =
  | { tag: "title"; props: { children: string }; children?: string; key?: string }
  | {
      tag: "meta";
      props:
        | { name: string; content: string }
        | { property: string; content: string }
        | { charset: string }
        | { "http-equiv": string; content: string };
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
      children?: string;
      key?: string;
    };

export interface HeadResult {
  readonly html: string;
  readonly tags: HeadTag[];
}

export interface SecurityHeadOptions {
  trustedTypes?: boolean;
  nonceSync?: boolean;
  devReporter?: boolean;
  nonce?: string;
}

const TRUSTED_TYPES_SCRIPT = `(function(){var w=window;if(w.trustedTypes&&w.trustedTypes.createPolicy){try{if(!w.trustedTypes.defaultPolicy){w.trustedTypes.createPolicy("default",{createHTML:function(i){return i;},createScript:function(i){return i;},createScriptURL:function(i){return i;}});}}catch(e){}}})();`;

const NONCE_SYNC_SCRIPT = `(function(){var w=window;if(!w.initialCspNonce){w.initialCspNonce=document.querySelector('meta[name="csp-nonce"]')?.getAttribute('content')||Array.from(document.querySelectorAll('script')).find(function(s){return s.nonce;})?.nonce||document.querySelector('script[nonce]')?.getAttribute('nonce')||document.querySelector('style[nonce]')?.getAttribute('nonce');}})();`;

const DEV_REPORTER_SCRIPT = `(function(){var reported=new Set();window.addEventListener("securitypolicyviolation",function(e){if(e.disposition!=="report")return;var key=e.effectiveDirective+":"+(e.blockedURI||e.sample||"");if(reported.has(key))return;reported.add(key);console.warn("%c[Rimelight Security]%c Allowed in DEV, but will fail in PRODUCTION:\\n"+"Directive: "+e.effectiveDirective+"\\n"+(e.blockedURI?"Blocked URI: "+e.blockedURI+"\\n":"")+(e.sourceFile?"Source: "+e.sourceFile+":"+(e.lineNumber||0)+"\\n":"")+(e.sample?"Sample: "+e.sample.slice(0,100)+"\\n":"")+"Fix: Add to imgSrc, scriptResources, styleResources or use nonces in your security configuration","background: #e11d48; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold;","color: inherit; font-weight: normal;");});})();`;

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
      props: { ...scriptProps, children: TRUSTED_TYPES_SCRIPT },
      children: TRUSTED_TYPES_SCRIPT,
    });
    htmlParts.push(`<script${nonceAttr}>${TRUSTED_TYPES_SCRIPT}</script>`);
  }

  if (nonceSync) {
    tags.push({
      tag: "script",
      props: { ...scriptProps, children: NONCE_SYNC_SCRIPT },
      children: NONCE_SYNC_SCRIPT,
    });
    htmlParts.push(`<script${nonceAttr}>${NONCE_SYNC_SCRIPT}</script>`);
  }

  if (devReporter) {
    tags.push({
      tag: "script",
      props: { ...scriptProps, children: DEV_REPORTER_SCRIPT },
      children: DEV_REPORTER_SCRIPT,
    });
    htmlParts.push(`<script${nonceAttr}>${DEV_REPORTER_SCRIPT}</script>`);
  }

  return {
    html: htmlParts.join("\n"),
    tags,
  };
}
