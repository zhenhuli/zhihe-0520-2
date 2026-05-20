import React from 'react';
import { useLightProgram } from '@/context/LightProgramContext';

export const LightPreview: React.FC = () => {
  const { program, activeState } = useLightProgram();
  const currentStep = program.timeline[activeState.stepIndex];

  return (
    <div className="h-full flex flex-col bg-black">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-lg font-bold text-white mb-2">实时预览</h2>
        <div className="text-sm text-gray-400">
          {currentStep ? (
            <>
              当前场景: <span className="text-white">{currentStep.name}</span>
              {activeState.isPlaying && (
                <span className="ml-2">
                  | 进度: {Math.round(activeState.progress * 100)}%
                </span>
              )}
            </>
          ) : (
            '暂无场景'
          )}
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="w-full h-full rounded-3xl relative">
            {currentStep ? (
              <div className="w-full h-full relative">
                {currentStep.lightGroups.map((group, index) => {
                  const currentColor = activeState.currentColors[group.id] || group.startColor;
                  const totalGroups = currentStep.lightGroups.length;
                  const angle = (360 / totalGroups) * index;
                  const isEven = totalGroups % 2 === 0;
                  const radius = 35;

                  const positions = [];
                  const rows = Math.ceil(Math.sqrt(totalGroups));
                  const cols = Math.ceil(totalGroups / rows);
                  
                  for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                      const idx = r * cols + c;
                      if (idx < totalGroups) {
                        positions.push({
                          x: 10 + (80 * (c / (cols - 1 || 1))),
                          y: 10 + (80 * (r / (rows - 1 || 1))),
                        });
                      }
                    }
                  }

                  const pos = positions[index] || { x: 50, y: 50 };

                  return (
                    <div key={group.id}
                      className="absolute rounded-full transition-all duration-100"
                      style={{
                        left: `${pos.x}%`,
                        top: `${pos.y}%`,
                        width: '120px',
                        height: '120px',
                        transform: 'translate(-50%, -50%)',
                        background: `radial-gradient(circle, ${currentColor} 0%, ${currentColor}88 30%, transparent 70%)`,
                        boxShadow: `0 0 60px 30px ${currentColor}66, 0 0 100px 60px ${currentColor}33`,
                        filter: 'blur(2px)',
                      }}
                    />
                  );
                })}

                <div className="absolute inset-0 pointer-events-none"
                  style={{
                    background: currentStep.lightGroups.map((group) => activeState.currentColors[group.id] || group.startColor)
                      .map((color, i, arr) => `${color}33 ${(i / arr.length) * 100}%, ${((i + 1) / arr.length) * 100}%`)
                      .join(', '),
                    opacity: 0.5,
                    mixBlendMode: 'screen',
                  }}
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-600">
                请添加场景以预览灯光效果
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          {currentStep && (
            <div className="flex flex-wrap gap-2">
              {currentStep.lightGroups.map((group) => {
                const currentColor = activeState.currentColors[group.id] || group.startColor;
                return (
                  <div
                    key={group.id}
                    className="flex items-center gap-2 bg-gray-900/80 rounded-lg px-3 py-2"
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: currentColor }}
                    />
                    <span className="text-xs text-white">{group.name}</span>
                    <span className="text-xs text-gray-400 font-mono">{currentColor}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
