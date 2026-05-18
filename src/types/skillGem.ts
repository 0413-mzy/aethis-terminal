// 技能宝石系统 — 替代单调的属性加点，完成任务掉落宝石，镶嵌获得能力

export type GemColor = 'red' | 'blue' | 'green' | 'purple' | 'gold';

export interface SkillGem {
  id: string;
  name: string;
  color: GemColor;
  description: string;
  effect: GemEffect;
  acquiredAt: string;
  socketed: boolean;
}

export type GemEffect =
  | { type: 'combo_boost'; comboMultiplier: number }
  | { type: 'boss_crit'; critChance: number }
  | { type: 'xp_boost'; xpPercent: number }
  | { type: 'gold_boost'; goldPercent: number }
  | { type: 'damage_reduce'; reducePercent: number }
  | { type: 'streak_shield'; days: number }
  | { type: 'double_loot'; chance: number }
  | { type: 'quick_strike'; cooldownReduction: number };

// 完成特定类型任务掉落特定宝石
export const GEM_DROP_TABLE: Record<string, SkillGem[]> = {
  easy: [
    { id: '', name: '微光碎片', color: 'green', description: '任务经验 +5%', effect: { type: 'xp_boost', xpPercent: 5 }, acquiredAt: '', socketed: false },
    { id: '', name: '幸运铜币', color: 'gold', description: '任务金币 +5%', effect: { type: 'gold_boost', goldPercent: 5 }, acquiredAt: '', socketed: false },
  ],
  medium: [
    { id: '', name: '专注水晶', color: 'blue', description: '连击倍率 +10%', effect: { type: 'combo_boost', comboMultiplier: 10 }, acquiredAt: '', socketed: false },
    { id: '', name: '护体石', color: 'purple', description: 'Boss伤害减免 15%', effect: { type: 'damage_reduce', reducePercent: 15 }, acquiredAt: '', socketed: false },
  ],
  hard: [
    { id: '', name: '暴击红宝石', color: 'red', description: 'Boss暴击率 +15%', effect: { type: 'boss_crit', critChance: 15 }, acquiredAt: '', socketed: false },
    { id: '', name: '连击翡翠', color: 'green', description: '连击倍率 +20%', effect: { type: 'combo_boost', comboMultiplier: 20 }, acquiredAt: '', socketed: false },
    { id: '', name: '双倍符文', color: 'gold', description: '10%几率双倍掉落', effect: { type: 'double_loot', chance: 10 }, acquiredAt: '', socketed: false },
  ],
  legendary: [
    { id: '', name: '传说之眼', color: 'purple', description: 'Boss暴击率 +25%', effect: { type: 'boss_crit', critChance: 25 }, acquiredAt: '', socketed: false },
    { id: '', name: '连击大师', color: 'red', description: '连击倍率 +30%', effect: { type: 'combo_boost', comboMultiplier: 30 }, acquiredAt: '', socketed: false },
    { id: '', name: '迅捷符文', color: 'blue', description: '攻击冷却 -2秒', effect: { type: 'quick_strike', cooldownReduction: 2 }, acquiredAt: '', socketed: false },
  ],
};

export const DROP_CHANCE: Record<string, number> = {
  easy: 0.15,
  medium: 0.25,
  hard: 0.40,
  legendary: 0.80,
};
