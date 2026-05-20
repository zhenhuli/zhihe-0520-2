class Node {
  constructor(x, y, options = {}) {
    this.x = x;
    this.y = y;
    this.originalX = x;
    this.originalY = y;
    this.vx = 0;
    this.vy = 0;
    this.fx = 0;
    this.fy = 0;
    this.loadX = 0;
    this.loadY = 0;
    this.fixed = options.fixed || false;
    this.supportX = options.supportX || false;
    this.supportY = options.supportY || false;
    this.id = options.id || '';
    this.displacement = 0;
    this.stress = 0;
  }

  applyLoad(fx, fy) {
    this.loadX += fx;
    this.loadY += fy;
  }

  resetForces() {
    this.fx = this.loadX;
    this.fy = this.loadY;
    this.vx *= 0.98;
    this.vy *= 0.98;
  }

  update(dt, damping = 0.1) {
    if (this.fixed) {
      this.vx = 0;
      this.vy = 0;
      return;
    }
    
    if (this.supportX) {
      this.fx = 0;
      this.vx = 0;
    }
    if (this.supportY) {
      this.fy = 0;
      this.vy = 0;
    }
    
    this.vx += this.fx * dt;
    this.vy += this.fy * dt;
    
    this.x += this.vx * damping;
    this.y += this.vy * damping;
    
    this.displacement = Math.sqrt(
      Math.pow(this.x - this.originalX, 2) +
      Math.pow(this.y - this.originalY, 2)
    );
  }

  reset() {
    this.x = this.originalX;
    this.y = this.originalY;
    this.vx = 0;
    this.vy = 0;
    this.fx = 0;
    this.fy = 0;
    this.loadX = 0;
    this.loadY = 0;
    this.displacement = 0;
    this.stress = 0;
  }
}

class Member {
  constructor(nodeA, nodeB, options = {}) {
    this.nodeA = nodeA;
    this.nodeB = nodeB;
    this.originalLength = this.calculateLength();
    this.length = this.originalLength;
    this.stiffness = options.stiffness || 1000;
    this.maxStress = options.maxStress || 100;
    this.force = 0;
    this.stress = 0;
    this.broken = false;
    this.yieldStrength = options.yieldStrength || 80;
  }

  calculateLength() {
    const dx = this.nodeB.x - this.nodeA.x;
    const dy = this.nodeB.y - this.nodeA.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  calculateForce() {
    const dx = this.nodeB.x - this.nodeA.x;
    const dy = this.nodeB.y - this.nodeA.y;
    this.length = Math.sqrt(dx * dx + dy * dy);
    
    const strain = (this.length - this.originalLength) / this.originalLength;
    this.force = strain * this.stiffness;
    this.stress = Math.abs(this.force) / this.originalLength;
    
    if (this.stress > this.yieldStrength) {
      this.broken = true;
    }
    
    return this.force;
  }

  applyForces() {
    if (this.broken) return;
    
    const force = this.calculateForce();
    
    const dx = this.nodeB.x - this.nodeA.x;
    const dy = this.nodeB.y - this.nodeA.y;
    const length = this.length || 0.001;
    
    const fx = (dx / length) * force;
    const fy = (dy / length) * force;
    
    this.nodeA.fx += fx;
    this.nodeA.fy += fy;
    this.nodeB.fx -= fx;
    this.nodeB.fy -= fy;
  }

  getStressColor() {
    if (this.broken) return '#6b7280';
    
    const normalizedStress = Math.min(this.stress / this.yieldStrength, 1);
    
    if (this.force < 0) {
      const r = Math.floor(59 + (239 - 59) * normalizedStress);
      const g = Math.floor(130 - 130 * normalizedStress);
      const b = Math.floor(246 - 246 * normalizedStress);
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      const r = Math.floor(239 * normalizedStress);
      const g = Math.floor(68 - 68 * normalizedStress);
      const b = Math.floor(68 - 68 * normalizedStress);
      return `rgb(239, ${g}, ${b})`;
    }
  }

  reset() {
    this.length = this.originalLength;
    this.force = 0;
    this.stress = 0;
    this.broken = false;
  }
}

class TrussPhysics {
  constructor(options = {}) {
    this.nodes = [];
    this.nodesMap = new Map();
    this.members = [];
    this.gravity = options.gravity || 0;
    this.damping = options.damping || 0.1;
    this.iterations = options.iterations || 10;
  }

  addNode(x, y, nodeOptions = {}) {
    const node = new Node(x, y, nodeOptions);
    this.nodes.push(node);
    if (nodeOptions.id) {
      this.nodesMap.set(nodeOptions.id, node);
    }
    return node;
  }

  addMember(nodeA, nodeB, memberOptions = {}) {
    const member = new Member(nodeA, nodeB, memberOptions);
    this.members.push(member);
    return member;
  }

  getNodeById(id) {
    return this.nodesMap.get(id);
  }

  setGravity(gravity) {
    this.gravity = gravity;
  }

  applyGravity() {
    for (const node of this.nodes) {
      if (!node.fixed) {
        node.fy += this.gravity;
      }
    }
  }

  update(dt = 1) {
    for (let i = 0; i < this.iterations; i++) {
      for (const node of this.nodes) {
        node.resetForces();
      }
      
      this.applyGravity();
      
      for (const member of this.members) {
        member.applyForces();
      }
      
      for (const node of this.nodes) {
        node.update(dt, this.damping);
      }
    }
    
    this.calculateStress();
  }

  calculateStress() {
    let maxDisplacement = 0;
    let maxStress = 0;
    
    for (const member of this.members) {
      if (member.stress > maxStress) {
        maxStress = member.stress;
      }
    }
    
    for (const node of this.nodes) {
      if (node.displacement > maxDisplacement) {
        maxDisplacement = node.displacement;
      }
    }
    
    return { maxDisplacement, maxStress };
  }

  getMaxCompression() {
    let maxCompression = 0;
    for (const member of this.members) {
      if (member.force < 0 && Math.abs(member.force) > maxCompression) {
        maxCompression = Math.abs(member.force);
      }
    }
    return maxCompression;
  }

  getMaxTension() {
    let maxTension = 0;
    for (const member of this.members) {
      if (member.force > maxTension) {
        maxTension = member.force;
      }
    }
    return maxTension;
  }

  getMaxDisplacement() {
    let maxDisp = 0;
    for (const node of this.nodes) {
      if (node.displacement > maxDisp) {
        maxDisp = node.displacement;
      }
    }
    return maxDisp;
  }

  hasFailed() {
    for (const member of this.members) {
      if (member.broken) {
        return true;
      }
    }
    return false;
  }

  reset() {
    for (const node of this.nodes) {
      node.reset();
    }
    for (const member of this.members) {
      member.reset();
    }
  }

  clear() {
    this.nodes = [];
    this.nodesMap.clear();
    this.members = [];
  }
}

window.TrussPhysics = TrussPhysics;
window.Node = Node;
window.Member = Member;
