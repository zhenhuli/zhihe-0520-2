import {
  MaterialUsage,
  WorkProcessStep,
  CraftWork,
  CostDetailReport,
  Order,
  MonthlyStat,
  CategoryPricingStats,
  PricingRecommendation,
  PricingStrategy,
  MarketAnalysis,
  SimilarWork,
  RiskFactor,
  PriceOptimizationResult,
} from '@/types';

export function calculateActualQuantity(quantity: number, wastageRate: number): number {
  return Number((quantity * (1 + wastageRate / 100)).toFixed(4));
}

export function calculateSingleMaterialCost(
  unitPrice: number,
  quantity: number,
  wastageRate: number = 0
): number {
  const actualQuantity = calculateActualQuantity(quantity, wastageRate);
  return Number((unitPrice * actualQuantity).toFixed(2));
}

export function calculateMaterialCost(materials: MaterialUsage[] | undefined): number {
  if (!materials || materials.length === 0) return 0;
  return materials.reduce((sum, m) => sum + (m.cost || 0), 0);
}

export function calculateLaborCostFromSteps(steps: WorkProcessStep[] | undefined): number {
  if (!steps || steps.length === 0) return 0;
  return steps.reduce((sum, s) => sum + (s.cost || 0), 0);
}

export function calculateStepCost(hours: number, hourlyRate: number): number {
  return Number((hours * hourlyRate).toFixed(2));
}

export function calculateTotalCost(
  materialCost: number,
  laborCost: number,
  otherCost: number
): number {
  return Number((materialCost + laborCost + otherCost).toFixed(2));
}

export function calculateSuggestedPrice(
  totalCost: number,
  profitMargin: number = 2.5
): number {
  return Math.ceil(totalCost * profitMargin);
}

export function calculateProfit(sellingPrice: number, totalCost: number): number {
  return Number((sellingPrice - totalCost).toFixed(2));
}

export function calculateProfitMarginPercentage(
  profit: number,
  sellingPrice: number
): number {
  if (sellingPrice === 0) return 0;
  return Math.round((profit / sellingPrice) * 100);
}

export function formatCurrency(amount: number): string {
  return `¥${amount.toFixed(2)}`;
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours > 0) {
    return `${hours}小时${mins > 0 ? mins + '分钟' : ''}`;
  }
  return `${mins}分钟`;
}

export function formatHours(decimalHours: number): string {
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  }
  return `${minutes}m`;
}

export function generateCostReport(
  craftWork: CraftWork,
  periodStart?: string,
  periodEnd?: string
): Omit<CostDetailReport, 'id'> {
  const materialBreakdown = craftWork.materials.map(m => ({
    materialName: m.materialName,
    quantity: m.quantity,
    wastageRate: m.wastageRate,
    actualQuantity: m.actualQuantity,
    unitPrice: Number(m.unitPrice),
    cost: m.cost,
  }));

  const laborBreakdown = craftWork.processSteps.map(s => ({
    stepName: s.stepName,
    hours: s.actualHours || s.estimatedHours,
    hourlyRate: s.hourlyRate,
    cost: s.cost,
  }));

  return {
    craftWorkId: craftWork.id,
    craftWorkName: craftWork.name,
    generatedAt: new Date().toISOString(),
    periodStart,
    periodEnd,
    materialCost: craftWork.materialCost,
    materialBreakdown,
    laborCost: craftWork.laborCost,
    laborBreakdown,
    otherCost: craftWork.otherCost,
    totalCost: craftWork.totalCost,
    suggestedPrice: craftWork.suggestedPrice,
    sellingPrice: craftWork.sellingPrice,
    profit: craftWork.profit,
    profitMargin: craftWork.profitMargin,
  };
}

export function calculateOrderTotal(items: { quantity: number; unitPrice: number }[]): number {
  return Number(items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0).toFixed(2));
}

export function calculateFinalAmount(totalAmount: number, discount?: number): number {
  if (!discount) return totalAmount;
  return Number((totalAmount - discount).toFixed(2));
}

export function getMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
}

export function generateMonthlyStat(orders: Order[], works: CraftWork[], monthKey: string): Omit<MonthlyStat, 'id' | 'createdAt'> {
  const monthOrders = orders.filter(order => getMonthKey(new Date(order.createdAt)) === monthKey);
  const monthWorks = works.filter(work => getMonthKey(new Date(work.createdAt)) === monthKey);

  const totalRevenue = monthOrders.reduce((sum, order) => sum + order.finalAmount, 0);
  const totalCost = monthWorks.reduce((sum, work) => sum + work.totalCost, 0);
  const totalProfit = Number((totalRevenue - totalCost).toFixed(2));

  const workSales: Record<string, { craftWorkId: string; craftWorkName: string; quantity: number; revenue: number }> = {};
  monthOrders.forEach(order => {
    order.items.forEach(item => {
      if (!workSales[item.craftWorkId]) {
        workSales[item.craftWorkId] = {
          craftWorkId: item.craftWorkId,
          craftWorkName: item.craftWorkName,
          quantity: 0,
          revenue: 0,
        };
      }
      workSales[item.craftWorkId].quantity += item.quantity;
      workSales[item.craftWorkId].revenue += item.subtotal;
    });
  });

  const topSellingWorks = Object.values(workSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const avgProfitMargin = totalRevenue > 0
    ? Math.round((totalProfit / totalRevenue) * 100)
    : 0;

  return {
    month: monthKey,
    totalRevenue,
    totalCost,
    totalProfit,
    orderCount: monthOrders.length,
    workCount: monthWorks.length,
    avgProfitMargin,
    topSellingWorks,
  };
}

export function calculatePriceChange(oldPrice: number | undefined, newPrice: number): number {
  if (!oldPrice) return 0;
  return Number(((newPrice - oldPrice) / oldPrice * 100).toFixed(1));
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function calculateCategoryPricingStats(
  works: CraftWork[],
  category: string
): CategoryPricingStats {
  const categoryWorks = works.filter(
    (w) => w.category === category && w.totalCost > 0
  );

  if (categoryWorks.length === 0) {
    return {
      category,
      workCount: 0,
      avgPrice: 0,
      minPrice: 0,
      maxPrice: 0,
      avgCost: 0,
      avgProfitMargin: 0,
      priceRange: { low: 0, medium: 0, high: 0 },
    };
  }

  const prices = categoryWorks.map((w) => w.sellingPrice || w.suggestedPrice);
  const costs = categoryWorks.map((w) => w.totalCost);
  const margins = categoryWorks.map((w) => {
    const price = w.sellingPrice || w.suggestedPrice;
    return price > 0 ? ((price - w.totalCost) / price) * 100 : 0;
  });

  const sortedPrices = [...prices].sort((a, b) => a - b);
  const low = sortedPrices[Math.floor(sortedPrices.length * 0.25)];
  const medium = sortedPrices[Math.floor(sortedPrices.length * 0.5)];
  const high = sortedPrices[Math.floor(sortedPrices.length * 0.75)];

  return {
    category,
    workCount: categoryWorks.length,
    avgPrice: Number((prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2)),
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    avgCost: Number((costs.reduce((a, b) => a + b, 0) / costs.length).toFixed(2)),
    avgProfitMargin: Math.round(margins.reduce((a, b) => a + b, 0) / margins.length),
    priceRange: {
      low: Number(low.toFixed(2)),
      medium: Number(medium.toFixed(2)),
      high: Number(high.toFixed(2)),
    },
  };
}

export function calculateSimilarityScore(work1: CraftWork, work2: CraftWork): number {
  let score = 0;

  if (work1.category === work2.category) score += 30;

  const costDiff = Math.abs(work1.totalCost - work2.totalCost);
  const maxCost = Math.max(work1.totalCost, work2.totalCost);
  if (maxCost > 0) {
    const costSimilarity = Math.max(0, 1 - costDiff / maxCost) * 40;
    score += costSimilarity;
  }

  const materialDiff = Math.abs(
    (work1.materials?.length || 0) - (work2.materials?.length || 0)
  );
  score += Math.max(0, 15 - materialDiff * 3);

  const stepDiff = Math.abs(
    (work1.processSteps?.length || 0) - (work2.processSteps?.length || 0)
  );
  score += Math.max(0, 15 - stepDiff * 3);

  return Math.round(score);
}

export function findSimilarWorks(
  targetWork: CraftWork,
  allWorks: CraftWork[],
  limit: number = 5
): SimilarWork[] {
  return allWorks
    .filter((w) => w.id !== targetWork.id && w.totalCost > 0 && w.name)
    .map((work) => {
      const price = work.sellingPrice || work.suggestedPrice || 0;
      return {
        id: work.id,
        name: work.name,
        price,
        cost: work.totalCost,
        profitMargin: price > 0 ? Math.round(((price - work.totalCost) / price) * 100) : 0,
        similarityScore: calculateSimilarityScore(targetWork, work),
      };
    })
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, limit);
}

export function generatePricingStrategies(
  totalCost: number,
  categoryStats: CategoryPricingStats,
  similarWorks: SimilarWork[]
): PricingStrategy[] {
  const strategies: PricingStrategy[] = [];

  const safeProfitMargin = (price: number, cost: number): number => {
    if (price <= 0) return 0;
    return Math.round(((price - cost) / price) * 100);
  };

  const safePrice = (cost: number, multiplier: number): number => {
    if (cost <= 0) return Math.ceil(multiplier * 10);
    return Math.ceil(cost * multiplier);
  };

  strategies.push({
    type: 'economy',
    name: '经济型定价',
    description: '以较低价格吸引更多客户，适合新作品或竞争激烈的市场',
    suggestedPrice: safePrice(totalCost, 1.8),
    profitMargin: safeProfitMargin(safePrice(totalCost, 1.8), totalCost),
    expectedDemand: 'high',
    pros: ['吸引价格敏感客户', '快速获得订单', '减少库存压力'],
    cons: ['利润率较低', '可能影响品牌定位'],
  });

  strategies.push({
    type: 'standard',
    name: '标准定价',
    description: '基于成本加成的稳健定价策略，适合大多数情况',
    suggestedPrice: safePrice(totalCost, 2.5),
    profitMargin: safeProfitMargin(safePrice(totalCost, 2.5), totalCost),
    expectedDemand: 'medium',
    pros: ['稳定的利润空间', '市场接受度高', '易于预测收益'],
    cons: ['可能缺乏竞争力', '未能充分挖掘价值'],
  });

  strategies.push({
    type: 'premium',
    name: '溢价定价',
    description: '强调作品独特价值，面向高端客户群体',
    suggestedPrice: safePrice(totalCost, 3.5),
    profitMargin: safeProfitMargin(safePrice(totalCost, 3.5), totalCost),
    expectedDemand: 'low',
    pros: ['高利润率', '提升品牌形象', '利润空间大'],
    cons: ['客户群体较小', '需要强大的价值支撑'],
  });

  if (categoryStats.workCount > 0 && categoryStats.avgPrice > 0) {
    const competitivePrice = Math.max(
      safePrice(totalCost, 2),
      Math.ceil((categoryStats.priceRange.low || 0) * 0.95)
    );
    strategies.push({
      type: 'competitive',
      name: '竞争导向定价',
      description: '参考同类作品价格，保持市场竞争力',
      suggestedPrice: competitivePrice,
      profitMargin: safeProfitMargin(competitivePrice, totalCost),
      expectedDemand: 'medium',
      pros: ['与市场保持一致', '降低定价风险', '稳定的客户基础'],
      cons: ['可能牺牲利润', '需要持续监控市场'],
    });
  }

  if (similarWorks.length > 0) {
    const highMarginWork = similarWorks.reduce((prev, curr) =>
      curr.profitMargin > prev.profitMargin ? curr : prev
    );
    if (highMarginWork.profitMargin > 50) {
      strategies.push({
        type: 'value-based',
        name: '价值导向定价',
        description: '基于同类高价值作品的定价策略',
        suggestedPrice: Math.ceil(Math.max(safePrice(totalCost, 2.8), highMarginWork.price * 0.9)),
        profitMargin: Math.min(highMarginWork.profitMargin, 75),
        expectedDemand: 'medium',
        pros: ['参考成功案例', '平衡利润与销量', '市场验证过的价格'],
        cons: ['依赖可比作品数据', '需要匹配的价值支撑'],
      });
    }
  }

  return strategies;
}

export function analyzeMarket(
  work: CraftWork,
  allWorks: CraftWork[],
  orders: Order[]
): MarketAnalysis {
  const categoryStats = calculateCategoryPricingStats(allWorks, work.category);
  const similarWorks = findSimilarWorks(work, allWorks);

  const currentPrice = work.sellingPrice || work.suggestedPrice;
  let competitivePosition: MarketAnalysis['competitivePosition'] = 'average';

  if (categoryStats.workCount > 0) {
    const avgPrice = categoryStats.avgPrice;
    if (currentPrice < avgPrice * 0.9) {
      competitivePosition = 'below-average';
    } else if (currentPrice > avgPrice * 1.3) {
      competitivePosition = 'premium';
    } else if (currentPrice > avgPrice * 1.1) {
      competitivePosition = 'above-average';
    }
  }

  const recentOrders = orders.filter((o) => {
    const orderDate = new Date(o.createdAt);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return orderDate >= threeMonthsAgo;
  });

  let demandIndicator: MarketAnalysis['demandIndicator'] = 'medium';
  if (recentOrders.length >= 10) {
    demandIndicator = 'high';
  } else if (recentOrders.length < 3) {
    demandIndicator = 'low';
  }

  return {
    categoryStats,
    competitivePosition,
    priceTrend: 'stable',
    demandIndicator,
    similarWorks,
  };
}

export function identifyRiskFactors(
  work: CraftWork,
  categoryStats: CategoryPricingStats,
  orders: Order[]
): RiskFactor[] {
  const risks: RiskFactor[] = [];

  if (work.materials.length > 0) {
    const volatileMaterials = work.materials.filter(
      (m) => Number(m.unitPrice) > 50
    );
    if (volatileMaterials.length > 0) {
      risks.push({
        type: 'cost',
        name: '材料成本波动风险',
        description: `作品包含 ${volatileMaterials.length} 种高价材料，价格波动可能影响利润`,
        severity: volatileMaterials.length >= 3 ? 'high' : 'medium',
        impact: Math.round(
          (volatileMaterials.reduce((sum, m) => sum + m.cost, 0) / work.totalCost) *
            100
        ),
      });
    }
  }

  if (categoryStats.workCount >= 5) {
    risks.push({
      type: 'competition',
      name: '市场竞争风险',
      description: `该分类已有 ${categoryStats.workCount} 件作品，竞争较为激烈`,
      severity: categoryStats.workCount >= 10 ? 'high' : 'medium',
      impact: Math.min(categoryStats.workCount * 5, 50),
    });
  }

  const recentOrders = orders.filter((o) => {
    const orderDate = new Date(o.createdAt);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return orderDate >= threeMonthsAgo;
  });

  if (recentOrders.length < 3) {
    risks.push({
      type: 'demand',
      name: '需求不确定性风险',
      description: '近期订单量较少，市场需求存在不确定性',
      severity: 'medium',
      impact: 30,
    });
  }

  if (work.totalCost < 10) {
    risks.push({
      type: 'market',
      name: '低值作品定价风险',
      description: '作品成本较低，定价可能受心理价位限制',
      severity: 'low',
      impact: 15,
    });
  }

  return risks;
}

export function calculatePriceOptimization(
  totalCost: number,
  categoryStats: CategoryPricingStats,
  similarWorks: SimilarWork[]
): PriceOptimizationResult {
  const breakEvenPrice = Number((totalCost * 1.2).toFixed(2));

  const maxProfitPrice = Math.ceil(totalCost * 3.5);

  const competitivePrice =
    categoryStats.workCount > 0
      ? Math.ceil(Math.max(totalCost * 2, categoryStats.priceRange.low * 0.95))
      : Math.ceil(totalCost * 2.2);

  const valueBasedPrice =
    similarWorks.length > 0
      ? Math.ceil(
          Math.max(
            totalCost * 2.5,
            similarWorks.reduce((sum, w) => sum + w.price, 0) / similarWorks.length * 0.9
          )
        )
      : Math.ceil(totalCost * 2.5);

  const optimalPrice = Math.ceil(
    (competitivePrice * 0.4 + valueBasedPrice * 0.3 + totalCost * 2.5 * 0.3)
  );

  let recommendedStrategy = '标准定价';
  let explanation = '基于成本加成的稳健定价策略，平衡利润与市场接受度。';

  if (categoryStats.workCount > 5) {
    recommendedStrategy = '竞争导向定价';
    explanation = '参考同类作品价格，在保持竞争力的同时确保合理利润。';
  } else if (similarWorks.length >= 3 && similarWorks.every((w) => w.profitMargin > 60)) {
    recommendedStrategy = '价值导向定价';
    explanation = '同类作品普遍获得高溢价，建议采用价值导向定价。';
  }

  return {
    optimalPrice,
    maxProfitPrice,
    competitivePrice,
    valueBasedPrice,
    breakEvenPrice,
    recommendedStrategy,
    explanation,
  };
}

export function generatePricingRecommendation(
  work: CraftWork,
  allWorks: CraftWork[],
  orders: Order[]
): PricingRecommendation {
  const categoryStats = calculateCategoryPricingStats(allWorks, work.category);
  const similarWorks = findSimilarWorks(work, allWorks);
  const marketAnalysis = analyzeMarket(work, allWorks, orders);
  const strategies = generatePricingStrategies(work.totalCost, categoryStats, similarWorks);
  const riskFactors = identifyRiskFactors(work, categoryStats, orders);
  const priceOptimization = calculatePriceOptimization(
    work.totalCost,
    categoryStats,
    similarWorks
  );

  const currentPrice = work.sellingPrice || work.suggestedPrice;

  let confidenceScore = 50;
  if (categoryStats.workCount >= 3) confidenceScore += 15;
  if (similarWorks.length >= 2) confidenceScore += 15;
  if (orders.length >= 5) confidenceScore += 10;
  confidenceScore = Math.min(confidenceScore, 100);

  return {
    craftWorkId: work.id,
    craftWorkName: work.name,
    category: work.category,
    totalCost: work.totalCost,
    currentPrice,
    suggestedPrice: priceOptimization.optimalPrice,
    priceRange: {
      min: priceOptimization.breakEvenPrice,
      max: priceOptimization.maxProfitPrice,
      optimal: priceOptimization.optimalPrice,
    },
    strategies,
    marketAnalysis,
    riskFactors,
    confidenceScore,
  };
}

export function getDemandEmoji(demand: 'low' | 'medium' | 'high'): string {
  switch (demand) {
    case 'low':
      return '📉';
    case 'medium':
      return '📊';
    case 'high':
      return '📈';
  }
}

export function getSeverityColor(severity: 'low' | 'medium' | 'high'): string {
  switch (severity) {
    case 'low':
      return 'text-green-600 bg-green-100';
    case 'medium':
      return 'text-yellow-600 bg-yellow-100';
    case 'high':
      return 'text-red-600 bg-red-100';
  }
}
