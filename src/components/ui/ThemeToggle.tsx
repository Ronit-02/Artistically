"use client";

import { useSyncExternalStore } from "react";

const THEME_STORAGE_KEY = "artistically-theme";
const THEME_CHANGE_EVENT = "artistically-theme-change";

type Theme = "light" | "dark";

function getSavedTheme(): Theme | null {
  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return savedTheme === "light" || savedTheme === "dark" ? savedTheme : null;
}

function getThemeSnapshot(): Theme {
  return getSavedTheme() ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
}

function getServerThemeSnapshot(): Theme {
  return "light";
}

function subscribeToTheme(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handleThemeChange = () => {
    const savedTheme = getSavedTheme();
    if (savedTheme) {
      document.documentElement.dataset.theme = savedTheme;
    } else {
      delete document.documentElement.dataset.theme;
    }
    onStoreChange();
  };
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY) {
      handleThemeChange();
    }
  };

  mediaQuery.addEventListener("change", handleThemeChange);
  window.addEventListener("storage", handleStorageChange);
  window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);

  return () => {
    mediaQuery.removeEventListener("change", handleThemeChange);
    window.removeEventListener("storage", handleStorageChange);
    window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
  };
}

function setThemePreference(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const activeTheme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getServerThemeSnapshot);

  const nextTheme = activeTheme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
      onClick={() => setThemePreference(nextTheme)}
      className={`theme-toggle inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-transparent bg-transparent text-gray-500 transition-colors hover:bg-gray-50 hover:text-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2 ${className}`}
    >
      {activeTheme === "dark" ? (
        <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path strokeLinecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
      ) : (
        <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/></svg>
      )}
    </button>
  );
}
