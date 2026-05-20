'use client';

import { useState, useCallback } from 'react';
import { GearCanvas } from '@/components/GearCanvas';
import { ControlPanel } from '@/components/ControlPanel';
import { InfoPanel } from '@/components/InfoPanel';
import { GearData } from '@/types/gear';
import { calculateRadius, generateId } from '@/utils/gearUtils';

export default function Home() {
  const [gears, setGears] = useState<GearData[]>([
    {
      id: generateId(),
      x: 400,
      y: 350,
      teeth: 20,
      radius: calculateRadius(20),
      rotation: 0,
      isDriver: true,
      connectedTo: [],
      direction: 1,
      speed: 30,
    },
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [driverSpeed, setDriverSpeed] = useState(30);
  const [selectedGearId, setSelectedGearId] = useState<string | null>(null);

  const handleAddGear = useCallback((teeth: number) => {
    const newGear: GearData = {
      id: generateId(),
      x: 200 + Math.random() * 400,
      y: 200 + Math.random() * 200,
      teeth,
      radius: calculateRadius(teeth),
      rotation: 0,
      isDriver: gears.length === 0,
      connectedTo: [],
      direction: 1,
      speed: 0,
    };
    setGears((prev) => [...prev, newGear]);
    setSelectedGearId(newGear.id);
  }, [gears.length]);

  const handleToggleRunning = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  const handleReset = useCallback(() => {
    setGears([
      {
        id: generateId(),
        x: 400,
        y: 350,
        teeth: 20,
        radius: calculateRadius(20),
        rotation: 0,
        isDriver: true,
        connectedTo: [],
        direction: 1,
        speed: driverSpeed,
      },
    ]);
    setIsRunning(false);
    setSelectedGearId(null);
  }, [driverSpeed]);

  const handleDeleteSelected = useCallback(() => {
    if (!selectedGearId) return;
    
    setGears((prev) => {
      const newGears = prev.filter((g) => g.id !== selectedGearId);
      const wasDriver = prev.find((g) => g.id === selectedGearId)?.isDriver;
      
      if (wasDriver && newGears.length > 0) {
        newGears[0].isDriver = true;
      }
      
      return newGears;
    });
    setSelectedGearId(null);
  }, [selectedGearId]);

  const handleSelectGear = useCallback((id: string | null) => {
    setSelectedGearId(id);
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden relative">
      <GearCanvas
        gears={gears}
        setGears={setGears}
        isRunning={isRunning}
        driverSpeed={driverSpeed}
        selectedGearId={selectedGearId}
        onSelectGear={handleSelectGear}
      />
      <ControlPanel
        onAddGear={handleAddGear}
        onSetDriverSpeed={setDriverSpeed}
        onToggleRunning={handleToggleRunning}
        onReset={handleReset}
        onDeleteSelected={handleDeleteSelected}
        isRunning={isRunning}
        driverSpeed={driverSpeed}
        selectedGearId={selectedGearId}
        gearCount={gears.length}
      />
      <InfoPanel
        gears={gears}
        isRunning={isRunning}
        driverSpeed={driverSpeed}
      />
    </div>
  );
}
