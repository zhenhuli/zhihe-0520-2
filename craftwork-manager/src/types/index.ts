export interface Material {
  id: string;
  name: string;
  category: string;
  unit: string;
  unitPrice: number;
  stock: number;
  supplier?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialUsage {
  materialId: string;
  materialName: string;
  quantity: number;
  unitPrice: string;
  wastageRate: number;
  actualQuantity: number;
  cost: number;
}

export interface ProcessStep {
  id: string;
  name: string;
  category: string;
  description?: string;
  estimatedHours: number;
  hourlyRate: number;
  standardCost: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkProcessStep {
  stepId: string;
  stepName: string;
  estimatedHours: number;
  actualHours: number;
  hourlyRate: number;
  cost: number;
  notes?: string;
}

export interface LaborRecord {
  id: string;
  craftWorkId: string;
  craftWorkName: string;
  stepId?: string;
  stepName: string;
  startTime: string;
  endTime?: string;
  duration: number;
  hourlyRate: number;
  cost: number;
  notes?: string;
  createdAt: string;
}

export interface CostDetailReport {
  id: string;
  craftWorkId: string;
  craftWorkName: string;
  generatedAt: string;
  periodStart?: string;
  periodEnd?: string;
  materialCost: number;
  materialBreakdown: {
    materialName: string;
    quantity: number;
    wastageRate: number;
    actualQuantity: number;
    unitPrice: number;
    cost: number;
  }[];
  laborCost: number;
  laborBreakdown: {
    stepName: string;
    hours: number;
    hourlyRate: number;
    cost: number;
  }[];
  otherCost: number;
  totalCost: number;
  suggestedPrice: number;
  sellingPrice?: number;
  profit?: number;
  profitMargin?: number;
}

export interface CraftWork {
  id: string;
  name: string;
  category: string;
  description?: string;
  materials: MaterialUsage[];
  processSteps: WorkProcessStep[];
  laborCost: number;
  otherCost: number;
  materialCost: number;
  totalCost: number;
  suggestedPrice: number;
  sellingPrice?: number;
  profit?: number;
  profitMargin?: number;
  imageUrl?: string;
  craftNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export type MaterialCategory = '金属' | '线材' | '面料' | '颜料' | '纸张' | '木材' | '皮革' | '粘合剂' | '工具耗材' | '包装材料' | '其他';
export type CraftCategory = '首饰' | '绘画' | '皮具' | '书法篆刻' | '花艺' | '陶艺' | '编织' | '其他';
export type ProcessCategory = '准备' | '制作' | '装饰' | '组装' | '打磨' | '上色' | '烘焙' | '缝制' | '编织' | '包装' | '其他';
export type OrderStatus = '待付款' | '已付款' | '制作中' | '已完成' | '已发货' | '已取消';
export type PaymentMethod = '微信' | '支付宝' | '银行卡' | '现金' | '其他';

export interface WorkImage {
  id: string;
  craftWorkId: string;
  url: string;
  caption?: string;
  isCover: boolean;
  createdAt: string;
}

export interface GalleryAlbum {
  id: string;
  name: string;
  description?: string;
  coverImageUrl?: string;
  craftWorkIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  craftWorkId: string;
  craftWorkName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNo: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  items: OrderItem[];
  totalAmount: number;
  discount?: number;
  finalAmount: number;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  paidAt?: string;
  deliveredAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PricingHistory {
  id: string;
  craftWorkId: string;
  craftWorkName: string;
  oldSellingPrice?: number;
  newSellingPrice: number;
  oldTotalCost?: number;
  newTotalCost: number;
  changeReason?: string;
  changedAt: string;
}

export interface MonthlyStat {
  id: string;
  month: string;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  orderCount: number;
  workCount: number;
  avgProfitMargin: number;
  topSellingWorks: {
    craftWorkId: string;
    craftWorkName: string;
    quantity: number;
    revenue: number;
  }[];
  createdAt: string;
}

export interface PriceComparison {
  craftWorkId: string;
  craftWorkName: string;
  category: string;
  currentSellingPrice: number;
  historicalPrices: {
    date: string;
    price: number;
    cost: number;
  }[];
  priceChange: number;
  costChange: number;
}

export interface CategoryPricingStats {
  category: string;
  workCount: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  avgCost: number;
  avgProfitMargin: number;
  priceRange: {
    low: number;
    medium: number;
    high: number;
  };
}

export interface PricingRecommendation {
  craftWorkId: string;
  craftWorkName: string;
  category: string;
  totalCost: number;
  currentPrice: number;
  suggestedPrice: number;
  priceRange: {
    min: number;
    max: number;
    optimal: number;
  };
  strategies: PricingStrategy[];
  marketAnalysis: MarketAnalysis;
  riskFactors: RiskFactor[];
  confidenceScore: number;
}

export interface PricingStrategy {
  type: 'economy' | 'standard' | 'premium' | 'competitive' | 'value-based';
  name: string;
  description: string;
  suggestedPrice: number;
  profitMargin: number;
  expectedDemand: 'low' | 'medium' | 'high';
  pros: string[];
  cons: string[];
}

export interface MarketAnalysis {
  categoryStats: CategoryPricingStats;
  competitivePosition: 'below-average' | 'average' | 'above-average' | 'premium';
  priceTrend: 'rising' | 'stable' | 'falling';
  demandIndicator: 'low' | 'medium' | 'high';
  similarWorks: SimilarWork[];
}

export interface SimilarWork {
  id: string;
  name: string;
  price: number;
  cost: number;
  profitMargin: number;
  similarityScore: number;
}

export interface RiskFactor {
  type: 'cost' | 'market' | 'competition' | 'demand';
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  impact: number;
}

export interface PriceOptimizationResult {
  optimalPrice: number;
  maxProfitPrice: number;
  competitivePrice: number;
  valueBasedPrice: number;
  breakEvenPrice: number;
  recommendedStrategy: string;
  explanation: string;
}

export interface CraftTemplate {
  id: string;
  name: string;
  category: string;
  description?: string;
  materials: MaterialUsage[];
  processSteps: WorkProcessStep[];
  otherCost: number;
  profitMultiplier: number;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}
