'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useUIStore } from '@/stores/uiStore';
import { BOSSES } from '@/data/bosses';
import { Button } from '@/components/ui/Button';
import { particleEmitters } from '@/components/effects/ParticleCanvas';

export function BossEncounterModal() {
  const bossBattle = useGameStore((s) => s.bossBattle);
  const closeModal = useUIStore((s) => s.closeModal);
  const setView = useUIStore((s) => s.setView);

  const bossDef = bossBattle ? BOSSES.find((b) => b.id === bossBattle.bossId) : null;

  useEffect(() => {
    particleEmitters.emit(window.innerWidth / 2, window.innerHeight / 2, {
      count: 80,
      spread: 360,
      speed: 5,
      colors: ['#8b0000', '#ff4444', '#ff6600', '#000'],
      size: 6,
      life: 3,
      gravity: 20,
    });
  }, []);

  const handleFace = () => {
    closeModal();
    setView('boss');
  };

  if (!bossDef) return null;

  return (
    <div className="p-8 text-center">
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 8, stiffness: 200 }}
        className="text-7xl mb-4"
      >
        {bossDef.theme === 'fire' ? '🐉' :
         bossDef.theme === 'shadow' ? '👹' :
         bossDef.theme === 'ice' ? '❄️' :
         bossDef.theme === 'void' ? '👻' :
         bossDef.theme === 'earth' ? '🪨' : '👾'}
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="medieval text-3xl text-[var(--color-danger-glow)] mb-1"
      >
        {bossDef.name}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-sm text-[var(--color-text-muted)] italic mb-2"
      >
        {bossDef.title}
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-sm text-[var(--color-text-secondary)] mb-6"
      >
        {bossDef.description}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.9, type: 'spring' }}
        className="flex flex-col items-center gap-3"
      >
        <div className="bg-[var(--color-bg-tertiary)] rounded-lg px-4 py-2">
          <span className="text-xs text-[var(--color-text-muted)]">Boss 生命：</span>
          <span className="text-lg font-bold text-[var(--color-danger)]">
            {bossBattle?.currentHP} / {bossBattle?.maxHP}
          </span>
        </div>

        <Button variant="danger" size="lg" onClick={handleFace}>
          ⚔️ 迎战
        </Button>

        <button
          onClick={closeModal}
          className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors cursor-pointer"
        >
          逃跑（失去连签）
        </button>
      </motion.div>
    </div>
  );
}
