'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/stores/uiStore';
import { useGameStore } from '@/stores/gameStore';
import { CharacterPanel } from '@/components/character/CharacterPanel';
import { FilterBar } from '@/components/tasks/FilterBar';
import { InventoryGrid } from '@/components/shop/InventoryGrid';
import { ShopPanel } from '@/components/shop/ShopPanel';

const tabs = [
  { id: 'character', label: '⚔️ 执行官' },
  { id: 'filters', label: '🔍 筛选' },
  { id: 'inventory', label: '💎 装备库' },
  { id: 'shop', label: '🏪 军需处' },
] as const;

export function Sidebar() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const sidebarTab = useUIStore((s) => s.sidebarTab);
  const setSidebarTab = useUIStore((s) => s.setSidebarTab);
  const focusMode = useGameStore((s) => s.focusMode);

  if (focusMode) return null;

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 300, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] overflow-hidden flex-shrink-0"
        >
          <div className="w-[300px] h-full flex flex-col">
            <div className="flex border-b border-[var(--color-border)]">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSidebarTab(tab.id as typeof sidebarTab)}
                  className={`flex-1 py-2 text-xs font-medium transition-colors cursor-pointer ${
                    sidebarTab === tab.id
                      ? 'text-[var(--color-accent)] border-b-2 border-[var(--color-accent)]'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {sidebarTab === 'character' && <CharacterPanel />}
              {sidebarTab === 'filters' && <FilterBar />}
              {sidebarTab === 'inventory' && <InventoryGrid />}
              {sidebarTab === 'shop' && <ShopPanel />}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
