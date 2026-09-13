import { loadYaml } from "../utils/yaml";

/**
 * Which theme to load. Future themes only need a new YAML in
 * public/content/themes plus a change to this constant (or the
 * REACT_APP_THEME environment variable) — the schema stays identical and the
 * UI keeps reading CSS variables, never this file.
 */
const THEME_ID = process.env.REACT_APP_THEME || "terminal";
const THEME_PATH = `${process.env.PUBLIC_URL}/content/themes/${THEME_ID}.yaml`;
const FALLBACK_THEME_PATH = `${process.env.PUBLIC_URL}/content/themes/default.yaml`;

const str = (v) => (typeof v === "string" && v.length ? v : undefined);

/**
 * CSS variable names that the components consume, keyed by the theme YAML
 * colour key they come from. Kept as one mapping so a future theme can't
 * silently break a screen by renaming a colour.
 */
const COLOR_VAR_MAP = {
  bg: "bg",
  bg_gradient: "bg-gradient",
  surface: "surface",
  surface_glass: "surface-glass",
  text: "text",
  text_muted: "text-muted",
  accent: "accent",
  accent_2: "accent-2",
  border: "border",
  badge: "badge",
  rail: "rail",
};

function sanitizeTheme(raw) {
  if (!raw || typeof raw !== "object") return null;
  const theme = {
    id: str(raw.id) || "default",
    name: str(raw.name) || "Default",
    mode: ["dark", "light", "auto"].includes(raw.mode) ? raw.mode : "dark",
    fonts: {},
    colors: { dark: {}, light: {} },
  };

  if (raw.fonts && typeof raw.fonts === "object") {
    theme.fonts = {
      primary: str(raw.fonts.primary) || "'Lato', system-ui, sans-serif",
      heading: str(raw.fonts.heading) || str(raw.fonts.primary),
      mono:
        str(raw.fonts.mono) ||
        "'SFMono-Regular', Menlo, Consolas, monospace",
    };
  }

  for (const mode of ["dark", "light"]) {
    const palette = raw.colors?.[mode];
    if (!palette || typeof palette !== "object") continue;
    for (const key of Object.keys(COLOR_VAR_MAP)) {
      const value = str(palette[key]);
      if (value) theme.colors[mode][key] = value;
    }
  }

  return theme;
}

export function resolveThemeMode(theme) {
  if (!theme) return "dark";
  if (theme.mode !== "auto") return theme.mode;
  if (
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: light)").matches
  ) {
    return "light";
  }
  return "dark";
}

/**
 * Write a sanitised theme onto the document root as CSS custom properties.
 * Returns { theme, mode } so callers can re-render with the resolved values.
 */
export function applyTheme(theme) {
  if (!theme || typeof document === "undefined") {
    return { theme, mode: "dark" };
  }

  const root = document.documentElement;
  const mode = resolveThemeMode(theme);
  const colors = theme.colors[mode] || theme.colors.dark || {};

  root.setAttribute("data-theme", theme.id);
  root.setAttribute("data-color-mode", mode);

  root.style.setProperty("--font-primary", theme.fonts.primary);
  root.style.setProperty("--font-heading", theme.fonts.heading || theme.fonts.primary);
  root.style.setProperty("--font-mono", theme.fonts.mono);

  for (const [key, cssName] of Object.entries(COLOR_VAR_MAP)) {
    if (colors[key]) {
      root.style.setProperty(`--${cssName}`, colors[key]);
    }
  }

  return { theme, mode };
}

export async function loadTheme() {
  try {
    const raw = await loadYaml(THEME_PATH);
    const theme = sanitizeTheme(raw);
    if (theme) return theme;
  } catch (err) {
    console.warn(
      `[theme] could not load "${THEME_ID}"; falling back to default.`,
      err?.message
    );
  }

  const fallback = await loadYaml(FALLBACK_THEME_PATH);
  return sanitizeTheme(fallback);
}
