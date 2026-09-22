export type HeadTag =
  | { tag: "title"; children: string; props?: never }
  | {
      tag: "meta"
      props:
        | { name: string; content: string }
        | { property: string; content: string }
        | { charset: string }
        | { "http-equiv": string; "content": string }
        | Record<string, string | undefined>
      children?: never
    }
  | {
      tag: "link"
      props: { rel: string; href: string; [k: string]: string | undefined }
      children?: never
    }
  | {
      tag: "script"
      props?:
        | { type?: string | undefined; nonce?: string | undefined; [k: string]: string | undefined }
        | undefined
      children: string
    }
  | {
      tag: "style"
      props?: { nonce?: string | undefined; [k: string]: string | undefined } | undefined
      children: string
    }

export interface HeadResult {
  /**
   * Sanitized raw HTML ready for direct insertion into <head>.
   */
  readonly html: string

  /**
   * Strongly-typed tag list for JSX or AST walkers.
   */
  readonly tags: HeadTag[]
}

export interface UiHeadOptions {
  /**
   * Injects the theme mode anti-flash script (data-theme). Defaults to true.
   */
  themeSync?: boolean | undefined

  /**
   * Injects the RLHeaderStack layout stack and banner manager script. Defaults to true.
   */
  headerStack?: boolean | undefined

  /**
   * Optional CSP nonce string to attach to generated head scripts.
   */
  nonce?: string | undefined
}

const THEME_FLASH_SCRIPT = `(function(){function getThemePreference(){var stored=localStorage.getItem('theme');if(stored==='dark'||stored==='light')return stored;return window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}function applyTheme(doc){var pref=getThemePreference();doc.documentElement.setAttribute('data-theme',pref);}applyTheme(document);document.addEventListener('astro:before-swap',function(e){applyTheme(e.newDocument);});document.addEventListener('astro:after-swap',function(){applyTheme(document);});})();`

const HEADER_STACK_SCRIPT = `(function(){'use strict';var w=window;if(!w.RLHeaderStack){w.RLHeaderStack={layers:[],register:function(id,order,naturalHeight,isVisible,el,type){if(el&&!el.isConnected)return;if(type===undefined)type=el&&el.getAttribute?(el.getAttribute('data-layer-type')||'header'):'header';var layer=this.layers.find(function(l){return l.id===id;});if(!layer){layer={id:id,type:type,order:order,naturalHeight:naturalHeight,isVisible:isVisible,el:el};this.layers.push(layer);this.sortLayers();}else{layer.naturalHeight=naturalHeight;layer.isVisible=isVisible;layer.el=el;}if(el){el.rlNaturalHeight=naturalHeight;el.rlIsVisible=isVisible;}this.update();},unregister:function(id){var layer=this.layers.find(function(l){return l.id===id;});if(layer&&layer.el){var el=layer.el;if(el.rlScrollListener)window.removeEventListener('scroll',el.rlScrollListener);if(el.rlResizeObserver)el.rlResizeObserver.disconnect();}this.layers=this.layers.filter(function(l){return l.id!==id;});this.update();},sortLayers:function(){this.layers.sort(function(a,b){if(a.type!==b.type)return a.type==='banner'?-1:1;return a.order-b.order;});},update:function(){var currentTop=0;for(var i=0;i<this.layers.length;i++){var layer=this.layers[i];if(layer&&layer.el){var topPx=layer.isVisible?currentTop+'px':'-'+layer.naturalHeight+'px';layer.el.style.top=topPx;layer.el.dataset.topPx=topPx;if(layer.isVisible){layer.el.classList.remove('opacity-0','!pointer-events-none');}else{layer.el.classList.add('opacity-0','!pointer-events-none');}document.documentElement.style.setProperty('--rl-header-bottom','calc('+topPx+' + '+layer.naturalHeight+'px)');if(layer.isVisible)currentTop+=layer.naturalHeight;}}document.documentElement.style.setProperty('--rl-total-header-height',currentTop+'px');}};}function getHeight(el){if(!el)return 64;var h=el.offsetHeight;return h>0?h:64;}function dismissBanner(banner){var key=banner.getAttribute('data-dismiss-key');if(key)localStorage.setItem(key,'true');banner.classList.add('hidden','!pointer-events-none');banner.setAttribute('data-rla-banner','false');if(w.RLHeaderStack)w.RLHeaderStack.unregister(banner.id);}function checkDismissed(){var banners=document.querySelectorAll("[data-rla-banner='true']");for(var i=0;i<banners.length;i++){var b=banners[i];if(b){var key=b.getAttribute('data-dismiss-key');if(key&&localStorage.getItem(key)==='true'){b.classList.add('hidden','!pointer-events-none');b.setAttribute('data-rla-banner','false');}}}}function selector(){return "[data-rla-header='true'],[data-rla-banner='true']";}function initLayer(el){var RL=w.RLHeaderStack;if(!RL)return;if(el.getAttribute('data-rla-banner')==='false'||el.classList.contains('hidden')){RL.unregister(el.id);return;}var id=el.id;var type=el.getAttribute('data-layer-type')||'header';var stackIndex=parseInt(el.getAttribute('data-stack-index')||'0',10);var hideOnScroll=el.getAttribute('data-hide-on-scroll')==='true';var contentEl=el.querySelector('[data-header-content]');if(el.rlManaged){var naturalHeight=el.rlNaturalHeight||getHeight(contentEl);var isVisible=el.rlIsVisible!==false;RL.register(id,stackIndex,naturalHeight,isVisible,el,type);return;}el.rlManaged=true;var natHeight=getHeight(contentEl);var isVis=true;RL.register(id,stackIndex,natHeight,isVis,el,type);if(typeof ResizeObserver!=='undefined'&&contentEl){var ro=new ResizeObserver(function(entries){if(!el.isConnected){ro.disconnect();return;}var h=entries[0]&&entries[0].contentRect.height;if(h&&h>0){natHeight=h;RL.register(id,stackIndex,natHeight,isVis,el,type);}});ro.observe(contentEl);el.rlResizeObserver=ro;}if(hideOnScroll){var lastScrollY=window.scrollY;var scrollListener=function(){if(!el.isConnected){window.removeEventListener('scroll',scrollListener);return;}var current=window.scrollY;var diff=current-lastScrollY;if(Math.abs(diff)>=10){var newVis=current<=50?true:diff<=0;if(newVis!==isVis){isVis=newVis;RL.register(id,stackIndex,natHeight,isVis,el,type);}lastScrollY=current;}};el.rlScrollListener=scrollListener;window.addEventListener('scroll',scrollListener,{passive:true});}}function startObserver(){if(document.body){checkDismissed();var layers=document.querySelectorAll(selector());for(var i=0;i<layers.length;i++)initLayer(layers[i]);w.rlHeaderObserver=new MutationObserver(function(mutations){for(var i=0;i<mutations.length;i++){var added=mutations[i]?.addedNodes||[];for(var j=0;j<added.length;j++){var node=added[j];if(!node||node.nodeType!==1)continue;if(node.matches&&node.matches(selector()))initLayer(node);if(node.querySelectorAll){var nested=node.querySelectorAll(selector());for(var k=0;k<nested.length;k++)initLayer(nested[k]);}}var removed=mutations[i]?.removedNodes||[];for(var j=0;j<removed.length;j++){var node=removed[j];if(!node||node.nodeType!==1)continue;if(node.matches&&node.matches(selector())&&w.RLHeaderStack)w.RLHeaderStack.unregister(node.id);if(node.querySelectorAll){var nested=node.querySelectorAll(selector());for(var k=0;k<nested.length;k++){if(w.RLHeaderStack)w.RLHeaderStack.unregister(nested[k].id);}}}}});w.rlHeaderObserver.observe(document.body,{childList:true,subtree:true});}else{document.addEventListener('DOMContentLoaded',function(){startObserver();});}}function setupStack(){if(w.rlHeaderObserver){w.rlHeaderObserver.disconnect();w.rlHeaderObserver=null;}var RL=w.RLHeaderStack;if(RL){RL.layers=[];RL.update();}startObserver();}if(!w.rlBannerInit){w.rlBannerInit=true;document.addEventListener('click',function(e){var btn=e.target?.closest?.('[data-banner-close]');if(!btn)return;var banner=btn.closest('[data-rla-banner]');if(!banner)return;dismissBanner(banner);});}document.addEventListener('astro:before-swap',function(){if(w.rlHeaderObserver){w.rlHeaderObserver.disconnect();w.rlHeaderObserver=null;}if(w.RLHeaderStack){w.RLHeaderStack.layers=[];w.RLHeaderStack.update();}});setupStack();document.addEventListener('astro:after-swap',setupStack);})();`

/**
 * Generates the document <head> tags for UI runtime systems (anti-theme-flash and header stacking).
 */
export function createUiHead(options: UiHeadOptions = {}): HeadResult {
  const { themeSync = true, headerStack = true, nonce } = options

  const tags: HeadTag[] = []
  const htmlParts: string[] = []
  const nonceAttr = nonce ? ` nonce="${nonce}"` : ""
  const scriptProps = nonce ? { nonce } : undefined

  if (themeSync) {
    tags.push({
      tag: "script",
      ...(scriptProps ? { props: scriptProps } : {}),
      children: THEME_FLASH_SCRIPT
    })
    htmlParts.push(`<script${nonceAttr}>${THEME_FLASH_SCRIPT}</script>`)
  }

  if (headerStack) {
    tags.push({
      tag: "script",
      ...(scriptProps ? { props: scriptProps } : {}),
      children: HEADER_STACK_SCRIPT
    })
    htmlParts.push(`<script${nonceAttr}>${HEADER_STACK_SCRIPT}</script>`)
  }

  return {
    html: htmlParts.join("\n"),
    tags
  }
}
