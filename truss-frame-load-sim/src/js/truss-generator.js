class TrussGenerator {
  constructor(physics) {
    this.physics = physics;
  }

  generateTriangularTruss(options = {}) {
    this.physics.clear();
    
    const {
      span = 600,
      height = 200,
      segments = 4,
      x = 100,
      y = 350,
      stiffness = 1000,
      yieldStrength = 80
    } = options;
    
    const segmentWidth = span / segments;
    const bottomChordY = y;
    const topChordY = y - height;
    
    const bottomNodes = [];
    const topNodes = [];
    
    const leftSupport = this.physics.addNode(x, bottomChordY, {
      id: 'support_left',
      fixed: false,
      supportX: true,
      supportY: true
    });
    bottomNodes.push(leftSupport);
    
    for (let i = 1; i < segments; i++) {
      const nodeX = x + i * segmentWidth;
      const node = this.physics.addNode(nodeX, bottomChordY, {
        id: `bottom_${i}`
      });
      bottomNodes.push(node);
    }
    
    const rightSupport = this.physics.addNode(x + span, bottomChordY, {
      id: 'support_right',
      fixed: false,
      supportY: true
    });
    bottomNodes.push(rightSupport);
    
    const apex = this.physics.addNode(x + span / 2, topChordY, {
      id: 'apex'
    });
    topNodes.push(apex);
    
    const memberOptions = { stiffness, yieldStrength };
    
    for (let i = 0; i < bottomNodes.length; i++) {
      this.physics.addMember(bottomNodes[i], apex, memberOptions);
    }
    
    for (let i = 0; i < bottomNodes.length - 1; i++) {
      this.physics.addMember(bottomNodes[i], bottomNodes[i + 1], memberOptions);
    }
    
    const middleLeft = this.physics.addNode(x + span / 4, topChordY + height / 2, {
      id: 'middle_left'
    });
    const middleRight = this.physics.addNode(x + 3 * span / 4, topChordY + height / 2, {
      id: 'middle_right'
    });
    
    this.physics.addMember(leftSupport, middleLeft, memberOptions);
    this.physics.addMember(middleLeft, apex, memberOptions);
    this.physics.addMember(apex, middleRight, memberOptions);
    this.physics.addMember(middleRight, rightSupport, memberOptions);
    
    this.physics.addMember(middleLeft, bottomNodes[1], memberOptions);
    this.physics.addMember(middleRight, bottomNodes[segments - 1], memberOptions);
    
    return {
      type: 'triangular',
      loadNodes: bottomNodes.slice(1, -1),
      supportNodes: [leftSupport, rightSupport],
      span,
      height,
      segments
    };
  }

  generateParallelTruss(options = {}) {
    this.physics.clear();
    
    const {
      span = 600,
      height = 150,
      segments = 4,
      x = 100,
      y = 350,
      stiffness = 1000,
      yieldStrength = 80
    } = options;
    
    const segmentWidth = span / segments;
    const bottomChordY = y;
    const topChordY = y - height;
    
    const bottomNodes = [];
    const topNodes = [];
    
    const leftSupport = this.physics.addNode(x, bottomChordY, {
      id: 'support_left',
      fixed: false,
      supportX: true,
      supportY: true
    });
    bottomNodes.push(leftSupport);
    
    const topLeft = this.physics.addNode(x, topChordY, {
      id: 'top_left'
    });
    topNodes.push(topLeft);
    
    for (let i = 1; i < segments; i++) {
      const nodeX = x + i * segmentWidth;
      const bottomNode = this.physics.addNode(nodeX, bottomChordY, {
        id: `bottom_${i}`
      });
      const topNode = this.physics.addNode(nodeX, topChordY, {
        id: `top_${i}`
      });
      bottomNodes.push(bottomNode);
      topNodes.push(topNode);
    }
    
    const rightSupport = this.physics.addNode(x + span, bottomChordY, {
      id: 'support_right',
      fixed: false,
      supportY: true
    });
    bottomNodes.push(rightSupport);
    
    const topRight = this.physics.addNode(x + span, topChordY, {
      id: 'top_right'
    });
    topNodes.push(topRight);
    
    const memberOptions = { stiffness, yieldStrength };
    
    for (let i = 0; i < bottomNodes.length; i++) {
      this.physics.addMember(bottomNodes[i], topNodes[i], memberOptions);
    }
    
    for (let i = 0; i < bottomNodes.length - 1; i++) {
      this.physics.addMember(bottomNodes[i], bottomNodes[i + 1], memberOptions);
      this.physics.addMember(topNodes[i], topNodes[i + 1], memberOptions);
      
      this.physics.addMember(bottomNodes[i], topNodes[i + 1], memberOptions);
    }
    
    return {
      type: 'parallel',
      loadNodes: bottomNodes.slice(1, -1),
      supportNodes: [leftSupport, rightSupport],
      span,
      height,
      segments
    };
  }

  applyLoad(loadNodes, loadMagnitude, loadPoints = 3) {
    if (!loadNodes || loadNodes.length === 0) return;
    
    const numLoads = Math.min(loadPoints, loadNodes.length);
    const step = Math.floor(loadNodes.length / (numLoads + 1));
    
    for (let i = 0; i < numLoads; i++) {
      const index = Math.min(step * (i + 1), loadNodes.length - 1);
      const node = loadNodes[index];
      node.applyLoad(0, loadMagnitude);
    }
  }

  generate(type, options) {
    if (type === 'triangular') {
      return this.generateTriangularTruss(options);
    } else if (type === 'parallel') {
      return this.generateParallelTruss(options);
    }
    return null;
  }
}

window.TrussGenerator = TrussGenerator;
