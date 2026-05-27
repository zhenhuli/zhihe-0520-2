'use client';

import { useState, useEffect } from 'react';
import { CraftWork, Order, Material, ProcessStep, MonthlyStat, Customer, CraftTemplate } from '@/types';
import {
  getCraftWorks,
  getOrders,
  getMaterials,
  getProcessSteps,
  getMonthlyStats,
  getCustomers,
  getCraftTemplates,
} from '@/lib/storage';
import { formatCurrency, formatDate, getMonthKey } from '@/lib/calculator';

export default function DashboardPage() {
  const [works, setWorks] = useState<CraftWork[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStat[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [templates, setTemplates] = useState<CraftTemplate[]>([]);
  const [timeRange, setTimeRange] = useState<'all' | 'month' | 'quarter' | 'year'>('all');

  useEffect(() => {
    setWorks(getCraftWorks());
    setOrders(getOrders());
    setMaterials(getMaterials());
    setProcessSteps(getProcessSteps());
    setMonthlyStats(getMonthlyStats().sort((a, b) => b.month.localeCompare(a.month)));
    setCustomers(getCustomers());
    setTemplates(getCraftTemplates());
  }, []);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const filterByDate = (dateStr: string) => {
    const date = new Date(dateStr);
    switch (timeRange) {
      case 'month':
        return date >= monthStart;
      case 'quarter':
        return date >= quarterStart;
      case 'year':
        return date >= yearStart;
      default:
        return true;
    }
  };

  const filteredOrders = orders.filter(o => filterByDate(o.createdAt));
  const filteredWorks = works.filter(w => filterByDate(w.createdAt));

  const totalRevenue = filteredOrders
    .filter(o => o.status !== '已取消')
    .reduce((sum, o) => sum + o.finalAmount, 0);
  const totalCost = filteredWorks.reduce((sum, w) => sum + w.totalCost, 0);
  const totalProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;

  const pendingOrders = orders.filter(o => ['待付款', '已付款', '制作中'].includes(o.status)).length;
  const completedOrders = orders.filter(o => o.status === '已完成').length;
  const avgOrderValue = filteredOrders.filter(o => o.status !== '已取消').length > 0
    ? totalRevenue / filteredOrders.filter(o => o.status !== '已取消').length
    : 0;

  const lowStockMaterials = materials.filter(m => m.stock < 10);
  const totalMaterialValue = materials.reduce((sum, m) => sum + m.unitPrice * m.stock, 0);

  const categoryStats = works.reduce((acc, work) => {
    if (!acc[work.category]) {
      acc[work.category] = { count: 0, totalCost: 0, totalPrice: 0 };
    }
    acc[work.category].count++;
    acc[work.category].totalCost += work.totalCost;
    acc[work.category].totalPrice += work.sellingPrice || work.suggestedPrice;
    return acc;
  }, {} as Record<string, { count: number; totalCost: number; totalPrice: number }>);

  const maxCategoryCount = Math.max(...Object.values(categoryStats).map(s => s.count), 1);

  const topSellingWorks = [...works]
    .sort((a, b) => (b.sellingPrice || b.suggestedPrice) - (a.sellingPrice || a.suggestedPrice))
    .slice(0, 5);

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const totalTemplateUsage = templates.reduce((sum, t) => sum + t.usageCount, 0);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-amber-800">数据看板</h2>
          <p className="text-gray-600 mt-1">实时监控您的手作业务关键指标</p>
        </div>
        <div className="flex gap-2">
          {(['all', 'month', 'quarter', 'year'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                timeRange === range
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-amber-50'
              }`}
            >
              {range === 'all' ? '全部' : range === 'month' ? '本月' : range === 'quarter' ? '本季度' : '本年度'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-amber-100 text-sm mb-1">总营收</div>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            </div>
            <div className="text-4xl opacity-80">💰</div>
          </div>
          <div className="text-amber-100 text-xs mt-2">
            {filteredOrders.filter(o => o.status !== '已取消').length} 笔订单
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-green-100 text-sm mb-1">总利润</div>
              <div className="text-2xl font-bold">{formatCurrency(totalProfit)}</div>
            </div>
            <div className="text-4xl opacity-80">📈</div>
          </div>
          <div className="text-green-100 text-xs mt-2">
            利润率 {profitMargin}%
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-blue-100 text-sm mb-1">作品数</div>
              <div className="text-2xl font-bold">{works.length}</div>
            </div>
            <div className="text-4xl opacity-80">🎨</div>
          </div>
          <div className="text-blue-100 text-xs mt-2">
            {filteredWorks.length} 件新作
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-purple-100 text-sm mb-1">待处理订单</div>
              <div className="text-2xl font-bold">{pendingOrders}</div>
            </div>
            <div className="text-4xl opacity-80">📋</div>
          </div>
          <div className="text-purple-100 text-xs mt-2">
            已完成 {completedOrders} 单
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📊 作品分类分布</h3>
          <div className="space-y-4">
            {Object.entries(categoryStats).map(([category, stats]) => (
              <div key={category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{category}</span>
                  <span className="text-sm text-gray-500">
                    {stats.count} 件 · 平均 {formatCurrency(stats.totalPrice / stats.count)}
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all"
                    style={{ width: `${(stats.count / maxCategoryCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {Object.keys(categoryStats).length === 0 && (
              <p className="text-gray-500 text-center py-4">暂无分类数据</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📦 库存概览</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">耗材种类</span>
              <span className="text-xl font-bold text-gray-800">{materials.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">库存总价值</span>
              <span className="text-xl font-bold text-amber-600">{formatCurrency(totalMaterialValue)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">低库存预警</span>
              <span className={`text-xl font-bold ${lowStockMaterials.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {lowStockMaterials.length}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">工艺步骤</span>
              <span className="text-xl font-bold text-blue-600">{processSteps.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">⭐ 高价值作品 TOP 5</h3>
          <div className="space-y-3">
            {topSellingWorks.map((work, index) => (
              <div key={work.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                  index === 0 ? 'bg-yellow-500' :
                  index === 1 ? 'bg-gray-400' :
                  index === 2 ? 'bg-amber-600' : 'bg-gray-300'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{work.name}</p>
                  <p className="text-xs text-gray-500">{work.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-amber-600">{formatCurrency(work.sellingPrice || work.suggestedPrice)}</p>
                </div>
              </div>
            ))}
            {topSellingWorks.length === 0 && (
              <p className="text-gray-500 text-center py-4">暂无作品数据</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📝 最近订单</h3>
          <div className="space-y-3">
            {recentOrders.map(order => (
              <div key={order.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-800 text-sm">{order.orderNo}</span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    order.status === '已完成' ? 'bg-green-100 text-green-700' :
                    order.status === '已取消' ? 'bg-gray-100 text-gray-700' :
                    order.status === '制作中' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{order.customerName}</span>
                  <span>{formatCurrency(order.finalAmount)}</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {formatDate(order.createdAt)}
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && (
              <p className="text-gray-500 text-center py-4">暂无订单数据</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📋 模板使用统计</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
              <span className="text-amber-700">模板总数</span>
              <span className="text-xl font-bold text-amber-600">{templates.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-green-700">累计使用</span>
              <span className="text-xl font-bold text-green-600">{totalTemplateUsage}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-blue-700">客户数</span>
              <span className="text-xl font-bold text-blue-600">{customers.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-purple-700">客单价</span>
              <span className="text-xl font-bold text-purple-600">{formatCurrency(avgOrderValue)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📈 月度趋势</h3>
        {monthlyStats.length === 0 ? (
          <p className="text-gray-500 text-center py-8">暂无月度统计数据，请到收益统计页面保存月度数据</p>
        ) : (
          <div className="space-y-4">
            {monthlyStats.slice(0, 6).map(stat => {
              const maxRevenue = Math.max(...monthlyStats.map(s => s.totalRevenue), 1);
              return (
                <div key={stat.id} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-800">
                      {stat.month.replace('-', '年')}月
                    </span>
                    <span className="text-sm text-gray-500">
                      {stat.orderCount} 单 · {stat.workCount} 作品
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                          style={{ width: `${(stat.totalRevenue / maxRevenue) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="font-bold text-amber-600 min-w-[100px] text-right">
                      {formatCurrency(stat.totalRevenue)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-sm">
                    <span className="text-gray-500">
                      成本: <span className="text-gray-700">{formatCurrency(stat.totalCost)}</span>
                    </span>
                    <span className="text-gray-500">
                      利润: <span className="text-green-600 font-medium">{formatCurrency(stat.totalProfit)}</span>
                    </span>
                    <span className="text-gray-500">
                      利润率: <span className="text-blue-600 font-medium">{stat.avgProfitMargin}%</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {lowStockMaterials.length > 0 && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-red-800 mb-4">⚠️ 低库存预警</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {lowStockMaterials.map(material => (
              <div key={material.id} className="bg-white rounded-lg p-3 border border-red-100">
                <div className="font-medium text-gray-800">{material.name}</div>
                <div className="text-sm text-gray-500">{material.category}</div>
                <div className="text-red-600 font-bold mt-1">库存: {material.stock} {material.unit}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
