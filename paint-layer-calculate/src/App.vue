<template>
  <div class="app-container">
    <header class="app-header">
      <h1>🎨 墙面油漆涂刷用量计算器</h1>
      <p class="subtitle">精准计算，科学采购</p>
    </header>
    <main class="app-main">
      <PaintCalculator />
    </main>
    <footer class="app-footer">
      <p>© 2024 油漆用量计算工具 | 让装修更省心</p>
    </footer>
  </div>
</template>

<script>
import PaintCalculator from './components/PaintCalculator.vue'

export default {
  name: 'App',
  components: {
    PaintCalculator
  }
}
</script>

<style lang="less" scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.app-header {
  text-align: center;
  padding: 40px 20px 20px;
  color: white;

  h1 {
    font-size: 32px;
    margin-bottom: 10px;
    font-weight: 600;
  }

  .subtitle {
    font-size: 16px;
    opacity: 0.9;
  }
}

.app-main {
  flex: 1;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.app-footer {
  text-align: center;
  padding: 20px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}
</style>
