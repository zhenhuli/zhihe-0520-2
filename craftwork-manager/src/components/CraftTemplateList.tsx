'use client';

import { CraftTemplate } from '@/types';
import { formatCurrency, formatDate } from '@/lib/calculator';

interface CraftTemplateListProps {
  templates: CraftTemplate[];
  onEdit: (template: CraftTemplate) => void;
  onDelete: (id: string) => void;
  onUse: (template: CraftTemplate) => void;
}

export default function CraftTemplateList({ templates, onEdit, onDelete, onUse }: CraftTemplateListProps) {
  if (templates.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-md">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl font-medium text-gray-600 mb-2">暂无工艺模板</h3>
        <p className="text-gray-400">点击上方按钮创建您的第一个工艺模板</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <div
          key={template.id}
          className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">{template.name}</h3>
                <span className="inline-block px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                  {template.category}
                </span>
              </div>
              <span className="text-xs text-gray-400">
                使用 {template.usageCount} 次
              </span>
            </div>

            {template.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
            )}

            <div className="grid grid-cols-3 gap-2 mb-4 text-center">
              <div className="bg-amber-50 rounded-lg p-2">
                <div className="text-xs text-gray-500">材料</div>
                <div className="text-sm font-bold text-amber-700">{template.materials.length}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-2">
                <div className="text-xs text-gray-500">工序</div>
                <div className="text-sm font-bold text-green-700">{template.processSteps.length}</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-2">
                <div className="text-xs text-gray-500">成本</div>
                <div className="text-sm font-bold text-blue-700">
                  {formatCurrency(
                    template.materials.reduce((sum, m) => sum + m.cost, 0) +
                    template.processSteps.reduce((sum, s) => sum + s.cost, 0) +
                    template.otherCost
                  )}
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-400 mb-4">
              创建于 {formatDate(template.createdAt)}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onUse(template)}
                className="flex-1 px-3 py-2 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 transition-colors"
              >
                🚀 使用模板
              </button>
              <button
                onClick={() => onEdit(template)}
                className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
              >
                ✏️
              </button>
              <button
                onClick={() => onDelete(template.id)}
                className="px-3 py-2 border border-red-300 text-red-600 text-sm rounded-lg hover:bg-red-50 transition-colors"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
