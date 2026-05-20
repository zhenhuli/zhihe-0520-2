"use client";

import { ControlPanel } from "@/components/ControlPanel";
import { TimelineEditor } from "@/components/TimelineEditor";
import { LightPreview } from "@/components/LightPreview";

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-gray-900 overflow-hidden">
      <header className="bg-gray-950 text-white px-6 py-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold">舞台灯光渐变编排工具</h1>
            <p className="text-xs text-gray-400">Stage Light Color Fade Designer</p>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          Next.js + Tailwind CSS
        </div>
      </header>

      <ControlPanel />

      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/2 border-r border-gray-800 overflow-hidden">
          <TimelineEditor />
        </div>
        <div className="w-1/2 overflow-hidden">
          <LightPreview />
        </div>
      </div>
    </div>
  );
}
