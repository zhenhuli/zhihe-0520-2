'use client';

import { useState, useEffect, useRef } from 'react';
import { wavelengthToColor, wavelengthToName } from '@/lib/waveUtils';

export default function WaveSuperposition() {
  const [wave1Wavelength, setWave1Wavelength] = useState(500);
  const [wave1Amplitude, setWave1Amplitude] = useState(40);
  const [wave2Wavelength, setWave2Wavelength] = useState(600);
  const [wave2Amplitude, setWave2Amplitude] = useState(40);
  const [showWaves, setShowWaves] = useState(true);
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

      const color1 = wavelengthToColor(wave1Wavelength);
      const color2 = wavelengthToColor(wave2Wavelength);
      const freq1 = (780 - wave1Wavelength + 100) / 100;
      const freq2 = (780 - wave2Wavelength + 100) / 100;
      const amp1 = wave1Amplitude * 1.2;
      const amp2 = wave2Amplitude * 1.2;

      if (showWaves) {
        ctx.beginPath();
        for (let x = 0; x < width; x++) {
          const y = centerY + amp1 * Math.sin((x / width) * Math.PI * 4 * freq1 + time * 2);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = color1;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.6;
        ctx.stroke();

        ctx.beginPath();
        for (let x = 0; x < width; x++) {
          const y = centerY + amp2 * Math.sin((x / width) * Math.PI * 4 * freq2 + time * 2);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = color2;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        const y1 = amp1 * Math.sin((x / width) * Math.PI * 4 * freq1 + time * 2);
        const y2 = amp2 * Math.sin((x / width) * Math.PI * 4 * freq2 + time * 2);
        const y = centerY + y1 + y2;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, color1);
      gradient.addColorStop(1, color2);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 10;
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
  }, [wave1Wavelength, wave1Amplitude, wave2Wavelength, wave2Amplitude, showWaves]);

  const color1 = wavelengthToColor(wave1Wavelength);
  const color2 = wavelengthToColor(wave2Wavelength);

  return (
    <div className="bg-slate-800 rounded-2xl p-6 shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="text-3xl">🔀</span> 波的叠加
      </h2>

      <div className="relative rounded-xl overflow-hidden mb-6 border border-slate-700">
        <canvas
          ref={canvasRef}
          width={600}
          height={280}
          className="w-full h-auto"
        />
        <div className="absolute top-3 right-3 bg-slate-900/80 px-3 py-1.5 rounded-lg flex gap-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color1 }} />
            <span className="text-white text-xs">{wave1Wavelength}nm</span>
          </div>
          <span className="text-slate-500">+</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color2 }} />
            <span className="text-white text-xs">{wave2Wavelength}nm</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="text-slate-300 text-sm">显示原始波</span>
        <button
          onClick={() => setShowWaves(!showWaves)}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            showWaves ? 'bg-cyan-500' : 'bg-slate-600'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0 w-5 h-5 bg-white rounded-full transition-transform ${
              showWaves ? 'translate-x-0.5' : 'translate-x-6'
            }`}
          />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-4 rounded-xl bg-slate-700/50">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color1 }} />
            <span className="text-white font-medium">光波 1</span>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">波长</span>
                <span className="text-cyan-400 font-mono">{wave1Wavelength}nm</span>
              </div>
              <input
                type="range"
                min="380"
                max="780"
                value={wave1Wavelength}
                onChange={(e) => setWave1Wavelength(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: 'linear-gradient(to right, #8b5cf6, #3b82f6, #22c55e, #eab308, #f97316, #ef4444)'
                }}
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">振幅</span>
                <span className="text-cyan-400 font-mono">{wave1Amplitude}</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={wave1Amplitude}
                onChange={(e) => setWave1Amplitude(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-600"
              />
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-700/50">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color2 }} />
            <span className="text-white font-medium">光波 2</span>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">波长</span>
                <span className="text-cyan-400 font-mono">{wave2Wavelength}nm</span>
              </div>
              <input
                type="range"
                min="380"
                max="780"
                value={wave2Wavelength}
                onChange={(e) => setWave2Wavelength(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: 'linear-gradient(to right, #8b5cf6, #3b82f6, #22c55e, #eab308, #f97316, #ef4444)'
                }}
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">振幅</span>
                <span className="text-cyan-400 font-mono">{wave2Amplitude}</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={wave2Amplitude}
                onChange={(e) => setWave2Amplitude(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-600"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-slate-900/50 rounded-xl">
        <h3 className="text-white font-semibold mb-2">📖 波的叠加原理</h3>
        <ul className="text-slate-400 text-sm space-y-1">
          <li>• 两列波相遇时，质点位移等于各波单独引起位移的<span className="text-cyan-400">矢量和</span></li>
          <li>• <span className="text-green-400">相长干涉</span>：同相位叠加，振幅增大</li>
          <li>• <span className="text-red-400">相消干涉</span>：反相位叠加，振幅减小</li>
          <li>• 两波频率相同时产生稳定的<span className="text-yellow-400">干涉图样</span></li>
        </ul>
      </div>
    </div>
  );
}
