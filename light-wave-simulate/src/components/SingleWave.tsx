'use client';

import { useState, useEffect, useRef } from 'react';
import { wavelengthToColor, wavelengthToName } from '@/lib/waveUtils';

export default function SingleWave() {
  const [wavelength, setWavelength] = useState(550);
  const [amplitude, setAmplitude] = useState(50);
  const [phase, setPhase] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const time = Date.now() / 1000;
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      for (let i = 0; i <= width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let i = 0; i <= height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }

      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();
      ctx.setLineDash([]);

      const color = wavelengthToColor(wavelength);
      const frequency = (780 - wavelength + 100) / 100;
      const amp = amplitude * 1.5;

      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        const y = centerY + amp * Math.sin((x / width) * Math.PI * 4 * frequency + time * 3 + phase);
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.shadowColor = color;
      ctx.shadowBlur = 20;
      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        const y = centerY + amp * Math.sin((x / width) * Math.PI * 4 * frequency + time * 3 + phase);
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowBlur = 0;

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [wavelength, amplitude, phase]);

  const color = wavelengthToColor(wavelength);
  const lightName = wavelengthToName(wavelength);

  return (
    <div className="bg-slate-800 rounded-2xl p-6 shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="text-3xl">🌊</span> 单光波演示
      </h2>
      
      <div className="relative rounded-xl overflow-hidden mb-6 border border-slate-700">
        <canvas
          ref={canvasRef}
          width={600}
          height={250}
          className="w-full h-auto"
        />
        <div className="absolute top-3 right-3 bg-slate-900/80 px-3 py-1.5 rounded-lg">
          <span className="text-white font-mono text-sm">{wavelength} nm</span>
        </div>
      </div>

      <div className="mb-4 p-4 rounded-xl bg-slate-700/50">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-slate-300 text-sm font-medium">当前色光：</span>
          <div
            className="w-8 h-8 rounded-full shadow-lg"
            style={{ backgroundColor: color, boxShadow: `0 0 15px ${color}` }}
          />
          <span className="text-white font-bold text-lg">{lightName}</span>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-slate-300 font-medium">波长 (λ)</label>
            <span className="text-cyan-400 font-mono font-bold">{wavelength} nm</span>
          </div>
          <input
            type="range"
            min="380"
            max="780"
            value={wavelength}
            onChange={(e) => setWavelength(Number(e.target.value))}
            className="w-full h-3 rounded-lg appearance-none cursor-pointer"
            style={{
              background: 'linear-gradient(to right, #8b5cf6, #3b82f6, #22c55e, #eab308, #f97316, #ef4444)'
            }}
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>380nm 紫外</span>
            <span>450nm 蓝</span>
            <span>550nm 绿</span>
            <span>650nm 红</span>
            <span>780nm 红外</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-slate-300 font-medium">振幅 (A)</label>
            <span className="text-cyan-400 font-mono font-bold">{amplitude}</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={amplitude}
            onChange={(e) => setAmplitude(Number(e.target.value))}
            className="w-full h-3 rounded-lg appearance-none cursor-pointer bg-slate-600"
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-slate-300 font-medium">初相位 (φ)</label>
            <span className="text-cyan-400 font-mono font-bold">{(phase * 180 / Math.PI).toFixed(0)}°</span>
          </div>
          <input
            type="range"
            min="0"
            max={String(Math.PI * 2)}
            step="0.1"
            value={phase}
            onChange={(e) => setPhase(Number(e.target.value))}
            className="w-full h-3 rounded-lg appearance-none cursor-pointer bg-slate-600"
          />
        </div>
      </div>

      <div className="mt-6 p-4 bg-slate-900/50 rounded-xl">
        <h3 className="text-white font-semibold mb-2">📖 物理原理</h3>
        <ul className="text-slate-400 text-sm space-y-1">
          <li>• <span className="text-slate-300">波长</span>：决定光的颜色，可见光范围 380-780nm</li>
          <li>• <span className="text-slate-300">振幅</span>：决定光的亮度，振幅越大光越强</li>
          <li>• <span className="text-slate-300">频率</span>：与波长成反比，c = λf</li>
        </ul>
      </div>
    </div>
  );
}
