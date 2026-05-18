export type StatType = 'strength' | 'intelligence' | 'agility' | 'vitality';

export interface Stats {
  strength: number;
  intelligence: number;
  agility: number;
  vitality: number;
}

export interface Character {
  name: string;
  level: number;
  currentXP: number;
  stats: Stats;
  unspentStatPoints: number;
  gold: number;
  maxHP: number;
  currentHP: number;
  avatarId: string | null;
  title: string | null;
  createdAt: string;
}
