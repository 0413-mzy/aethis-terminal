'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { Achievement } from '@/types';

export function AchievementToast() {
  const achievements = useGameStore((s) => s.achievements);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const newlyUnlocked = achievements.filter(
      (a) => a.unlockedAt && !visibleIds.has(a.id)
    );

    if (newlyUnlocked.length > 0) {
      for (const achievement of newlyUnlocked) {
        setVisibleIds((prev) => new Set(prev).add(achievement.id));
        setRecentAchievements((prev) => {
          if (prev.some((a) => a.id === achievement.id)) return prev;
          return [...prev.slice(-2), achievement];
        });

        setTimeout(() => {
          setRecentAchievements((prev) =>
            prev.filter((a) => a.id !== achievement.id)
          );
        }, 5000);
      }
    }
  }, [achievements, visibleIds]);

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {recentAchievements.map((achievement) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-[var(--color-bg-secondary)] border border-[var(--color-magic)] rounded-xl px-4 py-3 shadow-lg pointer-events-auto flex items-center gap-3"
          >
            <span className="text-2xl">🏆</span>
            <div>
              <div className="text-xs text-[var(--color-magic-glow)] font-bold">
                成就解锁！
              </div>
              <div className="text-sm font-bold text-[var(--color-text-primary)]">
                {achievement.name}
              </div>
              <div className="text-[10px] text-[var(--color-text-secondary)]">
                {achievement.description}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
