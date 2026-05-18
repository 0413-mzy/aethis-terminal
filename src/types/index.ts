export * from './task';
export * from './character';
export * from './game';
export * from './shop';

export interface PersistedGameState {
  tasks: import('./task').Task[];
  categories: import('./task').Category[];
  character: import('./character').Character;
  streaks: import('./game').Streak;
  bossBattle: import('./game').BossBattle | null;
  bossDefeatCount: number;
  achievements: import('./game').Achievement[];
  inventory: import('./shop').InventoryItem[];
  totalTasksCompleted: number;
  totalLegendaryCompleted: number;
  lastSaveTimestamp: string;
}
