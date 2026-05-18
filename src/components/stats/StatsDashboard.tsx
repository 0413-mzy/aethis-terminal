'use client';

import { useCharacterStore } from '@/stores/characterStore';
import { useGameStore } from '@/stores/gameStore';
import { useTaskStore } from '@/stores/taskStore';
import { xpToNextLevel } from '@/lib/constants';
import { ProgressBar } from '@/components/ui/ProgressBar';

export function StatsDashboard() {
  const character = useCharacterStore((s) => s.character);
  const tasks = useTaskStore((s) => s.tasks);
  const totalCompleted = useGameStore((s) => s.totalTasksCompleted);
  const bossDefeatCount = useGameStore((s) => s.bossDefeatCount);
  const bossHistory = useGameStore((s) => s.bossHistory);
  const streaks = useGameStore((s) => s.streaks);
  const achievements = useGameStore((s) => s.achievements);
  const totalGoldEarned = useGameStore((s) => s.totalGoldEarned);

  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const totalTasks = tasks.length;
  const easyTasks = tasks.filter((t) => t.difficulty === 'easy' && t.status === 'done').length;
  const mediumTasks = tasks.filter((t) => t.difficulty === 'medium' && t.status === 'done').length;
  const hardTasks = tasks.filter((t) => t.difficulty === 'hard' && t.status === 'done').length;
  const legendaryTasks = tasks.filter((t) => t.difficulty === 'legendary' && t.status === 'done').length;
  const unlockedAchievements = achievements.filter((a) => a.unlockedAt).length;
  const totalAchievements = achievements.length;
  const xpNeeded = xpToNextLevel(character.level);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="medieval text-2xl text-[var(--color-accent)] mb-1">
          📊 冒险统计
        </h2>
        <p className="text-xs text-[var(--color-text-muted)]">
          {character.name} 的冒险记录
        </p>
      </div>

      {/* 角色概览 */}
      <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-4">
        <h3 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
          ⚔️ 角色概览
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="等级" value={`Lv.${character.level}`} color="text-[var(--color-accent)]" />
          <StatCard label="金币" value={`🪙 ${(character.gold ?? 0).toLocaleString()}`} color="text-[var(--color-accent)]" />
          <StatCard label="生命" value={`${character.currentHP} / ${character.maxHP}`} color="text-[var(--color-danger)]" />
          <StatCard
            label="经验"
            value={`${character.currentXP} / ${xpNeeded}`}
            color="text-[var(--color-accent)]"
          />
        </div>
        <div className="mt-3 space-y-1.5">
          <ProgressBar
            current={character.currentHP}
            max={character.maxHP}
            color="var(--color-hp-bar)"
            bgColor="var(--color-hp-bar-bg)"
            height="h-2"
            label="❤️ 生命"
          />
          <ProgressBar
            current={character.currentXP}
            max={xpNeeded}
            color="var(--color-xp-bar)"
            bgColor="var(--color-bg-primary)"
            height="h-2"
            label="⭐ 经验"
          />
        </div>
      </div>

      {/* 任务统计 */}
      <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-4">
        <h3 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
          📋 任务统计
        </h3>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <StatCard label="已完成" value={String(doneTasks)} color="text-green-400" />
          <StatCard label="总共创建" value={String(totalTasks)} color="text-[var(--color-text-primary)]" />
          <StatCard label="累计完成" value={String(totalCompleted)} color="text-[var(--color-accent)]" />
          <StatCard label="完成率" value={totalTasks > 0 ? `${Math.round((doneTasks / totalTasks) * 100)}%` : '0%'} color="text-[var(--color-info)]" />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-green-400">◈ 简单</span>
            <span className="text-[var(--color-text-primary)]">{easyTasks}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-yellow-400">◆ 中等</span>
            <span className="text-[var(--color-text-primary)]">{mediumTasks}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-orange-400">⬟ 困难</span>
            <span className="text-[var(--color-text-primary)]">{hardTasks}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-red-400">👑 传说</span>
            <span className="text-[var(--color-text-primary)]">{legendaryTasks}</span>
          </div>
        </div>
      </div>

      {/* 连签 & Boss */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-4">
          <h3 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
            🔥 连签
          </h3>
          <StatCard label="当前连签" value={`${streaks.currentStreak} 天`} color="text-orange-400" />
          <div className="mt-2">
            <StatCard label="最佳纪录" value={`${streaks.bestStreak} 天`} color="text-[var(--color-accent)]" />
          </div>
        </div>

        <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-4">
          <h3 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
            ⚔️ Boss讨伐
          </h3>
          <StatCard label="击败数量" value={String(bossDefeatCount)} color="text-[var(--color-danger)]" />
          <div className="mt-2">
            <StatCard
              label="最近讨伐"
              value={bossHistory.length > 0 ? bossHistory[bossHistory.length - 1].bossName : '暂无'}
              color="text-[var(--color-text-primary)]"
            />
          </div>
        </div>
      </div>

      {/* 成就进度 */}
      <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-4">
        <h3 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
          🏆 成就进度
        </h3>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[var(--color-text-primary)]">
            {unlockedAchievements} / {totalAchievements} 已解锁
          </span>
          <span className="text-xs text-[var(--color-text-muted)]">
            {totalAchievements > 0 ? Math.round((unlockedAchievements / totalAchievements) * 100) : 0}%
          </span>
        </div>
        <ProgressBar
          current={unlockedAchievements}
          max={totalAchievements}
          color="var(--color-magic)"
          bgColor="var(--color-bg-primary)"
          height="h-2"
        />
        <div className="mt-3 space-y-1 max-h-40 overflow-y-auto">
          {achievements.filter((a) => a.unlockedAt).map((a) => (
            <div key={a.id} className="flex items-center gap-2 text-xs">
              <span className="text-[var(--color-magic-glow)]">✓</span>
              <span className="text-[var(--color-text-primary)]">{a.name}</span>
              <span className="text-[var(--color-text-muted)] ml-auto">{a.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 累计金币 */}
      <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-4 text-center">
        <h3 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
          🪙 累计获得金币
        </h3>
        <span className="text-2xl font-bold text-[var(--color-accent)]">
          {totalGoldEarned.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-[var(--color-bg-tertiary)] rounded-lg p-3">
      <div className="text-[10px] text-[var(--color-text-muted)] mb-0.5">{label}</div>
      <div className={`text-sm font-bold ${color}`}>{value}</div>
    </div>
  );
}
