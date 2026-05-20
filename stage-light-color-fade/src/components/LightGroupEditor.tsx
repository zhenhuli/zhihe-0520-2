import React from 'react';
import { LightGroup, EasingType, EASING_OPTIONS } from '@/types';
import { useLightProgram } from '@/context/LightProgramContext';

interface LightGroupEditorProps {
  stepId: string;
  group: LightGroup;
}

export const LightGroupEditor: React.FC<LightGroupEditorProps> = ({ stepId, group }) => {
  const { updateLightGroup, deleteLightGroup, activeState } = useLightProgram();
  const currentColor = activeState.currentColors[group.id];

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <input
          type="text"
          value={group.name}
          onChange={(e) => updateLightGroup(stepId, group.id, { name: e.target.value })}
          className="bg-gray-700 text-white px-2 py-1 rounded text-sm w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => deleteLightGroup(stepId, group.id)}
          className="text-red-400 hover:text-red-300 text-sm"
        >
          删除
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-gray-400 text-xs mb-1">起始色</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={group.startColor}
              onChange={(e) => updateLightGroup(stepId, group.id, { startColor: e.target.value })}
              className="w-10 h-8 rounded cursor-pointer border-0"
            />
            <input
              type="text"
              value={group.startColor}
              onChange={(e) => updateLightGroup(stepId, group.id, { startColor: e.target.value })}
              className="bg-gray-700 text-white px-2 py-1 rounded text-xs w-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-gray-400 text-xs mb-1">结束色</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={group.endColor}
              onChange={(e) => updateLightGroup(stepId, group.id, { endColor: e.target.value })}
              className="w-10 h-8 rounded cursor-pointer border-0"
            />
            <input
              type="text"
              value={group.endColor}
              onChange={(e) => updateLightGroup(stepId, group.id, { endColor: e.target.value })}
              className="bg-gray-700 text-white px-2 py-1 rounded text-xs w-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-gray-400 text-xs mb-1">渐变时长 (ms)</label>
          <input
            type="number"
            value={group.duration}
            onChange={(e) => updateLightGroup(stepId, group.id, { duration: parseInt(e.target.value) || 0 })}
            className="bg-gray-700 text-white px-2 py-1 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            step="100"
          />
        </div>
        <div>
          <label className="block text-gray-400 text-xs mb-1">延迟 (ms)</label>
          <input
            type="number"
            value={group.delay}
            onChange={(e) => updateLightGroup(stepId, group.id, { delay: parseInt(e.target.value) || 0 })}
            className="bg-gray-700 text-white px-2 py-1 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            step="100"
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="block text-gray-400 text-xs mb-1">渐变曲线</label>
        <select
          value={group.easing}
          onChange={(e) => updateLightGroup(stepId, group.id, { easing: e.target.value as EasingType })}
          className="bg-gray-700 text-white px-2 py-1 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {EASING_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {currentColor && (
        <div className="mt-3 p-2 rounded border border-gray-600">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">当前颜色</span>
            <span className="text-xs text-white font-mono">{currentColor}</span>
          </div>
          <div
            className="w-full h-6 rounded mt-1"
            style={{ backgroundColor: currentColor }}
          />
        </div>
      )}

      <div className="mt-3">
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-75 rounded-full"
            style={{
              background: `linear-gradient(to right, ${group.startColor}, ${group.endColor})`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
