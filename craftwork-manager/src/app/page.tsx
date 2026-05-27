'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getMaterials, getCraftWorks, getOrders, getCraftTemplates, getProcessSteps } from '@/lib/storage';
import { formatCurrency } from '@/lib/calculator';

export default function HomePage() {
  const [stats, setStats] = useState({
    materialCount: 0,
    workCount: 0,
    totalInventoryValue: 0,
    totalProfit: 0,
    orderCount: 0,
    templateCount: 0,
    processStepCount: 0,
  });

  useEffect(() => {
    const materials = getMaterials();
    const works = getCraftWorks();
    const orders = getOrders();
    const templates = getCraftTemplates();
    const processSteps = getProcessSteps();

    setStats({
      materialCount: materials.length,
      workCount: works.length,
      totalInventoryValue: materials.reduce((sum, m) => sum + m.unitPrice * m.stock, 0),
      totalProfit: works.reduce((sum, w) => sum + (w.profit || 0), 0),
      orderCount: orders.filter(o => o.status !== '已取消').length,
      templateCount: templates.length,
      processStepCount: processSteps.length,
    });
  }, []);

  const features = [
    {
      icon: '📊',
      title: '数据看板',
      description: '实时监控业务关键指标，一目了然掌握经营状况',
      link: '/dashboard',
      linkText: '查看看板',
    },
    {
      icon: '📋',
      title: '工艺模板',
      description: '创建可复用的工艺模板，快速创建相似作品',
      link: '/templates',
      linkText: '管理模板',
    },
    {
      icon: '🔢',
      title: '批量计算',
      description: '选择多个作品批量重新计算成本，高效更新数据',
      link: '/batch-calculator',
      linkText: '开始计算',
    },
    {
      icon: '📦',
      title: '耗材管理',
      description: '系统化管理您的所有手工材料，追踪库存变化',
      link: '/materials',
      linkText: '管理耗材',
    },
    {
      icon: '💰',
      title: '成本核算',
      description: '精准计算每件作品的材料、人工等各项成本',
      link: '/works',
      linkText: '创建作品',
    },
    {
      icon: '📈',
      title: '利润分析',
      description: '自动计算建议售价和利润率，帮您科学定价',
      link: '/works',
      linkText: '查看分析',
    },
    {
      icon: '🎨',
      title: '作品存档',
      description: '记录每件作品的工艺笔记，沉淀您的创作历程',
      link: '/works',
      linkText: '浏览作品',
    },
    {
      icon: '⚙️',
      title: '工艺步骤库',
      description: '建立标准化工序库，统一工时和成本标准',
      link: '/process-steps',
      linkText: '管理工序',
    },
  ];

  return (
    <div>
      <div className="bg-gradient-to-r from-amber-600 to-orange-500 rounded-2xl p-8 mb-8 text-white">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            欢迎来到匠心工坊 👋
          </h1>
          <p className="text-amber-100 text-lg mb-6">
            专为手工从业者打造的全链路工艺管理与成本核算系统。
            让您专注创作，我们帮您打理繁琐的数字记录。
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/materials"
              className="px-6 py-3 bg-white text-amber-700 rounded-lg font-medium hover:bg-amber-50 transition-colors"
            >
              开始录入耗材
            </Link>
            <Link
              href="/works"
              className="px-6 py-3 bg-amber-700/50 text-white rounded-lg font-medium hover:bg-amber-700/70 transition-colors border border-white/30"
            >
              创建第一个作品
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-md">
          <div className="text-3xl mb-2">📦</div>
          <div className="text-2xl font-bold text-amber-600">{stats.materialCount}</div>
          <div className="text-gray-500 text-sm">耗材种类</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-md">
          <div className="text-3xl mb-2">🎨</div>
          <div className="text-2xl font-bold text-amber-600">{stats.workCount}</div>
          <div className="text-gray-500 text-sm">作品数量</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-md">
          <div className="text-3xl mb-2">📋</div>
          <div className="text-2xl font-bold text-blue-600">{stats.templateCount}</div>
          <div className="text-gray-500 text-sm">工艺模板</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-md">
          <div className="text-3xl mb-2">⚙️</div>
          <div className="text-2xl font-bold text-purple-600">{stats.processStepCount}</div>
          <div className="text-gray-500 text-sm">工艺步骤</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-md">
          <div className="text-3xl mb-2">💎</div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalInventoryValue)}</div>
          <div className="text-gray-500 text-sm">库存价值</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-md">
          <div className="text-3xl mb-2">📈</div>
          <div className="text-2xl font-bold text-green-600">{stats.orderCount}</div>
          <div className="text-gray-500 text-sm">有效订单</div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-6">核心功能</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="text-5xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
            <p className="text-gray-600 mb-4">{feature.description}</p>
            <Link
              href={feature.link}
              className="text-amber-600 font-medium hover:text-amber-700 inline-flex items-center"
            >
              {feature.linkText}
              <span className="ml-1">→</span>
            </Link>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">💡 使用提示</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
          <div className="flex items-start space-x-3">
            <span className="text-amber-500">1.</span>
            <p>先在「耗材管理」中录入您常用的材料和工具</p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-amber-500">2.</span>
            <p>在「工艺步骤库」中建立标准化工序和工时标准</p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-amber-500">3.</span>
            <p>创建作品时，从耗材库选择材料并填写用量</p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-amber-500">4.</span>
            <p>常用作品可保存为「工艺模板」，快速复用</p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-amber-500">5.</span>
            <p>材料价格变动时，使用「批量计算」一键更新</p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-amber-500">6.</span>
            <p>通过「数据看板」实时监控经营状况</p>
          </div>
        </div>
      </div>
    </div>
  );
}
