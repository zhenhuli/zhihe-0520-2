"use client";

import { LightProgramProvider } from "@/context/LightProgramContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return <LightProgramProvider>{children}</LightProgramProvider>;
}
