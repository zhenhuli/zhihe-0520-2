<template>
  <div class="app-container">
    <header class="app-header">
      <div class="header-content">
        <div class="logo-area">
          <el-icon :size="32" color="#409eff"><OfficeBuilding /></el-icon>
          <div class="title">
            <h1>仓储面积测算工具</h1>
            <p>Warehouse Area Calculator</p>
          </div>
        </div>
        <div class="header-desc">
          智能测算仓储有效使用面积，辅助仓库布局优化设计
        </div>
      </div>
    </header>
    
    <main class="app-main">
      <el-row :gutter="20">
        <el-col :xs="24" :md="10" :lg="8" :xl="7" :xxl="6" class="col-form">
          <WarehouseForm :warehouse="warehouse" />
        </el-col>
        
        <el-col :xs="24" :md="14" :lg="16" :xl="17" :xxl="18" class="col-right">
          <el-row :gutter="20">
            <el-col :xs="24" :md="12">
              <ResultPanel
                :original-area="originalArea"
                :pillar-area="pillarArea"
                :aisle-area="aisleArea"
                :wall-margin-area="wallMarginArea"
                :effective-area="effectiveArea"
                :shelf-count="shelfCount"
                :space-utilization="spaceUtilization"
                :utilization-rate="utilizationRate"
              />
            </el-col>
            <el-col :xs="24" :md="12">
              <WarehouseVisual
                :warehouse="warehouse"
                :pillars="pillars"
                :shelves="shelves"
              />
            </el-col>
          </el-row>
          
          <el-row :gutter="20" class="row-compare">
            <el-col :span="24">
              <ComparePanel
                :warehouse="warehouse"
                :original-area="originalArea"
                :effective-area="effectiveArea"
                :shelf-count="shelfCount"
                :space-utilization="spaceUtilization"
                @apply-scheme="applyScheme"
              />
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </main>
    
    <footer class="app-footer">
      <p>© 2024 仓储面积测算工具 - 助力仓储物流数字化转型</p>
    </footer>
  </div>
</template>

<script setup>
import { OfficeBuilding } from '@element-plus/icons-vue'
import WarehouseForm from './components/WarehouseForm.vue'
import ResultPanel from './components/ResultPanel.vue'
import WarehouseVisual from './components/WarehouseVisual.vue'
import ComparePanel from './components/ComparePanel.vue'
import { useWarehouseCalc } from './composables/useWarehouseCalc'

const {
  warehouse,
  originalArea,
  pillarArea,
  aisleArea,
  wallMarginArea,
  effectiveArea,
  shelfCount,
  spaceUtilization,
  utilizationRate,
  pillars,
  shelves
} = useWarehouseCalc()

const applyScheme = (scheme) => {
  Object.assign(warehouse, scheme)
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.app-header {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  color: white;
  padding: 24px 40px;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.3);
}

.header-content {
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.title p {
  margin: 4px 0 0 0;
  font-size: 13px;
  opacity: 0.9;
}

.header-desc {
  font-size: 14px;
  opacity: 0.95;
}

.app-main {
  flex: 1;
  padding: 24px 40px;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.col-form {
  margin-bottom: 20px;
}

.col-right {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.row-compare {
  margin-top: 0;
}

.app-footer {
  background: #303133;
  color: #909399;
  text-align: center;
  padding: 16px;
  font-size: 13px;
}

.app-footer p {
  margin: 0;
}

@media (max-width: 1200px) {
  .app-header,
  .app-main {
    padding: 20px;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .app-header,
  .app-main {
    padding: 16px;
  }
}
</style>
