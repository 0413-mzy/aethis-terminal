'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useCharacterStore } from '@/stores/characterStore';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { sound } from '@/lib/soundManager';

export function DailyQuests() {
  const dailyQuests = useGameStore((s) => s.dailyQuests);
  const dailyQuestProgress = useGameStore((s) => s.dailyQuestProgress);
  const claimDailyQuest = useGameStore((s) => s.claimDailyQuest);
  const gainGold = useCharacterStore((s) => s.gainGold);
  const gainXP = useCharacterStore((s) => s.gainXP);

  if (dailyQuests.length === 0) return null;

  const allClaimed =
    dailyQuestProgress.length === dailyQuests.length &&
    dailyQuestProgress.every((p) => p.claimed);

  const handleClaim = (questId: string) => {
    const reward = claimDailyQuest(questId);
    if (reward) {
      sound.purchase();
      gainXP(reward.xp);
      gainGold(reward.gold);
    }
  };

  return (
    <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
          📜 每日任务
        </h3>
        {allClaimed && (
          <span className="text-[10px] text-green-400">✓ 全部完成</span>
        )}
      </div>
      <div className="space-y-2">
        {dailyQuests.map((quest) => {
          const progress = dailyQuestProgress.find((p) => p.questId === quest.id);

          return (
            <motion.div
              key={quest.id}
              layout
              className={`rounded-lg p-2 border transition-colors ${
                progress?.claimed
                  ? 'border-green-700 bg-green-900/10 opacity-50'
                  : progress?.completed
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5'
                  : 'border-[var(--color-border)] bg-[var(--color-bg-tertiary)]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-[var(--color-text-primary)]">
                  {quest.title}
                </span>
                <span className="text-[10px] text-[var(--color-accent)]">
                  🪙{quest.rewardGold} ⭐{quest.rewardXP}
                </span>
              </div>
              <p className="text-[10px] text-[var(--color-text-muted)] mb-1">
                {quest.description}
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <ProgressBar
                    current={progress?.progress || 0}
                    max={quest.target}
                    color={progress?.completed ? '#4ade80' : 'var(--color-accent)'}
                    bgColor="var(--color-bg-primary)"
                    height="h-1.5"
                  />
                </div>
                <span className="text-[10px] text-[var(--color-text-muted)] w-8 text-right">
                  {progress?.progress || 0}/{quest.target}
                </span>
                {progress?.completed && !progress?.claimed && (
                  <Button variant="gold" size="sm" onClick={() => handleClaim(quest.id)}>
                    领取
                  </Button>
                )}
                {progress?.claimed && (
                  <span className="text-[10px] text-green-400">✓</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
