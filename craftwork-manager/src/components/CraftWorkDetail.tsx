'use client';

import { CraftWork } from '@/types';
import { formatCurrency, formatHours } from '@/lib/calculator';

interface CraftWorkDetailProps {
  work: CraftWork;
  onClose: () => void;
  onEdit: () => void;
}

export default function CraftWorkDetail({ work, onClose, onEdit }: CraftWorkDetailProps) {
  const categoryEmojis: Record<string, string> = {
    '首饰': '💍',
    '绘画': '🎨',
    '皮具': '👜',
    '书法篆刻': '🖌️',
    '花艺': '💐',
    '陶艺': '🏺',
    '编织': '🧶',
    '其他': '✨',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative h-64 bg-gradient-to-br from-amber-100 to-orange-100">
          {work.imageUrl ? (
            <img
              src={work.imageUrl}
              alt={work.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-8xl">{categoryEmojis[work.category] || '✨'}</span>
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{work.name}</h2>
              <span className="inline-flex items-center px-3 py-1 mt-2 rounded-full text-sm font-medium bg-amber-100 text-amber-700">
                {work.category}
              </span>
            </div>
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              编辑作品
            </button>
          </div>

          {work.description && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">作品描述</h3>
              <p className="text-gray-600">{work.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <div className="text-blue-600 text-xs mb-1">材料成本</div>
              <div className="text-lg font-bold text-blue-700">{formatCurrency(work.materialCost || 0)}</div>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <div className="text-green-600 text-xs mb-1">人工成本</div>
              <div className="text-lg font-bold text-green-700">{formatCurrency(work.laborCost)}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-gray-500 text-xs mb-1">总成本</div>
              <div className="text-lg font-bold text-gray-800">{formatCurrency(work.totalCost)}</div>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 text-center">
              <div className="text-amber-600 text-xs mb-1">售价</div>
              <div className="text-lg font-bold text-amber-700">{formatCurrency(work.sellingPrice || work.suggestedPrice)}</div>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <div className="text-green-600 text-xs mb-1">利润率</div>
              <div className="text-lg font-bold text-green-700">{work.profitMargin || 0}%</div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-3">📦 材料清单 (含损耗率)</h3>
            <div className="bg-gray-50 rounded-xl overflow-hidden overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr className="text-gray-600">
                    <th className="px-3 py-2 text-left">材料名称</th>
                    <th className="px-3 py-2 text-right">单价</th>
                    <th className="px-3 py-2 text-right">计划用量</th>
                    <th className="px-3 py-2 text-right">损耗率</th>
                    <th className="px-3 py-2 text-right">实际用量</th>
                    <th className="px-3 py-2 text-right">成本</th>
                  </tr>
                </thead>
                <tbody>
                  {work.materials.map((m, index) => (
                    <tr key={m.materialId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-2">{m.materialName}</td>
                      <td className="px-3 py-2 text-right text-gray-600">{formatCurrency(Number(m.unitPrice))}</td>
                      <td className="px-3 py-2 text-right text-gray-600">{m.quantity}</td>
                      <td className="px-3 py-2 text-right text-orange-600">{m.wastageRate || 0}%</td>
                      <td className="px-3 py-2 text-right font-medium">{m.actualQuantity?.toFixed(2) || m.quantity}</td>
                      <td className="px-3 py-2 text-right font-medium">{formatCurrency(m.cost)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-amber-100">
                  <tr>
                    <td colSpan={5} className="px-3 py-2 font-semibold text-sm">材料成本小计</td>
                    <td className="px-3 py-2 text-right font-bold text-amber-700">
                      {formatCurrency(work.materialCost || 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {work.processSteps && work.processSteps.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-3">⚙️ 工艺步骤 (工时记录)</h3>
              <div className="bg-gray-50 rounded-xl overflow-hidden overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr className="text-gray-600">
                      <th className="px-3 py-2 text-left">工序名称</th>
                      <th className="px-3 py-2 text-right">预计工时</th>
                      <th className="px-3 py-2 text-right">实际工时</th>
                      <th className="px-3 py-2 text-right">小时费率</th>
                      <th className="px-3 py-2 text-right">成本</th>
                    </tr>
                  </thead>
                  <tbody>
                    {work.processSteps.map((s, index) => (
                      <tr key={s.stepId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-3 py-2">{s.stepName}</td>
                        <td className="px-3 py-2 text-right text-gray-600">{formatHours(s.estimatedHours)}</td>
                        <td className="px-3 py-2 text-right font-medium">{formatHours(s.actualHours || s.estimatedHours)}</td>
                        <td className="px-3 py-2 text-right text-gray-600">¥{s.hourlyRate.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right font-medium">{formatCurrency(s.cost)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-green-100">
                    <tr>
                      <td colSpan={4} className="px-3 py-2 font-semibold text-sm">人工成本小计</td>
                      <td className="px-3 py-2 text-right font-bold text-green-700">
                        {formatCurrency(work.laborCost)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-gray-500 text-sm mb-1">材料成本</div>
                <div className="text-lg font-semibold text-blue-700">{formatCurrency(work.materialCost || 0)}</div>
              </div>
              <div>
                <div className="text-gray-500 text-sm mb-1">人工成本</div>
                <div className="text-lg font-semibold text-green-700">{formatCurrency(work.laborCost)}</div>
              </div>
              <div>
                <div className="text-gray-500 text-sm mb-1">其他费用</div>
                <div className="text-lg font-semibold text-purple-700">{formatCurrency(work.otherCost)}</div>
              </div>
            </div>
          </div>

          {work.craftNotes && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">📝 工艺笔记</h3>
              <div className="bg-amber-50 rounded-xl p-4 text-gray-600 whitespace-pre-wrap">
                {work.craftNotes}
              </div>
            </div>
          )}

          <div className="text-sm text-gray-400">
            创建于 {new Date(work.createdAt).toLocaleDateString('zh-CN')}
          </div>
        </div>
      </div>
    </div>
  );
}
