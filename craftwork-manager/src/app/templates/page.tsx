'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CraftTemplate, CraftWork } from '@/types';
import {
  getCraftTemplates,
  addCraftTemplate,
  updateCraftTemplate,
  deleteCraftTemplate,
  getCraftWorks,
  incrementTemplateUsage,
} from '@/lib/storage';
import { formatCurrency } from '@/lib/calculator';
import CraftTemplateForm from '@/components/CraftTemplateForm';
import CraftTemplateList from '@/components/CraftTemplateList';

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<CraftTemplate[]>([]);
  const [works, setWorks] = useState<CraftWork[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CraftTemplate | null>(null);
  const [sourceWorkId, setSourceWorkId] = useState<string | undefined>();
  const [showCreateFromWork, setShowCreateFromWork] = useState(false);

  useEffect(() => {
    setTemplates(getCraftTemplates());
    setWorks(getCraftWorks());
  }, []);

  const handleAddTemplate = (data: Omit<CraftTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => {
    addCraftTemplate(data);
    setTemplates(getCraftTemplates());
    setShowForm(false);
    setShowCreateFromWork(false);
    setSourceWorkId(undefined);
  };

  const handleUpdateTemplate = (data: Omit<CraftTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => {
    if (!editingTemplate) return;
    const updated = updateCraftTemplate(editingTemplate.id, data);
    if (updated) {
      setTemplates(getCraftTemplates());
    }
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm('确定要删除这个工艺模板吗？')) {
      deleteCraftTemplate(id);
      setTemplates(getCraftTemplates());
    }
  };

  const handleEditTemplate = (template: CraftTemplate) => {
    setEditingTemplate(template);
    setShowForm(false);
    setShowCreateFromWork(false);
  };

  const handleUseTemplate = (template: CraftTemplate) => {
    incrementTemplateUsage(template.id);
    router.push(`/works?templateId=${template.id}`);
  };

  const handleCreateFromWork = (workId: string) => {
    setSourceWorkId(workId);
    setShowCreateFromWork(false);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTemplate(null);
    setSourceWorkId(undefined);
    setShowCreateFromWork(false);
  };

  const totalTemplates = templates.length;
  const totalUsage = templates.reduce((sum, t) => sum + t.usageCount, 0);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-amber-800">工艺模板管理</h2>
          <p className="text-gray-600 mt-1">创建和管理可复用的工艺模板，快速创建相似作品</p>
        </div>
        {!editingTemplate && !showForm && (
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreateFromWork(!showCreateFromWork)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              📋 从作品创建
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              ➕ 新建模板
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="text-3xl mb-2">📋</div>
          <div className="text-2xl font-bold text-amber-600">{totalTemplates}</div>
          <div className="text-gray-500 text-sm">模板总数</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="text-3xl mb-2">🚀</div>
          <div className="text-2xl font-bold text-green-600">{totalUsage}</div>
          <div className="text-gray-500 text-sm">累计使用</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="text-3xl mb-2">🎨</div>
          <div className="text-2xl font-bold text-blue-600">{works.length}</div>
          <div className="text-gray-500 text-sm">可套用作品</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="text-3xl mb-2">⭐</div>
          <div className="text-2xl font-bold text-purple-600">
            {totalTemplates > 0 ? (totalUsage / totalTemplates).toFixed(1) : 0}
          </div>
          <div className="text-gray-500 text-sm">平均使用次数</div>
        </div>
      </div>

      {showCreateFromWork && (
        <div className="mb-6 bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">选择一个作品作为模板基础</h3>
          {works.length === 0 ? (
            <p className="text-gray-500 text-center py-4">暂无作品可用于创建模板</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {works.map((work) => (
                <div
                  key={work.id}
                  onClick={() => handleCreateFromWork(work.id)}
                  className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-colors"
                >
                  <div className="font-medium text-gray-800 mb-1">{work.name}</div>
                  <div className="text-xs text-gray-500 mb-2">{work.category}</div>
                  <div className="text-sm text-amber-600 font-medium">
                    {formatCurrency(work.totalCost)} 成本
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setShowCreateFromWork(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="mb-6">
          <CraftTemplateForm
            template={editingTemplate}
            onSubmit={editingTemplate ? handleUpdateTemplate : handleAddTemplate}
            onCancel={handleCancel}
            sourceWorkId={sourceWorkId}
          />
        </div>
      )}

      {editingTemplate && !showForm && (
        <div className="mb-6">
          <CraftTemplateForm
            template={editingTemplate}
            onSubmit={handleUpdateTemplate}
            onCancel={handleCancel}
          />
        </div>
      )}

      {!showForm && !editingTemplate && !showCreateFromWork && (
        <CraftTemplateList
          templates={templates}
          onEdit={handleEditTemplate}
          onDelete={handleDeleteTemplate}
          onUse={handleUseTemplate}
        />
      )}
    </div>
  );
}
