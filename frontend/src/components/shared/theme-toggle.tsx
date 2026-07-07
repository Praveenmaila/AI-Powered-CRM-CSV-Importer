"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Dark/Light mode toggle button.
 * Uses next-themes for persistent theme switching.
 * Shows sun icon in dark mode, moon icon in light mode.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <span className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      id="theme-toggle"
      variant="ghost"
      size="icon"
      className="h-9 w-9 transition-transform duration-200 hover:rotate-12"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-amber-400 transition-all duration-300" />
      ) : (
        <Moon className="h-4 w-4 text-slate-700 transition-all duration-300" />
      )}
    </Button>
  );
}
