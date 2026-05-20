'use client';

import { motion } from 'framer-motion';
import { GearData } from '@/types/gear';

interface GearProps {
  gear: GearData;
  isRunning: boolean;
  onDragStart: (e: React.MouseEvent | React.TouchEvent, gearId: string) => void;
  onDrag: (e: React.MouseEvent | React.TouchEvent) => void;
  onDragEnd: () => void;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const getGearColor = (teeth: number, isDriver: boolean) => {
  if (isDriver) return '#3b82f6';
  if (teeth <= 12) return '#ef4444';
  if (teeth <= 20) return '#f59e0b';
  if (teeth <= 30) return '#10b981';
  return '#8b5cf6';
};

export function Gear({ gear, isRunning, onDragStart, onDrag, onDragEnd, isSelected, onSelect }: GearProps) {
  const color = getGearColor(gear.teeth, gear.isDriver);
  const toothDepth = 8;
  const outerRadius = gear.radius;
  const innerRadius = gear.radius - toothDepth;
  const centerRadius = Math.max(10, innerRadius * 0.3);

  const createGearPath = () => {
    const teeth = gear.teeth;
    const angleStep = (2 * Math.PI) / teeth;
    let path = '';

    for (let i = 0; i < teeth; i++) {
      const angle1 = i * angleStep - angleStep / 4;
      const angle2 = i * angleStep - angleStep / 8;
      const angle3 = i * angleStep + angleStep / 8;
      const angle4 = i * angleStep + angleStep / 4;

      const x1 = Math.cos(angle1) * innerRadius;
      const y1 = Math.sin(angle1) * innerRadius;
      const x2 = Math.cos(angle2) * outerRadius;
      const y2 = Math.sin(angle2) * outerRadius;
      const x3 = Math.cos(angle3) * outerRadius;
      const y3 = Math.sin(angle3) * outerRadius;
      const x4 = Math.cos(angle4) * innerRadius;
      const y4 = Math.sin(angle4) * innerRadius;

      if (i === 0) {
        path += `M ${x1} ${y1}`;
      }
      path += ` L ${x2} ${y2} L ${x3} ${y3} L ${x4} ${y4}`;
    }
    path += ' Z';
    return path;
  };

  return (
    <g
      style={{
        cursor: isRunning ? 'not-allowed' : 'grab',
      }}
      transform={`translate(${gear.x}, ${gear.y}) rotate(${gear.rotation})`}
      onMouseDown={(e) => {
        if (!isRunning) {
          e.stopPropagation();
          onSelect(gear.id);
          onDragStart(e, gear.id);
        }
      }}
      onTouchStart={(e) => {
        if (!isRunning) {
          e.stopPropagation();
          onSelect(gear.id);
          onDragStart(e, gear.id);
        }
      }}
    >
      <path
        d={createGearPath()}
        fill={color}
        stroke={isSelected ? '#ffffff' : '#1f2937'}
        strokeWidth={isSelected ? 3 : 2}
        style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}
      />
      
      <circle
        cx={0}
        cy={0}
        r={innerRadius * 0.7}
        fill="none"
        stroke="rgba(0,0,0,0.2)"
        strokeWidth={2}
      />
      
      <circle
        cx={0}
        cy={0}
        r={centerRadius}
        fill="#1f2937"
      />
      
      <circle
        cx={0}
        cy={0}
        r={centerRadius * 0.6}
        fill="#374151"
      />
      
      <text
        x={0}
        y={innerRadius + 20}
        textAnchor="middle"
        fill="#e5e7eb"
        fontSize={12}
        fontWeight="bold"
        style={{ pointerEvents: 'none' }}
        transform={`rotate(${-gear.rotation})`}
      >
        {gear.teeth} 齿
      </text>
      
      {gear.isDriver && (
        <text
          x={0}
          y={-innerRadius - 10}
          textAnchor="middle"
          fill="#fbbf24"
          fontSize={10}
          fontWeight="bold"
          style={{ pointerEvents: 'none' }}
          transform={`rotate(${-gear.rotation})`}
        >
          ⚡ 主动轮
        </text>
      )}
    </g>
  );
}
