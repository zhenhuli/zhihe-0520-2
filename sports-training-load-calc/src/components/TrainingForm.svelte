<script>
  import { SPORTS_TYPES, HEART_RATE_ZONES, RPE_LEVELS, calculateMaxHeartRate } from '../lib/trainingLoad.js'
  
  export let formData = {
    sportType: 'running',
    duration: 30,
    heartRateZone: 'zone3',
    rpe: 10,
    age: 30,
    weight: 70
  }
  
  function updateField(field, value) {
    formData = { ...formData, [field]: value }
  }
  
  function handleSubmit(e) {
    e.preventDefault()
    dispatch('calculate', formData)
  }
  
  function getHeartRateRange(zone) {
    const maxHr = calculateMaxHeartRate(formData.age)
    const minHr = Math.round(maxHr * (zone.min / 100))
    const maxHrZone = Math.round(maxHr * (zone.max / 100))
    return `${minHr}-${maxHrZone} bpm`
  }
  
  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()
</script>

<form class="form" on:submit={handleSubmit}>
  <div class="formGroup">
    <label class="label">运动项目</label>
    <select 
      class="select" 
      value={formData.sportType} 
      on:change={(e) => updateField('sportType', e.target.value)}
    >
      {#each SPORTS_TYPES as sport (sport.id)}
        <option value={sport.id}>{sport.name}</option>
      {/each}
    </select>
  </div>
  
  <div class="formGroup">
    <label class="label">运动时长（分钟）</label>
    <input 
      type="number" 
      class="input" 
      min="1" 
      max="480"
      value={formData.duration} 
      on:input={(e) => updateField('duration', parseInt(e.target.value) || 0)}
    />
    <input 
      type="range" 
      class="range" 
      min="5" 
      max="240" 
      step="5"
      value={formData.duration} 
      on:input={(e) => updateField('duration', parseInt(e.target.value))}
    />
    <div class="rangeValue">{formData.duration} 分钟</div>
  </div>
  
  <div class="formGroup">
    <label class="label">心率区间 <span class="labelHint">（基于年龄 {formData.age} 岁，最大心率约 {calculateMaxHeartRate(formData.age)} bpm）</span></label>
    <div class="zoneGrid">
      {#each HEART_RATE_ZONES as zone (zone.id)}
        <button 
          type="button"
          class={`zoneBtn ${formData.heartRateZone === zone.id ? 'active' : ''}`}
          on:click={() => updateField('heartRateZone', zone.id)}
        >
          <div class="zoneHeader">
            <div class="zoneName">{zone.name}</div>
            <div class="zoneBpm">{getHeartRateRange(zone)}</div>
          </div>
          <div class="zoneDesc">{zone.description}</div>
        </button>
      {/each}
    </div>
  </div>
  
  <div class="formGroup">
    <label class="label">自感疲劳程度 (RPE)</label>
    <select 
      class="select" 
      value={formData.rpe} 
      on:change={(e) => updateField('rpe', parseInt(e.target.value))}
    >
      {#each RPE_LEVELS as level (level.value)}
        <option value={level.value}>{level.label} - {level.description}</option>
      {/each}
    </select>
    <input 
      type="range" 
      class="range" 
      min="6" 
      max="20" 
      step="1"
      value={formData.rpe} 
      on:input={(e) => updateField('rpe', parseInt(e.target.value))}
    />
    <div class="rangeValue">RPE: {formData.rpe}</div>
  </div>
  
  <div class="formRow">
    <div class="formGroup">
      <label class="label">年龄</label>
      <input 
        type="number" 
        class="input" 
        min="10" 
        max="100"
        value={formData.age} 
        on:input={(e) => updateField('age', parseInt(e.target.value) || 30)}
      />
    </div>
    <div class="formGroup">
      <label class="label">体重 (kg)</label>
      <input 
        type="number" 
        class="input" 
        min="30" 
        max="200"
        value={formData.weight} 
        on:input={(e) => updateField('weight', parseInt(e.target.value) || 70)}
      />
    </div>
  </div>
  
  <button type="submit" class="submitBtn">计算训练负荷</button>
</form>

<style module>
  .form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .formGroup {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .formRow {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  
  .label {
    font-weight: 600;
    color: #333;
    font-size: 0.95rem;
  }
  
  .labelHint {
    font-weight: 400;
    color: #666;
    font-size: 0.8rem;
  }
  
  .input,
  .select {
    padding: 0.75rem 1rem;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.2s ease;
    background: white;
  }
  
  .input:focus,
  .select:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }
  
  .range {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: #e0e0e0;
    outline: none;
    -webkit-appearance: none;
  }
  
  .range::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #4f46e5;
    cursor: pointer;
    transition: transform 0.2s ease;
  }
  
  .range::-webkit-slider-thumb:hover {
    transform: scale(1.1);
  }
  
  .rangeValue {
    text-align: center;
    color: #666;
    font-size: 0.875rem;
    font-weight: 500;
  }
  
  .zoneGrid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  @media (min-width: 768px) {
    .zoneGrid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  .zoneBtn {
    padding: 0.75rem 1rem;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    text-align: left;
    transition: all 0.2s ease;
  }
  
  .zoneBtn:hover {
    border-color: #4f46e5;
    background: rgba(79, 70, 229, 0.05);
  }
  
  .zoneBtn.active {
    border-color: #4f46e5;
    background: rgba(79, 70, 229, 0.1);
  }
  
  .zoneHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
  }
  
  .zoneName {
    font-weight: 600;
    color: #333;
    font-size: 0.9rem;
  }
  
  .zoneBpm {
    font-weight: 700;
    color: #4f46e5;
    font-size: 0.8rem;
    background: rgba(79, 70, 229, 0.1);
    padding: 0.125rem 0.5rem;
    border-radius: 4px;
    white-space: nowrap;
  }
  
  .zoneBtn.active .zoneBpm {
    background: #4f46e5;
    color: white;
  }
  
  .zoneDesc {
    color: #666;
    font-size: 0.8rem;
  }
  
  .submitBtn {
    padding: 1rem 2rem;
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3);
  }
  
  .submitBtn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
  }
  
  .submitBtn:active {
    transform: translateY(0);
  }
</style>
