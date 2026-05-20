export type EasingType = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce';

export interface LightGroup {
  id: string;
  name: string;
  startColor: string;
  endColor: string;
  duration: number;
  easing: EasingType;
  delay: number;
}

export interface TimelineStep {
  id: string;
  name: string;
  lightGroups: LightGroup[];
  stepDuration: number;
}

export interface LightProgram {
  id: string;
  name: string;
  createdAt: number;
  timeline: TimelineStep[];
}

export interface ActiveStepState {
  stepIndex: number;
  progress: number;
  isPlaying: boolean;
  currentColors: Record<string, string>;
}

export const EASING_OPTIONS: { value: EasingType; label: string }[] = [
  { value: 'linear', label: '线性' },
  { value: 'ease', label: '平滑' },
  { value: 'ease-in', label: '渐入' },
  { value: 'ease-out', label: '渐出' },
  { value: 'ease-in-out', label: '渐入渐出' },
  { value: 'bounce', label: '弹跳' },
];

export const easingFunctions: Record<EasingType, (t: number) => number> = {
  linear: (t) => t,
  ease: (t) => t * (2 - t),
  'ease-in': (t) => t * t,
  'ease-out': (t) => t * (2 - t),
  'ease-in-out': (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  bounce: (t) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  },
};

export const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, '0');
      })
      .join('')
  );
};

export const interpolateColor = (
  color1: string,
  color2: string,
  factor: number,
  easing: EasingType
): string => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  const easedFactor = easingFunctions[easing](factor);
  
  return rgbToHex(
    rgb1.r + (rgb2.r - rgb1.r) * easedFactor,
    rgb1.g + (rgb2.g - rgb1.g) * easedFactor,
    rgb1.b + (rgb2.b - rgb1.b) * easedFactor
  );
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};
