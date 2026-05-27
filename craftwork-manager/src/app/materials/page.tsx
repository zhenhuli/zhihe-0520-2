'use client';

import { useState, useEffect } from 'react';
import { Material } from '@/types';
import { getMaterials, addMaterial, updateMaterial, deleteMaterial } from '@/lib/storage';
import MaterialList from '@/components/MaterialList';
import MaterialForm from '@/components/MaterialForm';

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setMaterials(getMaterials());
  }, []);

  const handleAddMaterial = (data: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newMaterial = addMaterial(data);
    setMaterials(getMaterials());
    setShowForm(false);
  };

  const handleUpdateMaterial = (data: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingMaterial) {
      updateMaterial(editingMaterial.id, data);
      setMaterials(getMaterials());
      setEditingMaterial(null);
      setShowForm(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个耗材吗？')) {
      deleteMaterial(id);
      setMaterials(getMaterials());
    }
  };

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingMaterial(null);
  };

  const filteredMaterials = materials.filter(m =>
    m.name.toLowerCase().includes(filter.toLowerCase()) ||
    m.category.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-amber-800">耗材管理</h2>
          <p className="text-gray-600 mt-1">管理您的所有手工材料和用品</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="搜索耗材..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
          <button
            onClick={() => {
              setShowForm(true);
              setEditingMaterial(null);
            }}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center space-x-2"
          >
            <span>➕</span>
            <span>添加耗材</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="text-3xl mb-2">📦</div>
          <div className="text-2xl font-bold text-amber-600">{materials.length}</div>
          <div className="text-gray-500 text-sm">耗材总数</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="text-3xl mb-2">💎</div>
          <div className="text-2xl font-bold text-amber-600">
            {materials.reduce((sum, m) => sum + m.unitPrice * m.stock, 0).toFixed(2)}
          </div>
          <div className="text-gray-500 text-sm">库存总价值</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="text-3xl mb-2">🏷️</div>
          <div className="text-2xl font-bold text-amber-600">
            {new Set(materials.map(m => m.category)).size}
          </div>
          <div className="text-gray-500 text-sm">分类数量</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="text-3xl mb-2">⚠️</div>
          <div className="text-2xl font-bold text-red-500">
            {materials.filter(m => m.stock < 10).length}
          </div>
          <div className="text-gray-500 text-sm">库存不足</div>
        </div>
      </div>

      {showForm && (
        <div className="mb-6">
          <MaterialForm
            material={editingMaterial}
            onSubmit={editingMaterial ? handleUpdateMaterial : handleAddMaterial}
            onCancel={handleCancel}
          />
        </div>
      )}

      <MaterialList
        materials={filteredMaterials}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
