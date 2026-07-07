"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Client-side providers wrapper.
 * Wraps children with next-themes ThemeProvider for dark mode support.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
