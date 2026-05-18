'use client';

import { useUIStore } from '@/stores/uiStore';
import { useGameStore } from '@/stores/gameStore';
import { TaskListView } from '@/components/tasks/TaskListView';
import { BossBattleView } from '@/components/boss/BossBattleView';
import { BossHistoryView } from '@/components/boss/BossHistoryView';
import { StatsDashboard } from '@/components/stats/StatsDashboard';

export function MainContent() {
  const activeView = useUIStore((s) => s.activeView);
  const bossBattle = useGameStore((s) => s.bossBattle);

  return (
    <main className="flex-1 overflow-y-auto p-4">
      <div className="max-w-3xl mx-auto">
        {activeView === 'tasks' && <TaskListView />}
        {activeView === 'boss' && (
          bossBattle && (bossBattle.status === 'active' || bossBattle.status === 'defeated') ? (
            <BossBattleView />
          ) : (
            <BossHistoryView />
          )
        )}
        {activeView === 'stats' && <StatsDashboard />}
      </div>
    </main>
  );
}
