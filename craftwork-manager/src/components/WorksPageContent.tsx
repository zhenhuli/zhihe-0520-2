'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { CraftWork, CraftTemplate } from '@/types';
import { getCraftWorks, addCraftWork, updateCraftWork, deleteCraftWork, getCraftTemplateById, getCraftTemplates } from '@/lib/storage';
import { formatCurrency } from '@/lib/calculator';
import CraftWorkCard from '@/components/CraftWorkCard';
import CraftWorkForm from '@/components/CraftWorkForm';
import CraftWorkDetail from '@/components/CraftWorkDetail';

export default function WorksPageContent() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId');
  
  const [works, setWorks] = useState<CraftWork[]>([]);
  const [templates, setTemplates] = useState<CraftTemplate[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingWork, setEditingWork] = useState<CraftWork | null>(null);
  const [viewingWork, setViewingWork] = useState<CraftWork | null>(null);
  const [filter, setFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  useEffect(() => {
    setWorks(getCraftWorks());
    setTemplates(getCraftTemplates());
    
    if (templateId) {
      const template = getCraftTemplateById(templateId);
      if (template) {
        setSelectedTemplateId(templateId);
        setShowForm(true);
      }
    }
  }, [templateId]);

  const handleAddWork = (data: Omit<CraftWork, 'id' | 'createdAt' | 'updatedAt'>) => {
    addCraftWork(data);
    setWorks(getCraftWorks());
    setShowForm(false);
    setSelectedTemplateId(null);
  };

  const handleUpdateWork = (data: Omit<CraftWork, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingWork) {
      updateCraftWork(editingWork.id, data);
      setWorks(getCraftWorks());
      setEditingWork(null);
      setShowForm(false);
      setViewingWork(null);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个作品吗？')) {
      deleteCraftWork(id);
      setWorks(getCraftWorks());
    }
  };

  const handleEdit = (work: CraftWork) => {
    setEditingWork(work);
    setShowForm(true);
    setViewingWork(null);
    setSelectedTemplateId(null);
  };

  const handleView = (work: CraftWork) => {
    setViewingWork(work);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingWork(null);
    setSelectedTemplateId(null);
  };

  const categories = [...new Set(works.map(w => w.category))];
  const filteredWorks = works.filter(w => {
    const matchName = w.name.toLowerCase().includes(filter.toLowerCase());
    const matchCategory = !categoryFilter || w.category === categoryFilter;
    return matchName && matchCategory;
  });

  const totalRevenue = works.reduce((sum, w) => sum + (w.sellingPrice || w.suggestedPrice), 0);
  const totalProfit = works.reduce((sum, w) => sum + (w.profit || 0), 0);
  const totalCost = works.reduce((sum, w) => sum + w.totalCost, 0);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-amber-800">作品管理</h2>
          <p className="text-gray-600 mt-1">管理您的所有手工作品和成本记录</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingWork(null);
            setSelectedTemplateId(null);
          }}
          className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center space-x-2"
        >
          <span>➕</span>
          <span>创建作品</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="text-3xl mb-2">🎨</div>
          <div className="text-2xl font-bold text-amber-600">{works.length}</div>
          <div className="text-gray-500 text-sm">作品总数</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="text-3xl mb-2">💰</div>
          <div className="text-2xl font-bold text-amber-600">{formatCurrency(totalCost)}</div>
          <div className="text-gray-500 text-sm">总成本</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="text-3xl mb-2">📈</div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
          <div className="text-gray-500 text-sm">总销售额</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="text-3xl mb-2">💎</div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalProfit)}</div>
          <div className="text-gray-500 text-sm">总利润</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="搜索作品..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
        >
          <option value="">全部分类</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {showForm && (
        <div className="mb-6">
          {!editingWork && templates.length > 0 && (
            <div className="mb-4 bg-blue-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-blue-800 mb-2">
                📋 选择工艺模板 (可选)
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedTemplateId(null)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    !selectedTemplateId
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  空白创建
                </button>
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplateId(template.id)}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedTemplateId === template.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <CraftWorkForm
            work={editingWork}
            onSubmit={editingWork ? handleUpdateWork : handleAddWork}
            onCancel={handleCancel}
            templateId={selectedTemplateId}
          />
        </div>
      )}

      {filteredWorks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <div className="text-6xl mb-4">🎨</div>
          <h3 className="text-xl font-medium text-gray-600 mb-2">暂无作品记录</h3>
          <p className="text-gray-400">点击上方按钮创建您的第一个作品档案</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredWorks.map((work) => (
            <CraftWorkCard
              key={work.id}
              work={work}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          ))}
        </div>
      )}

      {viewingWork && !showForm && (
        <CraftWorkDetail
          work={viewingWork}
          onClose={() => setViewingWork(null)}
          onEdit={() => handleEdit(viewingWork)}
        />
      )}
    </div>
  );
}
