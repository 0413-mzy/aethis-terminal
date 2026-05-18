'use client';

import { useTaskStore } from '@/stores/taskStore';
import { TaskStatus, TaskPriority, TaskDifficulty, SortField } from '@/types';
import { Input } from '@/components/ui/Input';

const statusOptions: { value: TaskStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'todo', label: '待办' },
  { value: 'in_progress', label: '进行中' },
  { value: 'done', label: '已完成' },
];

const priorityOptions: { value: TaskPriority | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' },
  { value: 'critical', label: '紧急' },
];

const difficultyOptions: { value: TaskDifficulty | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'easy', label: '简单' },
  { value: 'medium', label: '中等' },
  { value: 'hard', label: '困难' },
  { value: 'legendary', label: '传说' },
];

const sortOptions: { value: SortField; label: string }[] = [
  { value: 'order', label: '自定义顺序' },
  { value: 'createdAt', label: '创建时间' },
  { value: 'dueDate', label: '截止日期' },
  { value: 'priority', label: '优先级' },
  { value: 'difficulty', label: '难度' },
];

export function FilterBar() {
  const filter = useTaskStore((s) => s.filter);
  const setFilter = useTaskStore((s) => s.setFilter);
  const sortBy = useTaskStore((s) => s.sortBy);
  const sortDirection = useTaskStore((s) => s.sortDirection);
  const setSort = useTaskStore((s) => s.setSort);

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
        筛选
      </h4>

      <Input
        placeholder="搜索任务..."
        value={filter.search}
        onChange={(e) => setFilter({ search: e.target.value })}
      />

      <div>
        <label className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">
          状态
        </label>
        <div className="flex flex-wrap gap-1">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter({ status: opt.value })}
              className={`px-2 py-0.5 text-[10px] rounded cursor-pointer transition-colors ${
                filter.status === opt.value
                  ? 'bg-[var(--color-accent)] text-black'
                  : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">
          优先级
        </label>
        <div className="flex flex-wrap gap-1">
          {priorityOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter({ priority: opt.value })}
              className={`px-2 py-0.5 text-[10px] rounded cursor-pointer transition-colors ${
                filter.priority === opt.value
                  ? 'bg-[var(--color-accent)] text-black'
                  : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">
          难度
        </label>
        <div className="flex flex-wrap gap-1">
          {difficultyOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter({ difficulty: opt.value })}
              className={`px-2 py-0.5 text-[10px] rounded cursor-pointer transition-colors ${
                filter.difficulty === opt.value
                  ? 'bg-[var(--color-accent)] text-black'
                  : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">
          排序方式
        </label>
        <div className="flex flex-wrap gap-1">
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() =>
                setSort(
                  opt.value,
                  sortBy === opt.value && sortDirection === 'asc'
                    ? 'desc'
                    : 'asc'
                )
              }
              className={`px-2 py-0.5 text-[10px] rounded cursor-pointer transition-colors ${
                sortBy === opt.value
                  ? 'bg-[var(--color-accent)] text-black'
                  : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {opt.label} {sortBy === opt.value ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
