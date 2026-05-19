'use client';

import { useGameStore } from '@/stores/gameStore';
import { useCharacterStore } from '@/stores/characterStore';
import { useUIStore } from '@/stores/uiStore';
import { getDailyRewardGold } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { particleEmitters } from '@/components/effects/ParticleCanvas';
import { useEffect } from 'react';

export function DailyRewardModal() {
  const streaks = useGameStore((s) => s.streaks);
  const claimDailyReward = useGameStore((s) => s.claimDailyReward);
  const gainGold = useCharacterStore((s) => s.gainGold);
  const closeModal = useUIStore((s) => s.closeModal);

  const rewardGold = getDailyRewardGold(streaks.currentStreak);

  useEffect(() => {
    particleEmitters.emit(window.innerWidth / 2, window.innerHeight / 3, {
      count: 50,
      spread: 180,
      speed: 3,
      colors: ['#c9a44b', '#f0c860'],
      size: 4,
      life: 2,
      gravity: 40,
    });
  }, []);

  const handleClaim = () => {
    const gold = claimDailyReward();
    if (gold > 0) {
      gainGold(gold);
    }
    closeModal();
  };

  return (
    <div className="p-6 text-center">
      <div className="text-5xl mb-4">
        {streaks.currentStreak >= 30 ? '🔥' : streaks.currentStreak >= 7 ? '✨' : '☀️'}
      </div>
      <h2 className="medieval text-2xl text-[var(--color-accent)] mb-2">
        每日奖励
      </h2>
      <p className="text-sm text-[var(--color-text-secondary)] mb-4">
        {streaks.currentStreak > 0
          ? `已连续签到 ${streaks.currentStreak} 天！`
          : '今天开始你的连签吧！'}
      </p>
      <div className="bg-[var(--color-bg-tertiary)] rounded-lg p-4 mb-6">
        <span className="text-3xl font-bold text-[var(--color-accent)]">
          +{rewardGold}
        </span>
        <span className="text-sm text-[var(--color-text-secondary)] ml-2">金币</span>
      </div>
      <Button variant="gold" size="lg" onClick={handleClaim}>
        领取奖励
      </Button>
    </div>
  );
}
