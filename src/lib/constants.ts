import { TaskDifficulty, Stats } from '@/types';

export const BASE_XP = 100;
export const GROWTH_FACTOR = 1.6;

export function xpToNextLevel(level: number): number {
  if (level < 5) {
    return Math.round(BASE_XP * Math.pow(level, 1.35));
  }
  return Math.round(BASE_XP * Math.pow(level, GROWTH_FACTOR));
}

const baseXP: Record<TaskDifficulty, number> = {
  easy: 25,
  medium: 50,
  hard: 100,
  legendary: 250,
};

const baseGold: Record<TaskDifficulty, number> = {
  easy: 10,
  medium: 25,
  hard: 50,
  legendary: 120,
};

const baseDamage: Record<TaskDifficulty, number> = {
  easy: 20,
  medium: 35,
  hard: 55,
  legendary: 80,
};

export function calculateTaskXP(
  difficulty: TaskDifficulty,
  isEarlyCompletion: boolean,
  streakMultiplier: number,
  intelligence: number,
): number {
  let xp = baseXP[difficulty];
  if (isEarlyCompletion) xp *= 1.25;
  xp *= (1 + Math.min(streakMultiplier, 0.50));
  xp *= (1 + intelligence * 0.08);
  return Math.round(xp);
}

export function calculateTaskGold(
  difficulty: TaskDifficulty,
  isEarlyCompletion: boolean,
  strength: number,
): number {
  let gold = baseGold[difficulty];
  if (isEarlyCompletion) gold *= 1.25;
  gold *= (1 + strength * 0.10);
  return Math.round(gold);
}

export function calculateMaxHP(vitality: number, level: number): number {
  return 100 + (vitality * 20) + (level * 10);
}

export function calculateDeadlineDamage(
  difficulty: TaskDifficulty,
  agility: number,
): number {
  const reduction = Math.min(agility * 0.06, 0.60);
  return Math.round(baseDamage[difficulty] * (1 - reduction));
}

export function calculateHPRegenPerHour(maxHP: number): number {
  return Math.max(1, Math.round(maxHP * 0.05));
}

export function calculateBossHP(playerLevel: number): number {
  return 200 + (playerLevel * 50);
}

export function calculateSubtaskDamage(strength: number): number {
  return 25 + (strength * 5);
}

export function calculateBossXP(playerLevel: number, intelligence: number): number {
  return calculateTaskXP('legendary', false, 0, intelligence) * 3;
}

export function calculateBossGold(playerLevel: number, strength: number): number {
  return calculateTaskGold('legendary', false, strength) * 3;
}

export function getStreakMultiplier(streakDays: number): number {
  return Math.min(streakDays * 0.05, 0.50);
}

export function getDailyRewardGold(streakDays: number): number {
  return Math.min(10 + (streakDays * 5), 100);
}

export const BOSS_SPAWN_INTERVAL = 10;

export function shouldSpawnBoss(
  totalCompleted: number,
  bossDefeatCount: number,
  activeBoss: boolean,
): boolean {
  if (activeBoss) return false;
  const nextBossAt = (bossDefeatCount + 1) * BOSS_SPAWN_INTERVAL;
  return totalCompleted >= nextBossAt;
}

export const DEFAULT_STATS: Stats = {
  strength: 1,
  intelligence: 1,
  agility: 1,
  vitality: 1,
};

export const CLASS_STATS: Record<string, Stats> = {
  warrior: { strength: 3, intelligence: 1, agility: 2, vitality: 2 },
  mage: { strength: 1, intelligence: 3, agility: 2, vitality: 2 },
  rogue: { strength: 2, intelligence: 2, agility: 3, vitality: 1 },
  guardian: { strength: 2, intelligence: 1, agility: 1, vitality: 4 },
};

export function isEarlyCompletion(dueDate: string | null): boolean {
  if (!dueDate) return false;
  const now = new Date();
  const due = new Date(dueDate);
  const hoursUntilDue = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntilDue > 24;
}

export function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}
