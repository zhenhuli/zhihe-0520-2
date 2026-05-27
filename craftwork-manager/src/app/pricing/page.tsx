'use client';

import { useState, useEffect } from 'react';
import { CraftWork, PricingHistory } from '@/types';
import { getCraftWorks, getPricingHistoryByCraftWorkId, addPricingHistory, updateCraftWork } from '@/lib/storage';
import { formatCurrency, formatDate, calculatePriceChange } from '@/lib/calculator';
import SmartPricingRecommendation from '@/components/SmartPricingRecommendation';

export default function PricingPage() {
  const [works, setWorks] = useState<CraftWork[]>([]);
  const [selectedWork, setSelectedWork] = useState<CraftWork | null>(null);
  const [pricingHistory, setPricingHistory] = useState<PricingHistory[]>([]);
  const [showPriceEdit, setShowPriceEdit] = useState(false);
  const [newSellingPrice, setNewSellingPrice] = useState('');
  const [changeReason, setChangeReason] = useState('');

  useEffect(() => {
    setWorks(getCraftWorks());
  }, []);

  useEffect(() => {
    if (selectedWork) {
      setPricingHistory(getPricingHistoryByCraftWorkId(selectedWork.id));
      setNewSellingPrice((selectedWork.sellingPrice || selectedWork.suggestedPrice).toString());
    }
  }, [selectedWork]);

  const handleSelectWork = (work: CraftWork) => {
    setSelectedWork(work);
    setShowPriceEdit(false);
  };

  const handleUpdatePrice = () => {
    if (!selectedWork || !newSellingPrice) return;

    const oldPrice = selectedWork.sellingPrice;
    const newPrice = Number(newSellingPrice);

    if (oldPrice !== newPrice) {
      addPricingHistory({
        craftWorkId: selectedWork.id,
        craftWorkName: selectedWork.name,
        oldSellingPrice: oldPrice,
        newSellingPrice: newPrice,
        oldTotalCost: selectedWork.totalCost,
        newTotalCost: selectedWork.totalCost,
        changeReason: changeReason || undefined,
      });

      updateCraftWork(selectedWork.id, { sellingPrice: newPrice });
      setWorks(getCraftWorks());
      const updatedWork = getCraftWorks().find(w => w.id === selectedWork.id);
      if (updatedWork) {
        setSelectedWork(updatedWork);
        setPricingHistory(getPricingHistoryByCraftWorkId(selectedWork.id));
      }
    }

    setShowPriceEdit(false);
    setChangeReason('');
  };

  const getPriceTrend = (work: CraftWork) => {
    const history = getPricingHistoryByCraftWorkId(work.id);
    if (history.length === 0) return { icon: '➡️', text: '稳定', color: 'text-gray-500' };
    const lastChange = history[0];
    if (!lastChange.oldSellingPrice) return { icon: '➡️', text: '首次定价', color: 'text-blue-500' };
    const change = calculatePriceChange(lastChange.oldSellingPrice, lastChange.newSellingPrice);
    if (change > 0) return { icon: '📈', text: `+${change}%`, color: 'text-green-600' };
    if (change < 0) return { icon: '📉', text: `${change}%`, color: 'text-red-600' };
    return { icon: '➡️', text: '稳定', color: 'text-gray-500' };
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-amber-800">历史定价对比</h2>
        <p className="text-gray-600 mt-1">分析作品定价变化，做出更明智的定价决策</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4">🎨 作品列表</h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
            {works.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-xl shadow">
                <div className="text-4xl mb-2">🎨</div>
                <p className="text-gray-500">暂无作品</p>
              </div>
            ) : (
              works.map((work) => {
                const trend = getPriceTrend(work);
                return (
                  <div
                    key={work.id}
                    onClick={() => handleSelectWork(work)}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      selectedWork?.id === work.id
                        ? 'bg-amber-100 border-2 border-amber-500'
                        : 'bg-white hover:bg-amber-50 border-2 border-transparent shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">{work.name}</p>
                        <p className="text-sm text-gray-500">{work.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-amber-600">
                          {formatCurrency(work.sellingPrice || work.suggestedPrice)}
                        </p>
                        <p className={`text-xs ${trend.color}`}>
                          {trend.icon} {trend.text}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedWork ? (
            <div>
              <SmartPricingRecommendation
                key={selectedWork.id}
                work={selectedWork}
                onSelectStrategy={(price) => {
                  setNewSellingPrice(price.toString());
                  setShowPriceEdit(true);
                }}
              />

              <div className="bg-white rounded-xl shadow-md p-6 mt-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{selectedWork.name}</h3>
                    <p className="text-gray-500">{selectedWork.category}</p>
                  </div>
                  <button
                    onClick={() => setShowPriceEdit(true)}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    ✏️ 手动修改定价
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-500 mb-1">当前售价</p>
                    <p className="text-2xl font-bold text-amber-600">
                      {formatCurrency(selectedWork.sellingPrice || selectedWork.suggestedPrice)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-500 mb-1">总成本</p>
                    <p className="text-2xl font-bold text-gray-700">
                      {formatCurrency(selectedWork.totalCost)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-500 mb-1">利润</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency((selectedWork.sellingPrice || selectedWork.suggestedPrice) - selectedWork.totalCost)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-500 mb-1">利润率</p>
                    <p className="text-2xl font-bold text-green-600">
                      {Math.round(((selectedWork.sellingPrice || selectedWork.suggestedPrice) - selectedWork.totalCost) / (selectedWork.sellingPrice || selectedWork.suggestedPrice) * 100)}%
                    </p>
                  </div>
                </div>

                {showPriceEdit && (
                  <div className="bg-amber-50 rounded-lg p-4 mb-6">
                    <h4 className="font-medium text-gray-800 mb-3">修改售价</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">新售价</label>
                        <input
                          type="number"
                          value={newSellingPrice}
                          onChange={(e) => setNewSellingPrice(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">调整原因</label>
                        <input
                          type="text"
                          value={changeReason}
                          onChange={(e) => setChangeReason(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                          placeholder="如：材料成本上涨、市场需求增加等"
                        />
                      </div>
                    </div>
                    {newSellingPrice && Number(newSellingPrice) !== (selectedWork.sellingPrice || selectedWork.suggestedPrice) && (
                      <div className="mb-4 p-3 bg-white rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">原售价</p>
                            <p className="text-lg font-medium line-through text-gray-400">
                              {formatCurrency(selectedWork.sellingPrice || selectedWork.suggestedPrice)}
                            </p>
                          </div>
                          <div className="text-2xl text-gray-300">→</div>
                          <div>
                            <p className="text-sm text-gray-500">新售价</p>
                            <p className="text-lg font-bold text-amber-600">
                              {formatCurrency(Number(newSellingPrice))}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">变化</p>
                            <p className={`text-lg font-bold ${
                              Number(newSellingPrice) > (selectedWork.sellingPrice || selectedWork.suggestedPrice)
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}>
                              {Number(newSellingPrice) > (selectedWork.sellingPrice || selectedWork.suggestedPrice) ? '+' : ''}
                              {formatCurrency(Number(newSellingPrice) - (selectedWork.sellingPrice || selectedWork.suggestedPrice))}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">新利润</p>
                            <p className="text-lg font-bold text-green-600">
                              {formatCurrency(Number(newSellingPrice) - selectedWork.totalCost)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex space-x-3">
                      <button
                        onClick={handleUpdatePrice}
                        className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                      >
                        确认修改
                      </button>
                      <button
                        onClick={() => {
                          setShowPriceEdit(false);
                          setChangeReason('');
                          setNewSellingPrice((selectedWork.sellingPrice || selectedWork.suggestedPrice).toString());
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <h4 className="text-lg font-bold text-gray-800 mb-4">📜 定价历史记录</h4>
                {pricingHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📜</div>
                    <p className="text-gray-500">暂无定价历史记录</p>
                    <p className="text-gray-400 text-sm">修改定价后将在此处显示历史记录</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pricingHistory.map((record, index) => (
                      <div key={record.id} className="border-l-4 border-amber-400 pl-4 py-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <div className="flex items-center space-x-3">
                              <span className="text-sm text-gray-500">{formatDate(record.changedAt)}</span>
                              {record.changeReason && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                  {record.changeReason}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              {record.oldSellingPrice !== undefined && (
                                <>
                                  <span className="text-gray-400 line-through">
                                    {formatCurrency(record.oldSellingPrice)}
                                  </span>
                                  <span className="text-gray-300">→</span>
                                </>
                              )}
                              <span className="font-bold text-amber-600">
                                {formatCurrency(record.newSellingPrice)}
                              </span>
                              {record.oldSellingPrice !== undefined && (
                                <span className={`text-sm ${
                                  calculatePriceChange(record.oldSellingPrice, record.newSellingPrice) >= 0
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                }`}>
                                  ({calculatePriceChange(record.oldSellingPrice, record.newSellingPrice) >= 0 ? '+' : ''}
                                  {calculatePriceChange(record.oldSellingPrice, record.newSellingPrice)}%)
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            成本: {formatCurrency(record.newTotalCost)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl shadow">
              <div className="text-6xl mb-4">👈</div>
              <h4 className="text-lg font-medium text-gray-600 mb-2">请选择一件作品</h4>
              <p className="text-gray-400">从左侧列表中选择作品查看定价历史</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📊 所有作品定价概览</h3>
        {works.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">暂无作品数据</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">作品名称</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">分类</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">成本</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">售价</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">利润</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">利润率</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">价格趋势</th>
                </tr>
              </thead>
              <tbody>
                {works.map((work) => {
                  const price = work.sellingPrice || work.suggestedPrice;
                  const profit = price - work.totalCost;
                  const profitMargin = price > 0 ? Math.round(profit / price * 100) : 0;
                  const trend = getPriceTrend(work);
                  return (
                    <tr key={work.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-800 font-medium">{work.name}</td>
                      <td className="py-3 px-4 text-gray-600">{work.category}</td>
                      <td className="py-3 px-4 text-right text-gray-600">{formatCurrency(work.totalCost)}</td>
                      <td className="py-3 px-4 text-right text-amber-600 font-medium">{formatCurrency(price)}</td>
                      <td className="py-3 px-4 text-right text-green-600 font-medium">{formatCurrency(profit)}</td>
                      <td className="py-3 px-4 text-right text-green-600">{profitMargin}%</td>
                      <td className="py-3 px-4 text-center">
                        <span className={trend.color}>
                          {trend.icon} {trend.text}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
