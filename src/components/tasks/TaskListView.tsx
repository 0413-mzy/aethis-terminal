'use client';

import { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useTaskStore } from '@/stores/taskStore';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskForm } from '@/components/tasks/TaskForm';
import { Calendar } from '@/components/tasks/Calendar';
import { DailyQuests } from '@/components/tasks/DailyQuests';
import { Button } from '@/components/ui/Button';

export function TaskListView() {
  const tasks = useTaskStore((s) => s.tasks);
  const filter = useTaskStore((s) => s.filter);
  const sortBy = useTaskStore((s) => s.sortBy);
  const sortDirection = useTaskStore((s) => s.sortDirection);
  const reorderTasks = useTaskStore((s) => s.reorderTasks);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    if (filter.status !== 'all') {
      result = result.filter((t) => t.status === filter.status);
    }

    if (filter.priority !== 'all') {
      result = result.filter((t) => t.priority === filter.priority);
    }

    if (filter.difficulty !== 'all') {
      result = result.filter((t) => t.difficulty === filter.difficulty);
    }

    if (selectedDate) {
      result = result.filter((t) => t.dueDate && t.dueDate.split('T')[0] === selectedDate);
    }

    if (filter.search.trim()) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case 'order':
          cmp = a.order - b.order;
          break;
        case 'createdAt':
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) cmp = 0;
          else if (!a.dueDate) cmp = 1;
          else if (!b.dueDate) cmp = -1;
          else cmp = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
        case 'priority': {
          const prio = { low: 0, medium: 1, high: 2, critical: 3 };
          cmp = (prio[a.priority] || 0) - (prio[b.priority] || 0);
          break;
        }
        case 'difficulty': {
          const diff = { easy: 0, medium: 1, hard: 2, legendary: 3 };
          cmp = (diff[a.difficulty] || 0) - (diff[b.difficulty] || 0);
          break;
        }
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [tasks, filter, sortBy, sortDirection, selectedDate]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderTasks(active.id as string, over.id as string);
    }
  };

  const activeIds = filteredTasks.map((t) => t.id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="medieval text-xl text-[var(--color-text-primary)]">
            📋 委托面板
          </h2>
          <p className="text-xs text-[var(--color-text-muted)]">
            {filteredTasks.filter((t) => t.status === 'todo').length} 个待处理委托
          </p>
        </div>
        <Button variant="gold" size="md" onClick={() => setFormOpen(!formOpen)}>
          {formOpen ? '取消' : '+ 发布委托'}
        </Button>
      </div>

      <TaskForm isOpen={formOpen} onClose={() => setFormOpen(false)} />

      {/* Calendar */}
      <Calendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />

      {selectedDate && (
        <p className="text-xs text-[var(--color-accent)] pl-1">
          📅 {selectedDate} 的委托 ({filteredTasks.length})
        </p>
      )}

      <DailyQuests />

      {filteredTasks.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📜</div>
          <h3 className="medieval text-lg text-[var(--color-text-muted)] mb-2">
            没有找到委托
          </h3>
          <p className="text-sm text-[var(--color-text-muted)]">
            {tasks.length === 0
              ? '发布你的第一个委托，点燃秩序的火种！'
              : '试试更改筛选条件。'}
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={activeIds}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              <AnimatePresence>
                {filteredTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </AnimatePresence>
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
