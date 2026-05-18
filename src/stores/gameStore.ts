import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { Streak, BossBattle, BossHistoryEntry, Achievement } from '@/types';
import { shouldSpawnBoss, calculateBossHP } from '@/lib/constants';
import { BOSSES } from '@/data/bosses';
import { ACHIEVEMENTS } from '@/data/achievements';
import { generateDailyQuests, DailyQuestDef, DailyQuestProgress, getDailyQuestDate } from '@/data/dailyQuests';
import { SkillGem, GEM_DROP_TABLE, DROP_CHANCE } from '@/types/skillGem';
import { STORY_CHAPTERS, StoryChapter } from '@/data/story';

function getLocalDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

interface GameState {
  streaks: Streak;
  bossBattle: BossBattle | null;
  bossDefeatCount: number;
  bossHistory: BossHistoryEntry[];
  achievements: Achievement[];
  totalTasksCompleted: number;
  totalLegendaryCompleted: number;
  totalGoldEarned: number;
  dailyCheckedIn: boolean;
  dailyRewardClaimed: boolean;
  dailyQuests: DailyQuestDef[];
  dailyQuestProgress: DailyQuestProgress[];
  dailyQuestDate: string;
  combo: number;
  maxCombo: number;
  skillGems: SkillGem[];
  shieldActive: boolean;
  doubleXpActive: boolean;
  focusMode: boolean;
  unlockedChapters: string[];
  storyChapterUnlocked: string | null;

  incrementDailyCompletion: () => { streakUpdated: boolean; newStreak: number };
  incrementTotalCompleted: () => void;
  decrementTotalCompleted: () => void;
  incrementLegendaryCompleted: () => void;
  checkDailyCheckin: () => boolean;
  claimDailyReward: () => number;
  checkAndSpawnBoss: (playerLevel: number) => BossBattle | null;
  damageBoss: (damage: number) => void;
  defeatBoss: (stats: { playerLevel: number; xpEarned: number; goldEarned: number; damageDealt: number }) => void;
  clearBoss: () => void;
  applyBossAbility: (abilityId: string) => void;
  checkAchievements: (playerLevel?: number, playerGold?: number) => Achievement[];
  recordGoldEarned: (amount: number) => void;
  resetStreak: () => void;
  updateDailyQuestProgress: (taskDifficulty: string, hasTags: boolean, hasSubtasks: boolean, isHighPriority: boolean) => void;
  claimDailyQuest: (questId: string) => number;
  incrementCombo: () => number;
  resetCombo: () => void;
  tryDropGem: (difficulty: string) => SkillGem | null;
  socketGem: (id: string) => void;
  unsocketGem: (id: string) => void;
  activateShield: () => void;
  consumeShield: () => boolean;
  activateDoubleXP: () => void;
  isDoubleXPActive: () => boolean;
  toggleFocusMode: () => void;
  checkStoryChapter: (playerLevel: number, bossDefeatedId?: string) => StoryChapter | null;
  dismissStoryChapter: () => void;
  getActiveGemEffects: () => { comboBoost: number; bossCrit: number; xpBoost: number; goldBoost: number; damageReduce: number; doubleLoot: number; cooldownReduction: number };
}

const defaultStreak: Streak = {
  currentStreak: 0,
  bestStreak: 0,
  lastActiveDate: null,
  streakFrozen: false,
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      streaks: { ...defaultStreak },
      bossBattle: null,
      bossDefeatCount: 0,
      bossHistory: [],
      achievements: ACHIEVEMENTS.map((a) => ({ ...a, unlockedAt: null })),
      totalTasksCompleted: 0,
      totalLegendaryCompleted: 0,
      totalGoldEarned: 0,
      dailyCheckedIn: false,
      dailyRewardClaimed: false,
      dailyQuests: generateDailyQuests(),
      dailyQuestProgress: [],
      dailyQuestDate: getDailyQuestDate(),
      combo: 0,
      maxCombo: 0,
      skillGems: [],
      shieldActive: false,
      doubleXpActive: false,
      focusMode: false,
      unlockedChapters: [],
      storyChapterUnlocked: null,

      incrementDailyCompletion: () => {
        const { streaks } = get();
        const today = getLocalDate();

        if (streaks.lastActiveDate === today) {
          return { streakUpdated: false, newStreak: streaks.currentStreak };
        }

        const yesterday = new Date(Date.now() - 86400000);
        const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

        let newStreak: number;
        if (streaks.lastActiveDate === yesterdayStr) {
          newStreak = streaks.currentStreak + 1;
        } else {
          newStreak = 1;
        }

        const bestStreak = Math.max(newStreak, streaks.bestStreak);

        set({
          streaks: {
            ...streaks,
            currentStreak: newStreak,
            bestStreak,
            lastActiveDate: today,
          },
        });

        return { streakUpdated: true, newStreak };
      },

      incrementTotalCompleted: () => {
        set({ totalTasksCompleted: get().totalTasksCompleted + 1 });
      },

      decrementTotalCompleted: () => {
        set({ totalTasksCompleted: Math.max(0, get().totalTasksCompleted - 1) });
      },

      incrementLegendaryCompleted: () => {
        set({ totalLegendaryCompleted: get().totalLegendaryCompleted + 1 });
      },

      checkDailyCheckin: () => {
        const today = getLocalDate();
        if (get().dailyCheckedIn) return false;
        set({ dailyCheckedIn: true });
        return get().streaks.lastActiveDate !== today;
      },

      claimDailyReward: () => {
        const { streaks } = get();
        const gold = Math.min(10 + streaks.currentStreak * 5, 100);
        set({ dailyRewardClaimed: true });
        return gold;
      },

      checkAndSpawnBoss: (playerLevel) => {
        const state = get();
        if (state.bossBattle && state.bossBattle.status === 'active') return null;

        if (shouldSpawnBoss(state.totalTasksCompleted, state.bossDefeatCount, state.bossBattle !== null)) {
          const bossDef = BOSSES[Math.floor(Math.random() * BOSSES.length)];
          const hp = calculateBossHP(playerLevel);

          const battle: BossBattle = {
            id: nanoid(),
            bossId: bossDef.id,
            taskId: '',
            status: 'active',
            maxHP: hp,
            currentHP: hp,
            activeAbilities: [],
            spawnedAt: new Date().toISOString(),
            defeatedAt: null,
          };

          set({ bossBattle: battle });
          return battle;
        }

        return null;
      },

      damageBoss: (damage) => {
        const { bossBattle } = get();
        if (!bossBattle) return;
        const newHP = Math.max(0, bossBattle.currentHP - damage);
        set({
          bossBattle: {
            ...bossBattle,
            currentHP: newHP,
            status: newHP <= 0 ? 'defeated' : 'active',
            defeatedAt: newHP <= 0 ? new Date().toISOString() : null,
          },
        });
      },

      defeatBoss: (stats) => {
        const { bossBattle, bossDefeatCount, bossHistory } = get();
        if (!bossBattle) return; // guard against no active boss

        const bossDef = BOSSES.find((b) => b.id === bossBattle.bossId);

        const entry: BossHistoryEntry = {
          bossId: bossBattle.bossId,
          bossName: bossDef?.name || 'Unknown Boss',
          defeatedAt: new Date().toISOString(),
          playerLevel: stats.playerLevel,
          damageDealt: stats.damageDealt,
          xpEarned: stats.xpEarned,
          goldEarned: stats.goldEarned,
        };

        set({
          bossDefeatCount: bossDefeatCount + 1,
          bossHistory: [...bossHistory, entry],
        });
      },

      clearBoss: () => {
        set({ bossBattle: null });
      },

      applyBossAbility: (abilityId) => {
        const { bossBattle } = get();
        if (!bossBattle) return;

        const bossDef = BOSSES.find((b) => b.id === bossBattle.bossId);
        if (!bossDef) return;

        const ability = bossDef.abilities.find((a) => a.id === abilityId);
        if (!ability) return;

        set({
          bossBattle: {
            ...bossBattle,
            activeAbilities: [...bossBattle.activeAbilities, ability],
          },
        });
      },

      recordGoldEarned: (amount) => {
        if (!amount || isNaN(amount) || amount <= 0) return;
        set({ totalGoldEarned: get().totalGoldEarned + amount });
      },

      checkAchievements: (playerLevel?: number, playerGold?: number) => {
        const state = get();
        const newlyUnlocked: Achievement[] = [];

        const updatedAchievements = state.achievements.map((a) => {
          if (a.unlockedAt) return a;

          let unlocked = false;
          switch (a.condition.type) {
            case 'tasks_completed':
              unlocked = state.totalTasksCompleted >= a.condition.count;
              break;
            case 'streak_reached':
              unlocked = state.streaks.currentStreak >= a.condition.days;
              break;
            case 'bosses_defeated':
              unlocked = state.bossDefeatCount >= a.condition.count;
              break;
            case 'level_reached':
              unlocked = (playerLevel || 0) >= a.condition.level;
              break;
            case 'legendary_tasks':
              unlocked = state.totalLegendaryCompleted >= a.condition.count;
              break;
            case 'gold_accumulated':
              unlocked = (playerGold ?? state.totalGoldEarned) >= a.condition.amount;
              break;
          }

          if (unlocked) {
            const unlockedAchievement = { ...a, unlockedAt: new Date().toISOString() };
            newlyUnlocked.push(unlockedAchievement);
            return unlockedAchievement;
          }
          return a;
        });

        if (newlyUnlocked.length > 0) {
          set({ achievements: updatedAchievements });
        }

        return newlyUnlocked;
      },

      incrementCombo: () => {
        const { combo, maxCombo } = get();
        const next = combo + 1;
        set({ combo: next, maxCombo: Math.max(maxCombo, next) });
        return next;
      },
      resetCombo: () => set({ combo: 0 }),

      tryDropGem: (difficulty) => {
        const chance = DROP_CHANCE[difficulty] || 0;
        if (Math.random() > chance) return null;
        const pool = GEM_DROP_TABLE[difficulty] || [];
        if (pool.length === 0) return null;
        const template = pool[Math.floor(Math.random() * pool.length)];
        const gem: SkillGem = {
          ...template,
          id: nanoid(),
          acquiredAt: new Date().toISOString(),
          socketed: false,
        };
        set({ skillGems: [...get().skillGems, gem] });
        return gem;
      },

      socketGem: (id) => {
        set({ skillGems: get().skillGems.map((g) => g.id === id ? { ...g, socketed: true } : g) });
      },
      unsocketGem: (id) => {
        set({ skillGems: get().skillGems.map((g) => g.id === id ? { ...g, socketed: false } : g) });
      },

      activateShield: () => set({ shieldActive: true }),
      consumeShield: () => {
        if (!get().shieldActive) return false;
        set({ shieldActive: false });
        return true;
      },
      activateDoubleXP: () => set({ doubleXpActive: true }),
      isDoubleXPActive: () => get().doubleXpActive,
      toggleFocusMode: () => set({ focusMode: !get().focusMode }),

      checkStoryChapter: (playerLevel, bossDefeatedId) => {
        const { unlockedChapters, totalTasksCompleted, streaks, bossDefeatCount } = get();
        for (const chapter of STORY_CHAPTERS) {
          if (unlockedChapters.includes(chapter.id)) continue;
          let triggered = false;
          switch (chapter.trigger.type) {
            case 'first_visit': triggered = totalTasksCompleted === 0; break;
            case 'tasks_completed': triggered = totalTasksCompleted >= chapter.trigger.count; break;
            case 'boss_defeated': triggered = bossDefeatedId === chapter.trigger.bossId; break;
            case 'level_reached': triggered = playerLevel >= chapter.trigger.level; break;
            case 'streak_reached': triggered = streaks.currentStreak >= chapter.trigger.days; break;
          }
          if (triggered) {
            set({
              unlockedChapters: [...unlockedChapters, chapter.id],
              storyChapterUnlocked: chapter.id,
            });
            return chapter;
          }
        }
        return null;
      },
      dismissStoryChapter: () => set({ storyChapterUnlocked: null }),

      getActiveGemEffects: () => {
        const socketed = get().skillGems.filter((g) => g.socketed);
        let comboBoost = 0, bossCrit = 0, xpBoost = 0, goldBoost = 0, damageReduce = 0, doubleLoot = 0, cooldownReduction = 0;
        socketed.forEach((g) => {
          switch (g.effect.type) {
            case 'combo_boost': comboBoost += g.effect.comboMultiplier; break;
            case 'boss_crit': bossCrit += g.effect.critChance; break;
            case 'xp_boost': xpBoost += g.effect.xpPercent; break;
            case 'gold_boost': goldBoost += g.effect.goldPercent; break;
            case 'damage_reduce': damageReduce += g.effect.reducePercent; break;
            case 'double_loot': doubleLoot += g.effect.chance; break;
            case 'quick_strike': cooldownReduction += g.effect.cooldownReduction; break;
          }
        });
        return { comboBoost, bossCrit, xpBoost, goldBoost, damageReduce, doubleLoot, cooldownReduction };
      },

      resetStreak: () => {
        set({
          streaks: { ...get().streaks, currentStreak: 0, lastActiveDate: null },
        });
      },

      updateDailyQuestProgress: (taskDifficulty, hasTags, hasSubtasks, isHighPriority) => {
        const state = get();
        const today = getDailyQuestDate();

        // Reset quests if it's a new day
        if (state.dailyQuestDate !== today) {
          const fresh = generateDailyQuests();
          const freshProgress = fresh.map((q) => ({ questId: q.id, progress: 0, completed: false, claimed: false }));
          // Increment progress for the current task on fresh quests
          const updated = freshProgress.map((p) => {
            const q = fresh.find((dq) => dq.id === p.questId);
            if (!q || p.completed) return p;
            let shouldIncrement = false;
            switch (q.id) {
              case 'dq_easy_1': shouldIncrement = taskDifficulty === 'easy'; break;
              case 'dq_easy_2': shouldIncrement = taskDifficulty === 'medium'; break;
              case 'dq_hard_1': shouldIncrement = taskDifficulty === 'hard'; break;
              case 'dq_any_1': case 'dq_any_2': shouldIncrement = true; break;
              case 'dq_tags': shouldIncrement = hasTags; break;
              case 'dq_legendary': shouldIncrement = taskDifficulty === 'legendary'; break;
              case 'dq_subtasks': shouldIncrement = hasSubtasks; break;
              case 'dq_priority': shouldIncrement = isHighPriority; break;
              case 'dq_streak': shouldIncrement = state.streaks.currentStreak >= 3; break;
            }
            if (shouldIncrement) {
              const newProgress = p.progress + 1;
              return { ...p, progress: newProgress, completed: newProgress >= (q?.target || 99) };
            }
            return p;
          });
          set({ dailyQuests: fresh, dailyQuestProgress: updated, dailyQuestDate: today });
          return;
        }

        // Update existing progress
        const updated = state.dailyQuestProgress.map((p) => {
          const q = state.dailyQuests.find((dq) => dq.id === p.questId);
          if (!q || p.completed) return p;
          let shouldIncrement = false;
          switch (q.id) {
            case 'dq_easy_1': shouldIncrement = taskDifficulty === 'easy'; break;
            case 'dq_easy_2': shouldIncrement = taskDifficulty === 'medium'; break;
            case 'dq_hard_1': shouldIncrement = taskDifficulty === 'hard'; break;
            case 'dq_any_1': case 'dq_any_2': shouldIncrement = true; break;
            case 'dq_tags': shouldIncrement = hasTags; break;
            case 'dq_legendary': shouldIncrement = taskDifficulty === 'legendary'; break;
            case 'dq_subtasks': shouldIncrement = hasSubtasks; break;
            case 'dq_priority': shouldIncrement = isHighPriority; break;
            case 'dq_streak': shouldIncrement = state.streaks.currentStreak >= 3; break;
          }
          if (shouldIncrement) {
            const newProgress = p.progress + 1;
            return { ...p, progress: newProgress, completed: newProgress >= q.target };
          }
          return p;
        });
        set({ dailyQuestProgress: updated });
      },

      claimDailyQuest: (questId) => {
        const state = get();
        const progress = state.dailyQuestProgress.find((p) => p.questId === questId);
        const quest = state.dailyQuests.find((q) => q.id === questId);
        if (!progress || !quest || !progress.completed || progress.claimed) return 0;

        const updated = state.dailyQuestProgress.map((p) =>
          p.questId === questId ? { ...p, claimed: true } : p
        );
        set({ dailyQuestProgress: updated });
        return quest.rewardGold + quest.rewardXP; // return total reward
      },
    }),
    {
      name: 'rpg-game-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (isNaN(state.totalTasksCompleted)) state.totalTasksCompleted = 0;
          if (isNaN(state.bossDefeatCount)) state.bossDefeatCount = 0;
          if (isNaN(state.totalGoldEarned)) state.totalGoldEarned = 0;
          if (isNaN(state.totalLegendaryCompleted)) state.totalLegendaryCompleted = 0;
          // Reset daily state - new day, new check
          state.dailyCheckedIn = false;
          state.dailyRewardClaimed = false;
        }
      },
    }
  )
);
