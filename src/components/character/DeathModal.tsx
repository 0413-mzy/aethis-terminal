'use client';

import { motion } from 'framer-motion';
import { useCharacterStore } from '@/stores/characterStore';
import { useUIStore } from '@/stores/uiStore';
import { Button } from '@/components/ui/Button';
import { particleEmitters } from '@/components/effects/ParticleCanvas';
import { useEffect } from 'react';

export function DeathModal() {
  const character = useCharacterStore((s) => s.character);
  const closeModal = useUIStore((s) => s.closeModal);

  useEffect(() => {
    particleEmitters.emit(window.innerWidth / 2, window.innerHeight / 2, {
      count: 60,
      spread: 360,
      speed: 3,
      colors: ['#8b0000', '#440000', '#ff0000'],
      size: 5,
      life: 4,
      gravity: 15,
    });
  }, []);

  return (
    <div className="p-6 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 8 }}
        className="text-6xl mb-4"
      >
        💀
      </motion.div>

      <h2 className="medieval text-2xl text-[var(--color-danger-glow)] mb-2">
        你倒下了
      </h2>

      <p className="text-sm text-[var(--color-text-secondary)] mb-4">
        生命值归零。你失去了一半金币和连签天数。
        但真正的冒险者总会重新站起。
      </p>

      <div className="bg-[var(--color-bg-tertiary)] rounded-lg p-3 mb-6 space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-[var(--color-text-muted)]">金币损失：</span>
          <span className="text-[var(--color-danger-glow)]">50%</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-[var(--color-text-muted)]">剩余金币：</span>
          <span className="text-[var(--color-accent)]">🪙 {(character.gold ?? 0).toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-[var(--color-text-muted)]">生命恢复至：</span>
          <span className="text-green-400">{Math.floor(character.maxHP * 0.5)} / {character.maxHP}</span>
        </div>
      </div>

      <Button variant="gold" size="lg" onClick={closeModal}>
        重新站起
      </Button>
    </div>
  );
}
