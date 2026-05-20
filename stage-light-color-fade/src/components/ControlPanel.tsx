import React, { useState, useRef } from 'react';
import { useLightProgram } from '@/context/LightProgramContext';
import { LightProgram } from '@/types';

export const ControlPanel: React.FC = () => {
  const {
    program,
    activeState,
    setProgramName,
    play,
    pause,
    stop,
    reset,
    saveProgram,
    exportProgram,
    importProgram,
  } = useLightProgram();

  const [showSavedPrograms, setShowSavedPrograms] = useState(false);
  const [savedPrograms, setSavedPrograms] = useState<LightProgram[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadSavedPrograms = () => {
    const saved = JSON.parse(localStorage.getItem('lightPrograms') || '[]');
    setSavedPrograms(saved);
    setShowSavedPrograms(true);
  };

  const handleExport = () => {
    const json = exportProgram();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${program.name.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        importProgram(content);
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalDuration = () => {
    return program.timeline.reduce((acc, step) => acc + step.stepDuration, 0);
  };

  return (
    <div className="bg-gray-900 text-white p-4 border-b border-gray-700">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">方案名称:</span>
          <input
            type="text"
            value={program.name}
            onChange={(e) => setProgramName(e.target.value)}
            className="bg-gray-800 text-white px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
          />
        </div>

        <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
          {!activeState.isPlaying ? (
            <button
              onClick={play}
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              disabled={program.timeline.length === 0}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
              播放
            </button>
          ) : (
            <button
              onClick={pause}
              className="flex items-center gap-1.5 bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
              </svg>
              暂停
            </button>
          )}
          <button
            onClick={stop}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4.25A2.25 2.25 0 016.25 2h7.5A2.25 2.25 0 0116 4.25v11.5A2.25 2.25 0 0113.75 18h-7.5A2.25 2.25 0 014 15.75V4.25z" />
            </svg>
            停止
          </button>
          <button
            onClick={reset}
            className="flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            重置
          </button>
        </div>

        <div className="h-8 w-px bg-gray-700" />

        <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
          <button
            onClick={saveProgram}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            保存
          </button>
          <button
            onClick={loadSavedPrograms}
            className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            加载
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            导出
          </button>
          <label className="flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            导入
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>

        <div className="flex-1" />

        <div className="text-sm text-gray-400">
          总时长: <span className="text-white font-mono">{formatTime(getTotalDuration())}</span>
          {activeState.isPlaying && (
            <span className="ml-3">
              场景: <span className="text-white">{activeState.stepIndex + 1}/{program.timeline.length}</span>
            </span>
          )}
        </div>
      </div>

      {showSavedPrograms && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowSavedPrograms(false)}>
          <div className="bg-gray-800 rounded-xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">已保存的方案</h3>
              <button
                onClick={() => setShowSavedPrograms(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            {savedPrograms.length === 0 ? (
              <p className="text-gray-400 text-center py-8">暂无已保存的方案</p>
            ) : (
              <div className="space-y-2">
                {savedPrograms.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
                    onClick={() => {
                      importProgram(JSON.stringify(p));
                      setShowSavedPrograms(false);
                    }}
                  >
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-gray-400">
                        {p.timeline.length} 个场景 · {new Date(p.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
