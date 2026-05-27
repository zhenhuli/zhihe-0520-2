'use client';

import { useState, useEffect } from 'react';
import { ProcessStep } from '@/types';
import {
  getProcessSteps,
  addProcessStep,
  updateProcessStep,
  deleteProcessStep,
} from '@/lib/storage';
import ProcessStepForm from '@/components/ProcessStepForm';
import ProcessStepList from '@/components/ProcessStepList';

export default function ProcessStepsPage() {
  const [steps, setSteps] = useState<ProcessStep[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingStep, setEditingStep] = useState<ProcessStep | null>(null);

  useEffect(() => {
    setSteps(getProcessSteps());
  }, []);

  const handleAddStep = (data: Omit<ProcessStep, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newStep = addProcessStep(data);
    setSteps([...steps, newStep]);
    setShowForm(false);
  };

  const handleUpdateStep = (data: Omit<ProcessStep, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingStep) return;
    const updated = updateProcessStep(editingStep.id, data);
    if (updated) {
      setSteps(steps.map(s => s.id === editingStep.id ? updated : s));
    }
    setEditingStep(null);
  };

  const handleDeleteStep = (id: string) => {
    if (confirm('确定要删除这个工艺步骤吗？')) {
      deleteProcessStep(id);
      setSteps(steps.filter(s => s.id !== id));
    }
  };

  const handleEditStep = (step: ProcessStep) => {
    setEditingStep(step);
    setShowForm(false);
  };

  const handleCancelEdit = () => {
    setEditingStep(null);
  };

  const totalSteps = steps.length;
  const totalCost = steps.reduce((sum, s) => sum + s.standardCost, 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">工艺步骤库</h1>
          <p className="text-gray-500 mt-1">
            共 {totalSteps} 个步骤，标准总成本 ¥{totalCost.toFixed(2)}
          </p>
        </div>
        {!editingStep && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showForm ? '取消' : '+ 添加工艺步骤'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-6">
          <ProcessStepForm
            onSubmit={handleAddStep}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {editingStep && (
        <div className="mb-6">
          <ProcessStepForm
            step={editingStep}
            onSubmit={handleUpdateStep}
            onCancel={handleCancelEdit}
          />
        </div>
      )}

      <ProcessStepList
        steps={steps}
        onEdit={handleEditStep}
        onDelete={handleDeleteStep}
      />
    </div>
  );
}
