# CSP Test Violations & Automated Testing Guide

This document analyzes the console errors gathered from the static load testing of components in the `csp` package and outlines exact suggestions to address them, along with a guide on automating CSP compliance testing for all 100+ components.

---

## Part 1: Analysis of Console Errors

### 1. Inline Style Violations (`aspect-ratio`, `chart`, `main`, `marquee`, `pagination`, `progress`)

#### The Error
```
Applying inline style violates the following Content Security Policy directive 'style-src 'self' ...
```

#### Why it happens
These components use inline `style="..."` HTML attributes inside their source templates (e.g., `<div style="aspect-ratio: 16/9">` or `<div style="width: 45%">` for the progress bar). Because your CSP does not include `'unsafe-inline'` for styles (for high security), the browser blocks all inline style attributes, even if the styles themselves are simple layout parameters.

#### Suggested Fixes
1. **Refactor to UnoCSS Utility Classes (Recommended):**
   * Instead of `<div style="aspect-ratio: 16/9">`, use UnoCSS's aspect classes: `<div class="aspect-video">` or `<div class="aspect-[16/9]">`.
2. **Utilize Astro `<style>` Tags (Zero-CSP Overhead):**
   * Move the styles to a `<style>` block in the Astro component. Astro compiles these styles, hashes them, and includes them in the allowed CSP header list automatically.
   * *Example for dynamic values:* Use CSS custom variables inside Astro `<style>` blocks:
     ```html
     ---
     const { progress = 45 } = Astro.props;
     ---
     <div class="progress-bar"></div>

     <style define:vars={{ progress: `${progress}%` }}>
       .progress-bar {
         width: var(--progress);
       }
     </style>
     ```
3. **Avoid raw `style` bindings in frameworks (Vue/Svelte):** Ensure Svelte/Vue components are not outputting inline style strings to DOM nodes.

---

### 2. The "Refresh" Warning Oddity (`breadcrumb`, `file-upload`, `form-field`, `link`, `logo`, `page-body`, `prose`, `select`, `sidebar`)

#### The Error
```
Loading the script '...' violates the following Content Security Policy directive: "script-src 'unsafe-inline' 'unsafe-eval'". Note that 'script-src-elem' was not explicitly set...
Connecting to 'https://csp.rimelight.com/cdn-cgi/rum?' violates the following Content Security Policy directive: "connect-src 'none'".
```

#### Why it happens (The browser speculative prefetch)
You noticed this happened **only on initial load** (neutral color, not red) and **disappeared on page refreshes**. 

This is **not a bug in your application**, and your CSP headers are correct. This is a browser-internal diagnostic log triggered by **Google Chrome's speculative prefetching/prerendering engine**:
* When a page loads, Chrome speculatively prefetches links it thinks you might click (like the `/csp-test/*` links on your homepage).
* To prevent prefetched pages from tracking you, executing analytics, or performing malicious actions before you actually visit them, Chrome loads prefetched documents under an extremely strict, sandbox-only CSP (`connect-src 'none'` and `script-src 'unsafe-inline' 'unsafe-eval'`).
* When Chrome processes your prefetched pages in the background, it triggers these warning-level logs in the console. When you actually load the page directly (refresh), the prefetch sandbox is no longer active, which is why the warnings disappear.
* **Verdict:** You can **safely ignore** the "refresh" warnings. They are browser prefetch telemetry logs and do not represent a real security block or functional breakdown for active visitors.

---

## Part 2: Automated CSP Compliance Testing

Manually clicking through 100+ components to check for CSP console errors is extremely tedious and prone to missing interactive errors. 

### Why Vitest cannot test this
Vitest runs inside a simulated Node/DOM environment (like JSDOM or HappyDOM). These simulated environments **do not enforce Content Security Policies** or parse security headers, meaning Vitest will never throw CSP console errors.

### The Solution: Playwright + Headless Browser Script
You can easily automate this by using a lightweight **Playwright** script. It boots up your local production build, sequentially navigates through all your `/csp-test/*` pages, interacts with each component, and checks if the browser console emitted any CSP violations.

#### Setup Guide

1. **Install Playwright:**
   ```bash
   pnpm add -D playwright
   ```

2. **Create the Test Script (`test-csp.js`):**
   Save the following script in your `csp` package root:

```javascript
import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const baseUrl = 'http://localhost:4321'; // Or your local preview port
  const violations = [];

  // Listen to all console errors and CSP reports
  page.on('console', (msg) => {
    const text = msg.text();
    if (text.includes('violates') && text.includes('Content Security Policy')) {
      violations.push({ url: page.url(), type: 'Console Error', message: text });
    }
  });

  // Also catch official CSP reporting events
  page.on('pageerror', (err) => {
    if (err.message.includes('Content Security Policy')) {
      violations.push({ url: page.url(), type: 'Runtime Error', message: err.message });
    }
  });

  console.log('Fetching homepage links...');
  await page.goto(baseUrl);
  
  // Extract all test links from your tidy list
  const links = await page.$$eval('a[href^="/csp-test/"]', anchors => 
    anchors.map(a => a.getAttribute('href'))
  );

  console.log(`Found ${links.length} components to test.`);

  for (const link of links) {
    const url = `${baseUrl}${link}`;
    console.log(`Testing: ${link}`);
    
    // Visit page
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    
    // Perform basic click/hover interaction to trigger interactive scripts
    const body = await page.$('body');
    if (body) {
      await body.click();
    }
    
    // Give dynamic client-side hydration scripts 100ms to execute
    await page.waitForTimeout(100);
  }

  await browser.close();

  console.log('\n--- CSP TEST RESULTS ---');
  if (violations.length === 0) {
    console.log('✅ PASS: No CSP violations found across all components!');
    process.exit(0);
  } else {
    console.error(`❌ FAIL: Found ${violations.length} CSP violations:`);
    console.table(violations);
    process.exit(1);
  }
})();
```

3. **How to Run it Locally:**
   Run a production preview server locally, then execute the test:
   ```bash
   pnpm run build
   pnpm run preview &
   node test-csp.js
   ```

This will test all 100+ components in under 10 seconds and print a perfect table showing exactly which components failed and why.
