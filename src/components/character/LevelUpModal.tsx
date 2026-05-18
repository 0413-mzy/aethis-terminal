'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCharacterStore } from '@/stores/characterStore';
import { useUIStore } from '@/stores/uiStore';
import { StatType } from '@/types';
import { Button } from '@/components/ui/Button';
import { particleEmitters } from '@/components/effects/ParticleCanvas';

const statInfo: Record<StatType, { label: string; icon: string }> = {
  strength: { label: '力量', icon: '💪' },
  intelligence: { label: '智力', icon: '🧠' },
  agility: { label: '敏捷', icon: '💨' },
  vitality: { label: '体力', icon: '❤️' },
};

export function LevelUpModal() {
  const character = useCharacterStore((s) => s.character);
  const allocateStatPoint = useCharacterStore((s) => s.allocateStatPoint);
  const closeModal = useUIStore((s) => s.closeModal);

  useEffect(() => {
    particleEmitters.emit(window.innerWidth / 2, window.innerHeight / 2, {
      count: 100,
      spread: 360,
      speed: 6,
      colors: ['#c9a44b', '#f0c860', '#ffd700', '#fff'],
      size: 5,
      life: 3,
      gravity: 30,
    });
  }, []);

  return (
    <div className="p-6 text-center">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 10 }}
        className="text-6xl mb-4"
      >
        ⭐
      </motion.div>

      <h2 className="medieval text-3xl text-[var(--color-accent)] mb-2">
        升级了！
      </h2>
      <p className="text-lg text-[var(--color-text-primary)] mb-1">
        你现在是 <span className="text-[var(--color-accent)] font-bold">{character.level} 级</span>
      </p>
      <p className="text-sm text-[var(--color-text-secondary)] mb-6">
        生命值完全恢复！你有 {character.unspentStatPoints} 点属性可以分配。
      </p>

      {character.unspentStatPoints > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-6">
          {(Object.keys(statInfo) as StatType[]).map((stat) => (
            <button
              key={stat}
              onClick={() => allocateStatPoint(stat)}
              className="flex items-center gap-2 p-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg hover:border-[var(--color-accent)] transition-colors cursor-pointer"
            >
              <span className="text-lg">{statInfo[stat].icon}</span>
              <div className="text-left">
                <div className="text-xs font-medium text-[var(--color-text-primary)]">
                  {statInfo[stat].label}
                </div>
                <div className="text-sm text-[var(--color-accent)] font-bold">
                  {character.stats[stat]}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <Button variant="gold" size="lg" onClick={closeModal}>
        {character.unspentStatPoints > 0 ? '稍后分配' : '继续冒险！'}
      </Button>
    </div>
  );
}
