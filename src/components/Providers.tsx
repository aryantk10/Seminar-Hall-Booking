"use client";

import { AuthProvider } from "@/context/AuthContext";
import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <TooltipProvider delayDuration={0}>
         {children}
        </TooltipProvider>
      </SidebarProvider>
    </AuthProvider>
  );
}
