'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface ControlPanelProps {
  onAddGear: (teeth: number) => void;
  onSetDriverSpeed: (speed: number) => void;
  onToggleRunning: () => void;
  onReset: () => void;
  onDeleteSelected: () => void;
  isRunning: boolean;
  driverSpeed: number;
  selectedGearId: string | null;
  gearCount: number;
}

const PRESET_TEETH = [8, 12, 16, 20, 24, 30, 36, 40];

export function ControlPanel({
  onAddGear,
  onSetDriverSpeed,
  onToggleRunning,
  onReset,
  onDeleteSelected,
  isRunning,
  driverSpeed,
  selectedGearId,
  gearCount,
}: ControlPanelProps) {
  const [customTeeth, setCustomTeeth] = useState(20);

  return (
    <motion.div
      className="absolute left-4 top-4 z-10 bg-gray-800 bg-opacity-95 rounded-xl p-5 text-white shadow-2xl border border-gray-700"
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ width: 280 }}
    >
      <h2 className="text-xl font-bold mb-4 text-yellow-400 flex items-center gap-2">
        <span>⚙️</span> 齿轮传动模拟器
      </h2>

      <div className="mb-5">
        <h3 className="text-sm font-semibold text-gray-400 mb-2">添加齿轮</h3>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {PRESET_TEETH.map((teeth) => (
            <motion.button
              key={teeth}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onAddGear(teeth)}
              disabled={isRunning}
              className={`px-2 py-2 text-xs font-bold rounded-lg transition-colors ${
                isRunning
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {teeth}
            </motion.button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            min={6}
            max={60}
            value={customTeeth}
            onChange={(e) => setCustomTeeth(Math.max(6, Math.min(60, parseInt(e.target.value) || 6)))}
            disabled={isRunning}
            className="flex-1 px-3 py-2 bg-gray-700 rounded-lg text-center text-sm border border-gray-600 focus:outline-none focus:border-blue-500"
          />
          <motion.button
            whileHover={{ scale: isRunning ? 1 : 1.05 }}
            whileTap={{ scale: isRunning ? 1 : 0.95 }}
            onClick={() => onAddGear(customTeeth)}
            disabled={isRunning}
            className={`px-4 py-2 text-sm font-bold rounded-lg ${
              isRunning
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-500 text-white'
            }`}
          >
            添加
          </motion.button>
        </div>
      </div>

      <div className="mb-5">
        <h3 className="text-sm font-semibold text-gray-400 mb-2">
          动力转速: <span className="text-yellow-400">{driverSpeed} RPM</span>
        </h3>
        <input
          type="range"
          min={5}
          max={100}
          value={driverSpeed}
          onChange={(e) => onSetDriverSpeed(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-400"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>慢</span>
          <span>快</span>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onToggleRunning}
          className={`flex-1 py-3 rounded-lg font-bold text-sm transition-colors ${
            isRunning
              ? 'bg-red-600 hover:bg-red-500'
              : 'bg-emerald-600 hover:bg-emerald-500'
          }`}
        >
          {isRunning ? '⏹ 停止' : '▶ 运行'}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onReset}
          className="flex-1 py-3 rounded-lg font-bold text-sm bg-gray-600 hover:bg-gray-500"
        >
          🔄 重置
        </motion.button>
      </div>

      {selectedGearId && (
        <motion.button
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onDeleteSelected}
          disabled={isRunning}
          className={`w-full py-2 rounded-lg font-bold text-sm mb-4 ${
            isRunning
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-red-700 hover:bg-red-600 text-white'
          }`}
        >
          🗑️ 删除选中齿轮
        </motion.button>
      )}

      <div className="border-t border-gray-700 pt-4">
        <h3 className="text-xs font-semibold text-gray-400 mb-2">使用说明</h3>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>• 点击齿轮可选中齿轮</li>
          <li>• 拖拽齿轮调整位置</li>
          <li>• 齿轮靠近自动啮合</li>
          <li>• 蓝色为主动轮</li>
          <li>• 运行时无法编辑</li>
        </ul>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-700">
        <p className="text-xs text-gray-500">
          当前齿轮数量: <span className="text-white font-bold">{gearCount}</span>
        </p>
      </div>
    </motion.div>
  );
}
