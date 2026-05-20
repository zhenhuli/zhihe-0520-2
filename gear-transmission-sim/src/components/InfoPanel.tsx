'use client';

import { motion } from 'framer-motion';
import { GearData } from '@/types/gear';
import { calculateGearRatio } from '@/utils/gearUtils';

interface InfoPanelProps {
  gears: GearData[];
  isRunning: boolean;
  driverSpeed: number;
}

export function InfoPanel({ gears, isRunning, driverSpeed }: InfoPanelProps) {
  const driverGear = gears.find((g) => g.isDriver);
  const drivenGears = gears.filter((g) => !g.isDriver);

  return (
    <motion.div
      className="absolute right-4 top-4 z-10 bg-gray-800 bg-opacity-95 rounded-xl p-5 text-white shadow-2xl border border-gray-700"
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      style={{ width: 280 }}
    >
      <h2 className="text-lg font-bold mb-4 text-cyan-400 flex items-center gap-2">
        <span>📊</span> 传动信息
      </h2>

      {driverGear && (
        <div className="mb-4 p-3 bg-blue-900 bg-opacity-50 rounded-lg border border-blue-700">
          <p className="text-sm font-semibold text-blue-300">主动轮</p>
          <p className="text-xs text-gray-400">齿数: {driverGear.teeth}</p>
          <p className="text-xs text-gray-400">
            转速: <span className="text-yellow-400 font-bold">{driverSpeed} RPM</span>
          </p>
          <p className="text-xs text-gray-400">
            方向: <span className="text-green-400">顺时针</span>
          </p>
        </div>
      )}

      {drivenGears.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-2">从动轮</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {drivenGears.map((gear) => {
              const ratio = driverGear ? calculateGearRatio(driverGear.teeth, gear.teeth) : 0;
              const actualSpeed = driverSpeed * ratio;
              return (
                <motion.div
                  key={gear.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-2 bg-gray-700 bg-opacity-50 rounded-lg border border-gray-600"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-300">{gear.teeth} 齿</span>
                    <span className={`text-xs font-bold ${gear.direction === 1 ? 'text-green-400' : 'text-orange-400'}`}>
                      {gear.direction === 1 ? '→ 顺时针' : '← 逆时针'}
                    </span>
                  </div>
                  {driverGear && (
                    <>
                      <p className="text-xs text-gray-500 mt-1">
                        传动比: <span className="text-cyan-400">{ratio.toFixed(2)}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        实际转速: <span className="text-yellow-400">{actualSpeed.toFixed(1)} RPM</span>
                      </p>
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {gears.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          请添加齿轮开始演示
        </p>
      )}

      <div className="mt-4 pt-3 border-t border-gray-700">
        <h3 className="text-xs font-semibold text-gray-400 mb-2">传动原理</h3>
        <div className="text-xs text-gray-500 space-y-1">
          <p>• 传动比 = 主动轮齿数 / 从动轮齿数</p>
          <p>• 从动轮转速 = 主动轮转速 × 传动比</p>
          <p>• 啮合齿轮转动方向相反</p>
          <p>• 齿数越少，转速越快</p>
        </div>
      </div>

      {isRunning && (
        <motion.div
          className="mt-4 p-2 bg-emerald-900 bg-opacity-50 rounded-lg text-center"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <span className="text-emerald-400 text-sm font-bold">⚡ 正在运行中</span>
        </motion.div>
      )}
    </motion.div>
  );
}
