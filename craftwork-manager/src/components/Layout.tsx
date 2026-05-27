'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface LayoutProps {
  children: React.ReactNode;
}

const primaryNavItems = [
  { path: '/', label: '首页', icon: '🏠' },
  { path: '/dashboard', label: '数据看板', icon: '📊' },
  { path: '/works', label: '作品管理', icon: '🎨' },
  { path: '/orders', label: '订单管理', icon: '📝' },
  { path: '/statistics', label: '收益统计', icon: '💰' },
];

const moreNavItems = [
  { path: '/materials', label: '耗材管理', icon: '📦' },
  { path: '/process-steps', label: '工艺步骤库', icon: '⚙️' },
  { path: '/templates', label: '工艺模板', icon: '📋' },
  { path: '/batch-calculator', label: '批量计算', icon: '🔢' },
  { path: '/gallery', label: '作品相册', icon: '🖼️' },
  { path: '/pricing', label: '定价对比', icon: '📈' },
  { path: '/reports', label: '成本报表', icon: '📑' },
];

const allNavItems = [...primaryNavItems, ...moreNavItems];

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isInMoreMenu = moreNavItems.some(item => pathname === item.path);

  return (
    <div className="flex flex-col min-h-screen bg-amber-50">
      <header className="bg-gradient-to-r from-amber-700 to-amber-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">✂️</span>
              <div>
                <h1 className="text-2xl font-bold">匠心工坊</h1>
                <p className="text-amber-100 text-sm">手艺人的全链路管理系统</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-1">
              {primaryNavItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                    pathname === item.path
                      ? 'bg-white/20 text-white font-medium'
                      : 'text-amber-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
              <div className="relative" ref={moreMenuRef}>
                <button
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                    isInMoreMenu
                      ? 'bg-white/20 text-white font-medium'
                      : 'text-amber-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>☰</span>
                  <span>更多</span>
                  <span className={`transition-transform duration-200 ${showMoreMenu ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                {showMoreMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50">
                    {moreNavItems.map((item) => (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={() => setShowMoreMenu(false)}
                        className={`px-4 py-2 flex items-center space-x-3 transition-colors ${
                          pathname === item.path
                            ? 'bg-amber-50 text-amber-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>

      <nav className="md:hidden bg-amber-600 text-white px-4 py-2 overflow-x-auto">
        <div className="flex space-x-2">
          {allNavItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap flex items-center space-x-1 ${
                pathname === item.path
                  ? 'bg-white/20 font-medium'
                  : 'text-amber-100 hover:bg-white/10'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {children}
      </main>

      <footer className="bg-amber-800 text-amber-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm">匠心工坊 © 2024 - 让每一件手作都有价值</p>
        </div>
      </footer>
    </div>
  );
}
