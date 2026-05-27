'use client';

import { CraftWork } from '@/types';
import { formatCurrency } from '@/lib/calculator';

interface CraftWorkCardProps {
  work: CraftWork;
  onEdit: (work: CraftWork) => void;
  onDelete: (id: string) => void;
  onView: (work: CraftWork) => void;
}

export default function CraftWorkCard({ work, onEdit, onDelete, onView }: CraftWorkCardProps) {
  const categoryEmojis: Record<string, string> = {
    '首饰': '💍',
    '绘画': '🎨',
    '皮具': '👜',
    '书法篆刻': '🖌️',
    '花艺': '💐',
    '陶艺': '🏺',
    '编织': '🧶',
    '其他': '✨',
  };

  return (
    <div
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={() => onView(work)}
    >
      <div className="relative h-48 bg-gradient-to-br from-amber-100 to-orange-100">
        {work.imageUrl ? (
          <img
            src={work.imageUrl}
            alt={work.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl">{categoryEmojis[work.category] || '✨'}</span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/90 text-amber-700">
            {work.category}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-800 text-lg mb-1 truncate">{work.name}</h3>
        {work.description && (
          <p className="text-gray-500 text-sm mb-3 line-clamp-2">{work.description}</p>
        )}

        <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <div className="text-gray-500 text-xs">成本</div>
            <div className="font-semibold text-gray-700">{formatCurrency(work.totalCost)}</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-2 text-center">
            <div className="text-amber-600 text-xs">售价</div>
            <div className="font-semibold text-amber-700">{formatCurrency(work.sellingPrice || work.suggestedPrice)}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-2 text-center">
            <div className="text-green-600 text-xs">利润</div>
            <div className="font-semibold text-green-700">{formatCurrency(work.profit || 0)}</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-2 text-center">
            <div className="text-blue-600 text-xs">利润率</div>
            <div className="font-semibold text-blue-700">{work.profitMargin || 0}%</div>
          </div>
        </div>

        <div
          className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onEdit(work)}
            className="px-3 py-1 text-sm text-amber-600 hover:bg-amber-100 rounded transition-colors"
          >
            编辑
          </button>
          <button
            onClick={() => onDelete(work.id)}
            className="px-3 py-1 text-sm text-red-600 hover:bg-red-100 rounded transition-colors"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  );
}
