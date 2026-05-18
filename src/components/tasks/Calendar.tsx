'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTaskStore } from '@/stores/taskStore';

interface CalendarProps {
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
}

export function Calendar({ selectedDate, onSelectDate }: CalendarProps) {
  const tasks = useTaskStore((s) => s.tasks);
  const today = useMemo(() => new Date(), []);

  const [viewYear, viewMonth] = useMemo(() => {
    if (selectedDate) {
      const d = new Date(selectedDate + 'T00:00:00');
      return [d.getFullYear(), d.getMonth()];
    }
    return [today.getFullYear(), today.getMonth()];
  }, [selectedDate]);

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Count tasks per day for current month
  const tasksPerDay = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach((t) => {
      if (!t.dueDate) return;
      const d = t.dueDate.split('T')[0];
      if (!counts[d]) counts[d] = 0;
      counts[d]++;
    });
    return counts;
  }, [tasks]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const goToMonth = (offset: number) => {
    const newDate = new Date(viewYear, viewMonth + offset, 1);
    // Select first day of new month to avoid confusion
    const y = newDate.getFullYear();
    const m = String(newDate.getMonth() + 1).padStart(2, '0');
    onSelectDate(`${y}-${m}-01`);
  };

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => goToMonth(-1)}
          className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors p-1 cursor-pointer"
        >
          ◀
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[var(--color-text-primary)]">
            {viewYear}年{viewMonth + 1}月
          </span>
          <button
            onClick={() => onSelectDate(todayStr)}
            className="text-[10px] text-[var(--color-accent)] hover:underline cursor-pointer"
          >
            今天
          </button>
        </div>
        <button
          onClick={() => goToMonth(1)}
          className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors p-1 cursor-pointer"
        >
          ▶
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {weekDays.map((wd) => (
          <div key={wd} className="text-center text-[10px] text-[var(--color-text-muted)] py-1">
            {wd}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;

          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const count = tasksPerDay[dateStr] || 0;
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const isPast = dateStr < todayStr;

          return (
            <motion.button
              key={dateStr}
              whileTap={{ scale: 0.9 }}
              onClick={() => onSelectDate(isSelected ? null : dateStr)}
              className={`relative flex flex-col items-center justify-center rounded-md py-1.5 cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-[var(--color-accent)] text-black'
                  : isToday
                  ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]'
                  : 'hover:bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)]'
              }`}
            >
              <span className={`text-xs ${isPast && !isToday && !isSelected ? 'opacity-40' : ''}`}>
                {day}
              </span>
              {count > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {count <= 3 ? (
                    Array.from({ length: count }).map((_, j) => (
                      <span
                        key={j}
                        className={`w-1 h-1 rounded-full ${
                          isSelected ? 'bg-black' : 'bg-[var(--color-accent)]'
                        }`}
                      />
                    ))
                  ) : (
                    <span
                      className={`text-[8px] font-bold ${
                        isSelected ? 'text-black' : 'text-[var(--color-accent)]'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Clear filter */}
      {selectedDate && (
        <button
          onClick={() => onSelectDate(null)}
          className="mt-2 w-full text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
        >
          清除日期筛选
        </button>
      )}
    </div>
  );
}
