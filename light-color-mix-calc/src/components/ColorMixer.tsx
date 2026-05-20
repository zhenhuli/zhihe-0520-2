"use client";

import { useState, useEffect, useCallback } from "react";

interface ColorRecipe {
  id: string;
  name: string;
  red: number;
  green: number;
  blue: number;
  createdAt: number;
}

const defaultRecipes: ColorRecipe[] = [
  { id: "1", name: "舞台暖白", red: 255, green: 240, blue: 220, createdAt: Date.now() },
  { id: "2", name: "冷色调蓝", red: 50, green: 150, blue: 255, createdAt: Date.now() },
  { id: "3", name: "热情品红", red: 255, green: 0, blue: 255, createdAt: Date.now() },
  { id: "4", name: "青春青绿", red: 0, green: 255, blue: 200, createdAt: Date.now() },
  { id: "5", name: "金色年华", red: 255, green: 200, blue: 50, createdAt: Date.now() },
];

export default function ColorMixer() {
  const [red, setRed] = useState(255);
  const [green, setGreen] = useState(255);
  const [blue, setBlue] = useState(255);
  const [recipeName, setRecipeName] = useState("");
  const [recipes, setRecipes] = useState<ColorRecipe[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string; value: string } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("colorRecipes");
    if (saved) {
      try {
        setRecipes(JSON.parse(saved));
      } catch {
        setRecipes(defaultRecipes);
      }
    } else {
      setRecipes(defaultRecipes);
    }
  }, []);

  useEffect(() => {
    if (recipes.length > 0) {
      localStorage.setItem("colorRecipes", JSON.stringify(recipes));
    }
  }, [recipes]);

  const rgbToHex = (r: number, g: number, b: number): string => {
    return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("").toUpperCase();
  };

  const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  const getBrightnessRatio = (value: number): string => {
    return ((value / 255) * 100).toFixed(1);
  };

  const getMixRatio = (): { r: string; g: string; b: string } => {
    const total = red + green + blue;
    if (total === 0) return { r: "0.0", g: "0.0", b: "0.0" };
    return {
      r: ((red / total) * 100).toFixed(1),
      g: ((green / total) * 100).toFixed(1),
      b: ((blue / total) * 100).toFixed(1),
    };
  };

  const hex = rgbToHex(red, green, blue);
  const hsl = rgbToHsl(red, green, blue);
  const mixRatio = getMixRatio();
  const mixedColorStyle = {
    backgroundColor: `rgb(${red}, ${green}, ${blue})`,
    "--mixed-glow": `rgba(${red}, ${green}, ${blue}, 0.5)`,
  } as React.CSSProperties;

  const copyToClipboard = useCallback((text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    const typeLabels: Record<string, string> = {
      hex: "HEX 色值",
      rgb: "RGB 色值",
      hsl: "HSL 色值",
      ratio: "混色配比",
    };
    setToast({
      show: true,
      message: `已复制 ${typeLabels[type] || "内容"}`,
      value: text,
    });
    setTimeout(() => {
      setCopied(null);
      setToast(null);
    }, 2000);
  }, []);

  const saveRecipe = () => {
    if (!recipeName.trim()) return;
    const newRecipe: ColorRecipe = {
      id: Date.now().toString(),
      name: recipeName.trim(),
      red,
      green,
      blue,
      createdAt: Date.now(),
    };
    setRecipes((prev) => [newRecipe, ...prev]);
    setRecipeName("");
    setShowSaveModal(false);
  };

  const loadRecipe = (recipe: ColorRecipe) => {
    setRed(recipe.red);
    setGreen(recipe.green);
    setBlue(recipe.blue);
  };

  const deleteRecipe = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  };

  const resetColors = () => {
    setRed(255);
    setGreen(255);
    setBlue(255);
  };

  const setRandomColor = () => {
    setRed(Math.floor(Math.random() * 256));
    setGreen(Math.floor(Math.random() * 256));
    setBlue(Math.floor(Math.random() * 256));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <header className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-red-400 via-green-400 to-blue-400 bg-clip-text text-transparent">
          光学三原色混色精准演算工具
        </h1>
        <p className="text-slate-400 text-lg">
          RGB Light Color Mixing Calculator · 专业舞台灯光混色设计
        </p>
      </header>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <div
            className="aspect-square rounded-3xl flex items-center justify-center transition-all duration-300 glow-mixed relative overflow-hidden"
            style={mixedColorStyle}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            <div className="text-center z-10 p-8">
              <div
                className="inline-block px-6 py-3 rounded-2xl mb-4 backdrop-blur-md"
                style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
              >
                <span className="text-3xl font-mono font-bold tracking-wider">{hex}</span>
              </div>
              <p
                className="text-sm opacity-80"
                style={{ color: hsl.l > 50 ? "#000" : "#fff" }}
              >
                点击色值复制
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(hex, "hex")}
              className="absolute inset-0 cursor-pointer"
              aria-label="复制色值"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div
              className="aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300 glow-red"
              style={{ backgroundColor: `rgb(${red}, 0, 0)` }}
            >
              <span className="text-2xl font-bold text-white drop-shadow-lg">R</span>
              <span className="text-white/90 font-mono text-xl">{red}</span>
              <span className="text-white/70 text-sm">{getBrightnessRatio(red)}%</span>
            </div>
            <div
              className="aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300 glow-green"
              style={{ backgroundColor: `rgb(0, ${green}, 0)` }}
            >
              <span className="text-2xl font-bold text-white drop-shadow-lg">G</span>
              <span className="text-white/90 font-mono text-xl">{green}</span>
              <span className="text-white/70 text-sm">{getBrightnessRatio(green)}%</span>
            </div>
            <div
              className="aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300 glow-blue"
              style={{ backgroundColor: `rgb(0, 0, ${blue})` }}
            >
              <span className="text-2xl font-bold text-white drop-shadow-lg">B</span>
              <span className="text-white/90 font-mono text-xl">{blue}</span>
              <span className="text-white/70 text-sm">{getBrightnessRatio(blue)}%</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold mb-6 text-slate-200">光源亮度调节</h2>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-red-400 font-medium flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-red-500" />
                    红色通道 (R)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="255"
                      value={red}
                      onChange={(e) => setRed(Math.max(0, Math.min(255, parseInt(e.target.value) || 0)))}
                      className="w-20 bg-slate-900 border border-slate-600 rounded-lg px-3 py-1 text-center font-mono text-red-400"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={red}
                  onChange={(e) => setRed(parseInt(e.target.value))}
                  className="w-full slider-red"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-green-400 font-medium flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-green-500" />
                    绿色通道 (G)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="255"
                      value={green}
                      onChange={(e) => setGreen(Math.max(0, Math.min(255, parseInt(e.target.value) || 0)))}
                      className="w-20 bg-slate-900 border border-slate-600 rounded-lg px-3 py-1 text-center font-mono text-green-400"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={green}
                  onChange={(e) => setGreen(parseInt(e.target.value))}
                  className="w-full slider-green"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-blue-400 font-medium flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-500" />
                    蓝色通道 (B)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="255"
                      value={blue}
                      onChange={(e) => setBlue(Math.max(0, Math.min(255, parseInt(e.target.value) || 0)))}
                      className="w-20 bg-slate-900 border border-slate-600 rounded-lg px-3 py-1 text-center font-mono text-blue-400"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={blue}
                  onChange={(e) => setBlue(parseInt(e.target.value))}
                  className="w-full slider-blue"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={resetColors}
                className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors font-medium"
              >
                重置
              </button>
              <button
                onClick={setRandomColor}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg transition-colors font-medium"
              >
                随机配色
              </button>
              <button
                onClick={() => setShowSaveModal(true)}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 rounded-lg transition-colors font-medium"
              >
                保存配方
              </button>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold mb-4 text-slate-200">混色参数输出</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: "HEX", value: hex, type: "hex" },
                { label: "RGB", value: `rgb(${red}, ${green}, ${blue})`, type: "rgb" },
                { label: "HSL", value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, type: "hsl" },
                {
                  label: "配比 R:G:B",
                  value: `${mixRatio.r}% : ${mixRatio.g}% : ${mixRatio.b}%`,
                  type: "ratio",
                },
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => copyToClipboard(item.value, item.type)}
                  className="bg-slate-900/60 rounded-xl p-3 text-left hover:bg-slate-900 transition-colors group border border-slate-700 hover:border-slate-600"
                >
                  <div className="text-xs text-slate-500 mb-1">{item.label}</div>
                  <div className="font-mono text-sm text-slate-200 flex justify-between items-center">
                    <span>{item.value}</span>
                    <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity text-green-400">
                      {copied === item.type ? "✓ 已复制" : "复制"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold mb-4 text-slate-200">保存的配方 ({recipes.length})</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {recipes.length === 0 ? (
                <p className="text-slate-500 text-center py-4">暂无保存的配方</p>
              ) : (
                recipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    onClick={() => loadRecipe(recipe)}
                    className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-xl hover:bg-slate-900 transition-colors cursor-pointer group border border-slate-700 hover:border-slate-600"
                  >
                    <div
                      className="w-12 h-12 rounded-lg flex-shrink-0 shadow-lg"
                      style={{
                        backgroundColor: `rgb(${recipe.red}, ${recipe.green}, ${recipe.blue})`,
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-200 truncate">{recipe.name}</div>
                      <div className="text-xs text-slate-500 font-mono">
                        {rgbToHex(recipe.red, recipe.green, recipe.blue)}
                      </div>
                    </div>
                    <button
                      onClick={(e) => deleteRecipe(recipe.id, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-500/20 rounded-lg text-red-400"
                      aria-label="删除配方"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {showSaveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700 shadow-2xl">
            <h3 className="text-xl font-semibold mb-4 text-slate-200">保存混色配方</h3>
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-20 h-20 rounded-xl shadow-lg"
                style={{ backgroundColor: `rgb(${red}, ${green}, ${blue})` }}
              />
              <div>
                <div className="font-mono text-2xl text-slate-200">{hex}</div>
                <div className="text-sm text-slate-400">
                  R:{red} G:{green} B:{blue}
                </div>
              </div>
            </div>
            <input
              type="text"
              placeholder="输入配方名称..."
              value={recipeName}
              onChange={(e) => setRecipeName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveRecipe()}
              autoFocus
              className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 mb-4 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setRecipeName("");
                }}
                className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={saveRecipe}
                disabled={!recipeName.trim()}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 rounded-xl transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-green-400/30">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <div className="font-semibold">{toast.message}</div>
              <div className="text-sm font-mono opacity-90 bg-black/20 px-2 py-0.5 rounded inline-block mt-0.5">
                {toast.value}
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-12 text-center text-slate-500 text-sm">
        <p>光学三原色加色模型 · 色光混合遵循加法法则 · 舞台灯光设计辅助工具</p>
      </footer>
    </div>
  );
}
