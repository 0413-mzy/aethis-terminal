'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaskStore } from '@/stores/taskStore';
import { TaskDifficulty, TaskPriority } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const difficultyLabels: Record<TaskDifficulty, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
  legendary: '传说',
};

const difficultyColors: Record<TaskDifficulty, string> = {
  easy: 'text-green-400',
  medium: 'text-yellow-400',
  hard: 'text-orange-400',
  legendary: 'text-red-400',
};

export function TaskForm({ isOpen, onClose }: TaskFormProps) {
  const addTask = useTaskStore((s) => s.addTask);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<TaskDifficulty>('medium');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [subtasks, setSubtasks] = useState<string[]>([]);

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput('');
  };

  const handleAddSubtask = () => {
    const st = subtaskInput.trim();
    if (st) {
      setSubtasks([...subtasks, st]);
    }
    setSubtaskInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      description: description.trim(),
      difficulty,
      priority,
      tags,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      subtasks: subtasks.map((t) => ({
        title: t,
        completed: false,
        id: '',
        createdAt: '',
      })),
    });

    setTitle('');
    setDescription('');
    setDifficulty('medium');
    setPriority('medium');
    setDueDate('');
    setTags([]);
    setSubtasks([]);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <form onSubmit={handleSubmit} className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-4 space-y-4">
            <h3 className="medieval text-lg text-[var(--color-accent)]">新建任务</h3>

            <Input
              label="任务标题"
              placeholder="需要完成什么？"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />

            <div>
              <label className="text-xs text-[var(--color-text-secondary)] font-medium mb-1 block">
                描述
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="任务的详细信息..."
                rows={2}
                className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-[6px] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[var(--color-text-secondary)] font-medium mb-1 block">
                  难度
                </label>
                <div className="flex gap-1">
                  {(Object.keys(difficultyColors) as TaskDifficulty[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      className={`px-2 py-1 text-[10px] rounded font-medium transition-colors cursor-pointer ${
                        difficulty === d
                          ? `bg-[var(--color-accent)] text-black`
                          : `bg-[var(--color-bg-tertiary)] ${difficultyColors[d]}`
                      }`}
                    >
                      {difficultyLabels[d]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-[var(--color-text-secondary)] font-medium mb-1 block">
                  优先级
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-[6px] px-2 py-1.5 text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]"
                >
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                  <option value="critical">紧急</option>
                </select>
              </div>
            </div>

            <Input
              label="截止日期（可选）"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />

            <div>
              <label className="text-xs text-[var(--color-text-secondary)] font-medium mb-1 block">
                标签
              </label>
              <div className="flex gap-1">
                <Input
                  placeholder="添加标签..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1"
                />
                <Button type="button" variant="secondary" size="sm" onClick={handleAddTag}>
                  添加
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-[10px] bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] rounded-full flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => setTags(tags.filter((t) => t !== tag))}
                        className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)]"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs text-[var(--color-text-secondary)] font-medium mb-1 block">
                子任务
              </label>
              <div className="flex gap-1">
                <Input
                  placeholder="添加子任务..."
                  value={subtaskInput}
                  onChange={(e) => setSubtaskInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
                  className="flex-1"
                />
                <Button type="button" variant="secondary" size="sm" onClick={handleAddSubtask}>
                  添加
                </Button>
              </div>
              {subtasks.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {subtasks.map((st, i) => (
                    <li
                      key={i}
                      className="text-xs text-[var(--color-text-secondary)] flex items-center gap-2"
                    >
                      <span className="text-[var(--color-text-muted)]">○</span>
                      {st}
                      <button
                        type="button"
                        onClick={() => setSubtasks(subtasks.filter((_, idx) => idx !== i))}
                        className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)] ml-auto"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" onClick={onClose}>
                取消
              </Button>
              <Button type="submit" variant="gold" disabled={!title.trim()}>
                创建任务
              </Button>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
