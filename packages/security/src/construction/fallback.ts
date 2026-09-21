export interface ConstructionFallbackOptions {
  siteName?: string | undefined
  title?: string | undefined
  description?: string | undefined
  passphraseLabel?: string | undefined
  passphrasePlaceholder?: string | undefined
  rememberMeLabel?: string | undefined
  signInButtonLabel?: string | undefined
  error?: string | undefined
  redirect?: string | undefined
  endpoint?: string | undefined
}

export function getConstructionFallbackHtml(options: ConstructionFallbackOptions = {}): string {
  const {
    siteName = "Rimelight",
    title = "Under Construction",
    description = "This site is currently undergoing scheduled maintenance. Please enter the access passphrase to preview.",
    passphraseLabel = "Passphrase",
    passphrasePlaceholder = "Enter passphrase...",
    rememberMeLabel = "Remember me",
    signInButtonLabel = "Unlock Site",
    error,
    redirect = "/",
    endpoint = "/api/construction-guest"
  } = options

  const isError = Boolean(error)
  const escapedRedirect = redirect.replace(/"/g, "&quot;")
  const escapedEndpoint = endpoint.replace(/"/g, "&quot;")

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} - ${siteName}</title>
  <meta name="robots" content="noindex, nofollow" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #0a0a0a;
      color: #ededed;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 1.5rem;
    }
    .card {
      background-color: #141414;
      border: 1px solid #262626;
      border-radius: 0.75rem;
      padding: 2rem;
      max-width: 26rem;
      width: 100%;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
    }
    .header { text-align: center; margin-bottom: 1.5rem; }
    .title { font-size: 1.5rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; letter-spacing: -0.02em; }
    .description { font-size: 0.875rem; color: #a3a3a3; line-height: 1.5; }
    .alert {
      background-color: rgba(220, 38, 38, 0.15);
      border: 1px solid rgba(220, 38, 38, 0.4);
      color: #fca5a5;
      font-size: 0.875rem;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      margin-bottom: 1.25rem;
    }
    .form { display: flex; flex-direction: column; gap: 1rem; }
    .field { display: flex; flex-direction: column; gap: 0.375rem; text-align: left; }
    .label { font-size: 0.8125rem; font-weight: 500; color: #d4d4d4; }
    .input {
      width: 100%;
      padding: 0.625rem 0.875rem;
      background-color: #0a0a0a;
      border: 1px solid #333333;
      border-radius: 0.5rem;
      color: #ffffff;
      font-size: 0.875rem;
      outline: none;
      transition: border-color 0.15s ease;
    }
    .input:focus { border-color: #3b82f6; ring: 2px solid rgba(59, 130, 246, 0.3); }
    .checkbox-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: #a3a3a3; cursor: pointer; }
    .checkbox { width: 1rem; height: 1rem; accent-color: #3b82f6; cursor: pointer; }
    .button {
      margin-top: 0.5rem;
      width: 100%;
      padding: 0.625rem 1rem;
      background-color: #ffffff;
      color: #0a0a0a;
      border: none;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.15s ease, opacity 0.15s ease;
    }
    .button:hover { background-color: #e5e5e5; }
    .footer { margin-top: 1.5rem; text-align: center; font-size: 0.75rem; color: #525252; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1 class="title">${title}</h1>
      <p class="description">${description}</p>
    </div>

    ${isError ? `<div class="alert" role="alert">Invalid credentials. Please try again.</div>` : ""}

    <form class="form" method="POST" action="${escapedEndpoint}">
      <input type="hidden" name="redirect" value="${escapedRedirect}" />

      <div class="field">
        <label class="label" for="passphrase">${passphraseLabel}</label>
        <input
          id="passphrase"
          class="input"
          type="password"
          name="passphrase"
          placeholder="${passphrasePlaceholder}"
          required
          autofocus
          autocomplete="current-password"
        />
      </div>

      <label class="checkbox-row">
        <input class="checkbox" type="checkbox" name="rememberMe" value="true" checked />
        <span>${rememberMeLabel}</span>
      </label>

      <button class="button" type="submit">${signInButtonLabel}</button>
    </form>

    <div class="footer">
      <span>&copy; ${new Date().getFullYear()} ${siteName}</span>
    </div>
  </div>
</body>
</html>`
}
