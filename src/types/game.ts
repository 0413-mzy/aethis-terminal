export type BossStatus = 'dormant' | 'active' | 'defeated';

export interface BossAbility {
  id: string;
  name: string;
  description: string;
  effect: BossAbilityEffect;
}

export type BossAbilityEffect =
  | { type: 'reduce_reward'; percentage: number }
  | { type: 'increase_difficulty'; targetDifficulty: import('./task').TaskDifficulty }
  | { type: 'deadline_crunch'; hoursReduction: number }
  | { type: 'task_lock'; lockedTaskId: string };

export interface BossHistoryEntry {
  bossId: string;
  bossName: string;
  defeatedAt: string;
  playerLevel: number;
  damageDealt: number;
  xpEarned: number;
  goldEarned: number;
}

export interface BossBattle {
  id: string;
  bossId: string;
  taskId: string;
  status: BossStatus;
  maxHP: number;
  currentHP: number;
  activeAbilities: BossAbility[];
  spawnedAt: string;
  defeatedAt: string | null;
}

export interface BossDefinition {
  id: string;
  name: string;
  title: string;
  description: string;
  artPath: string;
  baseHP: number;
  abilities: BossAbility[];
  theme: 'fire' | 'shadow' | 'ice' | 'void' | 'earth';
}

export interface Streak {
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string | null;
  streakFrozen: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: AchievementCondition;
  unlockedAt: string | null;
  rewardGold: number;
  rewardItemId: string | null;
}

export type AchievementCondition =
  | { type: 'tasks_completed'; count: number }
  | { type: 'streak_reached'; days: number }
  | { type: 'bosses_defeated'; count: number }
  | { type: 'gold_accumulated'; amount: number }
  | { type: 'level_reached'; level: number }
  | { type: 'legendary_tasks'; count: number };
