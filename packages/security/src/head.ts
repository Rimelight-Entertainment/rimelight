import type { HeadTag } from "@solidjs/web";

export type { HeadTag } from "@solidjs/web";

export interface SecurityHeadOptions {
  trustedTypes?: boolean;
  nonceSync?: boolean;
  devReporter?: boolean;
}

const TRUSTED_TYPES_SCRIPT = `(function(){var w=window;if(w.trustedTypes&&w.trustedTypes.createPolicy){try{if(!w.trustedTypes.defaultPolicy){w.trustedTypes.createPolicy("default",{createHTML:function(i){return i;},createScript:function(i){return i;},createScriptURL:function(i){return i;}});}}catch(e){}}})();`;

const NONCE_SYNC_SCRIPT = `(function(){var w=window;if(!w.initialCspNonce){w.initialCspNonce=document.querySelector('meta[name="csp-nonce"]')?.getAttribute('content')||Array.from(document.querySelectorAll('script')).find(function(s){return s.nonce;})?.nonce||document.querySelector('script[nonce]')?.getAttribute('nonce')||document.querySelector('style[nonce]')?.getAttribute('nonce');}})();`;

const DEV_REPORTER_SCRIPT = `(function(){var reported=new Set();window.addEventListener("securitypolicyviolation",function(e){if(e.disposition!=="report")return;var key=e.effectiveDirective+":"+(e.blockedURI||e.sample||"");if(reported.has(key))return;reported.add(key);console.warn("%c[Rimelight Security]%c Allowed in DEV, but will fail in PRODUCTION:\\n"+"Directive: "+e.effectiveDirective+"\\n"+(e.blockedURI?"Blocked URI: "+e.blockedURI+"\\n":"")+(e.sourceFile?"Source: "+e.sourceFile+":"+(e.lineNumber||0)+"\\n":"")+(e.sample?"Sample: "+e.sample.slice(0,100)+"\\n":"")+"Fix: Add to imgSrc, scriptResources, styleResources or use nonces in your security configuration","background: #e11d48; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold;","color: inherit; font-weight: normal;");});})();`;

export function createSecurityHead(options: SecurityHeadOptions = {}): HeadTag[] {
  const {
    trustedTypes = true,
    nonceSync = true,
    devReporter = typeof process !== "undefined" && process.env?.["NODE_ENV"] !== "production",
  } = options;

  const tags: HeadTag[] = [];

  if (trustedTypes) {
    tags.push({ tag: "script", props: { children: TRUSTED_TYPES_SCRIPT } });
  }

  if (nonceSync) {
    tags.push({ tag: "script", props: { children: NONCE_SYNC_SCRIPT } });
  }

  if (devReporter) {
    tags.push({ tag: "script", props: { children: DEV_REPORTER_SCRIPT } });
  }

  return tags;
}
