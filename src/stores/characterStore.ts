import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Character, StatType, Stats } from '@/types';
import { xpToNextLevel, calculateMaxHP, DEFAULT_STATS } from '@/lib/constants';

interface CharacterState {
  character: Character;
  gainXP: (amount: number) => { leveledUp: boolean; newLevel: number };
  loseXP: (amount: number) => void;
  gainGold: (amount: number) => void;
  loseGold: (amount: number) => void;
  spendGold: (amount: number) => boolean;
  takeDamage: (amount: number) => void;
  healHP: (amount: number) => void;
  allocateStatPoint: (stat: StatType) => void;
  setAvatar: (avatarId: string | null) => void;
  setTitle: (title: string | null) => void;
  initCharacter: (name: string, bonusStats: Partial<Stats>) => void;
  resetAfterDeath: () => void;
}

const DEFAULT_CHARACTER: Character = {
  name: '',
  level: 1,
  currentXP: 0,
  stats: { ...DEFAULT_STATS },
  unspentStatPoints: 0,
  gold: 0,
  maxHP: calculateMaxHP(1, 1),
  currentHP: calculateMaxHP(1, 1),
  avatarId: null,
  title: null,
  createdAt: '',
};

export const useCharacterStore = create<CharacterState>()(
  persist(
    (set, get) => ({
      character: { ...DEFAULT_CHARACTER },

      gainXP: (amount) => {
        const { character } = get();
        let { currentXP, level, unspentStatPoints } = character;
        const { stats } = character;
        currentXP += amount;
        let leveledUp = false;

        while (currentXP >= xpToNextLevel(level)) {
          currentXP -= xpToNextLevel(level);
          level += 1;
          unspentStatPoints += 3;
          leveledUp = true;
        }

        const maxHP = calculateMaxHP(stats.vitality, level);

        if (leveledUp) {
          set({
            character: {
              ...character,
              level,
              currentXP,
              unspentStatPoints,
              maxHP,
              currentHP: maxHP,
            },
          });
        } else {
          set({
            character: { ...character, currentXP },
          });
        }

        return { leveledUp, newLevel: level };
      },

      gainGold: (amount) => {
        if (!amount || isNaN(amount) || amount <= 0) return;
        set({
          character: { ...get().character, gold: get().character.gold + amount },
        });
      },

      loseGold: (amount) => {
        if (!amount || isNaN(amount) || amount < 0) return;
        const { character } = get();
        const newGold = Math.max(0, character.gold - amount);
        set({ character: { ...character, gold: newGold } });
      },

      loseXP: (amount) => {
        if (!amount || isNaN(amount) || amount < 0) return;
        const { character } = get();
        let { currentXP, level, unspentStatPoints } = character;
        const { stats } = character;
        currentXP -= amount;

        while (currentXP < 0 && level > 1) {
          level -= 1;
          unspentStatPoints = Math.max(0, unspentStatPoints - 3);
          currentXP += xpToNextLevel(level);
        }

        if (currentXP < 0) {
          currentXP = 0;
        }

        const maxHP = calculateMaxHP(stats.vitality, level);

        set({
          character: {
            ...character,
            level,
            currentXP,
            unspentStatPoints,
            maxHP,
            currentHP: Math.min(character.currentHP, maxHP),
          },
        });
      },

      spendGold: (amount) => {
        const { gold } = get().character;
        if (gold < amount) return false;
        set({ character: { ...get().character, gold: gold - amount } });
        return true;
      },

      takeDamage: (amount) => {
        if (!amount || isNaN(amount) || amount <= 0) return;
        const { character } = get();
        const newHP = Math.max(0, character.currentHP - amount);
        set({ character: { ...character, currentHP: newHP } });
      },

      healHP: (amount) => {
        if (!amount || isNaN(amount) || amount <= 0) return;
        const { character } = get();
        const newHP = Math.min(character.maxHP, character.currentHP + amount);
        set({ character: { ...character, currentHP: newHP } });
      },

      allocateStatPoint: (stat) => {
        const { character } = get();
        if (character.unspentStatPoints <= 0) return;

        const newStats = { ...character.stats, [stat]: character.stats[stat] + 1 };
        const maxHP = calculateMaxHP(newStats.vitality, character.level);
        const hpDiff = maxHP - character.maxHP;

        set({
          character: {
            ...character,
            stats: newStats,
            unspentStatPoints: character.unspentStatPoints - 1,
            maxHP,
            currentHP: character.currentHP + (hpDiff > 0 ? hpDiff : 0),
          },
        });
      },

      setAvatar: (avatarId) => {
        set({ character: { ...get().character, avatarId } });
      },

      setTitle: (title) => {
        set({ character: { ...get().character, title } });
      },

      initCharacter: (name, bonusStats) => {
        const stats: Stats = {
          strength: DEFAULT_STATS.strength + (bonusStats.strength || 0),
          intelligence: DEFAULT_STATS.intelligence + (bonusStats.intelligence || 0),
          agility: DEFAULT_STATS.agility + (bonusStats.agility || 0),
          vitality: DEFAULT_STATS.vitality + (bonusStats.vitality || 0),
        };
        const maxHP = calculateMaxHP(stats.vitality, 1);
        set({
          character: {
            name,
            level: 1,
            currentXP: 0,
            stats,
            unspentStatPoints: 0,
            gold: 0,
            maxHP,
            currentHP: maxHP,
            avatarId: null,
            title: null,
            createdAt: new Date().toISOString(),
          },
        });
      },

      resetAfterDeath: () => {
        const { character } = get();
        const lostGold = Math.floor(character.gold * 0.5);
        set({
          character: {
            ...character,
            gold: character.gold - lostGold,
            currentHP: Math.floor(character.maxHP * 0.5),
          },
        });
      },
    }),
    {
      name: 'rpg-character-storage',
      onRehydrateStorage: () => (state) => {
        if (state && state.character) {
          if (isNaN(state.character.gold)) state.character.gold = 0;
          if (isNaN(state.character.currentXP)) state.character.currentXP = 0;
          if (isNaN(state.character.currentHP)) state.character.currentHP = state.character.maxHP || 100;
          if (isNaN(state.character.level) || state.character.level < 1) state.character.level = 1;
          if (isNaN(state.character.maxHP)) state.character.maxHP = 100;
          if (isNaN(state.character.unspentStatPoints)) state.character.unspentStatPoints = 0;
          const stats = state.character.stats;
          if (!stats || typeof stats !== 'object') {
            state.character.stats = { strength: 1, intelligence: 1, agility: 1, vitality: 1 };
          } else {
            if (isNaN(stats.strength)) stats.strength = 1;
            if (isNaN(stats.intelligence)) stats.intelligence = 1;
            if (isNaN(stats.agility)) stats.agility = 1;
            if (isNaN(stats.vitality)) stats.vitality = 1;
          }
        }
      },
    }
  )
);
