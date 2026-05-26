'use client';

import { useState } from 'react';
import SingleWave from '@/components/SingleWave';
import WaveSuperposition from '@/components/WaveSuperposition';
import WaveDiffraction from '@/components/WaveDiffraction';

type TabType = 'single' | 'superposition' | 'diffraction';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('single');

  const tabs = [
    { id: 'single' as const, label: '单光波', icon: '🌊' },
    { id: 'superposition' as const, label: '波的叠加', icon: '🔀' },
    { id: 'diffraction' as const, label: '光的衍射', icon: '🎯' },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 mb-3">
            可见光光波仿真演示
          </h1>
          <p className="text-slate-400 text-lg">
            探索光的奥秘 - 物理光学入门可视化教学
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-full">
              <span className="text-sm text-slate-400">可见光范围</span>
              <span className="text-cyan-400 font-mono">380-780nm</span>
            </div>
          </div>
        </header>

        <div className="flex gap-2 mb-8 bg-slate-800/50 p-1.5 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="transition-all duration-500">
          {activeTab === 'single' && <SingleWave />}
          {activeTab === 'superposition' && <WaveSuperposition />}
          {activeTab === 'diffraction' && <WaveDiffraction />}
        </div>

        <footer className="mt-12 text-center text-slate-500 text-sm">
          <p>🔬 物理光学可视化教学工具</p>
          <p className="mt-1">通过调节参数，直观理解光的波动性</p>
        </footer>
      </div>
    </main>
  );
}
