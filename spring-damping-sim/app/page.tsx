"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";

interface TrailPoint {
  x: number;
  y: number;
  timestamp: number;
}

export default function SpringDampingSimulator() {
  const [springK, setSpringK] = useState(100);
  const [mass, setMass] = useState(1);
  const [damping, setDamping] = useState(5);
  const [isDragging, setIsDragging] = useState(false);
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [showTrail, setShowTrail] = useState(true);
  const [motionState, setMotionState] = useState({
    velocity: 0,
    acceleration: 0,
    displacement: 0,
    energy: 0,
  });

  const canvasWidth = 800;
  const canvasHeight = 500;
  const anchorX = canvasWidth / 2;
  const anchorY = 80;
  const restLength = 200;
  const bobRadius = 30;

  const x = useMotionValue(anchorX);
  const y = useMotionValue(anchorY + restLength);

  const springConfig = {
    stiffness: springK,
    damping: damping,
    mass: mass,
  };

  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const animationRef = useRef<number | null>(null);
  const trailTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const calculatePhysics = useCallback(() => {
    const currentX = springX.get();
    const currentY = springY.get();

    const dx = currentX - anchorX;
    const dy = currentY - anchorY;
    const displacement = Math.sqrt(dx * dx + dy * dy) - restLength;

    const velocityX = springX.getVelocity();
    const velocityY = springY.getVelocity();
    const velocity = Math.sqrt(velocityX * velocityX + velocityY * velocityY);

    const springForce = springK * displacement;
    const dampingForce = damping * velocity;
    const acceleration = (springForce - dampingForce) / mass;

    const potentialEnergy = 0.5 * springK * displacement * displacement;
    const kineticEnergy = 0.5 * mass * velocity * velocity;
    const totalEnergy = potentialEnergy + kineticEnergy;

    setMotionState({
      velocity: velocity,
      acceleration: acceleration,
      displacement: displacement,
      energy: totalEnergy,
    });
  }, [springK, mass, damping, springX, springY]);

  useEffect(() => {
    const updatePhysics = () => {
      calculatePhysics();
      animationRef.current = requestAnimationFrame(updatePhysics);
    };
    animationRef.current = requestAnimationFrame(updatePhysics);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [calculatePhysics]);

  useEffect(() => {
    if (showTrail && !isDragging) {
      trailTimerRef.current = setInterval(() => {
        const currentX = springX.get();
        const currentY = springY.get();
        setTrail((prev) => {
          const newTrail = [
            ...prev,
            { x: currentX, y: currentY, timestamp: Date.now() },
          ];
          return newTrail.slice(-100);
        });
      }, 30);
    } else {
      setTrail([]);
    }

    return () => {
      if (trailTimerRef.current) {
        clearInterval(trailTimerRef.current);
      }
    };
  }, [showTrail, isDragging, springX, springY]);

  const handleDragStart = () => {
    setIsDragging(true);
    setTrail([]);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const resetSimulation = () => {
    x.set(anchorX);
    y.set(anchorY + restLength);
    setTrail([]);
  };

  const getDampingType = () => {
    const criticalDamping = 2 * Math.sqrt(springK * mass);
    if (damping < criticalDamping * 0.3) return { type: "欠阻尼", color: "text-green-500", desc: "振动衰减缓慢" };
    if (damping < criticalDamping * 0.8) return { type: "欠阻尼", color: "text-yellow-500", desc: "振动逐渐衰减" };
    if (damping < criticalDamping * 1.2) return { type: "临界阻尼", color: "text-blue-500", desc: "最快回到平衡" };
    return { type: "过阻尼", color: "text-red-500", desc: "缓慢回到平衡" };
  };

  const dampingInfo = getDampingType();

  const naturalFrequency = Math.sqrt(springK / mass);
  const dampedFrequency = Math.sqrt(Math.max(0, (springK / mass) - (damping * damping) / (4 * mass * mass)));

  const getSpringPath = (x1: number, y1: number, x2: number, y2: number, coils: number = 10) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    
    const springLength = length - 40;
    const coilWidth = 15;
    
    let path = `M ${x1} ${y1} L ${x1 + Math.cos(angle) * 20} ${y1 + Math.sin(angle) * 20}`;
    
    for (let i = 0; i <= coils; i++) {
      const t = i / coils;
      const baseX = x1 + Math.cos(angle) * (20 + t * springLength);
      const baseY = y1 + Math.sin(angle) * (20 + t * springLength);
      const offset = (i % 2 === 0 ? 1 : -1) * coilWidth;
      const perpX = -Math.sin(angle) * offset;
      const perpY = Math.cos(angle) * offset;
      
      if (i === 0) {
        path += ` Q ${baseX + perpX * 0.5} ${baseY + perpY * 0.5} ${baseX + perpX} ${baseY + perpY}`;
      } else {
        path += ` Q ${baseX - perpX} ${baseY - perpY} ${baseX + perpX} ${baseY + perpY}`;
      }
    }
    
    path += ` L ${x2 - Math.cos(angle) * 20} ${y2 - Math.sin(angle) * 20} L ${x2} ${y2}`;
    
    return path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">弹簧阻尼物理运动仿真</h1>
          <p className="text-slate-400">拖拽蓝色球体释放后观察振动轨迹，调节参数探索不同运动状态</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-4 border border-slate-700">
              <div
                className="relative w-full rounded-xl bg-gradient-to-b from-slate-900 to-slate-950 overflow-hidden"
                style={{ height: canvasHeight }}
              >
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, rgba(148,163,184,0.1) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(148,163,184,0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px',
                  }}
                />

                <div
                  className="absolute left-1/2 top-0 bottom-0 w-px border-l-2 border-dashed border-slate-600/30"
                  style={{ marginLeft: '-1px' }}
                />

                <div
                  className="absolute"
                  style={{
                    left: anchorX - 40,
                    top: anchorY - 15,
                    width: 80,
                    height: 8,
                    backgroundColor: '#475569',
                    borderRadius: 4,
                  }}
                />
                <div
                  className="absolute rounded-full"
                  style={{
                    left: anchorX - 8,
                    top: anchorY - 8,
                    width: 16,
                    height: 16,
                    backgroundColor: '#64748b',
                  }}
                />

                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
                  preserveAspectRatio="xMidYMid meet"
                >
                  <defs>
                    <linearGradient id="springGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#60a5fa" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {trail.length > 1 && (
                    <motion.path
                      d={`M ${trail.map((p) => `${p.x},${p.y}`).join(" L ")}`}
                      fill="none"
                      stroke="rgba(96,165,250,0.4)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                    />
                  )}

                  <SpringLine
                    springX={springX}
                    springY={springY}
                    anchorX={anchorX}
                    anchorY={anchorY}
                    getSpringPath={getSpringPath}
                  />
                </svg>

                <motion.div
                  className="absolute rounded-full cursor-grab active:cursor-grabbing flex items-center justify-center"
                  style={{
                    width: bobRadius * 2,
                    height: bobRadius * 2,
                    background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                    boxShadow: '0 0 20px rgba(96, 165, 250, 0.5), 0 4px 15px rgba(0,0,0,0.3)',
                    x: springX,
                    y: springY,
                    translateX: '-50%',
                    translateY: '-50%',
                    willChange: 'transform',
                  }}
                  drag
                  dragConstraints={{
                    left: bobRadius,
                    right: canvasWidth - bobRadius,
                    top: anchorY + 20,
                    bottom: canvasHeight - bobRadius,
                  }}
                  dragElastic={0}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  whileDrag={{ scale: 1.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div
                    className="rounded-full"
                    style={{
                      width: bobRadius * 0.8,
                      height: bobRadius * 0.8,
                      background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 70%)',
                    }}
                  />
                </motion.div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700">
                <div className="text-slate-400 text-sm mb-1">位移</div>
                <div className="text-2xl font-bold text-white">{motionState.displacement.toFixed(1)} <span className="text-sm text-slate-500">px</span></div>
              </div>
              <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700">
                <div className="text-slate-400 text-sm mb-1">速度</div>
                <div className="text-2xl font-bold text-white">{motionState.velocity.toFixed(1)} <span className="text-sm text-slate-500">px/s</span></div>
              </div>
              <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700">
                <div className="text-slate-400 text-sm mb-1">加速度</div>
                <div className="text-2xl font-bold text-white">{motionState.acceleration.toFixed(1)} <span className="text-sm text-slate-500">px/s²</span></div>
              </div>
              <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700">
                <div className="text-slate-400 text-sm mb-1">总能量</div>
                <div className="text-2xl font-bold text-white">{motionState.energy.toFixed(0)} <span className="text-sm text-slate-500">J</span></div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-6">参数控制</h2>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-slate-300">弹簧劲度系数 (k)</label>
                    <span className="text-blue-400 font-mono">{springK}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="500"
                    value={springK}
                    onChange={(e) => setSpringK(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>软</span>
                    <span>硬</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-slate-300">物体质量 (m)</label>
                    <span className="text-green-400 font-mono">{mass.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={mass}
                    onChange={(e) => setMass(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>轻</span>
                    <span>重</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-slate-300">空气阻力 (c)</label>
                    <span className="text-orange-400 font-mono">{damping.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="0.5"
                    value={damping}
                    onChange={(e) => setDamping(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>无阻力</span>
                    <span>强阻力</span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-t border-slate-700">
                  <span className="text-slate-300">显示轨迹</span>
                  <button
                    onClick={() => setShowTrail(!showTrail)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      showTrail ? "bg-blue-500" : "bg-slate-600"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                        showTrail ? "translate-x-6" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                <button
                  onClick={resetSimulation}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105 active:scale-95"
                >
                  重置仿真
                </button>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">运动状态分析</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">阻尼类型</span>
                  <span className={`font-semibold ${dampingInfo.color}`}>{dampingInfo.type}</span>
                </div>
                <p className="text-sm text-slate-500">{dampingInfo.desc}</p>
                <div className="h-px bg-slate-700 my-3" />
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">固有频率</span>
                  <span className="text-white font-mono">{naturalFrequency.toFixed(2)} rad/s</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">阻尼频率</span>
                  <span className="text-white font-mono">{dampedFrequency.toFixed(2)} rad/s</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur rounded-2xl p-6 border border-blue-500/30">
              <h3 className="text-lg font-semibold text-white mb-3">💡 物理公式</h3>
              <div className="space-y-2 text-sm">
                <p className="text-slate-300">运动方程:</p>
                <p className="text-blue-300 font-mono bg-slate-900/50 px-3 py-2 rounded">
                  m·x'' + c·x' + k·x = 0
                </p>
                <p className="text-slate-400 text-xs mt-2">
                  其中 m=质量, c=阻尼系数, k=弹簧系数
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700">
            <div className="text-green-400 font-semibold mb-2">🌱 欠阻尼</div>
            <p className="text-slate-400 text-sm">阻尼较小，物体在平衡位置附近往复振动，振幅逐渐减小</p>
          </div>
          <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700">
            <div className="text-blue-400 font-semibold mb-2">⚡ 临界阻尼</div>
            <p className="text-slate-400 text-sm">阻尼适中，物体不发生振动，最快回到平衡位置</p>
          </div>
          <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700">
            <div className="text-red-400 font-semibold mb-2">🐌 过阻尼</div>
            <p className="text-slate-400 text-sm">阻尼过大，物体缓慢回到平衡位置，不产生振动</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpringLine({ springX, springY, anchorX, anchorY, getSpringPath }: {
  springX: any;
  springY: any;
  anchorX: number;
  anchorY: number;
  getSpringPath: (x1: number, y1: number, x2: number, y2: number, coils?: number) => string;
}) {
  const [path, setPath] = useState(getSpringPath(anchorX, anchorY, anchorX, anchorY + 200));

  useEffect(() => {
    const updatePath = () => {
      const x = springX.get();
      const y = springY.get();
      setPath(getSpringPath(anchorX, anchorY, x, y));
      requestAnimationFrame(updatePath);
    };
    const id = requestAnimationFrame(updatePath);
    return () => cancelAnimationFrame(id);
  }, [springX, springY, anchorX, anchorY, getSpringPath]);

  return (
    <path
      d={path}
      fill="none"
      stroke="url(#springGradient)"
      strokeWidth="4"
      strokeLinecap="round"
      filter="url(#glow)"
    />
  );
}
