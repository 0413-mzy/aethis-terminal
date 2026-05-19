'use client';

import { useCallback } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import { useCharacterStore } from '@/stores/characterStore';
import { useGameStore } from '@/stores/gameStore';
import { useInventoryStore } from '@/stores/inventoryStore';
import { useUIStore } from '@/stores/uiStore';
import {
  calculateTaskXP,
  calculateTaskGold,
  calculateDeadlineDamage,
  getStreakMultiplier,
  isEarlyCompletion,
  isOverdue,
} from '@/lib/constants';
import { particleEmitters } from '@/components/effects/ParticleCanvas';
import { emitFloatingText } from '@/components/effects/FloatingText';
import { sound } from '@/lib/soundManager';
import { petBounce, petMood } from '@/components/character/PetCompanion';

export function useTaskCompletion() {
  const completeTask = useTaskStore((s) => s.completeTask);
  const undoCompleteTask = useTaskStore((s) => s.undoCompleteTask);
  const gainXP = useCharacterStore((s) => s.gainXP);
  const gainGold = useCharacterStore((s) => s.gainGold);
  const loseXP = useCharacterStore((s) => s.loseXP);
  const loseGold = useCharacterStore((s) => s.loseGold);
  const takeDamage = useCharacterStore((s) => s.takeDamage);
  const incrementDaily = useGameStore((s) => s.incrementDailyCompletion);
  const incrementTotalCompleted = useGameStore((s) => s.incrementTotalCompleted);
  const decrementTotalCompleted = useGameStore((s) => s.decrementTotalCompleted);
  const recordGoldEarned = useGameStore((s) => s.recordGoldEarned);
  const decrementGoldEarned = useGameStore((s) => s.decrementGoldEarned);
  const incrementLegendaryCompleted = useGameStore((s) => s.incrementLegendaryCompleted);
  const decrementLegendaryCompleted = useGameStore((s) => s.decrementLegendaryCompleted);
  const updateDailyQuestProgress = useGameStore((s) => s.updateDailyQuestProgress);
  const incrementCombo = useGameStore((s) => s.incrementCombo);
  const decrementCombo = useGameStore((s) => s.decrementCombo);
  const tryDropGem = useGameStore((s) => s.tryDropGem);
  const consumeShield = useGameStore((s) => s.consumeShield);
  const isDoubleXPActive = useGameStore((s) => s.isDoubleXPActive);
  const consumeGoldBoost = useGameStore((s) => s.consumeGoldBoost);
  const consumeGemBoost = useGameStore((s) => s.consumeGemBoost);
  const getActiveGemEffects = useGameStore((s) => s.getActiveGemEffects);
  const checkAndSpawnBoss = useGameStore((s) => s.checkAndSpawnBoss);
  const checkStoryChapter = useGameStore((s) => s.checkStoryChapter);
  const checkAchievements = useGameStore((s) => s.checkAchievements);
  const addToast = useUIStore((s) => s.addToast);
  const openModal = useUIStore((s) => s.openModal);
  const triggerShake = useUIStore((s) => s.triggerShake);

  const complete = useCallback(
    (taskId: string) => {
      const task = useTaskStore.getState().tasks.find((t) => t.id === taskId);
      if (!task || task.status === 'done') return;

      const char = useCharacterStore.getState().character;
      const streaks = useGameStore.getState().streaks;
      const gemEffects = getActiveGemEffects();

      const early = isEarlyCompletion(task.dueDate);
      const streakMult = getStreakMultiplier(streaks.currentStreak);
      let xp = calculateTaskXP(task.difficulty, early, streakMult, char.stats.intelligence);
      let gold = calculateTaskGold(task.difficulty, early, char.stats.strength);
      if (gemEffects.xpBoost > 0) {
        xp = Math.round(xp * (1 + gemEffects.xpBoost / 100));
      }
      if (gemEffects.goldBoost > 0) {
        gold = Math.round(gold * (1 + gemEffects.goldBoost / 100));
      }

      // Combo
      const comboCount = incrementCombo();
      if (comboCount >= 2) {
        const comboStep = 0.05 * (1 + gemEffects.comboBoost / 100);
        const comboBonus = Math.min(comboCount * comboStep, 0.75);
        xp = Math.round(xp * (1 + comboBonus));
        gold = Math.round(gold * (1 + comboBonus));
      }

      if (consumeGoldBoost()) {
        gold = Math.round(gold * 1.2);
        addToast({ type: 'gold', message: '🪙 贡献点增幅生效！+20%' });
      }

      // Double XP (consumed on use)
      if (isDoubleXPActive()) {
        xp = Math.round(xp * 2);
        useGameStore.getState().consumeDoubleXP();
        addToast({ type: 'info', message: '⚡ 双倍经验生效！已消耗。' });
      }

      // Check overdue damage FIRST (penalty before reward)
      const allTasks = useTaskStore.getState().tasks;
      let deadFromOverdue = false;
      for (const t of allTasks) {
        if (t.id === taskId) continue;
        if (t.status === 'done') continue;
        if (isOverdue(t.dueDate)) {
          const shielded = consumeShield();
          if (shielded) {
            addToast({ type: 'info', message: `🛡️ 护盾抵挡了「${t.title}」的逾期伤害！` });
          } else {
            const damage = calculateDeadlineDamage(t.difficulty, char.stats.agility);
            takeDamage(damage);
            triggerShake();
            sound.damage();
            petMood('sad');
            addToast({ type: 'damage', message: `-${damage} 生命（逾期: ${t.title}）` });
            const charAfterDmg = useCharacterStore.getState().character;
            if (charAfterDmg.currentHP <= 0) {
              useCharacterStore.getState().resetAfterDeath();
              openModal('death');
              useGameStore.getState().resetStreak();
              deadFromOverdue = true;
            }
          }
          break;
        }
      }

      completeTask(taskId, xp, gold);

      if (deadFromOverdue) {
        addToast({ type: 'info', message: '任务已标记完成，但你因逾期伤害倒下了...' });
      }

      const { leveledUp, newLevel } = gainXP(xp);
      gainGold(gold);
      recordGoldEarned(gold);

      const { streakUpdated, newStreak } = incrementDaily();
      incrementTotalCompleted();
      if (task.difficulty === 'legendary') {
        incrementLegendaryCompleted();
        sound.legendary();
        petMood('excited');
      } else {
        sound.complete();
      }
      petBounce();

      updateDailyQuestProgress(
        task.difficulty,
        task.tags.length > 0,
        task.subtasks.length > 0,
        task.priority === 'high' || task.priority === 'critical'
      );

      particleEmitters.emit(window.innerWidth / 2, window.innerHeight / 2, {
        count: task.difficulty === 'legendary' ? 60 : 30,
        spread: 180,
        speed: task.difficulty === 'legendary' ? 6 : 4,
        colors: ['#c9a44b', '#f0c860', '#fff'],
        size: 4,
        life: 2,
        gravity: 40,
      });

      emitFloatingText(
        `+${xp} 经验`,
        window.innerWidth / 2 + (Math.random() - 0.5) * 100,
        window.innerHeight / 2,
        '#c9a44b'
      );

      addToast({ type: 'xp', message: `+${xp} 经验值`, amount: xp });
      if (gold > 0) {
        addToast({ type: 'gold', message: `+${gold} 金币`, amount: gold });
      }
      if (streakUpdated && newStreak > 0) {
        sound.streak();
        addToast({ type: 'info', message: `🔥 连续 ${newStreak} 天签到！` });
      }

      // Combo toast
      if (comboCount >= 3) {
        const comboEmoji = comboCount >= 10 ? '⚡⚡⚡' : comboCount >= 5 ? '⚡⚡' : '⚡';
        addToast({ type: 'info', message: `${comboEmoji} ${comboCount}连击！+${Math.round(Math.min(comboCount * 5, 50))}%奖励` });
      }

      // Gem drop
      const gemChanceMultiplier = consumeGemBoost() ? 2 : 1;
      if (gemChanceMultiplier > 1) {
        addToast({ type: 'info', message: '💎 宝石探针生效！掉率翻倍。' });
      }
      const gem = tryDropGem(task.difficulty, gemChanceMultiplier);
      if (gem) {
        addToast({ type: 'achievement', message: `💎 获得技能宝石：${gem.name}！` });
        sound.purchase();
      }
      if (gem && gemEffects.doubleLoot > 0 && Math.random() < gemEffects.doubleLoot / 100) {
        const extraGem = tryDropGem(task.difficulty, 999);
        if (extraGem) {
          addToast({ type: 'achievement', message: `✨ 双倍掉落：${extraGem.name}！` });
        }
      }

      const boss = checkAndSpawnBoss(char.level);
      if (boss) {
        sound.bossSpawn();
        openModal('bossEncounter');
        addToast({ type: 'info', message: '⚔️ Boss出现了！' });
      }

      if (leveledUp) {
        sound.levelUp();
        openModal('levelUp', { level: newLevel });
      }

      const updatedChar = useCharacterStore.getState().character;
      const chapter = checkStoryChapter(updatedChar.level);
      if (chapter) openModal('storyChapter', { chapter });
      const totalEarned = useGameStore.getState().totalGoldEarned;
      const newAchievements = checkAchievements(updatedChar.level, totalEarned);
      if (newAchievements.length > 0) {
        for (const achievement of newAchievements) {
          addToast({
            type: 'achievement',
            message: `🏆 ${achievement.name}`,
          });
          if (achievement.rewardGold > 0) {
            gainGold(achievement.rewardGold);
            addToast({
              type: 'gold',
              message: `成就奖励 +${achievement.rewardGold} 金币`,
              amount: achievement.rewardGold,
            });
          }
          if (achievement.rewardItemId) {
            const itemAdded = useInventoryStore.getState().purchaseItem(achievement.rewardItemId);
            if (itemAdded) {
              addToast({ type: 'achievement', message: `🎁 获得奖励物品：${achievement.rewardItemId}` });
            }
          }
        }
      }

    },
    [
      completeTask,
      gainXP,
      gainGold,
      incrementDaily,
      incrementTotalCompleted,
      recordGoldEarned,
      checkAndSpawnBoss,
      checkStoryChapter,
      checkAchievements,
      addToast,
      openModal,
      triggerShake,
      takeDamage,
    ]
  );

  const undo = useCallback(
    (taskId: string) => {
      const task = useTaskStore.getState().tasks.find((t) => t.id === taskId);
      if (!task || task.status !== 'done') return;

      const xpEarned = task.xpEarned || 0;
      const goldEarned = task.goldEarned || 0;

      undoCompleteTask(taskId);
      decrementCombo();
      sound.undo();

      if (xpEarned > 0) loseXP(xpEarned);
      if (goldEarned > 0) {
        loseGold(goldEarned);
        decrementGoldEarned(goldEarned);
      }
      decrementTotalCompleted();
      if (task.difficulty === 'legendary') decrementLegendaryCompleted();

      addToast({ type: 'damage', message: `-${xpEarned} 经验，-${goldEarned} 金币（已撤销）` });

      if (xpEarned > 0) {
        emitFloatingText(
          `-${xpEarned} XP`,
          window.innerWidth / 2 + (Math.random() - 0.5) * 100,
          window.innerHeight / 2,
          '#c0392b'
        );
      }
    },
    [undoCompleteTask, loseXP, loseGold, decrementTotalCompleted, addToast]
  );

  return { completeTask: complete, undoTask: undo };
}
