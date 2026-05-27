'use client';

import { useState, useEffect } from 'react';
import { Material, MaterialUsage, CraftTemplate, CraftCategory, ProcessStep, WorkProcessStep } from '@/types';
import { getMaterials, getProcessSteps, getCraftWorks } from '@/lib/storage';
import {
  calculateMaterialCost,
  calculateTotalCost,
  calculateSuggestedPrice,
  calculateSingleMaterialCost,
  calculateActualQuantity,
  calculateLaborCostFromSteps,
  calculateStepCost,
  formatCurrency,
  formatHours,
} from '@/lib/calculator';

const craftCategories: CraftCategory[] = [
  '首饰', '绘画', '皮具', '书法篆刻', '花艺', '陶艺', '编织', '其他'
];

interface CraftTemplateFormProps {
  template?: CraftTemplate | null;
  onSubmit: (data: Omit<CraftTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => void;
  onCancel?: () => void;
  sourceWorkId?: string;
}

export default function CraftTemplateForm({ template, onSubmit, onCancel, sourceWorkId }: CraftTemplateFormProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<MaterialUsage[]>([]);
  const [selectedProcessSteps, setSelectedProcessSteps] = useState<WorkProcessStep[]>([]);
  const [newMaterialId, setNewMaterialId] = useState('');
  const [newQuantity, setNewQuantity] = useState(0);
  const [newWastageRate, setNewWastageRate] = useState(5);
  const [newStepId, setNewStepId] = useState('');
  const [profitMultiplier, setProfitMultiplier] = useState(2.5);

  const [formData, setFormData] = useState({
    name: '',
    category: '其他' as CraftCategory,
    description: '',
    otherCost: 0,
  });

  useEffect(() => {
    setMaterials(getMaterials());
    setProcessSteps(getProcessSteps());
  }, []);

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        category: template.category as CraftCategory,
        description: template.description || '',
        otherCost: template.otherCost,
      });
      setSelectedMaterials(template.materials || []);
      setSelectedProcessSteps(template.processSteps || []);
      setProfitMultiplier(template.profitMultiplier);
    } else if (sourceWorkId) {
      const works = getCraftWorks();
      const work = works.find(w => w.id === sourceWorkId);
      if (work) {
        setFormData({
          name: work.name + ' 模板',
          category: work.category as CraftCategory,
          description: work.description || '',
          otherCost: work.otherCost,
        });
        setSelectedMaterials(work.materials || []);
        setSelectedProcessSteps(work.processSteps || []);
        const multiplier = work.suggestedPrice / work.totalCost;
        setProfitMultiplier(Math.round(multiplier * 10) / 10);
      }
    }
  }, [template, sourceWorkId]);

  const addMaterial = () => {
    const material = materials.find(m => m.id === newMaterialId);
    if (!material || newQuantity <= 0) return;

    const existingIndex = selectedMaterials.findIndex(m => m.materialId === newMaterialId);
    if (existingIndex >= 0) {
      const updated = [...selectedMaterials];
      updated[existingIndex].quantity += newQuantity;
      updated[existingIndex].actualQuantity = calculateActualQuantity(updated[existingIndex].quantity, updated[existingIndex].wastageRate);
      updated[existingIndex].cost = calculateSingleMaterialCost(
        Number(updated[existingIndex].unitPrice),
        updated[existingIndex].quantity,
        updated[existingIndex].wastageRate
      );
      setSelectedMaterials(updated);
    } else {
      const actualQty = calculateActualQuantity(newQuantity, newWastageRate);
      const usage: MaterialUsage = {
        materialId: material.id,
        materialName: material.name,
        quantity: newQuantity,
        unitPrice: material.unitPrice.toString(),
        wastageRate: newWastageRate,
        actualQuantity: actualQty,
        cost: calculateSingleMaterialCost(material.unitPrice, newQuantity, newWastageRate),
      };
      setSelectedMaterials([...selectedMaterials, usage]);
    }

    setNewMaterialId('');
    setNewQuantity(0);
  };

  const removeMaterial = (materialId: string) => {
    setSelectedMaterials(selectedMaterials.filter(m => m.materialId !== materialId));
  };

  const updateMaterialWastageRate = (materialId: string, wastageRate: number) => {
    const updated = selectedMaterials.map(m => {
      if (m.materialId === materialId) {
        const actualQty = calculateActualQuantity(m.quantity, wastageRate);
        return {
          ...m,
          wastageRate,
          actualQuantity: actualQty,
          cost: calculateSingleMaterialCost(Number(m.unitPrice), m.quantity, wastageRate),
        };
      }
      return m;
    });
    setSelectedMaterials(updated);
  };

  const addProcessStep = () => {
    const step = processSteps.find(s => s.id === newStepId);
    if (!step) return;

    const existingIndex = selectedProcessSteps.findIndex(s => s.stepId === newStepId);
    if (existingIndex >= 0) return;

    const workStep: WorkProcessStep = {
      stepId: step.id,
      stepName: step.name,
      estimatedHours: step.estimatedHours,
      actualHours: step.estimatedHours,
      hourlyRate: step.hourlyRate,
      cost: step.standardCost,
    };
    setSelectedProcessSteps([...selectedProcessSteps, workStep]);
    setNewStepId('');
  };

  const removeProcessStep = (stepId: string) => {
    setSelectedProcessSteps(selectedProcessSteps.filter(s => s.stepId !== stepId));
  };

  const updateStepHours = (stepId: string, actualHours: number) => {
    const updated = selectedProcessSteps.map(s => {
      if (s.stepId === stepId) {
        return {
          ...s,
          actualHours,
          cost: calculateStepCost(actualHours, s.hourlyRate),
        };
      }
      return s;
    });
    setSelectedProcessSteps(updated);
  };

  const materialCost = calculateMaterialCost(selectedMaterials);
  const laborCostFromSteps = calculateLaborCostFromSteps(selectedProcessSteps);
  const totalCost = calculateTotalCost(
    materialCost,
    laborCostFromSteps,
    formData.otherCost
  );
  const suggestedPrice = calculateSuggestedPrice(totalCost, profitMultiplier);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      materials: selectedMaterials,
      processSteps: selectedProcessSteps,
      profitMultiplier,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-xl font-bold text-amber-800 mb-6">
        {template ? '编辑工艺模板' : '创建工艺模板'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            模板名称 *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            placeholder="给模板起个名字"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            分类
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as CraftCategory })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            {craftCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            模板描述
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            placeholder="描述这个模板的用途和特点"
          />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4 mb-6">
        <h4 className="font-semibold text-gray-800 mb-4">📦 材料清单 (含损耗率)</h4>

        <div className="flex flex-col sm:flex-row gap-3 mb-4 items-end">
          <select
            value={newMaterialId}
            onChange={(e) => setNewMaterialId(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="">选择耗材...</option>
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({formatCurrency(m.unitPrice)}/{m.unit})
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="用量"
            min="0"
            step="0.01"
            value={newQuantity || ''}
            onChange={(e) => setNewQuantity(parseFloat(e.target.value) || 0)}
            className="w-full sm:w-28 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
          <div className="w-full sm:w-28">
            <label className="block text-xs text-gray-500 mb-1">损耗率 %</label>
            <input
              type="number"
              min="0"
              max="100"
              value={newWastageRate}
              onChange={(e) => setNewWastageRate(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <button
            type="button"
            onClick={addMaterial}
            className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
          >
            添加材料
          </button>
        </div>

        {selectedMaterials.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-600">
                  <th className="text-left pb-2">材料名称</th>
                  <th className="text-right pb-2">单价</th>
                  <th className="text-right pb-2">计划用量</th>
                  <th className="text-right pb-2">损耗率</th>
                  <th className="text-right pb-2">实际用量</th>
                  <th className="text-right pb-2">成本</th>
                  <th className="text-center pb-2">操作</th>
                </tr>
              </thead>
              <tbody>
                {selectedMaterials.map((m) => (
                  <tr key={m.materialId} className="border-t border-gray-200">
                    <td className="py-2">{m.materialName}</td>
                    <td className="py-2 text-right text-gray-600">¥{Number(m.unitPrice).toFixed(2)}</td>
                    <td className="py-2 text-right text-gray-600">{m.quantity}</td>
                    <td className="py-2 text-right">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={m.wastageRate}
                        onChange={(e) => updateMaterialWastageRate(m.materialId, parseFloat(e.target.value) || 0)}
                        className="w-16 px-2 py-1 text-right border border-gray-300 rounded"
                      />%
                    </td>
                    <td className="py-2 text-right font-medium text-orange-600">{m.actualQuantity.toFixed(2)}</td>
                    <td className="py-2 text-right font-medium">{formatCurrency(m.cost)}</td>
                    <td className="py-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeMaterial(m.materialId)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-amber-300">
                  <td colSpan={5} className="py-2 font-semibold">材料总成本 (含损耗)</td>
                  <td className="py-2 text-right font-bold text-amber-700">{formatCurrency(materialCost)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 pt-4 mb-6">
        <h4 className="font-semibold text-gray-800 mb-4">⚙️ 工艺步骤 (工时记录)</h4>

        <div className="flex flex-col sm:flex-row gap-3 mb-4 items-end">
          <select
            value={newStepId}
            onChange={(e) => setNewStepId(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="">从工艺库选择步骤...</option>
            {processSteps.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({formatHours(s.estimatedHours)}, ¥{s.hourlyRate}/h)
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addProcessStep}
            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
          >
            添加工序
          </button>
        </div>

        {selectedProcessSteps.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-600">
                  <th className="text-left pb-2">工序名称</th>
                  <th className="text-right pb-2">预计工时</th>
                  <th className="text-right pb-2">实际工时</th>
                  <th className="text-right pb-2">小时费率</th>
                  <th className="text-right pb-2">成本</th>
                  <th className="text-center pb-2">操作</th>
                </tr>
              </thead>
              <tbody>
                {selectedProcessSteps.map((s) => (
                  <tr key={s.stepId} className="border-t border-gray-200">
                    <td className="py-2">{s.stepName}</td>
                    <td className="py-2 text-right text-gray-600">{formatHours(s.estimatedHours)}</td>
                    <td className="py-2 text-right">
                      <input
                        type="number"
                        min="0"
                        step="0.25"
                        value={s.actualHours}
                        onChange={(e) => updateStepHours(s.stepId, parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 text-right border border-gray-300 rounded"
                      />h
                    </td>
                    <td className="py-2 text-right text-gray-600">¥{s.hourlyRate.toFixed(2)}</td>
                    <td className="py-2 text-right font-medium">{formatCurrency(s.cost)}</td>
                    <td className="py-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeProcessStep(s.stepId)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-green-300">
                  <td colSpan={4} className="py-2 font-semibold">人工成本小计</td>
                  <td className="py-2 text-right font-bold text-green-700">{formatCurrency(laborCostFromSteps)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 pt-4 mb-6">
        <h4 className="font-semibold text-gray-800 mb-4">💰 成本与定价参数</h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              其他费用 (元)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.otherCost || ''}
              onChange={(e) => setFormData({ ...formData, otherCost: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="包装、水电等"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              期望利润率
            </label>
            <select
              value={profitMultiplier}
              onChange={(e) => setProfitMultiplier(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="1.5">50% (1.5倍)</option>
              <option value="2">100% (2倍)</option>
              <option value="2.5">150% (2.5倍)</option>
              <option value="3">200% (3倍)</option>
              <option value="4">300% (4倍)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl p-6 mb-6">
        <h4 className="font-semibold text-amber-800 mb-4">📊 模板成本预览</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-xs text-amber-600 mb-1">材料成本</div>
            <div className="text-lg font-bold text-amber-800">{formatCurrency(materialCost)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-amber-600 mb-1">人工成本</div>
            <div className="text-lg font-bold text-green-700">{formatCurrency(laborCostFromSteps)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-amber-600 mb-1">总成本</div>
            <div className="text-lg font-bold text-amber-800">{formatCurrency(totalCost)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-amber-600 mb-1">建议售价</div>
            <div className="text-lg font-bold text-green-600">{formatCurrency(suggestedPrice)}</div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
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
          {template ? '保存修改' : '创建模板'}
        </button>
      </div>
    </form>
  );
}
