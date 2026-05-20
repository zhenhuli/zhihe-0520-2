export interface GearData {
  id: string;
  x: number;
  y: number;
  teeth: number;
  radius: number;
  rotation: number;
  isDriver: boolean;
  connectedTo: string[];
  direction: 1 | -1;
  speed: number;
}

export interface GearConnection {
  from: string;
  to: string;
}
