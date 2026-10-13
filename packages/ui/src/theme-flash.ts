/**
 * Inline pre-paint script that applies the persisted or system theme
 * (data-theme) before first render to prevent a flash of the wrong theme.
 *
 * Kept intentionally dependency-free and readable: it is emitted verbatim
 * into a <script> tag in the document head by createUiHead().
 */
export const THEME_FLASH_SCRIPT = `(function () {
  function getThemePreference() {
    try {
      var stored = localStorage.getItem("theme");
      if (stored === "dark" || stored === "light") return stored;
    } catch {}
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyTheme(doc) {
    doc.documentElement.setAttribute("data-theme", getThemePreference());
  }

  applyTheme(document);
})();
`;
