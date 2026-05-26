'use client';

import { useState, useEffect, useRef } from 'react';
import { wavelengthToColor } from '@/lib/waveUtils';

export default function WaveDiffraction() {
  const [wavelength, setWavelength] = useState(550);
  const [slitWidth, setSlitWidth] = useState(50);
  const [slitDistance, setSlitDistance] = useState(100);
  const [diffractionType, setDiffractionType] = useState<'single' | 'double'>('double');
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

      const barrierX = 200;
      const color = wavelengthToColor(wavelength);

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(barrierX - 10, 0, 20, height);

      const slit1Y = centerY - slitDistance / 2;
      const slit2Y = centerY + slitDistance / 2;
      const slitHalfWidth = slitWidth / 2;

      ctx.clearRect(barrierX - 10, slit1Y - slitHalfWidth, 20, slitWidth);
      if (diffractionType === 'double') {
        ctx.clearRect(barrierX - 10, slit2Y - slitHalfWidth, 20, slitWidth);
      }

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(barrierX - 10, 0, 20, slit1Y - slitHalfWidth);
      ctx.fillRect(barrierX - 10, slit1Y + slitHalfWidth, 20, 
        diffractionType === 'double' ? slit2Y - slitHalfWidth - (slit1Y + slitHalfWidth) : height - (slit1Y + slitHalfWidth));
      if (diffractionType === 'double') {
        ctx.fillRect(barrierX - 10, slit2Y + slitHalfWidth, 20, height - (slit2Y + slitHalfWidth));
      }

      const freq = (780 - wavelength + 100) / 150;
      const speed = 2;

      for (let x = 0; x < barrierX - 10; x += 3) {
        for (let y = 0; y < height; y += 3) {
          const wave = Math.sin((x / 50) * freq * Math.PI - time * speed);
          const intensity = (wave + 1) / 2;
          ctx.fillStyle = `rgba(${parseInt(color.slice(4, 7))}, ${parseInt(color.slice(9, 12))}, ${parseInt(color.slice(13, 16))}, ${intensity * 0.5})`;
          ctx.fillRect(x, y, 3, 3);
        }
      }

      for (let x = barrierX + 10; x < width; x += 4) {
        for (let y = 0; y < height; y += 4) {
          const dist1 = Math.sqrt((x - barrierX) ** 2 + (y - slit1Y) ** 2);
          const wave1 = Math.sin((dist1 / 50) * freq * Math.PI - time * speed);
          
          let totalWave = wave1;
          
          if (diffractionType === 'double') {
            const dist2 = Math.sqrt((x - barrierX) ** 2 + (y - slit2Y) ** 2);
            const wave2 = Math.sin((dist2 / 50) * freq * Math.PI - time * speed);
            totalWave = (wave1 + wave2) / 2;
          }

          const intensity = Math.max(0, (totalWave + 1) / 2);
          const decay = Math.max(0.1, 1 - (x - barrierX) / (width - barrierX) * 0.5);
          
          ctx.fillStyle = `rgba(${parseInt(color.slice(4, 7))}, ${parseInt(color.slice(9, 12))}, ${parseInt(color.slice(13, 16))}, ${intensity * decay})`;
          ctx.fillRect(x, y, 4, 4);
        }
      }

      const screenX = width - 30;
      const screenWidth = 20;
      
      for (let y = 0; y < height; y += 2) {
        const dist1 = Math.sqrt((screenX - barrierX) ** 2 + (y - slit1Y) ** 2);
        const wave1 = Math.sin((dist1 / 50) * freq * Math.PI);
        
        let totalWave = wave1;
        
        if (diffractionType === 'double') {
          const dist2 = Math.sqrt((screenX - barrierX) ** 2 + (y - slit2Y) ** 2);
          const wave2 = Math.sin((dist2 / 50) * freq * Math.PI);
          totalWave = (wave1 + wave2) / 2;
        }

        const intensity = Math.max(0, (totalWave + 1) / 2);
        
        ctx.fillStyle = `rgba(${parseInt(color.slice(4, 7))}, ${parseInt(color.slice(9, 12))}, ${parseInt(color.slice(13, 16))}, ${intensity})`;
        ctx.fillRect(screenX, y, screenWidth, 2);
      }

      ctx.fillStyle = '#64748b';
      ctx.font = '12px sans-serif';
      ctx.fillText('入射光', 50, 20);
      ctx.fillText(diffractionType === 'double' ? '双缝' : '单缝', barrierX - 20, 20);
      ctx.fillText('衍射图样', screenX - 10, 20);

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [wavelength, slitWidth, slitDistance, diffractionType]);

  const color = wavelengthToColor(wavelength);

  return (
    <div className="bg-slate-800 rounded-2xl p-6 shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="text-3xl">🎯</span> 光的衍射
      </h2>

      <div className="relative rounded-xl overflow-hidden mb-6 border border-slate-700">
        <canvas
          ref={canvasRef}
          width={600}
          height={350}
          className="w-full h-auto"
        />
        <div className="absolute top-3 right-3 bg-slate-900/80 px-3 py-1.5 rounded-lg">
          <span className="text-white font-mono text-sm">{wavelength} nm</span>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setDiffractionType('single')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
            diffractionType === 'single'
              ? 'bg-cyan-500 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          单缝衍射
        </button>
        <button
          onClick={() => setDiffractionType('double')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
            diffractionType === 'double'
              ? 'bg-cyan-500 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          双缝干涉
        </button>
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
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-slate-300 font-medium">缝宽 (a)</label>
            <span className="text-cyan-400 font-mono font-bold">{slitWidth}</span>
          </div>
          <input
            type="range"
            min="20"
            max="100"
            value={slitWidth}
            onChange={(e) => setSlitWidth(Number(e.target.value))}
            className="w-full h-3 rounded-lg appearance-none cursor-pointer bg-slate-600"
          />
        </div>

        {diffractionType === 'double' && (
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-slate-300 font-medium">缝间距 (d)</label>
              <span className="text-cyan-400 font-mono font-bold">{slitDistance}</span>
            </div>
            <input
              type="range"
              min="60"
              max="200"
              value={slitDistance}
              onChange={(e) => setSlitDistance(Number(e.target.value))}
              className="w-full h-3 rounded-lg appearance-none cursor-pointer bg-slate-600"
            />
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-slate-900/50 rounded-xl">
        <h3 className="text-white font-semibold mb-2">📖 衍射原理</h3>
        <ul className="text-slate-400 text-sm space-y-1">
          <li>• <span className="text-slate-300">单缝衍射</span>：光通过窄缝后扩散，形成明暗相间条纹</li>
          <li>• <span className="text-slate-300">双缝干涉</span>：两缝光波相互叠加，产生干涉图样</li>
          <li>• <span className="text-yellow-400">明纹条件</span>：波程差为波长整数倍</li>
          <li>• <span className="text-red-400">暗纹条件</span>：波程差为半波长奇数倍</li>
        </ul>
      </div>
    </div>
  );
}
