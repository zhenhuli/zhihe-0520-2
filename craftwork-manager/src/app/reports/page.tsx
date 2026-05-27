'use client';

import { useState, useEffect } from 'react';
import { CostDetailReport, CraftWork } from '@/types';
import {
  getCostReports,
  addCostReport,
  deleteCostReport,
  getCraftWorks,
  getCraftWorkById,
} from '@/lib/storage';
import { generateCostReport } from '@/lib/calculator';
import CostReportView from '@/components/CostReportView';

export default function ReportsPage() {
  const [reports, setReports] = useState<CostDetailReport[]>([]);
  const [craftWorks, setCraftWorks] = useState<CraftWork[]>([]);
  const [selectedWork, setSelectedWork] = useState<string>('');
  const [viewingReport, setViewingReport] = useState<CostDetailReport | null>(null);

  useEffect(() => {
    setReports(getCostReports());
    setCraftWorks(getCraftWorks());
  }, []);

  const handleGenerateReport = () => {
    if (!selectedWork) {
      alert('请选择一个手工作品');
      return;
    }

    const craftWork = getCraftWorkById(selectedWork);
    if (!craftWork) return;

    const reportData = generateCostReport(craftWork);
    const newReport = addCostReport(reportData);
    setReports([newReport, ...reports]);
    setSelectedWork('');
  };

  const handleDeleteReport = (id: string) => {
    if (confirm('确定要删除这个报表吗？')) {
      deleteCostReport(id);
      setReports(reports.filter(r => r.id !== id));
      if (viewingReport?.id === id) {
        setViewingReport(null);
      }
    }
  };

  if (viewingReport) {
    return (
      <CostReportView
        report={viewingReport}
        onClose={() => setViewingReport(null)}
        onDelete={() => handleDeleteReport(viewingReport.id)}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">成本明细报表</h1>
          <p className="text-gray-500 mt-1">共 {reports.length} 份报表</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">生成新报表</h2>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              选择手工作品
            </label>
            <select
              value={selectedWork}
              onChange={(e) => setSelectedWork(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- 请选择 --</option>
              {craftWorks.map(work => (
                <option key={work.id} value={work.id}>
                  {work.name} (¥{work.totalCost.toFixed(2)})
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleGenerateReport}
            disabled={!selectedWork}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            生成报表
          </button>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-gray-400 text-lg mb-2">暂无报表记录</div>
          <p className="text-gray-500 text-sm">选择一个手工作品生成第一份成本报表</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map(report => (
            <div
              key={report.id}
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-gray-800 mb-2">{report.craftWorkName}</h3>
              <p className="text-xs text-gray-500 mb-3">
                生成时间：{new Date(report.generatedAt).toLocaleString()}
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                <div className="bg-blue-50 rounded p-2">
                  <div className="text-gray-500 text-xs">材料成本</div>
                  <div className="font-medium text-blue-600">¥{report.materialCost.toFixed(2)}</div>
                </div>
                <div className="bg-green-50 rounded p-2">
                  <div className="text-gray-500 text-xs">人工成本</div>
                  <div className="font-medium text-green-600">¥{report.laborCost.toFixed(2)}</div>
                </div>
              </div>
              <div className="bg-gray-800 rounded p-3 mb-4">
                <div className="text-gray-400 text-xs">总成本</div>
                <div className="text-xl font-bold text-white">¥{report.totalCost.toFixed(2)}</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewingReport(report)}
                  className="flex-1 bg-blue-100 text-blue-700 py-2 rounded text-sm hover:bg-blue-200 transition-colors"
                >
                  查看详情
                </button>
                <button
                  onClick={() => handleDeleteReport(report.id)}
                  className="bg-red-100 text-red-700 px-4 py-2 rounded text-sm hover:bg-red-200 transition-colors"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
