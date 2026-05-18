'use client';

import { useCharacterStore } from '@/stores/characterStore';
import { useGameStore } from '@/stores/gameStore';
import { useUIStore } from '@/stores/uiStore';
import { xpToNextLevel } from '@/lib/constants';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { motion } from 'framer-motion';

export function Header() {
  const character = useCharacterStore((s) => s.character);
  const streaks = useGameStore((s) => s.streaks);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const activeView = useUIStore((s) => s.activeView);
  const setView = useUIStore((s) => s.setView);
  const bossBattle = useGameStore((s) => s.bossBattle);
  const combo = useGameStore((s) => s.combo);
  const focusMode = useGameStore((s) => s.focusMode);
  const toggleFocusMode = useGameStore((s) => s.toggleFocusMode);

  const xpNeeded = xpToNextLevel(character.level);
  const hpPct = character.maxHP > 0 ? (character.currentHP / character.maxHP) * 100 : 100;
  const isHpLow = hpPct < 30;

  return (
    <header className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors p-1"
          title={sidebarOpen ? '关闭侧边栏' : '打开侧边栏'}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </button>

        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-[var(--color-bg-tertiary)] border-2 border-[var(--color-accent)] flex items-center justify-center text-lg flex-shrink-0">
            {character.avatarId ? (
              <span className="text-xs">🛡️</span>
            ) : (
              <span className="medieval text-[var(--color-accent)] text-sm">
                {character.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[var(--color-text-primary)] text-sm truncate medieval">
                {character.name || '冒险者'}
              </span>
              {character.title && (
                <span className="text-[10px] text-[var(--color-accent)] italic hidden sm:inline">
                  {character.title}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="accent" size="sm">
                Lv.{character.level}
              </Badge>
              {streaks.currentStreak > 0 && (
                <span className="text-[10px] text-[var(--color-accent)]">
                  🔥 {streaks.currentStreak}天
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-1 min-w-0 ml-2">
          <div className="flex items-center gap-2">
            <motion.span
              className="text-[10px] text-[var(--color-danger)] w-8 flex-shrink-0"
              animate={isHpLow ? { opacity: [1, 0.3, 1] } : {}}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              {isHpLow ? '⚠️' : '意志'}
            </motion.span>
            <ProgressBar
              current={character.currentHP}
              max={character.maxHP}
              color={isHpLow ? '#ff0000' : 'var(--color-hp-bar)'}
              bgColor="var(--color-hp-bar-bg)"
              height="h-2"
              className="flex-1"
            />
            <span className="text-[10px] text-[var(--color-text-muted)] w-16 text-right flex-shrink-0">
              {character.currentHP}/{character.maxHP}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--color-accent)] w-8 flex-shrink-0">算力</span>
            <ProgressBar
              current={character.currentXP}
              max={xpNeeded}
              color="var(--color-xp-bar)"
              bgColor="var(--color-bg-primary)"
              height="h-1.5"
              className="flex-1"
            />
            <span className="text-[10px] text-[var(--color-text-muted)] w-16 text-right flex-shrink-0">
              {character.currentXP}/{xpNeeded}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[var(--color-accent)] flex-shrink-0">
          <span className="text-sm">🪙</span>
          <span className="font-bold text-sm">{(character.gold ?? 0).toLocaleString()}</span>
        </div>

        {combo >= 3 && (
          <motion.span
            key={combo}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-xs font-bold flex-shrink-0"
            style={{ color: combo >= 10 ? '#ff6600' : combo >= 5 ? '#ffd700' : '#c9a44b' }}
          >
            {combo >= 10 ? '⚡⚡⚡' : combo >= 5 ? '⚡⚡' : '⚡'}x{combo}
          </motion.span>
        )}

        <button
          onClick={toggleFocusMode}
          className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors flex-shrink-0 cursor-pointer px-2 py-1 rounded border border-[var(--color-border)]"
          title={focusMode ? '切换到冒险模式' : '深度超频：进入纯白专注空间'}
        >
          {focusMode ? '🗡️ 冒险' : '🔷 超频'}
        </button>

        <div className="flex items-center gap-1 bg-[var(--color-bg-tertiary)] rounded-lg p-0.5 flex-shrink-0">
          {(['tasks', 'boss', 'stats'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setView(view)}
              className={`px-3 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                activeView === view
                  ? 'bg-[var(--color-accent)] text-black font-medium'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {view === 'tasks' && '📋 委托'}
              {view === 'boss' && (bossBattle ? '⚔️ 讨伐!' : '⚔️ 讨伐')}
              {view === 'stats' && '📊 数据'}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
