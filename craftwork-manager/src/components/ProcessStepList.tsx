'use client';

import { ProcessStep } from '@/types';
import { formatCurrency, formatHours } from '@/lib/calculator';

interface ProcessStepListProps {
  steps: ProcessStep[];
  onEdit: (step: ProcessStep) => void;
  onDelete: (id: string) => void;
}

export default function ProcessStepList({ steps, onEdit, onDelete }: ProcessStepListProps) {
  if (steps.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="text-gray-400 text-lg mb-2">暂无工艺步骤</div>
        <p className="text-gray-500 text-sm">点击上方按钮添加第一个工艺步骤</p>
      </div>
    );
  }

  const groupedSteps = steps.reduce((acc, step) => {
    if (!acc[step.category]) {
      acc[step.category] = [];
    }
    acc[step.category].push(step);
    return acc;
  }, {} as Record<string, ProcessStep[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedSteps).map(([category, categorySteps]) => (
        <div key={category}>
          <h3 className="text-lg font-medium text-gray-700 mb-3 flex items-center">
            <span className="w-1 h-5 bg-blue-500 rounded mr-2"></span>
            {category}
            <span className="ml-2 text-sm text-gray-500">({categorySteps.length}个步骤)</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categorySteps.map(step => (
              <div
                key={step.id}
                className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium text-gray-800">{step.name}</h4>
                  <div className="flex gap-1">
                    <button
                      onClick={() => onEdit(step)}
                      className="text-blue-600 hover:text-blue-800 px-2 py-1 text-sm"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => onDelete(step.id)}
                      className="text-red-600 hover:text-red-800 px-2 py-1 text-sm"
                    >
                      删除
                    </button>
                  </div>
                </div>
                {step.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{step.description}</p>
                )}
                <div className="flex justify-between items-center text-sm">
                  <div className="text-gray-500">
                    <span className="font-medium text-gray-700">{formatHours(step.estimatedHours)}</span>
                    {' '}× ¥{step.hourlyRate}/h
                  </div>
                  <div className="font-bold text-green-600">
                    {formatCurrency(step.standardCost)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
