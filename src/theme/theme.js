/** @typedef {'system' | 'light' | 'dark'} ThemePreference */

export const THEME_STORAGE_KEY = "rd-theme-preference";
export const DEFAULT_THEME_PREFERENCE = "system";

/** @param {ThemePreference} preference */
export function resolveTheme(preference) {
  if (preference === "light") return "light";
  if (preference === "dark") return "dark";
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

/** @param {'light' | 'dark'} resolved */
export function applyThemeToDocument(resolved) {
  const root = document.documentElement;
  root.classList.remove("theme-light", "theme-dark");
  root.classList.add(resolved === "light" ? "theme-light" : "theme-dark");
  root.dataset.theme = resolved;
  root.style.colorScheme = resolved;

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", resolved === "light" ? "#f4f7f7" : "#060a0e");
  }
}

/** Run before React paint to avoid flash. */
export function initThemeFromStorage() {
  let preference = DEFAULT_THEME_PREFERENCE;
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "light" || saved === "dark" || saved === "system") {
      preference = saved;
    }
  } catch {
    /* private mode */
  }
  applyThemeToDocument(resolveTheme(preference));
  return preference;
}
