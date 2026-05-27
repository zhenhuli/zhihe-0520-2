'use client';

import { CostDetailReport } from '@/types';
import { formatCurrency, formatHours } from '@/lib/calculator';

interface CostReportViewProps {
  report: CostDetailReport;
  onClose: () => void;
  onDelete?: () => void;
}

export default function CostReportView({ report, onClose, onDelete }: CostReportViewProps) {
  const totalMaterialQuantity = report.materialBreakdown.reduce((sum, m) => sum + m.actualQuantity, 0);
  const totalLaborHours = report.laborBreakdown.reduce((sum, l) => sum + l.hours, 0);

  const handleExport = () => {
    const csvContent = generateCSV();
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `成本报表_${report.craftWorkName}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const generateCSV = () => {
    let csv = `成本明细报表 - ${report.craftWorkName}\n`;
    csv += `生成时间,${new Date(report.generatedAt).toLocaleString()}\n\n`;

    csv += '材料成本明细\n';
    csv += '材料名称,计划用量,损耗率(%),实际用量,单价,成本\n';
    report.materialBreakdown.forEach(m => {
      csv += `${m.materialName},${m.quantity},${m.wastageRate}%,${m.actualQuantity},${m.unitPrice},${m.cost}\n`;
    });
    csv += `材料总成本,,,,"",${report.materialCost}\n\n`;

    csv += '人工成本明细\n';
    csv += '工序名称,工时(h),小时费率,成本\n';
    report.laborBreakdown.forEach(l => {
      csv += `${l.stepName},${l.hours},${l.hourlyRate},${l.cost}\n`;
    });
    csv += `人工总成本,${totalLaborHours},"",${report.laborCost}\n\n`;

    csv += '其他费用\n';
    csv += `其他成本,,,"",${report.otherCost}\n\n`;

    csv += '成本汇总\n';
    csv += `总成本,,,"",${report.totalCost}\n`;
    csv += `建议售价,,,"",${report.suggestedPrice}\n`;
    if (report.sellingPrice) {
      csv += `实际售价,,,"",${report.sellingPrice}\n`;
      csv += `利润,,,"",${report.profit || 0}\n`;
      csv += `利润率,,,"",${report.profitMargin || 0}%\n`;
    }

    return csv;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">成本明细报表</h2>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
          >
            导出CSV
          </button>
          {onDelete && (
            <button
              onClick={onDelete}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
            >
              删除
            </button>
          )}
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300"
          >
            关闭
          </button>
        </div>
      </div>

      <div className="border-b pb-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-700">{report.craftWorkName}</h3>
        <p className="text-sm text-gray-500">
          生成时间：{new Date(report.generatedAt).toLocaleString()}
        </p>
      </div>

      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3 flex items-center">
          <span className="w-1 h-4 bg-blue-500 rounded mr-2"></span>
          材料成本明细
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-3 py-2 text-left">材料名称</th>
                <th className="px-3 py-2 text-right">计划用量</th>
                <th className="px-3 py-2 text-right">损耗率</th>
                <th className="px-3 py-2 text-right">实际用量</th>
                <th className="px-3 py-2 text-right">单价</th>
                <th className="px-3 py-2 text-right">成本</th>
              </tr>
            </thead>
            <tbody>
              {report.materialBreakdown.map((item, idx) => (
                <tr key={idx} className="border-b">
                  <td className="px-3 py-2">{item.materialName}</td>
                  <td className="px-3 py-2 text-right">{item.quantity}</td>
                  <td className="px-3 py-2 text-right text-orange-600">{item.wastageRate}%</td>
                  <td className="px-3 py-2 text-right font-medium">{item.actualQuantity}</td>
                  <td className="px-3 py-2 text-right">¥{item.unitPrice.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right font-medium">¥{item.cost.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-blue-50 font-medium">
                <td className="px-3 py-2" colSpan={5}>材料成本小计</td>
                <td className="px-3 py-2 text-right text-blue-600">¥{report.materialCost.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3 flex items-center">
          <span className="w-1 h-4 bg-green-500 rounded mr-2"></span>
          人工成本明细
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-3 py-2 text-left">工序名称</th>
                <th className="px-3 py-2 text-right">工时</th>
                <th className="px-3 py-2 text-right">小时费率</th>
                <th className="px-3 py-2 text-right">成本</th>
              </tr>
            </thead>
            <tbody>
              {report.laborBreakdown.map((item, idx) => (
                <tr key={idx} className="border-b">
                  <td className="px-3 py-2">{item.stepName}</td>
                  <td className="px-3 py-2 text-right">{formatHours(item.hours)}</td>
                  <td className="px-3 py-2 text-right">¥{item.hourlyRate.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right font-medium">¥{item.cost.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-green-50 font-medium">
                <td className="px-3 py-2">人工成本小计</td>
                <td className="px-3 py-2 text-right">{formatHours(totalLaborHours)}</td>
                <td className="px-3 py-2"></td>
                <td className="px-3 py-2 text-right text-green-600">¥{report.laborCost.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3 flex items-center">
          <span className="w-1 h-4 bg-purple-500 rounded mr-2"></span>
          其他费用
        </h4>
        <div className="bg-purple-50 rounded p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">其他成本</span>
            <span className="font-medium text-purple-600">¥{report.otherCost.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 text-white rounded-lg p-6">
        <h4 className="font-medium mb-4">成本汇总</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-gray-400 text-sm">总成本</div>
            <div className="text-2xl font-bold">¥{report.totalCost.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">建议售价</div>
            <div className="text-2xl font-bold text-yellow-400">¥{report.suggestedPrice.toFixed(2)}</div>
          </div>
          {report.sellingPrice && (
            <>
              <div>
                <div className="text-gray-400 text-sm">实际售价</div>
                <div className="text-2xl font-bold text-green-400">¥{report.sellingPrice.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">利润 ({report.profitMargin}%)</div>
                <div className="text-2xl font-bold text-blue-400">¥{(report.profit || 0).toFixed(2)}</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
