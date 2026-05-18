'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCharacterStore } from '@/stores/characterStore';
import { useGameStore } from '@/stores/gameStore';
import { CLAW_DIALOGUES } from '@/data/story';

interface PetStage {
  emoji: string;
  name: string;
  minLevel: number;
}

const PET_STAGES: PetStage[] = [
  { emoji: '🔷', name: 'C.L.A.W. 核心', minLevel: 1 },
  { emoji: '💠', name: 'C.L.A.W. 激活', minLevel: 5 },
  { emoji: '🔮', name: 'C.L.A.W. 全息', minLevel: 15 },
  { emoji: '⚡', name: 'C.L.A.W. 超频', minLevel: 30 },
  { emoji: '👑', name: 'C.L.A.W. 完全体', minLevel: 50 },
];

export function PetCompanion() {
  const level = useCharacterStore((s) => s.character.level);
  const streaks = useGameStore((s) => s.streaks.currentStreak);
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [bouncing, setBouncing] = useState(false);
  const [mood, setMood] = useState<'happy' | 'sad' | 'excited' | 'idle'>('idle');

  const stage = PET_STAGES.reduce((prev, curr) =>
    level >= curr.minLevel ? curr : prev
  );

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.3) {
        const msgs = CLAW_DIALOGUES.idle;
        say(msgs[Math.floor(Math.random() * msgs.length)]);
      }
    }, 30000);
    const greets = CLAW_DIALOGUES.greet;
    say(greets[Math.floor(Math.random() * greets.length)]);
    return () => clearInterval(interval);
  }, []);

  const say = (msg: string) => {
    setMessage(msg.replace('{0}', String(streaks)));
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 4000);
  };

  // Use C.L.A.W. dialogues for triggered messages
  const sayFromPool = (pool: string[]) => {
    say(pool[Math.floor(Math.random() * pool.length)]);
  };

  useEffect(() => {
    (window as unknown as Record<string, unknown>).__petSay = say;
    (window as unknown as Record<string, unknown>).__petBounce = () => {
      setBouncing(true);
      setTimeout(() => setBouncing(false), 600);
    };
    (window as unknown as Record<string, unknown>).__petMood = (m: string) => {
      setMood(m as typeof mood);
      setTimeout(() => setMood('idle'), 3000);
    };
    return () => {
      delete (window as unknown as Record<string, unknown>).__petSay;
      delete (window as unknown as Record<string, unknown>).__petBounce;
      delete (window as unknown as Record<string, unknown>).__petMood;
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-30">
      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-full right-0 mb-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl px-4 py-2 shadow-xl max-w-[220px] z-20"
          >
            <p className="text-xs text-[var(--color-text-primary)] leading-relaxed">
              {message}
            </p>
            <div className="absolute top-full right-6 w-3 h-3 bg-[var(--color-bg-tertiary)] border-r border-b border-[var(--color-border)] transform rotate-45 -mt-1.5" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="relative"
        animate={bouncing ? { y: [0, -20, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        {/* Stage name badge */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-full px-2 py-0.5 whitespace-nowrap">
          <span className="text-[10px] text-[var(--color-accent)]">{stage.name} Lv.{level}</span>
        </div>

        <motion.button
          className="text-4xl cursor-pointer select-none block relative"
          animate={
            bouncing
              ? {}
              : mood === 'excited'
              ? { rotate: [-10, 10, -10, 10, 0] }
              : { y: [0, -3, 0] }
          }
          transition={
            bouncing
              ? {}
              : mood === 'excited'
              ? { duration: 0.4, repeat: 1 }
              : { duration: 3, repeat: Infinity }
          }
          title={`${stage.name} - 点击互动`}
          onClick={() => {
            setBouncing(true);
            setTimeout(() => setBouncing(false), 400);
            sayFromPool(CLAW_DIALOGUES.idle);
          }}
        >
          <span className="drop-shadow-lg" style={{ filter: mood === 'sad' ? 'hue-rotate(-30deg) brightness(0.7)' : mood === 'excited' ? 'hue-rotate(30deg) brightness(1.3)' : 'none' }}>
            {stage.emoji}
          </span>
        </motion.button>
      </motion.div>
    </div>
  );
}

export function petSay(msg: string) {
  const fn = (window as unknown as Record<string, unknown>).__petSay as ((m: string) => void) | undefined;
  fn?.(msg);
}
export function petBounce() {
  const fn = (window as unknown as Record<string, unknown>).__petBounce as (() => void) | undefined;
  fn?.();
}
export function petMood(mood: 'happy' | 'sad' | 'excited' | 'idle') {
  const fn = (window as unknown as Record<string, unknown>).__petMood as ((m: string) => void) | undefined;
  fn?.(mood);
}
