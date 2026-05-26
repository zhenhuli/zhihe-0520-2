<template>
  <el-card class="form-card">
    <template #header>
      <div class="card-header">
        <el-icon><Setting /></el-icon>
        <span>仓库参数设置</span>
      </div>
    </template>
    
    <el-form :model="warehouse" label-width="110px" class="warehouse-form">
      <el-divider content-position="left">仓库尺寸</el-divider>
      <el-row :gutter="16">
        <el-col :xs="24" :sm="12" :md="12" :lg="24" :xl="12">
          <el-form-item label="仓库长度 (米)">
            <el-input-number v-model="warehouse.length" :min="10" :max="200" :step="1" class="full-width-input" controls-position="right" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="12" :lg="24" :xl="12">
          <el-form-item label="仓库宽度 (米)">
            <el-input-number v-model="warehouse.width" :min="10" :max="200" :step="1" class="full-width-input" controls-position="right" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-divider content-position="left">柱体设置</el-divider>
      <el-row :gutter="16">
        <el-col :xs="24" :sm="12" :md="12" :lg="24" :xl="12">
          <el-form-item label="柱体宽度 (米)">
            <el-input-number v-model="warehouse.pillarWidth" :min="0.3" :max="3" :step="0.1" class="full-width-input" controls-position="right" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="12" :lg="24" :xl="12">
          <el-form-item label="柱体深度 (米)">
            <el-input-number v-model="warehouse.pillarDepth" :min="0.3" :max="3" :step="0.1" class="full-width-input" controls-position="right" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="12" :lg="24" :xl="12">
          <el-form-item label="柱体行数">
            <el-input-number v-model="warehouse.pillarRows" :min="0" :max="10" :step="1" class="full-width-input" controls-position="right" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="12" :lg="24" :xl="12">
          <el-form-item label="柱体列数">
            <el-input-number v-model="warehouse.pillarCols" :min="0" :max="20" :step="1" class="full-width-input" controls-position="right" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-divider content-position="left">通道设置</el-divider>
      <el-row :gutter="16">
        <el-col :xs="24" :sm="12" :md="12" :lg="24" :xl="12">
          <el-form-item label="主通道宽度 (米)">
            <el-input-number v-model="warehouse.aisleWidth" :min="1" :max="10" :step="0.5" class="full-width-input" controls-position="right" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="12" :lg="24" :xl="12">
          <el-form-item label="作业通道宽度 (米)">
            <el-input-number v-model="warehouse.aisleDepth" :min="0.5" :max="5" :step="0.5" class="full-width-input" controls-position="right" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="12" :lg="24" :xl="12">
          <el-form-item label="横向通道数">
            <el-input-number v-model="warehouse.crossAisles" :min="0" :max="5" :step="1" class="full-width-input" controls-position="right" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="12" :lg="24" :xl="12">
          <el-form-item label="墙边预留 (米)">
            <el-input-number v-model="warehouse.wallMargin" :min="0" :max="2" :step="0.1" class="full-width-input" controls-position="right" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-divider content-position="left">货架参数</el-divider>
      <el-row :gutter="16">
        <el-col :xs="24" :sm="12" :md="12" :lg="24" :xl="12">
          <el-form-item label="货架宽度 (米)">
            <el-input-number v-model="warehouse.shelfWidth" :min="0.5" :max="5" :step="0.1" class="full-width-input" controls-position="right" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="12" :lg="24" :xl="12">
          <el-form-item label="货架深度 (米)">
            <el-input-number v-model="warehouse.shelfDepth" :min="0.3" :max="3" :step="0.1" class="full-width-input" controls-position="right" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </el-card>
</template>

<script setup>
import { Setting } from '@element-plus/icons-vue'

defineProps({
  warehouse: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.form-card {
  height: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
}

.warehouse-form :deep(.el-form-item) {
  margin-bottom: 16px;
}

.warehouse-form :deep(.el-form-item__label) {
  white-space: nowrap;
  font-weight: 500;
  color: #606266;
}

.warehouse-form :deep(.el-input-number) {
  width: 100%;
}

.warehouse-form :deep(.el-input-number .el-input__inner) {
  text-align: left;
  padding-left: 15px;
  font-size: 14px;
}

.warehouse-form :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #dcdfe6 inset;
  border-radius: 6px;
}

.warehouse-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c0c4cc inset;
}

.warehouse-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff inset;
}

@media (min-width: 1200px) {
  .warehouse-form :deep(.el-form-item__content) {
    min-width: 180px;
  }
}

@media (min-width: 1920px) {
  .warehouse-form :deep(.el-form-item__content) {
    min-width: 200px;
  }
}
</style>
