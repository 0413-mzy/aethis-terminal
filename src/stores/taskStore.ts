import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { Task, SubTask, Category, TaskFilter, SortField, TaskDifficulty, TaskPriority, TaskStatus } from '@/types';

interface TaskState {
  tasks: Task[];
  categories: Category[];
  filter: TaskFilter;
  sortBy: SortField;
  sortDirection: 'asc' | 'desc';

  addTask: (data: {
    title: string;
    description?: string;
    priority?: TaskPriority;
    difficulty?: TaskDifficulty;
    categoryIds?: string[];
    tags?: string[];
    dueDate?: string | null;
    subtasks?: Omit<SubTask, 'id' | 'createdAt'>[];
    isBossBattle?: boolean;
    bossBattleId?: string | null;
  }) => string;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string, xp?: number, gold?: number) => void;
  undoCompleteTask: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  reorderTasks: (activeId: string, overId: string) => void;
  setFilter: (filter: Partial<TaskFilter>) => void;
  setSort: (field: SortField, direction: 'asc' | 'desc') => void;
  addCategory: (name: string, color: string, icon: string) => string;
  deleteCategory: (id: string) => void;
}

const defaultFilter: TaskFilter = {
  status: 'all',
  priority: 'all',
  difficulty: 'all',
  categoryId: 'all',
  search: '',
};

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      categories: [],
      filter: defaultFilter,
      sortBy: 'order',
      sortDirection: 'asc',

      addTask: (data) => {
        const id = nanoid();
        const now = new Date().toISOString();
        const { tasks } = get();
        const maxOrder = tasks.reduce((max, t) => Math.max(max, t.order), 0);

        const task: Task = {
          id,
          title: data.title,
          description: data.description || '',
          status: 'todo',
          priority: data.priority || 'medium',
          difficulty: data.difficulty || 'medium',
          categoryIds: data.categoryIds || [],
          tags: data.tags || [],
          dueDate: data.dueDate || null,
          subtasks: (data.subtasks || []).map((st) => ({
            ...st,
            id: nanoid(),
            createdAt: now,
          })),
          order: maxOrder + 1,
          createdAt: now,
          completedAt: null,
          xpEarned: 0,
          goldEarned: 0,
          isBossBattle: data.isBossBattle || false,
          bossBattleId: data.bossBattleId || null,
        };

        set({ tasks: [...tasks, task] });
        return id;
      },

      updateTask: (id, updates) => {
        set({
          tasks: get().tasks.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        });
      },

      deleteTask: (id) => {
        set({ tasks: get().tasks.filter((t) => t.id !== id) });
      },

      completeTask: (id, xp = 0, gold = 0) => {
        set({
          tasks: get().tasks.map((t) =>
            t.id === id
              ? { ...t, status: 'done' as TaskStatus, completedAt: new Date().toISOString(), xpEarned: xp, goldEarned: gold }
              : t
          ),
        });
      },

      undoCompleteTask: (id) => {
        set({
          tasks: get().tasks.map((t) =>
            t.id === id
              ? { ...t, status: 'todo' as TaskStatus, completedAt: null }
              : t
          ),
        });
      },

      toggleSubtask: (taskId, subtaskId) => {
        set({
          tasks: get().tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  subtasks: t.subtasks.map((st) =>
                    st.id === subtaskId ? { ...st, completed: !st.completed } : st
                  ),
                }
              : t
          ),
        });
      },

      reorderTasks: (activeId, overId) => {
        const { tasks } = get();
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);
        if (activeIndex === -1 || overIndex === -1) return;

        const newTasks = [...tasks];
        const [moved] = newTasks.splice(activeIndex, 1);
        newTasks.splice(overIndex, 0, moved);

        set({
          tasks: newTasks.map((t, i) => ({ ...t, order: i })),
        });
      },

      setFilter: (filter) => {
        set({ filter: { ...get().filter, ...filter } });
      },

      setSort: (field, direction) => {
        set({ sortBy: field, sortDirection: direction });
      },

      addCategory: (name, color, icon) => {
        const id = nanoid();
        set({
          categories: [...get().categories, { id, name, color, icon }],
        });
        return id;
      },

      deleteCategory: (id) => {
        set({
          categories: get().categories.filter((c) => c.id !== id),
          tasks: get().tasks.map((t) => ({
            ...t,
            categoryIds: t.categoryIds.filter((cid) => cid !== id),
          })),
        });
      },
    }),
    { name: 'rpg-task-storage' }
  )
);
