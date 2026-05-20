<script>
  import TrainingForm from './components/TrainingForm.svelte'
  import ResultDisplay from './components/ResultDisplay.svelte'
  import { calculateTrainingLoad } from './lib/trainingLoad.js'
  
  let result = null
  let showResult = false
  
  function handleCalculate(formData) {
    result = calculateTrainingLoad(formData)
    showResult = true
  }
  
  function resetForm() {
    result = null
    showResult = false
  }
</script>

<div class="app">
  <header class="header">
    <div class="headerContent">
      <div class="logo">
        <span class="logoIcon">🏋️</span>
        <h1 class="title">运动训练负荷计算器</h1>
      </div>
      <p class="subtitle">科学评估训练强度，智能规划恢复方案</p>
    </div>
  </header>
  
  <main class="main">
    <div class="container">
      {#if !showResult}
        <div class="formSection">
          <div class="card">
            <TrainingForm on:calculate={(e) => handleCalculate(e.detail)} />
          </div>
        </div>
      {:else}
        <div class="resultSection">
          <ResultDisplay {result} />
          <button class="resetBtn" on:click={resetForm}>
            ← 返回重新计算
          </button>
        </div>
      {/if}
    </div>
  </main>
  
  <footer class="footer">
    <p>科学训练，健康运动 | 数据仅供参考，请根据身体实际情况调整</p>
  </footer>
</div>

<style module>
  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%);
  }
  
  .header {
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    color: white;
    padding: 2rem 1rem;
    text-align: center;
    box-shadow: 0 4px 20px rgba(79, 70, 229, 0.2);
  }
  
  .headerContent {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
  }
  
  .logoIcon {
    font-size: 2.5rem;
  }
  
  .title {
    font-size: 2rem;
    font-weight: 800;
    margin: 0;
    letter-spacing: -0.02em;
  }
  
  .subtitle {
    font-size: 1.05rem;
    opacity: 0.9;
    margin: 0;
  }
  
  .main {
    flex: 1;
    padding: 2rem 1rem;
  }
  
  .container {
    max-width: 700px;
    margin: 0 auto;
  }
  
  .card {
    background: white;
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  }
  
  .formSection {
    animation: slideUp 0.5s ease;
  }
  
  .resultSection {
    animation: fadeIn 0.5s ease;
  }
  
  .resetBtn {
    margin-top: 1.5rem;
    padding: 0.875rem 1.5rem;
    background: white;
    color: #4f46e5;
    border: 2px solid #4f46e5;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .resetBtn:hover {
    background: #4f46e5;
    color: white;
  }
  
  .footer {
    background: #1f2937;
    color: #9ca3af;
    padding: 1.5rem 1rem;
    text-align: center;
    font-size: 0.875rem;
  }
  
  .footer p {
    margin: 0;
  }
  
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @media (max-width: 640px) {
    .header {
      padding: 1.5rem 1rem;
    }
    
    .title {
      font-size: 1.5rem;
    }
    
    .subtitle {
      font-size: 0.95rem;
    }
    
    .card {
      padding: 1.25rem;
    }
    
    .main {
      padding: 1rem 0.5rem;
    }
  }
</style>
