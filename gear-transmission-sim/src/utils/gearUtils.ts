import { GearData } from '@/types/gear';

export const calculateRadius = (teeth: number): number => {
  return teeth * 2.5 + 20;
};

export const calculateDistance = (g1: GearData, g2: GearData): number => {
  const dx = g2.x - g1.x;
  const dy = g2.y - g1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const checkMeshing = (g1: GearData, g2: GearData): boolean => {
  const distance = calculateDistance(g1, g2);
  const idealDistance = g1.radius + g2.radius;
  const tolerance = 30;
  return Math.abs(distance - idealDistance) < tolerance;
};

export const calculateGearRatio = (driverTeeth: number, drivenTeeth: number): number => {
  return driverTeeth / drivenTeeth;
};

export const calculateSpeed = (driverSpeed: number, driverTeeth: number, drivenTeeth: number): number => {
  return driverSpeed * (driverTeeth / drivenTeeth);
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const calculateOptimalPosition = (
  driverGear: GearData,
  newTeeth: number,
  angle: number = 0
): { x: number; y: number } => {
  const newRadius = calculateRadius(newTeeth);
  const distance = driverGear.radius + newRadius;
  return {
    x: driverGear.x + Math.cos(angle) * distance,
    y: driverGear.y + Math.sin(angle) * distance,
  };
};

export const buildGearConnections = (gears: GearData[]): Map<string, string[]> => {
  const connections = new Map<string, string[]>();
  
  gears.forEach((gear) => {
    connections.set(gear.id, []);
  });
  
  for (let i = 0; i < gears.length; i++) {
    for (let j = i + 1; j < gears.length; j++) {
      if (checkMeshing(gears[i], gears[j])) {
        connections.get(gears[i].id)?.push(gears[j].id);
        connections.get(gears[j].id)?.push(gears[i].id);
      }
    }
  }
  
  return connections;
};

export const calculateGearSpeeds = (
  gears: GearData[],
  driverSpeed: number
): Map<string, { speed: number; direction: 1 | -1 }> => {
  const speeds = new Map<string, { speed: number; direction: 1 | -1 }>();
  const connections = buildGearConnections(gears);
  const driverGear = gears.find((g) => g.isDriver);
  
  if (!driverGear) {
    gears.forEach((g) => {
      speeds.set(g.id, { speed: 0, direction: 1 });
    });
    return speeds;
  }
  
  const visited = new Set<string>();
  const queue: { id: string; speed: number; direction: 1 | -1 }[] = [];
  
  speeds.set(driverGear.id, { speed: driverSpeed, direction: 1 });
  queue.push({ id: driverGear.id, speed: driverSpeed, direction: 1 });
  visited.add(driverGear.id);
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentGear = gears.find((g) => g.id === current.id)!;
    const connectedIds = connections.get(current.id) || [];
    
    for (const connectedId of connectedIds) {
      if (!visited.has(connectedId)) {
        const connectedGear = gears.find((g) => g.id === connectedId)!;
        const gearRatio = calculateGearRatio(currentGear.teeth, connectedGear.teeth);
        const newSpeed = current.speed * gearRatio;
        const newDirection = (current.direction * -1) as 1 | -1;
        
        speeds.set(connectedId, { speed: newSpeed, direction: newDirection });
        queue.push({ id: connectedId, speed: newSpeed, direction: newDirection });
        visited.add(connectedId);
      }
    }
  }
  
  gears.forEach((g) => {
    if (!speeds.has(g.id)) {
      speeds.set(g.id, { speed: 0, direction: 1 });
    }
  });
  
  return speeds;
};
