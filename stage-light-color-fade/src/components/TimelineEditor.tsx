import React, { useState } from 'react';
import { useLightProgram } from '@/context/LightProgramContext';
import { LightGroupEditor } from './LightGroupEditor';

export const TimelineEditor: React.FC = () => {
  const { program, addStep, updateStep, deleteStep, addLightGroup, activeState } = useLightProgram();
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set(program.timeline.map(s => s.id)));

  const toggleStep = (stepId: string) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  };

  const getTotalDuration = () => {
    return program.timeline.reduce((acc, step) => acc + step.stepDuration, 0);
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const millis = ms % 1000;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
  };

  let accumulatedTime = 0;

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">时间线编排</h2>
          <button
            onClick={addStep}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + 添加场景
          </button>
        </div>
        <div className="text-sm text-gray-400">
          总时长: {formatTime(getTotalDuration())} | 场景数: {program.timeline.length}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {program.timeline.map((step, index) => {
          const stepStartTime = accumulatedTime;
          accumulatedTime += step.stepDuration;
          const isActive = activeState.stepIndex === index && activeState.isPlaying;
          const isExpanded = expandedSteps.has(step.id);

          return (
            <div
              key={step.id}
              className={`rounded-lg border transition-all ${
                isActive ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-gray-700'
              }`}
            >
              <div
                className="bg-gray-800 p-3 cursor-pointer rounded-t-lg"
                onClick={() => toggleStep(step.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-sm w-6">{index + 1}.</span>
                    <input
                      type="text"
                      value={step.name}
                      onChange={(e) => {
                        e.stopPropagation();
                        updateStep(step.id, { name: e.target.value });
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-transparent text-white font-medium focus:outline-none focus:bg-gray-700 px-2 py-1 rounded"
                    />
                    {isActive && (
                      <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded animate-pulse">
                        播放中
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-sm">
                      {formatTime(stepStartTime)} - {formatTime(stepStartTime + step.stepDuration)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteStep(step.id);
                      }}
                      className="text-red-400 hover:text-red-300 text-sm"
                      disabled={program.timeline.length <= 1}
                    >
                      删除
                    </button>
                    <span className="text-gray-500">{isExpanded ? '▼' : '▶'}</span>
                  </div>
                </div>

                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <label className="text-xs text-gray-400">场景时长:</label>
                    <input
                      type="number"
                      value={step.stepDuration}
                      onChange={(e) => {
                        e.stopPropagation();
                        updateStep(step.id, { stepDuration: parseInt(e.target.value) || 0 });
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-gray-700 text-white px-2 py-1 rounded text-xs w-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="100"
                      step="100"
                    />
                    <span className="text-xs text-gray-400">ms</span>
                    <span className="text-xs text-gray-500 ml-2">
                      灯光组: {step.lightGroups.length}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden relative">
                    {step.lightGroups.map((group, gIndex) => (
                      <div
                        key={group.id}
                        className="absolute h-full"
                        style={{
                          left: `${(gIndex / step.lightGroups.length) * 100}%`,
                          width: `${100 / step.lightGroups.length}%`,
                          background: `linear-gradient(to right, ${group.startColor}, ${group.endColor})`,
                        }}
                      />
                    ))}
                    {isActive && (
                      <div
                        className="absolute top-0 h-full w-1 bg-white shadow-lg"
                        style={{ left: `${activeState.progress * 100}%` }}
                      />
                    )}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="bg-gray-850 p-4 border-t border-gray-700 rounded-b-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                    {step.lightGroups.map((group) => (
                      <LightGroupEditor key={group.id} stepId={step.id} group={group} />
                    ))}
                  </div>
                  <button
                    onClick={() => addLightGroup(step.id)}
                    className="w-full py-2 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-blue-500 hover:text-blue-400 transition-colors text-sm"
                  >
                    + 添加灯光组
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
