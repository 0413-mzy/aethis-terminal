'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { BOSSES } from '@/data/bosses';

export function BossHistoryView() {
  const bossHistory = useGameStore((s) => s.bossHistory);
  const bossDefeatCount = useGameStore((s) => s.bossDefeatCount);

  if (bossHistory.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">🏰</div>
        <h3 className="medieval text-lg text-[var(--color-text-muted)] mb-2">
          尚未击败任何Boss
        </h3>
        <p className="text-sm text-[var(--color-text-muted)]">
          每完成10个任务将遭遇一个Boss，击败它来留下你的传奇！
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="medieval text-xl text-[var(--color-accent)] mb-1">
          🏆 Boss讨伐记录
        </h2>
        <p className="text-xs text-[var(--color-text-muted)]">
          已击败 {bossDefeatCount} 个Boss
        </p>
      </div>

      <div className="space-y-3">
        {bossHistory.map((entry, i) => {
          const bossDef = BOSSES.find((b) => b.id === entry.bossId);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">
                  {bossDef?.theme === 'fire' ? '🐉' :
                   bossDef?.theme === 'shadow' ? '👹' :
                   bossDef?.theme === 'ice' ? '❄️' :
                   bossDef?.theme === 'void' ? '👻' :
                   bossDef?.theme === 'earth' ? '🪨' : '👾'}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
                    {entry.bossName}
                  </h3>
                  <p className="text-[10px] text-[var(--color-text-muted)]">
                    击败于 {new Date(entry.defeatedAt).toLocaleDateString('zh-CN', {
                      year: 'numeric', month: 'long', day: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[var(--color-bg-tertiary)] rounded-lg p-2 text-center">
                  <div className="text-[10px] text-[var(--color-text-muted)]">战斗时等级</div>
                  <div className="text-sm font-bold text-[var(--color-text-primary)]">
                    Lv.{entry.playerLevel}
                  </div>
                </div>
                <div className="bg-[var(--color-bg-tertiary)] rounded-lg p-2 text-center">
                  <div className="text-[10px] text-[var(--color-text-muted)]">造成伤害</div>
                  <div className="text-sm font-bold text-[var(--color-danger)]">
                    {entry.damageDealt}
                  </div>
                </div>
                <div className="bg-[var(--color-bg-tertiary)] rounded-lg p-2 text-center">
                  <div className="text-[10px] text-[var(--color-text-muted)]">获得经验</div>
                  <div className="text-sm font-bold text-[var(--color-accent)]">
                    +{entry.xpEarned}
                  </div>
                </div>
                <div className="bg-[var(--color-bg-tertiary)] rounded-lg p-2 text-center">
                  <div className="text-[10px] text-[var(--color-text-muted)]">获得金币</div>
                  <div className="text-sm font-bold text-[var(--color-accent)]">
                    🪙{entry.goldEarned}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
