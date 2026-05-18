'use client';

import { useEffect, useRef } from 'react';
import { useCharacterStore } from '@/stores/characterStore';
import { useGameStore } from '@/stores/gameStore';
import { useTaskStore } from '@/stores/taskStore';
import { useUIStore } from '@/stores/uiStore';
import { calculateHPRegenPerHour, calculateDeadlineDamage, isOverdue } from '@/lib/constants';

export function useGameLoop() {
  const character = useCharacterStore((s) => s.character);
  const healHP = useCharacterStore((s) => s.healHP);
  const takeDamage = useCharacterStore((s) => s.takeDamage);
  const addToast = useUIStore((s) => s.addToast);
  const triggerShake = useUIStore((s) => s.triggerShake);
  const processedDamageRef = useRef<Set<string>>(new Set());

  // 每分钟被动生命恢复
  useEffect(() => {
    if (!character.name) return;

    const regenPerTick = Math.max(
      1,
      Math.round(calculateHPRegenPerHour(character.maxHP) / 60)
    );

    const interval = setInterval(() => {
      const { character: char } = useCharacterStore.getState();
      if (char.currentHP < char.maxHP) {
        useCharacterStore.getState().healHP(regenPerTick);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [character.name, character.maxHP]);

  // 每2分钟检测逾期任务
  useEffect(() => {
    if (!character.name) return;

    const checkDeadlines = () => {
      const { tasks: allTasks } = useTaskStore.getState();
      const { character: char } = useCharacterStore.getState();

      for (const task of allTasks) {
        if (task.status === 'done') continue;
        if (!task.dueDate) continue;
        if (processedDamageRef.current.has(task.id)) continue;
        if (!isOverdue(task.dueDate)) continue;

        const damage = calculateDeadlineDamage(task.difficulty, char.stats.agility);
        useCharacterStore.getState().takeDamage(damage);
        useUIStore.getState().triggerShake();
        useUIStore.getState().addToast({
          type: 'damage',
          message: `-${damage} 生命：「${task.title}」已逾期！`,
        });

        const { character: updatedChar } = useCharacterStore.getState();
        if (updatedChar.currentHP <= 0) {
          useCharacterStore.getState().resetAfterDeath();
          useUIStore.getState().openModal('death');
          useGameStore.getState().resetStreak();
        }

        processedDamageRef.current.add(task.id);
      }

      for (const id of processedDamageRef.current) {
        const task = allTasks.find((t) => t.id === id);
        if (!task || task.status === 'done' || !isOverdue(task.dueDate || '')) {
          processedDamageRef.current.delete(id);
        }
      }
    };

    checkDeadlines();
    const interval = setInterval(checkDeadlines, 120000);

    return () => clearInterval(interval);
  }, [character.name]);

  return null;
}
