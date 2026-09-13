"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { SavedPropertiesSync } from "@/components/shared/SavedPropertiesSync";
import { SessionTimeout } from "@/components/shared/SessionTimeout";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange={false}>
        <SavedPropertiesSync />
        <SessionTimeout />
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
