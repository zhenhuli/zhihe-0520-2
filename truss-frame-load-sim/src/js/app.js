class TrussSimulation {
  constructor() {
    this.canvas = document.getElementById('trussCanvas');
    this.physics = new TrussPhysics({
      damping: 0.15,
      iterations: 15
    });
    this.generator = new TrussGenerator(this.physics);
    this.renderer = new TrussRenderer(this.canvas);
    
    this.trussType = 'triangular';
    this.trussInfo = null;
    this.loadMagnitude = 0;
    this.loadPoints = 3;
    this.segmentCount = 4;
    this.memberThickness = 4;
    this.connectionType = 'pin';
    this.deformationScale = 10;
    this.maxLoadCapacity = 100;
    this.isAutoTesting = false;
    this.autoTestInterval = null;
    
    this.init();
  }

  init() {
    this.resizeCanvas();
    this.generateTruss();
    this.setupEventListeners();
    this.animate();
    
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    const container = this.canvas.parentElement;
    const width = container.clientWidth;
    const height = 600;
    this.renderer.resize(width, height);
  }

  generateTruss() {
    const canvasWidth = this.renderer.width;
    const canvasHeight = this.renderer.height;
    
    const span = Math.min(canvasWidth * 0.7, 700);
    const height = this.trussType === 'triangular' ? span * 0.35 : span * 0.2;
    const x = (canvasWidth - span) / 2;
    const y = canvasHeight * 0.65;
    
    const stiffnessBase = 500 + this.memberThickness * 200;
    const yieldStrength = 40 + this.memberThickness * 15;
    
    const connectionMultiplier = this.connectionType === 'rigid' ? 1.5 : 1;
    
    this.trussInfo = this.generator.generate(this.trussType, {
      span,
      height,
      segments: this.segmentCount,
      x,
      y,
      stiffness: stiffnessBase * connectionMultiplier,
      yieldStrength: yieldStrength * connectionMultiplier
    });
    
    this.maxLoadCapacity = this.calculateMaxLoadCapacity();
    this.updateLoadDisplay();
  }

  calculateMaxLoadCapacity() {
    const baseCapacity = 20 + this.memberThickness * 8 + this.segmentCount * 5;
    const connectionBonus = this.connectionType === 'rigid' ? 1.3 : 1;
    return Math.floor(baseCapacity * connectionBonus);
  }

  applyLoad() {
    this.physics.reset();
    
    if (this.trussInfo && this.trussInfo.loadNodes) {
      const loadPerPoint = this.loadMagnitude / Math.max(this.loadPoints, 1);
      this.generator.applyLoad(this.trussInfo.loadNodes, loadPerPoint, this.loadPoints);
    }
  }

  update() {
    this.applyLoad();
    this.physics.update(0.5);
  }

  render() {
    this.renderer.memberThickness = this.memberThickness;
    this.renderer.deformationScale = this.deformationScale;
    this.renderer.render(this.physics, this.trussInfo);
    this.updateStatusDisplay();
  }

  animate() {
    this.update();
    this.render();
    requestAnimationFrame(() => this.animate());
  }

  updateStatusDisplay() {
    const statusBadge = document.getElementById('statusBadge');
    const statusText = document.getElementById('statusText');
    
    const maxStress = Math.max(...this.physics.members.map(m => m.stress), 0);
    const hasFailed = this.physics.hasFailed();
    const loadRatio = this.loadMagnitude / this.maxLoadCapacity;
    
    statusBadge.className = 'status-badge';
    
    if (hasFailed) {
      statusBadge.classList.add('failed');
      statusText.textContent = '结构失效';
    } else if (loadRatio > 0.9 || maxStress > 70) {
      statusBadge.classList.add('danger');
      statusText.textContent = '危险';
    } else if (loadRatio > 0.6 || maxStress > 40) {
      statusBadge.classList.add('warning');
      statusText.textContent = '警告';
    } else {
      statusText.textContent = '稳定';
    }
    
    this.updateInfoPanel();
  }

  updateInfoPanel() {
    const maxCompression = this.physics.getMaxCompression();
    const maxTension = this.physics.getMaxTension();
    const maxDisplacement = this.physics.getMaxDisplacement();
    
    const safetyFactor = this.loadMagnitude > 0 
      ? Math.max(0, (this.maxLoadCapacity - this.loadMagnitude) / this.loadMagnitude).toFixed(1)
      : '∞';
    
    document.getElementById('maxCompression').textContent = maxCompression.toFixed(1) + ' kN';
    document.getElementById('maxTension').textContent = maxTension.toFixed(1) + ' kN';
    document.getElementById('maxDisplacement').textContent = maxDisplacement.toFixed(1) + ' mm';
    document.getElementById('safetyFactor').textContent = safetyFactor;
  }

  updateLoadDisplay() {
    const loadPercent = Math.min((this.loadMagnitude / this.maxLoadCapacity) * 100, 100);
    
    document.getElementById('loadValue').textContent = this.loadMagnitude + ' kN';
    document.getElementById('loadBarFill').style.width = loadPercent + '%';
    document.getElementById('loadMax').textContent = '最大承重: ' + this.maxLoadCapacity + ' kN';
    document.getElementById('loadSliderValue').textContent = this.loadMagnitude + ' kN';
  }

  setupEventListeners() {
    document.querySelectorAll('.truss-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.truss-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.trussType = e.currentTarget.dataset.type;
        this.generateTruss();
      });
    });
    
    document.getElementById('loadSlider').addEventListener('input', (e) => {
      this.loadMagnitude = parseInt(e.target.value);
      this.updateLoadDisplay();
    });
    
    document.getElementById('loadPointsSlider').addEventListener('input', (e) => {
      this.loadPoints = parseInt(e.target.value);
      document.getElementById('loadPointsSliderValue').textContent = this.loadPoints;
    });
    
    document.getElementById('memberThicknessSlider').addEventListener('input', (e) => {
      this.memberThickness = parseFloat(e.target.value);
      document.getElementById('memberThicknessSliderValue').textContent = this.memberThickness;
      this.generateTruss();
    });
    
    document.getElementById('segmentCountSlider').addEventListener('input', (e) => {
      this.segmentCount = parseInt(e.target.value);
      document.getElementById('segmentCountSliderValue').textContent = this.segmentCount;
      this.generateTruss();
    });
    
    document.querySelectorAll('input[name="connection"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.connectionType = e.target.value;
        this.generateTruss();
      });
    });
    
    document.getElementById('showForces').addEventListener('change', (e) => {
      this.renderer.showForces = e.target.checked;
    });
    
    document.getElementById('showDeformation').addEventListener('change', (e) => {
      this.renderer.showDeformation = e.target.checked;
    });
    
    document.getElementById('showStress').addEventListener('change', (e) => {
      this.renderer.showStress = e.target.checked;
    });
    
    document.getElementById('showLabels').addEventListener('change', (e) => {
      this.renderer.showLabels = e.target.checked;
    });
    
    document.getElementById('deformationScaleSlider').addEventListener('input', (e) => {
      this.deformationScale = parseInt(e.target.value);
      document.getElementById('deformationScaleSliderValue').textContent = this.deformationScale + 'x';
    });
    
    document.getElementById('resetBtn').addEventListener('click', () => {
      this.stopAutoTest();
      document.getElementById('loadSlider').value = 0;
      this.loadMagnitude = 0;
      this.generateTruss();
      this.updateLoadDisplay();
    });
    
    document.getElementById('testBtn').addEventListener('click', () => {
      this.toggleAutoTest();
    });
  }

  toggleAutoTest() {
    const testBtn = document.getElementById('testBtn');
    
    if (this.isAutoTesting) {
      this.stopAutoTest();
      testBtn.textContent = '自动测试';
      testBtn.classList.remove('btn-primary');
      testBtn.classList.add('btn-secondary');
    } else {
      this.startAutoTest();
      testBtn.textContent = '停止测试';
      testBtn.classList.remove('btn-secondary');
      testBtn.classList.add('btn-primary');
    }
  }

  startAutoTest() {
    this.isAutoTesting = true;
    let currentLoad = 0;
    const step = 2;
    
    this.autoTestInterval = setInterval(() => {
      if (currentLoad >= this.maxLoadCapacity * 1.2 || this.physics.hasFailed()) {
        this.stopAutoTest();
        document.getElementById('testBtn').textContent = '自动测试';
        document.getElementById('testBtn').classList.remove('btn-primary');
        document.getElementById('testBtn').classList.add('btn-secondary');
        return;
      }
      
      currentLoad += step;
      this.loadMagnitude = Math.min(currentLoad, this.maxLoadCapacity * 1.2);
      document.getElementById('loadSlider').value = this.loadMagnitude;
      this.updateLoadDisplay();
    }, 200);
  }

  stopAutoTest() {
    this.isAutoTesting = false;
    if (this.autoTestInterval) {
      clearInterval(this.autoTestInterval);
      this.autoTestInterval = null;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new TrussSimulation();
});
