import { TaskDifficulty } from '@/types';

export interface DailyQuestDef {
  id: string;
  title: string;
  description: string;
  target: number; // how many to complete
  difficulty: TaskDifficulty;
  rewardXP: number;
  rewardGold: number;
}

const QUEST_POOL: DailyQuestDef[] = [
  { id: 'dq_easy_1', title: '清道夫', description: '完成3个简单任务', target: 3, difficulty: 'easy', rewardXP: 80, rewardGold: 40 },
  { id: 'dq_easy_2', title: '小试身手', description: '完成2个中等任务', target: 2, difficulty: 'medium', rewardXP: 120, rewardGold: 60 },
  { id: 'dq_hard_1', title: '挑战者', description: '完成1个困难任务', target: 1, difficulty: 'hard', rewardXP: 200, rewardGold: 100 },
  { id: 'dq_any_1', title: '任务狂人', description: '完成5个任意任务', target: 5, difficulty: 'easy', rewardXP: 150, rewardGold: 80 },
  { id: 'dq_any_2', title: '效率大师', description: '完成3个任意任务', target: 3, difficulty: 'medium', rewardXP: 100, rewardGold: 50 },
  { id: 'dq_tags', title: '分类专家', description: '完成2个带有标签的任务', target: 2, difficulty: 'medium', rewardXP: 130, rewardGold: 60 },
  { id: 'dq_legendary', title: '传说之影', description: '完成1个传说任务', target: 1, difficulty: 'legendary', rewardXP: 500, rewardGold: 250 },
  { id: 'dq_subtasks', title: '细节控', description: '完成1个带有子任务的任务', target: 1, difficulty: 'hard', rewardXP: 180, rewardGold: 90 },
  { id: 'dq_priority', title: '紧急处理', description: '完成1个高优先级任务', target: 1, difficulty: 'hard', rewardXP: 200, rewardGold: 100 },
  { id: 'dq_streak', title: '坚持不懈', description: '完成3天连续签到+1个任务', target: 1, difficulty: 'medium', rewardXP: 100, rewardGold: 50 },
];

export function generateDailyQuests(): DailyQuestDef[] {
  const shuffled = [...QUEST_POOL].sort(() => Math.random() - 0.5);
  // Pick 3 unique quests
  const picked = new Set<string>();
  const result: DailyQuestDef[] = [];
  for (const q of shuffled) {
    if (picked.has(q.id)) continue;
    picked.add(q.id);
    result.push(q);
    if (result.length >= 3) break;
  }
  return result;
}

export interface DailyQuestProgress {
  questId: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
}

export function getDailyQuestDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
