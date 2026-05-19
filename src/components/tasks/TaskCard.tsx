'use client';

import { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, TaskDifficulty } from '@/types';
import { useTaskStore } from '@/stores/taskStore';
import { useTaskCompletion } from '@/hooks/useTaskCompletion';
import { Badge } from '@/components/ui/Badge';

interface TaskCardProps {
  task: Task;
}

const difficultyConfig: Record<TaskDifficulty, { color: string; icon: string; label: string }> = {
  easy: { color: 'text-green-400', icon: '◈', label: '简单' },
  medium: { color: 'text-yellow-400', icon: '◆', label: '中等' },
  hard: { color: 'text-orange-400', icon: '⬟', label: '困难' },
  legendary: { color: 'text-red-400', icon: '👑', label: '传说' },
};

const priorityStyles: Record<string, string> = {
  low: 'border-l-green-700',
  medium: 'border-l-blue-600',
  high: 'border-l-orange-500',
  critical: 'border-l-red-500',
};

export const TaskCard = memo(function TaskCard({ task }: TaskCardProps) {
  const { completeTask, undoTask } = useTaskCompletion();
  const deleteTask = useTaskStore((s) => s.deleteTask);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isDone = task.status === 'done';
  const subtaskDone = task.subtasks.filter((s) => s.completed).length;
  const difficultyConf = difficultyConfig[task.difficulty];
  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && !isDone;

  const handleComplete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isDone) {
        undoTask(task.id);
      } else {
        completeTask(task.id);
      }
    },
    [completeTask, undoTask, task.id, isDone]
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      deleteTask(task.id);
    },
    [deleteTask, task.id]
  );

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: isDragging ? 0.5 : 1,
        y: 0,
        scale: isDragging ? 1.02 : 1,
      }}
      exit={{ opacity: 0, x: 100 }}
      className={`bg-[var(--color-bg-secondary)] border border-[var(--color-border)] border-l-4 ${
        priorityStyles[task.priority]
      } rounded-lg p-3 cursor-grab active:cursor-grabbing select-none group hover:border-[var(--color-border-light)] transition-colors ${
        isDone ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          aria-label={isDone ? `撤销完成：${task.title}` : `完成任务：${task.title}`}
          onClick={handleComplete}
          className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all cursor-pointer ${
            isDone
              ? 'bg-[var(--color-success)] border-[var(--color-success)]'
              : 'border-[var(--color-border-light)] hover:border-[var(--color-accent)]'
          }`}
        >
          {isDone && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 6l3 3 5-6"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-sm font-medium ${
                isDone
                  ? 'line-through text-[var(--color-text-muted)]'
                  : 'text-[var(--color-text-primary)]'
              }`}
            >
              {task.title}
            </span>
            <span className={`text-xs ${difficultyConf.color}`} title={difficultyConf.label}>
              {difficultyConf.icon}
            </span>
            {task.isBossBattle && <Badge variant="danger" size="sm">⚔️ Boss</Badge>}
          </div>

          {task.description && (
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5 line-clamp-1">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {task.tags.map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 text-[10px] bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] rounded"
              >
                {tag}
              </span>
            ))}

            {task.subtasks.length > 0 && (
              <span className="text-[10px] text-[var(--color-text-muted)]">
                □ {subtaskDone}/{task.subtasks.length}
              </span>
            )}

            {task.dueDate && (
              <span
                className={`text-[10px] ${
                  isOverdue
                    ? 'text-[var(--color-danger-glow)] font-bold animate-pulse'
                    : 'text-[var(--color-text-muted)]'
                }`}
              >
                {isOverdue ? '⚠ 已逾期' : formatDueDate(task.dueDate)}
              </span>
            )}
          </div>
        </div>

        <button
          aria-label={`删除任务：${task.title}`}
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-all p-1 cursor-pointer flex-shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <path d="M4 4l6 6M10 4l-6 6" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
});

function formatDueDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));

  if (diffHours < 0) return '已逾期';
  if (diffHours < 24) return `${diffHours}小时后`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `${diffDays}天后`;
  return date.toLocaleDateString('zh-CN');
}
