"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Toaster } from "sonner";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function Providers({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("ajar-theme") as Theme | null;

    const applyTheme = (t: Theme) => {
      const root = window.document.documentElement;
      const targetTheme = t === "system" 
        ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
        : t;

      // Only apply if the class is not already there to prevent visual jumps
      if (!root.classList.contains(targetTheme)) {
        // Temporarily disable transitions for mount
        const css = document.createElement("style");
        css.appendChild(document.createTextNode("* { transition: none !important; }"));
        document.head.appendChild(css);

        root.classList.remove("light", "dark");
        root.classList.add(targetTheme);

        void window.getComputedStyle(css).opacity;
        document.head.removeChild(css);
      }
    };

    if (savedTheme) {
      setThemeState(savedTheme);
      applyTheme(savedTheme);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setThemeState("system");
      applyTheme("system");
    }

    // Clean up any stale service workers from previous projects
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
        }
      });
    }
  }, []);

  const getResolvedTheme = (): "light" | "dark" => {
    if (theme === "system") {
      return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return theme as "light" | "dark";
  };

  const setTheme = (newTheme: Theme) => {
    // Disable transitions temporarily for a smoother switch
    const css = document.createElement("style");
    css.appendChild(document.createTextNode("* { transition: none !important; }"));
    document.head.appendChild(css);

    setThemeState(newTheme);
    localStorage.setItem("ajar-theme", newTheme);
    // Set cookie for server-side theme detection (expires in 1 year)
    document.cookie = `ajar-theme=${newTheme}; path=/; max-age=31536000; SameSite=Lax`;
    
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    
    if (newTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(newTheme);
    }

    void window.getComputedStyle(css).opacity;
    document.head.removeChild(css);
  };

  // Sync theme changes with system preference if theme is 'system'
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(mediaQuery.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme: getResolvedTheme(), setTheme }}>
      {children}
      <Toaster position="top-right" richColors />
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
