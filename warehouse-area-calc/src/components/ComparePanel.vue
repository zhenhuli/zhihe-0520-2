<template>
  <el-card class="compare-card">
    <template #header>
      <div class="card-header">
        <el-icon><Compass /></el-icon>
        <span>布局优化对比</span>
      </div>
    </template>
    
    <div class="compare-actions">
      <el-button type="primary" @click="saveCurrentState">
        <el-icon><DocumentAdd /></el-icon>
        保存当前方案
      </el-button>
      <el-button @click="clearHistory" :disabled="history.length === 0">
        <el-icon><Delete /></el-icon>
        清空历史
      </el-button>
    </div>
    
    <div v-if="history.length === 0" class="empty-history">
      <el-empty description="暂无历史方案，请先保存当前方案进行对比">
        <template #image>
          <el-icon :size="60"><Histogram /></el-icon>
        </template>
      </el-empty>
    </div>
    
    <div v-else class="compare-content">
      <el-table :data="tableData" border stripe>
        <el-table-column label="方案" align="center">
          <template #default="{ row }">
            <el-tag :type="row.type === 'current' ? 'success' : 'info'">
              {{ row.name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="仓库尺寸" align="center">
          <template #default="{ row }">
            {{ row.length }}m × {{ row.width }}m
          </template>
        </el-table-column>
        <el-table-column label="总面积(㎡)" prop="originalArea" align="center" />
        <el-table-column label="有效面积(㎡)" prop="effectiveArea" align="center" />
        <el-table-column label="货位数量" prop="shelfCount" align="center" />
        <el-table-column label="空间利用率" align="center">
          <template #default="{ row }">
            <el-progress 
              :percentage="parseFloat(row.spaceUtilization)" 
              :stroke-width="10"
              :color="getProgressColor(row.spaceUtilization)"
              style="width: 100px"
            />
            <span class="percent-text">{{ row.spaceUtilization }}%</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="120">
          <template #default="{ row }">
            <el-button 
              v-if="row.type !== 'current'" 
              type="primary" 
              link 
              size="small"
              @click="applyScheme(row)"
            >
              应用此方案
            </el-button>
            <el-button 
              v-if="row.type !== 'current'" 
              type="danger" 
              link 
              size="small"
              @click="deleteScheme(row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="compare-chart" v-if="history.length >= 1">
        <h4>各方案对比图</h4>
        <div class="chart-bars">
          <div 
            v-for="item in chartData" 
            :key="item.name"
            class="chart-bar-item"
          >
            <span class="bar-name">{{ item.name }}</span>
            <div class="bar-track">
              <div 
                class="bar-fill"
                :style="{ 
                  width: (item.effectiveArea / maxOriginalArea * 100) + '%',
                  background: item.type === 'current' ? '#67c23a' : '#409eff'
                }"
              >
                <span class="bar-value">{{ item.effectiveArea.toFixed(0) }} ㎡</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Compass, DocumentAdd, Delete, Histogram } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  warehouse: Object,
  originalArea: Number,
  effectiveArea: Number,
  shelfCount: Number,
  spaceUtilization: [String, Number]
})

const emit = defineEmits(['apply-scheme'])

const history = ref([])
let idCounter = 0

const tableData = computed(() => {
  const current = {
    id: 'current',
    type: 'current',
    name: '当前方案',
    length: props.warehouse.length,
    width: props.warehouse.width,
    originalArea: props.originalArea.toFixed(2),
    effectiveArea: props.effectiveArea.toFixed(2),
    shelfCount: props.shelfCount,
    spaceUtilization: props.spaceUtilization
  }
  return [current, ...history.value]
})

const chartData = computed(() => {
  return tableData.value.map(item => ({
    ...item,
    effectiveArea: parseFloat(item.effectiveArea),
    originalArea: parseFloat(item.originalArea)
  }))
})

const maxOriginalArea = computed(() => {
  return Math.max(...chartData.value.map(d => d.originalArea))
})

const saveCurrentState = () => {
  idCounter++
  history.value.push({
    id: idCounter,
    type: 'history',
    name: `方案 ${idCounter}`,
    warehouse: { ...props.warehouse },
    length: props.warehouse.length,
    width: props.warehouse.width,
    originalArea: props.originalArea.toFixed(2),
    effectiveArea: props.effectiveArea.toFixed(2),
    shelfCount: props.shelfCount,
    spaceUtilization: props.spaceUtilization
  })
  ElMessage.success('方案已保存')
}

const clearHistory = () => {
  history.value = []
  idCounter = 0
  ElMessage.info('历史已清空')
}

const deleteScheme = (id) => {
  history.value = history.value.filter(h => h.id !== id)
  ElMessage.info('方案已删除')
}

const applyScheme = (row) => {
  emit('apply-scheme', { ...row.warehouse })
  ElMessage.success('方案已应用')
}

const getProgressColor = (value) => {
  const v = parseFloat(value)
  if (v >= 70) return '#67c23a'
  if (v >= 50) return '#e6a23c'
  return '#f56c6c'
}
</script>

<style scoped>
.compare-card {
  height: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
}

.compare-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.empty-history {
  padding: 40px 0;
}

.compare-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.percent-text {
  margin-left: 8px;
  font-size: 13px;
  color: #606266;
}

.compare-chart h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #606266;
  font-weight: 600;
}

.chart-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chart-bar-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bar-name {
  width: 80px;
  font-size: 13px;
  color: #606266;
  flex-shrink: 0;
}

.bar-track {
  flex: 1;
  height: 24px;
  background: #f0f2f5;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 8px;
  min-width: 60px;
  transition: width 0.3s ease;
}

.bar-value {
  color: white;
  font-size: 12px;
  font-weight: 500;
}
</style>
