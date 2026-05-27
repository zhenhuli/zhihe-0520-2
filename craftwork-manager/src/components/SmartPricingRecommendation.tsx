'use client';

import { useState, useEffect } from 'react';
import {
  PricingRecommendation,
  PricingStrategy,
  RiskFactor,
  SimilarWork,
  CraftWork,
} from '@/types';
import {
  generatePricingRecommendation,
  formatCurrency,
  getDemandEmoji,
  getSeverityColor,
} from '@/lib/calculator';
import { getCraftWorks, getOrders } from '@/lib/storage';

interface SmartPricingRecommendationProps {
  work: CraftWork;
  onSelectStrategy?: (price: number) => void;
  showFullAnalysis?: boolean;
}

export default function SmartPricingRecommendation({
  work,
  onSelectStrategy,
  showFullAnalysis = true,
}: SmartPricingRecommendationProps) {
  const [recommendation, setRecommendation] = useState<PricingRecommendation | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<PricingStrategy | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'strategies' | 'analysis' | 'risks'>(
    'overview'
  );

  useEffect(() => {
    const allWorks = getCraftWorks();
    const orders = getOrders();
    const rec = generatePricingRecommendation(work, allWorks, orders);
    setRecommendation(rec);
    if (rec.strategies.length > 0) {
      setSelectedStrategy(rec.strategies[1]);
    }
  }, [work]);

  if (!recommendation) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  const handleSelectStrategy = (strategy: PricingStrategy) => {
    setSelectedStrategy(strategy);
    if (onSelectStrategy) {
      onSelectStrategy(strategy.suggestedPrice);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getCompetitivePositionText = (position: string) => {
    const map: Record<string, string> = {
      'below-average': '低于平均',
      average: '平均水平',
      'above-average': '高于平均',
      premium: '高端定位',
    };
    return map[position] || position;
  };

  const getDemandText = (demand: string) => {
    const map: Record<string, string> = {
      low: '低需求',
      medium: '中等需求',
      high: '高需求',
    };
    return map[demand] || demand;
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
          <div className="text-xs text-blue-600 mb-1">保本价格</div>
          <div className="text-lg font-bold text-blue-700">
            {formatCurrency(recommendation.priceRange.min)}
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center">
          <div className="text-xs text-green-600 mb-1">推荐价格</div>
          <div className="text-lg font-bold text-green-700">
            {formatCurrency(recommendation.priceRange.optimal)}
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center">
          <div className="text-xs text-purple-600 mb-1">溢价上限</div>
          <div className="text-lg font-bold text-purple-700">
            {formatCurrency(recommendation.priceRange.max)}
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 text-center">
          <div className="text-xs text-amber-600 mb-1">置信度</div>
          <div
            className={`text-lg font-bold inline-block px-3 py-1 rounded-full ${getConfidenceColor(
              recommendation.confidenceScore
            )}`}
          >
            {recommendation.confidenceScore}%
          </div>
        </div>
      </div>

      <div className="relative pt-6">
        <div className="h-4 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-full overflow-hidden">
          <div
            className="absolute top-0 w-6 h-6 -mt-1 bg-white border-4 border-amber-500 rounded-full shadow-lg transform -translate-x-1/2"
            style={{
              left: `${Math.min(
                100,
                Math.max(
                  0,
                  ((recommendation.currentPrice - recommendation.priceRange.min) /
                    (recommendation.priceRange.max - recommendation.priceRange.min)) *
                    100
                )
              )}%`,
            }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>保本 {formatCurrency(recommendation.priceRange.min)}</span>
          <span className="font-medium text-amber-600">
            当前 {formatCurrency(recommendation.currentPrice)}
          </span>
          <span>最高 {formatCurrency(recommendation.priceRange.max)}</span>
        </div>
      </div>

      {selectedStrategy && (
        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-semibold text-amber-800">
              📌 当前选择：{selectedStrategy.name}
            </h5>
            <span className="text-2xl font-bold text-amber-700">
              {formatCurrency(selectedStrategy.suggestedPrice)}
            </span>
          </div>
          <p className="text-sm text-amber-700 mb-3">{selectedStrategy.description}</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">利润率：</span>
              <span className="font-semibold text-green-600">
                {selectedStrategy.profitMargin}%
              </span>
            </div>
            <div>
              <span className="text-gray-600">预期需求：</span>
              <span className="font-semibold">
                {getDemandEmoji(selectedStrategy.expectedDemand)}{' '}
                {getDemandText(selectedStrategy.expectedDemand)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderStrategiesTab = () => (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">
        选择一个定价策略，系统将自动应用推荐价格
      </p>
      {recommendation.strategies.map((strategy, index) => (
        <div
          key={strategy.type}
          onClick={() => handleSelectStrategy(strategy)}
          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
            selectedStrategy?.type === strategy.type
              ? 'border-amber-500 bg-amber-50'
              : 'border-gray-200 bg-white hover:border-amber-300'
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h5 className="font-semibold text-gray-800 flex items-center gap-2">
                {strategy.type === 'economy' && '💰'}
                {strategy.type === 'standard' && '⚖️'}
                {strategy.type === 'premium' && '👑'}
                {strategy.type === 'competitive' && '🏃'}
                {strategy.type === 'value-based' && '💎'}
                {strategy.name}
              </h5>
              <p className="text-sm text-gray-600 mt-1">{strategy.description}</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-amber-600">
                {formatCurrency(strategy.suggestedPrice)}
              </div>
              <div className="text-sm text-green-600 font-medium">
                {strategy.profitMargin}% 利润
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500 mb-1">优势</div>
              <ul className="space-y-1">
                {strategy.pros.map((pro, i) => (
                  <li key={i} className="text-green-600 flex items-center gap-1">
                    <span>✓</span> {pro}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-gray-500 mb-1">注意</div>
              <ul className="space-y-1">
                {strategy.cons.map((con, i) => (
                  <li key={i} className="text-orange-600 flex items-center gap-1">
                    <span>⚠</span> {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAnalysisTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4">
        <h5 className="font-semibold text-gray-800 mb-4">📊 分类市场统计</h5>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-xs text-gray-500">作品数量</div>
            <div className="text-lg font-bold text-gray-800">
              {recommendation.marketAnalysis.categoryStats.workCount} 件
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">平均价格</div>
            <div className="text-lg font-bold text-amber-600">
              {formatCurrency(recommendation.marketAnalysis.categoryStats.avgPrice)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">平均成本</div>
            <div className="text-lg font-bold text-gray-600">
              {formatCurrency(recommendation.marketAnalysis.categoryStats.avgCost)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">平均利润率</div>
            <div className="text-lg font-bold text-green-600">
              {recommendation.marketAnalysis.categoryStats.avgProfitMargin}%
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 mb-2">价格区间分布</div>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-3 bg-gradient-to-r from-green-300 via-yellow-300 to-red-300 rounded-full relative">
              <span className="absolute -bottom-5 left-0 text-xs text-gray-500">
                低 {formatCurrency(recommendation.marketAnalysis.categoryStats.priceRange.low)}
              </span>
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-gray-500">
                中 {formatCurrency(recommendation.marketAnalysis.categoryStats.priceRange.medium)}
              </span>
              <span className="absolute -bottom-5 right-0 text-xs text-gray-500">
                高 {formatCurrency(recommendation.marketAnalysis.categoryStats.priceRange.high)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-xs text-blue-600 mb-1">竞争定位</div>
          <div className="text-lg font-bold text-blue-800">
            {getCompetitivePositionText(recommendation.marketAnalysis.competitivePosition)}
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-xs text-purple-600 mb-1">市场需求</div>
          <div className="text-lg font-bold text-purple-800">
            {getDemandEmoji(recommendation.marketAnalysis.demandIndicator)}{' '}
            {getDemandText(recommendation.marketAnalysis.demandIndicator)}
          </div>
        </div>
      </div>

      {recommendation.marketAnalysis.similarWorks.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="font-semibold text-gray-800 mb-3">🔍 相似作品参考</h5>
          <div className="space-y-2">
            {recommendation.marketAnalysis.similarWorks.map((sw: SimilarWork) => (
              <div
                key={sw.id}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100"
              >
                <div>
                  <div className="font-medium text-gray-800">{sw.name}</div>
                  <div className="text-xs text-gray-500">
                    相似度 {sw.similarityScore}% · 成本 {formatCurrency(sw.cost)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-amber-600">{formatCurrency(sw.price)}</div>
                  <div className="text-xs text-green-600">{sw.profitMargin}% 利润</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderRisksTab = () => (
    <div className="space-y-4">
      {recommendation.riskFactors.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">✅</div>
          <p className="text-gray-600">暂无明显风险因素</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-600 mb-4">
            以下是系统识别出的潜在风险因素，请在定价时予以考虑
          </p>
          {recommendation.riskFactors.map((risk: RiskFactor) => (
            <div
              key={risk.name}
              className="p-4 rounded-lg border border-gray-200 bg-white"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityColor(
                      risk.severity
                    )}`}
                  >
                    {risk.severity === 'low' && '低风险'}
                    {risk.severity === 'medium' && '中风险'}
                    {risk.severity === 'high' && '高风险'}
                  </span>
                  <span className="font-semibold text-gray-800">{risk.name}</span>
                </div>
                <div className="text-sm text-gray-500">
                  影响度 <span className="font-medium">{risk.impact}%</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">{risk.description}</p>
            </div>
          ))}
        </>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🧠</span>
            <div>
              <h3 className="text-xl font-bold text-white">智能定价推荐</h3>
              <p className="text-amber-100 text-sm">基于数据分析的定价决策支持</p>
            </div>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(
              recommendation.confidenceScore
            )}`}
          >
            置信度 {recommendation.confidenceScore}%
          </div>
        </div>
      </div>

      {showFullAnalysis && (
        <div className="border-b border-gray-200">
          <div className="flex">
            {[
              { key: 'overview', label: '概览', icon: '📊' },
              { key: 'strategies', label: '策略', icon: '🎯' },
              { key: 'analysis', label: '分析', icon: '📈' },
              { key: 'risks', label: '风险', icon: '⚠️' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50'
                    : 'text-gray-600 hover:text-amber-600 hover:bg-amber-50'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-6">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'strategies' && renderStrategiesTab()}
        {activeTab === 'analysis' && renderAnalysisTab()}
        {activeTab === 'risks' && renderRisksTab()}
      </div>

      {onSelectStrategy && selectedStrategy && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={() => onSelectStrategy(selectedStrategy.suggestedPrice)}
            className="w-full py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors"
          >
            应用「{selectedStrategy.name}」策略 - {formatCurrency(selectedStrategy.suggestedPrice)}
          </button>
        </div>
      )}
    </div>
  );
}
