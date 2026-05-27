'use client';

import { Material } from '@/types';
import { formatCurrency } from '@/lib/calculator';

interface MaterialListProps {
  materials: Material[];
  onEdit: (material: Material) => void;
  onDelete: (id: string) => void;
}

export default function MaterialList({ materials, onEdit, onDelete }: MaterialListProps) {
  if (materials.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-md">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-xl font-medium text-gray-600 mb-2">暂无耗材记录</h3>
        <p className="text-gray-400">点击上方按钮添加您的第一个耗材</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-amber-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-amber-800">名称</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-amber-800">分类</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-amber-800">单价</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-amber-800">库存</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-amber-800">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {materials.map((material) => (
              <tr key={material.id} className="hover:bg-amber-50/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-800">{material.name}</div>
                  {material.description && (
                    <div className="text-xs text-gray-500 mt-1">{material.description}</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    {material.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-medium text-gray-700">
                  {formatCurrency(material.unitPrice)} / {material.unit}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`${material.stock < 10 ? 'text-red-600' : 'text-gray-700'}`}>
                    {material.stock} {material.unit}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => onEdit(material)}
                      className="px-3 py-1 text-sm text-amber-600 hover:bg-amber-100 rounded transition-colors"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => onDelete(material.id)}
                      className="px-3 py-1 text-sm text-red-600 hover:bg-red-100 rounded transition-colors"
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
