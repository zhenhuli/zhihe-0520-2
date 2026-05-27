'use client';

import { useState } from 'react';
import { ProcessStep, ProcessCategory } from '@/types';
import { calculateStepCost } from '@/lib/calculator';

interface ProcessStepFormProps {
  step?: ProcessStep;
  onSubmit: (data: Omit<ProcessStep, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel?: () => void;
}

const processCategories: ProcessCategory[] = [
  '准备', '制作', '装饰', '组装', '打磨', '上色', '烘焙', '缝制', '编织', '包装', '其他'
];

export default function ProcessStepForm({ step, onSubmit, onCancel }: ProcessStepFormProps) {
  const [name, setName] = useState(step?.name || '');
  const [category, setCategory] = useState<ProcessCategory>(step?.category as ProcessCategory || '制作');
  const [description, setDescription] = useState(step?.description || '');
  const [estimatedHours, setEstimatedHours] = useState(step?.estimatedHours?.toString() || '1');
  const [hourlyRate, setHourlyRate] = useState(step?.hourlyRate?.toString() || '50');

  const hours = parseFloat(estimatedHours) || 0;
  const rate = parseFloat(hourlyRate) || 0;
  const standardCost = calculateStepCost(hours, rate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      category,
      description,
      estimatedHours: hours,
      hourlyRate: rate,
      standardCost,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6 text-gray-800">
        {step ? '编辑工艺步骤' : '添加工艺步骤'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            步骤名称 *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            类别 *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ProcessCategory)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {processCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          步骤描述
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            预计工时 (小时) *
          </label>
          <input
            type="number"
            step="0.25"
            min="0"
            value={estimatedHours}
            onChange={(e) => setEstimatedHours(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            小时费率 (元) *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div className="bg-gray-50 rounded-md p-4 mb-6">
        <div className="text-sm text-gray-600">标准成本预览</div>
        <div className="text-2xl font-bold text-blue-600">¥{standardCost.toFixed(2)}</div>
        <div className="text-xs text-gray-500 mt-1">
          {hours} 小时 × ¥{rate}/小时
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          {step ? '保存修改' : '添加步骤'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
          >
            取消
          </button>
        )}
      </div>
    </form>
  );
}
