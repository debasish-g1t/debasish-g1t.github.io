import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { loadTheme, applyTheme, resolveThemeMode } from "../content/themeLoader";

const ThemeContext = createContext({
  theme: null,
  mode: "dark",
  loading: true,
  setMode: () => {},
});

function systemColorMode() {
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
 * Loads the active theme and exposes the resolved colour mode.
 *
 * The loader writes CSS custom properties straight onto <html>, so child
 * components never import the theme — they just use `var(--text)` etc.
 *
 * When the theme declares `mode: auto`, the palette follows the OS/browser
 * `prefers-color-scheme` setting live. Calling `setMode("dark" | "light")`
 * overrides that until `setMode("auto")` is called, which resumes following.
 */
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(null);
  const [mode, setModeState] = useState("dark");
  const [override, setOverride] = useState(null); // null | "dark" | "light"
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    loadTheme()
      .then((loaded) => {
        if (!mounted) return;
        setTheme(loaded);
        setOverride(null);
        setModeState(resolveThemeMode(loaded));
      })
      .catch((err) => {
        console.warn("[theme] could not load theme; using defaults.", err?.message);
        if (mounted) setLoading(false);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Follow the OS/browser colour scheme whenever the theme is `auto` and the
  // visitor hasn't picked a manual override.
  useEffect(() => {
    if (!theme || theme.mode !== "auto" || override) return;
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return;
    }
    const query = window.matchMedia("(prefers-color-scheme: light)");
    const handleChange = (event) =>
      setModeState(event.matches ? "light" : "dark");
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, [theme, override]);

  useEffect(() => {
    if (!theme) return;
    const { mode: resolved } = applyTheme({ ...theme, mode });
    setModeState(resolved);
  }, [theme, mode]);

  const setMode = useCallback((next) => {
    if (next === "auto") {
      setOverride(null);
      setModeState(systemColorMode());
      return;
    }
    if (next === "dark" || next === "light") {
      setOverride(next);
      setModeState(next);
      return;
    }
    // Unknown value: treat as auto.
    setOverride(null);
    setModeState(systemColorMode());
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, mode, loading, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
