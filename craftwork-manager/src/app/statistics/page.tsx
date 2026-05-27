'use client';

import { useState, useEffect } from 'react';
import { Order, CraftWork, MonthlyStat } from '@/types';
import { getOrders, getCraftWorks, getMonthlyStats, addMonthlyStat, getMonthlyStatByMonth } from '@/lib/storage';
import { formatCurrency, generateMonthlyStat, getMonthKey, formatDate } from '@/lib/calculator';

export default function StatisticsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [works, setWorks] = useState<CraftWork[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStat[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [currentMonthStat, setCurrentMonthStat] = useState<MonthlyStat | null>(null);

  useEffect(() => {
    const currentOrders = getOrders();
    const currentWorks = getCraftWorks();
    const currentStats = getMonthlyStats();

    setOrders(currentOrders);
    setWorks(currentWorks);
    setMonthlyStats(currentStats.sort((a, b) => b.month.localeCompare(a.month)));

    const now = new Date();
    const defaultMonth = getMonthKey(now);
    setSelectedMonth(defaultMonth);

    const stat = generateMonthlyStat(currentOrders, currentWorks, defaultMonth);
    const existingStat = getMonthlyStatByMonth(defaultMonth);
    if (existingStat) {
      setCurrentMonthStat(existingStat);
    } else {
      setCurrentMonthStat({ ...stat, id: '', createdAt: '' });
    }
  }, []);

  useEffect(() => {
    if (selectedMonth) {
      const stat = generateMonthlyStat(orders, works, selectedMonth);
      const existingStat = getMonthlyStatByMonth(selectedMonth);
      if (existingStat) {
        setCurrentMonthStat(existingStat);
      } else {
        setCurrentMonthStat({ ...stat, id: '', createdAt: '' });
      }
    }
  }, [selectedMonth, orders, works]);

  const handleSaveMonthStat = () => {
    if (!currentMonthStat) return;
    const stat = generateMonthlyStat(orders, works, selectedMonth);
    const saved = addMonthlyStat(stat);
    setCurrentMonthStat(saved);
    setMonthlyStats(getMonthlyStats().sort((a, b) => b.month.localeCompare(a.month)));
    alert('月度统计已保存！');
  };

  const availableMonths = (() => {
    const months = new Set<string>();
    const now = new Date();
    for (let i = 0; i < 24; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.add(getMonthKey(date));
    }
    return Array.from(months).sort().reverse();
  })();

  const completedOrders = orders.filter(o => o.status !== '已取消');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.finalAmount, 0);
  const totalCost = works.reduce((sum, w) => sum + w.totalCost, 0);
  const totalProfit = totalRevenue - totalCost;
  const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

  const getMonthLabel = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    return `${year}年${parseInt(month)}月`;
  };

  const maxRevenue = Math.max(...monthlyStats.map(s => s.totalRevenue), 1);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-amber-800">月度收益统计</h2>
        <p className="text-gray-600 mt-1">追踪您的创作收益，洞察经营状况</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-5 text-white shadow-lg">
          <div className="text-3xl mb-2">💰</div>
          <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          <div className="text-amber-100 text-sm">累计营收</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-5 text-white shadow-lg">
          <div className="text-3xl mb-2">📈</div>
          <div className="text-2xl font-bold">{formatCurrency(totalProfit)}</div>
          <div className="text-green-100 text-sm">累计利润</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl p-5 text-white shadow-lg">
          <div className="text-3xl mb-2">📋</div>
          <div className="text-2xl font-bold">{completedOrders.length}</div>
          <div className="text-blue-100 text-sm">有效订单</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-5 text-white shadow-lg">
          <div className="text-3xl mb-2">🎨</div>
          <div className="text-2xl font-bold">{works.length}</div>
          <div className="text-purple-100 text-sm">作品总数</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h3 className="text-lg font-bold text-gray-800">月度数据详情</h3>
            <div className="flex items-center space-x-3">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                {availableMonths.map((month) => (
                  <option key={month} value={month}>{getMonthLabel(month)}</option>
                ))}
              </select>
              <button
                onClick={handleSaveMonthStat}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                💾 保存统计
              </button>
            </div>
          </div>

          {currentMonthStat && (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-amber-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">营收</p>
                  <p className="text-xl font-bold text-amber-600">{formatCurrency(currentMonthStat.totalRevenue)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">成本</p>
                  <p className="text-xl font-bold text-gray-600">{formatCurrency(currentMonthStat.totalCost)}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">利润</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(currentMonthStat.totalProfit)}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">利润率</p>
                  <p className="text-xl font-bold text-blue-600">{currentMonthStat.avgProfitMargin}%</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">订单数</span>
                    <span className="text-xl font-bold text-gray-800">{currentMonthStat.orderCount}</span>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">新作品</span>
                    <span className="text-xl font-bold text-gray-800">{currentMonthStat.workCount}</span>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">客单价</span>
                    <span className="text-xl font-bold text-amber-600">
                      {currentMonthStat.orderCount > 0
                        ? formatCurrency(currentMonthStat.totalRevenue / currentMonthStat.orderCount)
                        : formatCurrency(0)}
                    </span>
                  </div>
                </div>
              </div>

              {currentMonthStat.topSellingWorks.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">🏆 畅销作品 TOP 5</h4>
                  <div className="space-y-3">
                    {currentMonthStat.topSellingWorks.map((item, index) => (
                      <div key={item.craftWorkId} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0 ? 'bg-yellow-500' :
                          index === 1 ? 'bg-gray-400' :
                          index === 2 ? 'bg-amber-600' : 'bg-gray-300'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{item.craftWorkName}</p>
                          <p className="text-sm text-gray-500">销售 {item.quantity} 件</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-amber-600">{formatCurrency(item.revenue)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📊 历史月度趋势</h3>
          {monthlyStats.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-gray-500">暂无历史统计</p>
              <p className="text-gray-400 text-sm">点击"保存统计"按钮记录月度数据</p>
            </div>
          ) : (
            <div className="space-y-4">
              {monthlyStats.slice(0, 12).map((stat) => (
                <div key={stat.id} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-800">{getMonthLabel(stat.month)}</span>
                    <span className="text-sm text-gray-500">{formatDate(stat.createdAt)}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all"
                          style={{ width: `${(stat.totalRevenue / maxRevenue) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="font-bold text-amber-600 min-w-[80px] text-right">
                      {formatCurrency(stat.totalRevenue)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-sm">
                    <span className="text-gray-500">利润: <span className="text-green-600 font-medium">{formatCurrency(stat.totalProfit)}</span></span>
                    <span className="text-gray-500">{stat.orderCount} 单</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📈 经营分析</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-3">订单状态分布</h4>
            <div className="space-y-3">
              {['待付款', '已付款', '制作中', '已完成', '已发货', '已取消'].map((status) => {
                const count = orders.filter(o => o.status === status).length;
                const percentage = orders.length > 0 ? Math.round(count / orders.length * 100) : 0;
                const colors: Record<string, string> = {
                  '待付款': 'bg-yellow-500',
                  '已付款': 'bg-green-500',
                  '制作中': 'bg-blue-500',
                  '已完成': 'bg-purple-500',
                  '已发货': 'bg-indigo-500',
                  '已取消': 'bg-gray-400',
                };
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">{status}</span>
                      <span className="text-sm font-medium text-gray-800">{count} ({percentage}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors[status]} rounded-full`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-3">作品分类分布</h4>
            <div className="space-y-3">
              {(() => {
                const categories = [...new Set(works.map(w => w.category))];
                return categories.map((category) => {
                  const count = works.filter(w => w.category === category).length;
                  const percentage = works.length > 0 ? Math.round(count / works.length * 100) : 0;
                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">{category}</span>
                        <span className="text-sm font-medium text-gray-800">{count} ({percentage}%)</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <h4 className="font-medium text-gray-700 mb-3">💡 经营建议</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {totalRevenue > 0 && (
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="font-medium text-green-800 mb-1">营收状况</p>
                <p className="text-sm text-green-700">
                  累计营收 {formatCurrency(totalRevenue)}，利润 {formatCurrency(totalProfit)}，
                  利润率 {totalRevenue > 0 ? Math.round(totalProfit / totalRevenue * 100) : 0}%
                </p>
              </div>
            )}
            {avgOrderValue > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-800 mb-1">客单价</p>
                <p className="text-sm text-blue-700">
                  平均每单金额 {formatCurrency(avgOrderValue)}，
                  共完成 {completedOrders.length} 笔有效订单
                </p>
              </div>
            )}
            {monthlyStats.length >= 2 && (
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="font-medium text-purple-800 mb-1">趋势分析</p>
                <p className="text-sm text-purple-700">
                  已记录 {monthlyStats.length} 个月的统计数据，
                  继续保持每月统计以获得更准确的趋势分析
                </p>
              </div>
            )}
            <div className="p-4 bg-amber-50 rounded-lg">
              <p className="font-medium text-amber-800 mb-1">作品库</p>
              <p className="text-sm text-amber-700">
                当前共有 {works.length} 件作品，
                分布在 {[...new Set(works.map(w => w.category))].length} 个分类中
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
