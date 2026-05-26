<template>
  <el-card class="visual-card">
    <template #header>
      <div class="card-header">
        <el-icon><Grid /></el-icon>
        <span>仓库布局预览</span>
      </div>
    </template>
    
    <div class="visual-container" ref="containerRef">
      <svg 
        :width="svgWidth" 
        :height="svgHeight" 
        class="warehouse-svg"
        :viewBox="`0 0 ${warehouse.length + 2} ${warehouse.width + 2}`"
      >
        <defs>
          <pattern id="grid" :width="5" :height="5" patternUnits="userSpaceOnUse">
            <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#e4e7ed" stroke-width="0.1"/>
          </pattern>
        </defs>
        
        <rect 
          x="1" 
          y="1" 
          :width="warehouse.length" 
          :height="warehouse.width" 
          fill="url(#grid)"
          stroke="#303133"
          stroke-width="0.2"
        />
        
        <rect 
          :x="1 + warehouse.wallMargin" 
          :y="1 + warehouse.wallMargin" 
          :width="warehouse.length - 2 * warehouse.wallMargin" 
          :height="warehouse.width - 2 * warehouse.wallMargin" 
          fill="none"
          stroke="#409eff"
          stroke-width="0.1"
          stroke-dasharray="0.5,0.3"
        />
        
        <line 
          :x1="1" 
          :y1="1 + warehouse.width / 2" 
          :x2="1 + warehouse.length" 
          :y2="1 + warehouse.width / 2"
          stroke="#e6a23c"
          stroke-width="0.3"
          stroke-dasharray="0.8,0.4"
        />
        
        <g v-for="(shelf, index) in shelves" :key="'shelf-' + index">
          <rect 
            :x="1 + shelf.x" 
            :y="1 + shelf.y" 
            :width="shelf.width" 
            :height="shelf.height"
            fill="#67c23a"
            fill-opacity="0.6"
            stroke="#529b2e"
            stroke-width="0.05"
            rx="0.1"
          />
        </g>
        
        <g v-for="(pillar, index) in pillars" :key="'pillar-' + index">
          <rect 
            :x="1 + pillar.x" 
            :y="1 + pillar.y" 
            :width="pillar.width" 
            :height="pillar.height"
            fill="#909399"
            stroke="#606266"
            stroke-width="0.05"
            rx="0.05"
          />
        </g>
        
        <g class="labels">
          <text 
            :x="1 + warehouse.length / 2" 
            :y="0.8" 
            text-anchor="middle" 
            font-size="1"
            fill="#606266"
            font-weight="500"
          >
            {{ warehouse.length }}m
          </text>
          <text 
            :x="0.5" 
            :y="1 + warehouse.width / 2" 
            text-anchor="middle" 
            font-size="1"
            fill="#606266"
            font-weight="500"
            transform="rotate(-90, 0.5, 1 + warehouse.width / 2)"
          >
            {{ warehouse.width }}m
          </text>
        </g>
      </svg>
      
      <div class="visual-legend">
        <div class="legend-item">
          <span class="legend-color warehouse"></span>
          <span>仓库边界</span>
        </div>
        <div class="legend-item">
          <span class="legend-color shelf"></span>
          <span>货架</span>
        </div>
        <div class="legend-item">
          <span class="legend-color pillar"></span>
          <span>柱体</span>
        </div>
        <div class="legend-item">
          <span class="legend-color aisle"></span>
          <span>主通道</span>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Grid } from '@element-plus/icons-vue'

const props = defineProps({
  warehouse: {
    type: Object,
    required: true
  },
  pillars: {
    type: Array,
    default: () => []
  },
  shelves: {
    type: Array,
    default: () => []
  }
})

const containerRef = ref(null)
const svgWidth = ref(600)
const svgHeight = ref(400)

const scale = computed(() => {
  const maxSide = Math.max(props.warehouse.length, props.warehouse.width)
  return Math.min(svgWidth.value / (maxSide + 2), svgHeight.value / (maxSide + 2))
})
</script>

<style scoped>
.visual-card {
  height: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
}

.visual-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.warehouse-svg {
  background: #fafafa;
  border-radius: 8px;
  max-width: 100%;
  height: auto;
}

.visual-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #606266;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  display: inline-block;
}

.legend-color.warehouse {
  border: 2px solid #303133;
  background: transparent;
}

.legend-color.shelf {
  background: #67c23a;
  opacity: 0.6;
}

.legend-color.pillar {
  background: #909399;
}

.legend-color.aisle {
  background: repeating-linear-gradient(
    45deg,
    #e6a23c,
    #e6a23c 4px,
    transparent 4px,
    transparent 8px
  );
}
</style>
