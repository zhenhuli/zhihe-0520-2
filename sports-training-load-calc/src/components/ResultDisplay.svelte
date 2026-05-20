<script>
  export let result = null
  
  function getLoadProgress(load) {
    const maxLoad = 1200
    const percent = Math.min((load / maxLoad) * 100, 100)
    return percent
  }
  
  function getProgressColor(color) {
    switch (color) {
      case 'success':
        return '#10b981'
      case 'warning':
        return '#f59e0b'
      case 'danger':
        return '#ef4444'
      default:
        return '#4f46e5'
    }
  }
</script>

{#if result}
  <div class="resultContainer">
    <div class="resultHeader">
      <h2 class="resultTitle">训练负荷分析结果</h2>
      {#if result.isOverloaded}
        <div class="warningBadge">⚠️ 训练强度超标</div>
      {/if}
    </div>
    
    <div class="mainScore">
      <div class="scoreCircle" style="--progress-color: {getProgressColor(result.color)};">
        <svg class="progressRing" viewBox="0 0 120 120">
          <circle class="progressBg" cx="60" cy="60" r="54" />
          <circle 
            class="progressFg" 
            cx="60" 
            cy="60" 
            r="54"
            stroke-dasharray="{getLoadProgress(result.totalLoad) * 3.3929} 339.29"
            style="stroke: var(--progress-color);"
          />
        </svg>
        <div class="scoreContent">
          <div class="scoreValue">{result.totalLoad}</div>
          <div class="scoreLabel">总负荷值</div>
        </div>
      </div>
      <div class={`intensityBadge ${result.color}`}>
        {result.intensityLevel}
      </div>
    </div>
    
    <div class="statsGrid">
      <div class="statCard">
        <div class="statIcon">🔥</div>
        <div class="statInfo">
          <div class="statValue">{result.caloriesBurned}</div>
          <div class="statLabel">消耗卡路里 (kcal)</div>
        </div>
      </div>
      <div class="statCard">
        <div class="statIcon">💪</div>
        <div class="statInfo">
          <div class="statValue">{result.rpeLoad}</div>
          <div class="statLabel">RPE 负荷</div>
        </div>
      </div>
      <div class="statCard">
        <div class="statIcon">❤️</div>
        <div class="statInfo">
          <div class="statValue">{result.trimp}</div>
          <div class="statLabel">TRIMP 训练冲量</div>
        </div>
      </div>
    </div>
    
    {#if result.recommendations.warnings.length > 0}
      <div class="warningsSection">
        <h3 class="sectionTitle">⚠️ 注意事项</h3>
        <ul class="warningList">
          {#each result.recommendations.warnings as warning, index}
            <li class="warningItem">{warning}</li>
          {/each}
        </ul>
      </div>
    {/if}
    
    <div class="recommendationsSection">
      <h3 class="sectionTitle">📋 恢复建议</h3>
      
      <div class="adviceCard">
        <div class="adviceIcon">😴</div>
        <div class="adviceContent">
          <div class="adviceTitle">休息建议</div>
          <div class="adviceText">{result.recommendations.restAdvice}</div>
        </div>
      </div>
      
      <div class="adviceCard">
        <div class="adviceIcon">🥗</div>
        <div class="adviceContent">
          <div class="adviceTitle">营养建议</div>
          <div class="adviceText">{result.recommendations.nutritionAdvice}</div>
        </div>
      </div>
      
      <div class="adviceCard">
        <div class="adviceIcon">🏃</div>
        <div class="adviceContent">
          <div class="adviceTitle">后续训练安排</div>
          <div class="adviceText">{result.recommendations.nextTraining}</div>
        </div>
      </div>
    </div>
    
    <div class="loadScale">
      <h3 class="sectionTitle">负荷参考标尺</h3>
      <div class="scaleBar">
        <div class="scaleSegment low" title="低强度">
          <span>0-200</span>
        </div>
        <div class="scaleSegment mediumLow" title="中低强度">
          <span>200-400</span>
        </div>
        <div class="scaleSegment medium" title="中等强度">
          <span>400-600</span>
        </div>
        <div class="scaleSegment mediumHigh" title="中高强度">
          <span>600-800</span>
        </div>
        <div class="scaleSegment high" title="高强度">
          <span>800-1000</span>
        </div>
        <div class="scaleSegment extreme" title="极高强度">
          <span>1000+</span>
        </div>
        <div 
          class="scaleIndicator" 
          style="left: {getLoadProgress(result.totalLoad)}%;"
        >
          <div class="indicatorArrow">▼</div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style module>
  .resultContainer {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    animation: fadeIn 0.5s ease;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .resultHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  
  .resultTitle {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
  }
  
  .warningBadge {
    background: #fef2f2;
    color: #dc2626;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-weight: 600;
    font-size: 0.875rem;
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
  
  .mainScore {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    background: linear-gradient(135deg, #f8fafc, #f1f5f9);
    border-radius: 16px;
  }
  
  .scoreCircle {
    position: relative;
    width: 160px;
    height: 160px;
  }
  
  .progressRing {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }
  
  .progressBg {
    fill: none;
    stroke: #e2e8f0;
    stroke-width: 8;
  }
  
  .progressFg {
    fill: none;
    stroke-width: 8;
    stroke-linecap: round;
    transition: stroke-dasharray 0.5s ease;
  }
  
  .scoreContent {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
  }
  
  .scoreValue {
    font-size: 2.5rem;
    font-weight: 800;
    color: #1f2937;
    line-height: 1;
  }
  
  .scoreLabel {
    font-size: 0.875rem;
    color: #64748b;
    margin-top: 0.25rem;
  }
  
  .intensityBadge {
    padding: 0.5rem 1.25rem;
    border-radius: 25px;
    font-weight: 700;
    font-size: 1rem;
  }
  
  .intensityBadge.success {
    background: #d1fae5;
    color: #065f46;
  }
  
  .intensityBadge.warning {
    background: #fef3c7;
    color: #92400e;
  }
  
  .intensityBadge.danger {
    background: #fee2e2;
    color: #991b1b;
  }
  
  .statsGrid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }
  
  @media (max-width: 640px) {
    .statsGrid {
      grid-template-columns: 1fr;
    }
  }
  
  .statCard {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .statIcon {
    font-size: 2rem;
  }
  
  .statValue {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
  }
  
  .statLabel {
    font-size: 0.75rem;
    color: #64748b;
  }
  
  .sectionTitle {
    font-size: 1.1rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 0.75rem 0;
  }
  
  .warningsSection {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 12px;
    padding: 1rem;
  }
  
  .warningList {
    margin: 0;
    padding-left: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .warningItem {
    color: #991b1b;
    font-size: 0.9rem;
  }
  
  .recommendationsSection {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .adviceCard {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #4f46e5;
  }
  
  .adviceIcon {
    font-size: 2rem;
    flex-shrink: 0;
  }
  
  .adviceTitle {
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 0.25rem;
  }
  
  .adviceText {
    color: #4b5563;
    font-size: 0.9rem;
    line-height: 1.5;
  }
  
  .loadScale {
    padding-top: 0.5rem;
  }
  
  .scaleBar {
    position: relative;
    display: flex;
    height: 40px;
    border-radius: 8px;
    overflow: hidden;
    margin-top: 0.5rem;
  }
  
  .scaleSegment {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 600;
    color: white;
  }
  
  .scaleSegment.low { background: #10b981; }
  .scaleSegment.mediumLow { background: #34d399; }
  .scaleSegment.medium { background: #fbbf24; }
  .scaleSegment.mediumHigh { background: #f97316; }
  .scaleSegment.high { background: #ef4444; }
  .scaleSegment.extreme { background: #991b1b; }
  
  .scaleIndicator {
    position: absolute;
    top: -20px;
    transform: translateX(-50%);
    transition: left 0.5s ease;
  }
  
  .indicatorArrow {
    color: #1f2937;
    font-size: 1.2rem;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }
</style>
