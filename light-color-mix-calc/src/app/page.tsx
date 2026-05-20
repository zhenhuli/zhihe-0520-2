"use client";

import { useState, useEffect, useCallback } from "react";
import ColorMixer from "@/components/ColorMixer";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <ColorMixer />
    </main>
  );
}
