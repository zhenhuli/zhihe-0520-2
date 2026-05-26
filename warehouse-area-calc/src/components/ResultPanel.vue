<template>
  <el-card class="result-card">
    <template #header>
      <div class="card-header">
        <el-icon><DataAnalysis /></el-icon>
        <span>测算结果</span>
      </div>
    </template>
    
    <div class="result-section">
      <h4>面积统计</h4>
      <el-descriptions :column="2" border size="small">
        <el-descriptions-item label="仓库总面积">
          <span class="highlight">{{ originalArea.toFixed(2) }}</span> ㎡
        </el-descriptions-item>
        <el-descriptions-item label="有效仓储面积">
          <span class="highlight primary">{{ effectiveArea.toFixed(2) }}</span> ㎡
        </el-descriptions-item>
        <el-descriptions-item label="柱体占比面积">
          {{ pillarArea.toFixed(2) }} ㎡
        </el-descriptions-item>
        <el-descriptions-item label="通道占比面积">
          {{ aisleArea.toFixed(2) }} ㎡
        </el-descriptions-item>
        <el-descriptions-item label="墙边预留面积">
          {{ wallMarginArea.toFixed(2) }} ㎡
        </el-descriptions-item>
      </el-descriptions>
    </div>
    
    <div class="result-section">
      <h4>货位统计</h4>
      <el-statistic title="可摆放货位数量" :value="shelfCount" class="stat-item">
        <template #suffix>个</template>
      </el-statistic>
    </div>
    
    <div class="result-section">
      <h4>空间利用率</h4>
      <div class="progress-group">
        <div class="progress-item">
          <span class="progress-label">理论空间利用率</span>
          <el-progress 
            :percentage="parseFloat(spaceUtilization)" 
            :color="getProgressColor(spaceUtilization)"
            :stroke-width="12"
          />
          <span class="progress-value">{{ spaceUtilization }}%</span>
        </div>
        <div class="progress-item">
          <span class="progress-label">实际货架利用率</span>
          <el-progress 
            :percentage="parseFloat(utilizationRate)" 
            :color="getProgressColor(utilizationRate)"
            :stroke-width="12"
          />
          <span class="progress-value">{{ utilizationRate }}%</span>
        </div>
      </div>
    </div>
    
    <div class="result-section">
      <h4>面积分布图</h4>
      <div class="chart-container">
        <div class="bar-chart">
          <div 
            class="bar original" 
            :style="{ height: '100%', width: (100 * originalArea / originalArea) + '%' }"
          >
            <span class="bar-label">总面积</span>
          </div>
        </div>
        <div class="bar-chart stacked">
          <div 
            class="bar effective" 
            :style="{ width: (100 * effectiveArea / originalArea) + '%' }"
          >
            <span class="bar-label">有效</span>
          </div>
          <div 
            class="bar pillar" 
            :style="{ width: (100 * pillarArea / originalArea) + '%' }"
          >
            <span class="bar-label">柱体</span>
          </div>
          <div 
            class="bar aisle" 
            :style="{ width: (100 * aisleArea / originalArea) + '%' }"
          >
            <span class="bar-label">通道</span>
          </div>
        </div>
      </div>
      <div class="legend">
        <span class="legend-item"><i class="dot effective"></i>有效面积</span>
        <span class="legend-item"><i class="dot pillar"></i>柱体</span>
        <span class="legend-item"><i class="dot aisle"></i>通道</span>
        <span class="legend-item"><i class="dot wall"></i>墙边</span>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { DataAnalysis } from '@element-plus/icons-vue'

defineProps({
  originalArea: Number,
  pillarArea: Number,
  aisleArea: Number,
  wallMarginArea: Number,
  effectiveArea: Number,
  shelfCount: Number,
  spaceUtilization: [String, Number],
  utilizationRate: [String, Number]
})

const getProgressColor = (value) => {
  const v = parseFloat(value)
  if (v >= 70) return '#67c23a'
  if (v >= 50) return '#e6a23c'
  return '#f56c6c'
}
</script>

<style scoped>
.result-card {
  height: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
}

.result-section {
  margin-bottom: 24px;
}

.result-section:last-child {
  margin-bottom: 0;
}

.result-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #606266;
  font-weight: 600;
}

.highlight {
  font-weight: 600;
  font-size: 16px;
}

.highlight.primary {
  color: #409eff;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.progress-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.progress-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-label {
  width: 120px;
  font-size: 13px;
  color: #606266;
  flex-shrink: 0;
}

.progress-value {
  width: 60px;
  font-weight: 600;
  color: #303133;
  text-align: right;
  flex-shrink: 0;
}

.chart-container {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
}

.bar-chart {
  height: 30px;
  background: #e4e7ed;
  border-radius: 4px;
  margin-bottom: 8px;
  display: flex;
  overflow: hidden;
}

.bar-chart.stacked {
  background: transparent;
}

.bar {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  min-width: 40px;
}

.bar.original {
  background: #909399;
  width: 100%;
}

.bar.effective {
  background: #67c23a;
}

.bar.pillar {
  background: #e6a23c;
}

.bar.aisle {
  background: #909399;
}

.bar-label {
  color: white;
  font-size: 11px;
  font-weight: 500;
}

.legend {
  display: flex;
  gap: 16px;
  margin-top: 12px;
  font-size: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #606266;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  display: inline-block;
}

.dot.effective { background: #67c23a; }
.dot.pillar { background: #e6a23c; }
.dot.aisle { background: #909399; }
.dot.wall { background: #409eff; }
</style>
