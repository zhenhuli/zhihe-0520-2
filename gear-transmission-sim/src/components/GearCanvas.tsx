'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Gear } from './Gear';
import { GearData } from '@/types/gear';
import { checkMeshing, calculateGearSpeeds } from '@/utils/gearUtils';

interface GearCanvasProps {
  gears: GearData[];
  setGears: React.Dispatch<React.SetStateAction<GearData[]>>;
  isRunning: boolean;
  driverSpeed: number;
  selectedGearId: string | null;
  onSelectGear: (id: string | null) => void;
}

export function GearCanvas({ gears, setGears, isRunning, driverSpeed, selectedGearId, onSelectGear }: GearCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [draggingGearId, setDraggingGearId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const gearsRef = useRef<GearData[]>(gears);

  useEffect(() => {
    gearsRef.current = gears;
  }, [gears]);

  const getMousePosition = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }, []);

  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent, gearId: string) => {
    if (isRunning) return;
    const pos = getMousePosition(e);
    const gear = gears.find((g) => g.id === gearId);
    if (gear) {
      setDragOffset({
        x: pos.x - gear.x,
        y: pos.y - gear.y,
      });
      setDraggingGearId(gearId);
    }
  }, [gears, getMousePosition, isRunning]);

  const handleDrag = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!draggingGearId || isRunning) return;
    const pos = getMousePosition(e);
    const newX = pos.x - dragOffset.x;
    const newY = pos.y - dragOffset.y;

    setGears((prev) =>
      prev.map((g) => (g.id === draggingGearId ? { ...g, x: newX, y: newY } : g))
    );
  }, [draggingGearId, dragOffset, getMousePosition, setGears, isRunning]);

  const handleDragEnd = useCallback(() => {
    setDraggingGearId(null);
  }, []);

  useEffect(() => {
    if (isRunning) {
      lastTimeRef.current = performance.now();
      
      const animate = (time: number) => {
        const deltaTime = Math.min((time - lastTimeRef.current) / 1000, 0.1);
        lastTimeRef.current = time;

        const currentGears = gearsRef.current;
        const speedInfo = calculateGearSpeeds(currentGears, driverSpeed);

        setGears((prev) =>
          prev.map((gear) => {
            const info = speedInfo.get(gear.id);
            if (!info || info.speed === 0) return gear;
            
            const rpmToDegreesPerSecond = (info.speed * 360) / 60;
            const rotationDelta = rpmToDegreesPerSecond * deltaTime;
            
            return {
              ...gear,
              rotation: gear.rotation + rotationDelta,
              speed: info.speed,
              direction: info.direction,
            };
          })
        );

        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, driverSpeed, setGears]);

  const renderConnectionLines = () => {
    const lines: JSX.Element[] = [];
    const processed = new Set<string>();

    gears.forEach((gear1) => {
      gears.forEach((gear2) => {
        if (gear1.id >= gear2.id) return;
        const key = `${gear1.id}-${gear2.id}`;
        if (processed.has(key)) return;

        if (checkMeshing(gear1, gear2)) {
          processed.add(key);
          lines.push(
            <line
              key={key}
              x1={gear1.x}
              y1={gear1.y}
              x2={gear2.x}
              y2={gear2.y}
              stroke={isRunning ? '#10b981' : '#475569'}
              strokeWidth={2}
              strokeDasharray={isRunning ? 'none' : '5,5'}
              opacity={0.6}
            />
          );
        }
      });
    });

    return lines;
  };

  return (
    <svg
      ref={svgRef}
      className="w-full h-full bg-gray-900"
      style={{ cursor: isRunning ? 'default' : 'crosshair' }}
      onMouseMove={handleDrag}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      onTouchMove={handleDrag}
      onTouchEnd={handleDragEnd}
      onClick={(e) => {
        if (e.target === svgRef.current) {
          onSelectGear(null);
        }
      }}
    >
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1f2937" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />

      {renderConnectionLines()}

      {gears.map((gear) => (
        <Gear
          key={gear.id}
          gear={gear}
          isRunning={isRunning}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          isSelected={selectedGearId === gear.id}
          onSelect={onSelectGear}
        />
      ))}
    </svg>
  );
}
