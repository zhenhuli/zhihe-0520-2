<template>
  <div class="calculator-container">
    <div class="calculator-card">
      <div class="card-layout">
        <div class="params-panel">
          <div class="card-section">
            <h2 class="section-title">📐 墙面参数</h2>
            <div class="input-group">
              <div class="input-item">
                <label>墙面长度 (米)</label>
                <input 
                  type="number" 
                  v-model.number="wallLength" 
                  min="0" 
                  step="0.1"
                  placeholder="请输入墙面长度"
                />
              </div>
              <div class="input-item">
                <label>墙面高度 (米)</label>
                <input 
                  type="number" 
                  v-model.number="wallHeight" 
                  min="0" 
                  step="0.1"
                  placeholder="请输入墙面高度"
                />
              </div>
            </div>
            
            <div class="area-display">
              <span class="area-label">墙面面积：</span>
              <span class="area-value">{{ wallArea.toFixed(2) }} ㎡</span>
            </div>
          </div>

          <div class="card-section">
            <h2 class="section-title">🖌️ 涂刷参数</h2>
            <div class="input-group">
              <div class="input-item">
                <label>涂刷遍数</label>
                <input 
                  type="number" 
                  v-model.number="coatCount" 
                  min="1" 
                  max="5"
                  step="1"
                />
                <div class="coat-buttons">
                  <button 
                    v-for="n in 5" 
                    :key="n"
                    @click="coatCount = n"
                    :class="{ active: coatCount === n }"
                  >{{ n }}遍</button>
                </div>
              </div>
              <div class="input-item">
                <label>油漆涂布率 (㎡/L)</label>
                <input 
                  type="number" 
                  v-model.number="spreadRate" 
                  min="1" 
                  step="0.1"
                  placeholder="通常为8-12㎡/L"
                />
                <div class="rate-hint">💡 参考值：乳胶漆约10-12㎡/L</div>
              </div>
            </div>
          </div>

          <div class="card-section">
            <h2 class="section-title">🏠 墙面材质</h2>
            <div class="material-grid">
              <div 
                v-for="material in materials" 
                :key="material.id"
                class="material-card"
                :class="{ active: selectedMaterial === material.id }"
                @click="selectedMaterial = material.id"
              >
                <div class="material-icon">{{ material.icon }}</div>
                <div class="material-name">{{ material.name }}</div>
                <div class="material-loss">损耗: {{ (material.lossFactor * 100).toFixed(0) }}%</div>
              </div>
            </div>
            <div class="material-desc">
              {{ currentMaterial.description }}
            </div>
          </div>
        </div>

        <div class="result-panel">
          <div class="card-section result-section">
            <h2 class="section-title">📊 计算结果</h2>
            <div class="result-grid">
              <div class="result-item">
                <div class="result-label">理论用量</div>
                <div class="result-value">{{ theoreticalUsage.toFixed(2) }} L</div>
                <div class="result-desc">不考虑损耗的理想用量</div>
              </div>
              <div class="result-item">
                <div class="result-label">损耗系数</div>
                <div class="result-value loss">{{ (currentMaterial.lossFactor * 100).toFixed(0) }}%</div>
                <div class="result-desc">{{ currentMaterial.name }}材质</div>
              </div>
              <div class="result-item highlight">
                <div class="result-label">实际用量</div>
                <div class="result-value">{{ actualUsage.toFixed(2) }} L</div>
                <div class="result-desc">含损耗的预估用量</div>
              </div>
            </div>

            <div class="purchase-section">
              <h3>🛒 采购参考</h3>
              <div class="package-options">
                <div class="package-item">
                  <span class="package-size">5L装</span>
                  <span class="package-count">需要 {{ package5L }} 桶</span>
                </div>
                <div class="package-item">
                  <span class="package-size">18L装</span>
                  <span class="package-count">需要 {{ package18L }} 桶</span>
                </div>
              </div>
              <div class="purchase-tip">
                💡 建议：可根据实际情况多购买5-10%作为备用
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaintCalculator',
  data() {
    return {
      wallLength: 5,
      wallHeight: 2.8,
      coatCount: 2,
      spreadRate: 10,
      selectedMaterial: 'smooth',
      materials: [
        {
          id: 'smooth',
          name: '平滑墙面',
          icon: '🏠',
          lossFactor: 0.10,
          description: '新刮腻子墙面、打磨光滑的墙面，吸漆量较低，损耗较小。'
        },
        {
          id: 'rough',
          name: '粗糙墙面',
          icon: '🧱',
          lossFactor: 0.20,
          description: '水泥墙面、未打磨的旧墙面，表面粗糙，吸漆量较大。'
        },
        {
          id: 'textured',
          name: '纹理墙面',
          icon: '🌀',
          lossFactor: 0.30,
          description: '艺术涂料、硅藻泥、真石漆等有凹凸纹理的墙面。'
        },
        {
          id: 'wood',
          name: '木质墙面',
          icon: '🪵',
          lossFactor: 0.15,
          description: '护墙板、木饰面等木质材料，需要考虑木材的吸油性。'
        },
        {
          id: 'brick',
          name: '砖墙/石材',
          icon: '🏛️',
          lossFactor: 0.35,
          description: '红砖、文化石、瓷砖等多孔材质，吸漆量最高。'
        }
      ]
    }
  },
  computed: {
    wallArea() {
      return (this.wallLength || 0) * (this.wallHeight || 0)
    },
    currentMaterial() {
      return this.materials.find(m => m.id === this.selectedMaterial) || this.materials[0]
    },
    theoreticalUsage() {
      if (!this.wallArea || !this.coatCount || !this.spreadRate) return 0
      return (this.wallArea * this.coatCount) / this.spreadRate
    },
    actualUsage() {
      return this.theoreticalUsage * (1 + this.currentMaterial.lossFactor)
    },
    package5L() {
      return Math.ceil(this.actualUsage / 5)
    },
    package18L() {
      return Math.ceil(this.actualUsage / 18)
    }
  }
}
</script>

<style lang="less" scoped>
.calculator-container {
  width: 100%;
  max-width: 1200px;
  height: calc(100vh - 160px);
}

.calculator-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  height: 100%;
}

.card-layout {
  display: flex;
  height: 100%;
}

.params-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #f0f0f0;
  overflow-y: auto;
  min-height: 0;
}

.result-panel {
  flex: 0 0 420px;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
  overflow-y: auto;
}

.card-section {
  padding: 30px;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  &.result-section {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.input-item {
  label {
    display: block;
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
    font-weight: 500;
  }

  input {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #e8e8e8;
    border-radius: 10px;
    font-size: 16px;
    transition: all 0.3s ease;
    outline: none;

    &:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
  }
}

.coat-buttons {
  display: flex;
  gap: 8px;
  margin-top: 10px;

  button {
    flex: 1;
    padding: 8px;
    border: 2px solid #e8e8e8;
    background: white;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s ease;

    &:hover {
      border-color: #667eea;
    }

    &.active {
      background: #667eea;
      border-color: #667eea;
      color: white;
    }
  }
}

.rate-hint {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.area-display {
  margin-top: 20px;
  padding: 15px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  .area-label {
    color: rgba(255, 255, 255, 0.9);
    font-size: 14px;
  }

  .area-value {
    color: white;
    font-size: 24px;
    font-weight: 700;
  }
}

.material-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

.material-card {
  padding: 15px 10px;
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #667eea;
    transform: translateY(-2px);
  }

  &.active {
    border-color: #667eea;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  }

  .material-icon {
    font-size: 28px;
    margin-bottom: 8px;
  }

  .material-name {
    font-size: 13px;
    font-weight: 500;
    color: #333;
    margin-bottom: 4px;
  }

  .material-loss {
    font-size: 11px;
    color: #667eea;
    font-weight: 600;
  }
}

.material-desc {
  margin-top: 15px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 13px;
  color: #666;
  line-height: 1.6;
}

.result-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
  margin-bottom: 25px;
}

.result-item {
  background: white;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

  &.highlight {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    
    .result-label,
    .result-desc {
      color: rgba(255, 255, 255, 0.9);
    }

    .result-value {
      color: white;
    }
  }

  .result-label {
    font-size: 13px;
    color: #666;
    margin-bottom: 8px;
  }

  .result-value {
    font-size: 28px;
    font-weight: 700;
    color: #333;
    margin-bottom: 6px;

    &.loss {
      color: #f59e0b;
    }
  }

  .result-desc {
    font-size: 11px;
    color: #999;
  }
}

.purchase-section {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-top: auto;

  h3 {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 15px;
  }
}

.package-options {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.package-item {
  flex: 1;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
  text-align: center;

  .package-size {
    display: block;
    font-size: 14px;
    color: #666;
    margin-bottom: 6px;
  }

  .package-count {
    display: block;
    font-size: 20px;
    font-weight: 700;
    color: #667eea;
  }
}

.purchase-tip {
  padding: 12px;
  background: #fffbeb;
  border: 1px solid #fef3c7;
  border-radius: 8px;
  font-size: 13px;
  color: #92400e;
  line-height: 1.5;
}

@media (max-width: 1024px) {
  .calculator-container {
    height: auto;
    min-height: calc(100vh - 160px);
  }

  .calculator-card {
    height: auto;
  }

  .card-layout {
    flex-direction: column;
    height: auto;
  }

  .params-panel {
    border-right: none;
    border-bottom: 1px solid #f0f0f0;
    overflow-y: visible;
  }

  .result-panel {
    flex: 1;
    overflow-y: visible;
  }

  .result-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .material-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .input-group {
    grid-template-columns: 1fr;
  }

  .material-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .result-grid {
    grid-template-columns: 1fr;
  }

  .package-options {
    flex-direction: column;
  }

  .card-section {
    padding: 20px;
  }
}
</style>
