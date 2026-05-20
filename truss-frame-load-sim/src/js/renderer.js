class TrussRenderer {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.memberThickness = options.memberThickness || 4;
    this.nodeRadius = options.nodeRadius || 6;
    this.deformationScale = options.deformationScale || 10;
    this.showForces = options.showForces !== undefined ? options.showForces : true;
    this.showDeformation = options.showDeformation !== undefined ? options.showDeformation : true;
    this.showStress = options.showStress !== undefined ? options.showStress : true;
    this.showLabels = options.showLabels !== undefined ? options.showLabels : false;
    this.forceArrowScale = options.forceArrowScale || 0.3;
  }

  resize(width, height) {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
    this.ctx.scale(dpr, dpr);
    this.width = width;
    this.height = height;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawGrid();
  }

  drawGrid() {
    const gridSize = 50;
    this.ctx.strokeStyle = 'rgba(100, 116, 139, 0.1)';
    this.ctx.lineWidth = 1;
    
    for (let x = 0; x < this.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }
    
    for (let y = 0; y < this.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }
  }

  drawMember(member, showDeformed = true) {
    const nodeA = member.nodeA;
    const nodeB = member.nodeB;
    
    let x1, y1, x2, y2;
    
    if (showDeformed && this.showDeformation) {
      const dispScale = this.deformationScale;
      x1 = nodeA.originalX + (nodeA.x - nodeA.originalX) * dispScale;
      y1 = nodeA.originalY + (nodeA.y - nodeA.originalY) * dispScale;
      x2 = nodeB.originalX + (nodeB.x - nodeB.originalX) * dispScale;
      y2 = nodeB.originalY + (nodeB.y - nodeB.originalY) * dispScale;
    } else {
      x1 = nodeA.originalX;
      y1 = nodeA.originalY;
      x2 = nodeB.originalX;
      y2 = nodeB.originalY;
    }
    
    let color = '#4a5568';
    if (this.showStress) {
      color = member.getStressColor();
    }
    
    let lineWidth = this.memberThickness;
    if (member.broken) {
      lineWidth *= 0.5;
      this.ctx.setLineDash([5, 5]);
    } else {
      this.ctx.setLineDash([]);
    }
    
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.lineCap = 'round';
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
    
    this.ctx.setLineDash([]);
    
    if (this.showForces && Math.abs(member.force) > 0.1 && !member.broken) {
      this.drawForceArrow(x1, y1, x2, y2, member.force);
    }
  }

  drawForceArrow(x1, y1, x2, y2, force) {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const arrowLength = Math.min(Math.abs(force) * this.forceArrowScale, 30);
    const arrowWidth = 8;
    
    this.ctx.save();
    this.ctx.translate(midX, midY);
    this.ctx.rotate(angle);
    
    const arrowColor = force < 0 ? '#3b82f6' : '#ef4444';
    this.ctx.fillStyle = arrowColor;
    this.ctx.strokeStyle = arrowColor;
    this.ctx.lineWidth = 2;
    
    if (force < 0) {
      this.ctx.beginPath();
      this.ctx.moveTo(-arrowLength / 2, 0);
      this.ctx.lineTo(arrowLength / 2, -arrowWidth / 2);
      this.ctx.lineTo(arrowLength / 2, arrowWidth / 2);
      this.ctx.closePath();
      this.ctx.fill();
      
      this.ctx.beginPath();
      this.ctx.moveTo(arrowLength / 2, 0);
      this.ctx.lineTo(-arrowLength / 2, -arrowWidth / 2);
      this.ctx.lineTo(-arrowLength / 2, arrowWidth / 2);
      this.ctx.closePath();
      this.ctx.fill();
    } else {
      this.ctx.beginPath();
      this.ctx.moveTo(0, -arrowWidth / 2);
      this.ctx.lineTo(arrowLength, 0);
      this.ctx.lineTo(0, arrowWidth / 2);
      this.ctx.closePath();
      this.ctx.fill();
    }
    
    this.ctx.restore();
  }

  drawNode(node, showDeformed = true) {
    let x, y;
    
    if (showDeformed && this.showDeformation) {
      const dispScale = this.deformationScale;
      x = node.originalX + (node.x - node.originalX) * dispScale;
      y = node.originalY + (node.y - node.originalY) * dispScale;
    } else {
      x = node.originalX;
      y = node.originalY;
    }
    
    let radius = this.nodeRadius;
    let fillColor = '#ffffff';
    let strokeColor = '#4a5568';
    
    if (node.fixed || node.supportX || node.supportY) {
      fillColor = '#f59e0b';
      strokeColor = '#d97706';
      radius = this.nodeRadius * 1.2;
      
      this.ctx.fillStyle = '#94a3b8';
      this.ctx.fillRect(x - 15, y, 30, 8);
      this.ctx.fillRect(x - 20, y + 8, 40, 12);
      
      this.ctx.strokeStyle = '#64748b';
      this.ctx.lineWidth = 1;
      for (let i = -15; i < 20; i += 8) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + i, y + 8);
        this.ctx.lineTo(x + i + 4, y + 20);
        this.ctx.stroke();
      }
    }
    
    if (node.loadY > 0) {
      const arrowLength = Math.min(node.loadY * 0.5, 40);
      this.ctx.save();
      this.ctx.strokeStyle = '#ef4444';
      this.ctx.fillStyle = '#ef4444';
      this.ctx.lineWidth = 2;
      
      this.ctx.beginPath();
      this.ctx.moveTo(x, y - radius - 10);
      this.ctx.lineTo(x, y - radius - 10 - arrowLength);
      this.ctx.stroke();
      
      this.ctx.beginPath();
      this.ctx.moveTo(x, y - radius - 10);
      this.ctx.lineTo(x - 6, y - radius - 18);
      this.ctx.lineTo(x + 6, y - radius - 18);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.restore();
    }
    
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = fillColor;
    this.ctx.fill();
    this.ctx.strokeStyle = strokeColor;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    
    if (this.showLabels && node.id) {
      this.ctx.font = '11px -apple-system, sans-serif';
      this.ctx.fillStyle = '#64748b';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(node.id, x, y - radius - 8);
    }
  }

  render(physics, trussInfo) {
    this.clear();
    
    if (this.showDeformation) {
      for (const member of physics.members) {
        this.drawOriginalMember(member);
      }
    }
    
    for (const member of physics.members) {
      this.drawMember(member, true);
    }
    
    for (const node of physics.nodes) {
      this.drawNode(node, true);
    }
  }

  drawOriginalMember(member) {
    this.ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
    this.ctx.lineWidth = this.memberThickness * 0.5;
    this.ctx.setLineDash([4, 4]);
    this.ctx.beginPath();
    this.ctx.moveTo(member.nodeA.originalX, member.nodeA.originalY);
    this.ctx.lineTo(member.nodeB.originalX, member.nodeB.originalY);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
  }

  drawLoadIndicator(node, magnitude) {
    const arrowLength = Math.min(magnitude * 0.5, 50);
    this.ctx.save();
    this.ctx.strokeStyle = '#dc2626';
    this.ctx.fillStyle = '#dc2626';
    this.ctx.lineWidth = 3;
    
    const x = node.originalX;
    const y = node.originalY;
    
    this.ctx.beginPath();
    this.ctx.moveTo(x, y - 20);
    this.ctx.lineTo(x, y - 20 - arrowLength);
    this.ctx.stroke();
    
    this.ctx.beginPath();
    this.ctx.moveTo(x, y - 20);
    this.ctx.lineTo(x - 8, y - 32);
    this.ctx.lineTo(x + 8, y - 32);
    this.ctx.closePath();
    this.ctx.fill();
    
    this.ctx.restore();
  }
}

window.TrussRenderer = TrussRenderer;
