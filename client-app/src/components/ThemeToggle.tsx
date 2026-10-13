"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 w-12 h-12"></div>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-lg border border-gray-200 dark:border-gray-700 hover:scale-110 transition-transform flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
      aria-label="Alihkan Mode Gelap"
    >
      {theme === "dark" ? (
        <span className="text-xl leading-none">🌞</span>
      ) : (
        <span className="text-xl leading-none">🌙</span>
      )}
    </button>
  );
}
