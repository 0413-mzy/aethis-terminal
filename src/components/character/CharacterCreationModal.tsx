'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCharacterStore } from '@/stores/characterStore';
import { useUIStore } from '@/stores/uiStore';
import { CLASS_STATS } from '@/lib/constants';
import { Button } from '@/components/ui/Button';

const classes = [
  { id: 'warrior', name: '战士', icon: '⚔️', desc: '高力量带来额外金币。以财富为核心的职业。', stats: CLASS_STATS.warrior },
  { id: 'mage', name: '法师', icon: '🧙', desc: '高智力带来额外经验。升级最快的职业。', stats: CLASS_STATS.mage },
  { id: 'rogue', name: '盗贼', icon: '🗡️', desc: '高敏捷躲避截止日伤害。', stats: CLASS_STATS.rogue },
  { id: 'guardian', name: '守护者', icon: '🛡️', desc: '高体力带来巨额生命值。很难被击倒。', stats: CLASS_STATS.guardian },
];

export function CharacterCreationModal() {
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const initCharacter = useCharacterStore((s) => s.initCharacter);
  const closeModal = useUIStore((s) => s.closeModal);

  const handleCreate = () => {
    if (!name.trim() || !selectedClass) return;
    const cls = classes.find((c) => c.id === selectedClass);
    if (!cls) return;
    initCharacter(name.trim(), cls.stats);
    closeModal();
  };

  return (
    <div className="p-6">
      <div className="text-center mb-6">
        <h2 className="medieval text-2xl text-[var(--color-accent)] mb-2">
          欢迎，冒险者
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          你的冒险之旅由此开始。选择你的名字和职业。
        </p>
      </div>

      <div className="mb-6">
        <label className="text-xs text-[var(--color-text-secondary)] font-medium mb-1 block">
          你叫什么名字？
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="输入你的名字..."
          maxLength={20}
          className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] transition-colors medieval"
          autoFocus
        />
      </div>

      <div className="mb-6">
        <label className="text-xs text-[var(--color-text-secondary)] font-medium mb-2 block">
          选择你的职业：
        </label>
        <div className="grid grid-cols-2 gap-2">
          {classes.map((cls) => (
            <motion.button
              key={cls.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedClass(cls.id)}
              className={`p-3 rounded-lg border-2 text-left transition-all cursor-pointer ${
                selectedClass === cls.id
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10'
                  : 'border-[var(--color-border)] bg-[var(--color-bg-tertiary)] hover:border-[var(--color-border-light)]'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{cls.icon}</span>
                <span className="font-bold text-sm text-[var(--color-text-primary)]">{cls.name}</span>
              </div>
              <p className="text-[10px] text-[var(--color-text-muted)]">{cls.desc}</p>
            </motion.button>
          ))}
        </div>
      </div>

      <Button
        variant="gold"
        size="lg"
        className="w-full"
        disabled={!name.trim() || !selectedClass}
        onClick={handleCreate}
      >
        开始你的冒险
      </Button>
    </div>
  );
}
