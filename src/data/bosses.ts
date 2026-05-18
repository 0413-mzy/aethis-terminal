import { BossDefinition } from '@/types';

export const BOSSES: BossDefinition[] = [
  {
    id: 'procrastination-dragon',
    name: '拖延魔龙',
    title: '永恒的拖延者',
    description: '一头以犹豫和拖延为食的巨兽。它的吐息能让人的心智陷入冷漠。',
    artPath: '/images/boss-art/dragon.png',
    baseHP: 300,
    theme: 'fire',
    abilities: [
      {
        id: 'delay-breath',
        name: '延迟吐息',
        description: '击败前所有经验值和金币奖励减少20%。',
        effect: { type: 'reduce_reward', percentage: 20 },
      },
      {
        id: 'deadline-fire',
        name: '截止日烈焰',
        description: '所有任务的截止日期缩短12小时。',
        effect: { type: 'deadline_crunch', hoursReduction: 12 },
      },
    ],
  },
  {
    id: 'distraction-demon',
    name: '分心恶魔',
    title: '注意力的窃贼',
    description: '一只狡猾的魔鬼，能打散你的思绪，让你无法专注于重要之事。',
    artPath: '/images/boss-art/demon.png',
    baseHP: 250,
    theme: 'shadow',
    abilities: [
      {
        id: 'focus-drain',
        name: '专注吸取',
        description: '锁定一个随机非Boss任务，阻止完成。',
        effect: { type: 'task_lock', lockedTaskId: '' },
      },
      {
        id: 'scatter-thoughts',
        name: '思绪散乱',
        description: '所有任务难度提升一级。',
        effect: { type: 'increase_difficulty', targetDifficulty: 'hard' },
      },
    ],
  },
  {
    id: 'overwhelm-ogre',
    name: '压垮巨魔',
    title: '堆积如山',
    description: '一个不断堆高工作的蛮横巨兽，直到你被压垮。',
    artPath: '/images/boss-art/ogre.png',
    baseHP: 400,
    theme: 'earth',
    abilities: [
      {
        id: 'crushing-weight',
        name: '沉重负担',
        description: '精神负担导致所有奖励减少25%。',
        effect: { type: 'reduce_reward', percentage: 25 },
      },
      {
        id: 'deadline-crush',
        name: '截止日压碎',
        description: '所有截止日期缩短24小时。',
        effect: { type: 'deadline_crunch', hoursReduction: 24 },
      },
    ],
  },
  {
    id: 'perfectionist-phantom',
    name: '完美主义幽灵',
    title: '永不完成的幽灵',
    description: '一个低语着"还不够好"的幽灵——没有什么能真正完成。',
    artPath: '/images/boss-art/phantom.png',
    baseHP: 350,
    theme: 'void',
    abilities: [
      {
        id: 'endless-revision',
        name: '无尽修订',
        description: '所有任务需要额外完成一个子任务才算完成。',
        effect: { type: 'reduce_reward', percentage: 15 },
      },
    ],
  },
  {
    id: 'burnout-behemoth',
    name: '倦怠巨兽',
    title: '能量吞噬者',
    description: '一只巨大的怪物，吸走你的活力，留下疲惫。',
    artPath: '/images/boss-art/behemoth.png',
    baseHP: 500,
    theme: 'ice',
    abilities: [
      {
        id: 'energy-drain',
        name: '能量吸取',
        description: '此Boss存在期间，被动生命恢复速度减半。',
        effect: { type: 'reduce_reward', percentage: 30 },
      },
      {
        id: 'frost-lock',
        name: '冰霜锁定',
        description: '锁定你最高优先级的非Boss任务。',
        effect: { type: 'task_lock', lockedTaskId: '' },
      },
    ],
  },
];
