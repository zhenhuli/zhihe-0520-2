'use client';

import { useState, useEffect } from 'react';
import { Material, MaterialCategory } from '@/types';

const materialCategories: MaterialCategory[] = [
  '金属', '线材', '面料', '颜料', '纸张', '木材', '皮革',
  '粘合剂', '工具耗材', '包装材料', '其他'
];

const unitOptions = ['个', '克', '千克', '米', '厘米', '毫升', '升', '件', '包', '卷', '张', '瓶', '套'];

interface MaterialFormProps {
  material?: Material | null;
  onSubmit: (data: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel?: () => void;
}

export default function MaterialForm({ material, onSubmit, onCancel }: MaterialFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: '其他' as MaterialCategory,
    unit: '个',
    unitPrice: 0,
    stock: 0,
    supplier: '',
    description: '',
  });

  useEffect(() => {
    if (material) {
      setFormData({
        name: material.name,
        category: material.category as MaterialCategory,
        unit: material.unit,
        unitPrice: material.unitPrice,
        stock: material.stock,
        supplier: material.supplier || '',
        description: material.description || '',
      });
    }
  }, [material]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-xl font-bold text-amber-800 mb-6">
        {material ? '编辑耗材' : '添加新耗材'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            耗材名称 *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            placeholder="如：银线、牛皮、丙烯颜料等"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            分类
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as MaterialCategory })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            {materialCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            计量单位
          </label>
          <select
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            {unitOptions.map((unit) => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            单价 (元) *
          </label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={formData.unitPrice || ''}
            onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            当前库存
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.stock || ''}
            onChange={(e) => setFormData({ ...formData, stock: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            供应商
          </label>
          <input
            type="text"
            value={formData.supplier}
            onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            placeholder="可选"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            备注说明
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            placeholder="记录耗材特性、采购渠道、使用注意事项等"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            取消
          </button>
        )}
        <button
          type="submit"
          className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          {material ? '保存修改' : '添加耗材'}
        </button>
      </div>
    </form>
  );
}
