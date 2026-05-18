export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskDifficulty = 'easy' | 'medium' | 'hard' | 'legendary';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  difficulty: TaskDifficulty;
  categoryIds: string[];
  tags: string[];
  dueDate: string | null;
  subtasks: SubTask[];
  order: number;
  createdAt: string;
  completedAt: string | null;
  xpEarned: number;
  goldEarned: number;
  isBossBattle: boolean;
  bossBattleId: string | null;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface TaskFilter {
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  difficulty: TaskDifficulty | 'all';
  categoryId: string | 'all';
  search: string;
}

export type SortField = 'order' | 'createdAt' | 'dueDate' | 'priority' | 'difficulty';
