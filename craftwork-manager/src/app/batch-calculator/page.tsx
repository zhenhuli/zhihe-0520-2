'use client';

import { useState, useEffect } from 'react';
import { CraftWork } from '@/types';
import { getCraftWorks, updateCraftWork } from '@/lib/storage';
import {
  formatCurrency,
  calculateMaterialCost,
  calculateLaborCostFromSteps,
  calculateTotalCost,
  calculateSuggestedPrice,
  calculateProfit,
  calculateProfitMarginPercentage,
} from '@/lib/calculator';

interface BatchResult {
  workId: string;
  workName: string;
  category: string;
  oldMaterialCost: number;
  oldLaborCost: number;
  oldOtherCost: number;
  oldTotalCost: number;
  oldSuggestedPrice: number;
  oldSellingPrice?: number;
  oldProfit?: number;
  oldProfitMargin?: number;
  newMaterialCost: number;
  newLaborCost: number;
  newOtherCost: number;
  newTotalCost: number;
  newSuggestedPrice: number;
  newProfit: number;
  newProfitMargin: number;
  costChange: number;
  priceChange: number;
}

export default function BatchCalculatorPage() {
  const [works, setWorks] = useState<CraftWork[]>([]);
  const [selectedWorkIds, setSelectedWorkIds] = useState<string[]>([]);
  const [results, setResults] = useState<BatchResult[]>([]);
  const [profitMultiplier, setProfitMultiplier] = useState(2.5);
  const [globalOtherCost, setGlobalOtherCost] = useState<number | null>(null);
  const [calculated, setCalculated] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setWorks(getCraftWorks());
  }, []);

  const categories = [...new Set(works.map(w => w.category))];
  
  const filteredWorks = works.filter(w => {
    return !categoryFilter || w.category === categoryFilter;
  });

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedWorkIds([]);
    } else {
      setSelectedWorkIds(filteredWorks.map(w => w.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectWork = (workId: string) => {
    if (selectedWorkIds.includes(workId)) {
      setSelectedWorkIds(selectedWorkIds.filter(id => id !== workId));
    } else {
      setSelectedWorkIds([...selectedWorkIds, workId]);
    }
  };

  const handleSelectCategory = () => {
    if (categoryFilter) {
      const categoryWorkIds = filteredWorks.map(w => w.id);
      const newSelected = new Set([...selectedWorkIds, ...categoryWorkIds]);
      setSelectedWorkIds(Array.from(newSelected));
    }
  };

  const calculateBatch = () => {
    if (selectedWorkIds.length === 0) {
      alert('请至少选择一个作品');
      return;
    }

    const batchResults: BatchResult[] = selectedWorkIds.map(workId => {
      const work = works.find(w => w.id === workId)!;
      
      if (!work) return null;
      
      const newMaterialCost = calculateMaterialCost(work.materials);
      const newLaborCost = calculateLaborCostFromSteps(work.processSteps);
      const newOtherCost = globalOtherCost !== null ? globalOtherCost : (work.otherCost || 0);
      const newTotalCost = calculateTotalCost(newMaterialCost, newLaborCost, newOtherCost);
      const newSuggestedPrice = calculateSuggestedPrice(newTotalCost, profitMultiplier);
      const sellingPrice = work.sellingPrice || newSuggestedPrice;
      const newProfit = calculateProfit(sellingPrice, newTotalCost);
      const newProfitMargin = calculateProfitMarginPercentage(newProfit, sellingPrice);

      return {
        workId: work.id,
        workName: work.name || '未知作品',
        category: work.category || '未分类',
        oldMaterialCost: work.materialCost || 0,
        oldLaborCost: work.laborCost || 0,
        oldOtherCost: work.otherCost || 0,
        oldTotalCost: work.totalCost || 0,
        oldSuggestedPrice: work.suggestedPrice || 0,
        oldSellingPrice: work.sellingPrice,
        oldProfit: work.profit,
        oldProfitMargin: work.profitMargin,
        newMaterialCost,
        newLaborCost,
        newOtherCost,
        newTotalCost,
        newSuggestedPrice,
        newProfit,
        newProfitMargin,
        costChange: newTotalCost - (work.totalCost || 0),
        priceChange: newSuggestedPrice - (work.suggestedPrice || 0),
      };
    }).filter(Boolean) as BatchResult[];

    setResults(batchResults);
    setCalculated(true);
  };

  const applyUpdates = () => {
    results.forEach(result => {
      updateCraftWork(result.workId, {
        materialCost: result.newMaterialCost,
        laborCost: result.newLaborCost,
        otherCost: result.newOtherCost,
        totalCost: result.newTotalCost,
        suggestedPrice: result.newSuggestedPrice,
        profit: result.newProfit,
        profitMargin: result.newProfitMargin,
      });
    });
    
    setWorks(getCraftWorks());
    setShowConfirm(false);
    setCalculated(false);
    setSelectedWorkIds([]);
    alert(`已成功更新 ${results.length} 个作品的成本数据！`);
  };

  const exportCSV = () => {
    const headers = ['作品名称', '分类', '原成本', '新成本', '成本变动', '原建议售价', '新建议售价', '价格变动', '新利润', '新利润率'];
    const rows = results.map(r => [
      r.workName,
      r.category,
      r.oldTotalCost.toFixed(2),
      r.newTotalCost.toFixed(2),
      (r.costChange >= 0 ? '+' : '') + r.costChange.toFixed(2),
      r.oldSuggestedPrice.toFixed(2),
      r.newSuggestedPrice.toFixed(2),
      (r.priceChange >= 0 ? '+' : '') + r.priceChange.toFixed(2),
      r.newProfit.toFixed(2),
      r.newProfitMargin + '%',
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `批量成本计算_${new Date().toLocaleDateString()}.csv`;
    link.click();
  };

  const totalOldCost = results.reduce((sum, r) => sum + r.oldTotalCost, 0);
  const totalNewCost = results.reduce((sum, r) => sum + r.newTotalCost, 0);
  const totalOldPrice = results.reduce((sum, r) => sum + r.oldSuggestedPrice, 0);
  const totalNewPrice = results.reduce((sum, r) => sum + r.newSuggestedPrice, 0);
  const totalNewProfit = results.reduce((sum, r) => sum + r.newProfit, 0);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-amber-800">批量成本计算器</h2>
        <p className="text-gray-600 mt-1">选择多个作品，批量重新计算成本和建议售价</p>
      </div>

      {!calculated ? (
        <>
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">⚙️ 计算参数</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  统一其他费用 (可选，留空则使用作品原值)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={globalOtherCost ?? ''}
                  onChange={(e) => setGlobalOtherCost(e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="不修改则留空"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <h3 className="text-lg font-bold text-gray-800">🎨 选择作品</h3>
              <div className="flex gap-2 flex-wrap">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="">全部分类</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {categoryFilter && (
                  <button
                    onClick={handleSelectCategory}
                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    选择此分类全部
                  </button>
                )}
                <button
                  onClick={handleSelectAll}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {selectAll ? '取消全选' : '全选当前'}
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-500 mb-4">
              已选择 <span className="font-bold text-amber-600">{selectedWorkIds.length}</span> 个作品
            </div>

            {filteredWorks.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🎨</div>
                <p className="text-gray-500">暂无作品可选择</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                {filteredWorks.map(work => (
                  <div
                    key={work.id}
                    onClick={() => handleSelectWork(work.id)}
                    className={`border rounded-lg p-3 cursor-pointer transition-all ${
                      selectedWorkIds.includes(work.id)
                        ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-800 truncate">{work.name}</div>
                        <div className="text-xs text-gray-500">{work.category}</div>
                      </div>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedWorkIds.includes(work.id)
                          ? 'bg-amber-500 border-amber-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedWorkIds.includes(work.id) && (
                          <span className="text-white text-xs">✓</span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-amber-600 font-medium mt-1">
                      {formatCurrency(work.totalCost)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={calculateBatch}
              disabled={selectedWorkIds.length === 0}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                selectedWorkIds.length > 0
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              🔢 开始批量计算 ({selectedWorkIds.length})
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h3 className="text-lg font-bold text-gray-800">📊 计算结果</h3>
              <div className="flex gap-2">
                <button
                  onClick={exportCSV}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  📥 导出 CSV
                </button>
                <button
                  onClick={() => {
                    setCalculated(false);
                    setResults([]);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  重新选择
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-amber-50 rounded-lg p-4 text-center">
                <div className="text-xs text-gray-500 mb-1">处理作品数</div>
                <div className="text-2xl font-bold text-amber-700">{results.length}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-xs text-gray-500 mb-1">原总成本</div>
                <div className="text-xl font-bold text-gray-700">{formatCurrency(totalOldCost)}</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-xs text-gray-500 mb-1">新总成本</div>
                <div className="text-xl font-bold text-blue-700">{formatCurrency(totalNewCost)}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-xs text-gray-500 mb-1">新总售价</div>
                <div className="text-xl font-bold text-green-700">{formatCurrency(totalNewPrice)}</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-xs text-gray-500 mb-1">总利润</div>
                <div className="text-xl font-bold text-purple-700">{formatCurrency(totalNewProfit)}</div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-4 py-3 font-medium text-gray-700">作品名称</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-700">分类</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-700">原成本</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-700">新成本</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-700">成本变动</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-700">原售价</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-700">新售价</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-700">价格变动</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-700">新利润</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-700">利润率</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(result => (
                    <tr key={result.workId} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{result.workName}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{result.category}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(result.oldTotalCost)}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-800">{formatCurrency(result.newTotalCost)}</td>
                      <td className={`px-4 py-3 text-right font-medium ${
                        result.costChange > 0 ? 'text-red-600' : result.costChange < 0 ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {result.costChange > 0 ? '+' : ''}{formatCurrency(result.costChange)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(result.oldSuggestedPrice)}</td>
                      <td className="px-4 py-3 text-right font-medium text-amber-700">{formatCurrency(result.newSuggestedPrice)}</td>
                      <td className={`px-4 py-3 text-right font-medium ${
                        result.priceChange > 0 ? 'text-red-600' : result.priceChange < 0 ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {result.priceChange > 0 ? '+' : ''}{formatCurrency(result.priceChange)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-green-600">{formatCurrency(result.newProfit)}</td>
                      <td className="px-4 py-3 text-right font-medium text-green-700">{result.newProfitMargin}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setCalculated(false);
                setResults([]);
              }}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              返回
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              💾 应用更新到所有作品
            </button>
          </div>

          {showConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-bold text-gray-800 mb-2">确认更新</h3>
                <p className="text-gray-600 mb-4">
                  即将更新 <span className="font-bold text-amber-600">{results.length}</span> 个作品的成本和售价数据。此操作不可撤销，确认继续吗？
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    onClick={applyUpdates}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                  >
                    确认更新
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
