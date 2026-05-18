'use client';

import { useState } from 'react';
import { useCharacterStore } from '@/stores/characterStore';
import { xpToNextLevel } from '@/lib/constants';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatType } from '@/types';

const statInfo: Record<StatType, { label: string; icon: string; desc: string }> = {
  strength: { label: '执行力', icon: '💪', desc: '每点+10%贡献点' },
  intelligence: { label: '算力', icon: '🧠', desc: '每点+8%算力获取' },
  agility: { label: '响应速度', icon: '💨', desc: '每点-6%熵化伤害' },
  vitality: { label: '意志力上限', icon: '❤️', desc: '每点+20意志力' },
};

export function CharacterPanel() {
  const character = useCharacterStore((s) => s.character);
  const allocateStatPoint = useCharacterStore((s) => s.allocateStatPoint);
  const xpNeeded = xpToNextLevel(character.level);
  const xpPct = xpNeeded > 0 ? Math.round((character.currentXP / xpNeeded) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-[var(--color-bg-tertiary)] border-2 border-[var(--color-accent)] flex items-center justify-center text-2xl flex-shrink-0 glow-pulse">
          {character.avatarId ? '🛡️' : '⚔️'}
        </div>
        <div>
          <h3 className="medieval text-lg text-[var(--color-text-primary)]">
            {character.name}
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant="accent" size="sm">Lv.{character.level}</Badge>
            {character.title && (
              <span className="text-[10px] text-[var(--color-accent)] italic">
                {character.title}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <ProgressBar
          current={character.currentHP}
          max={character.maxHP}
          color="var(--color-hp-bar)"
          bgColor="var(--color-hp-bar-bg)"
          height="h-3"
          showLabel
          label="❤️ 意志力"
        />
        <ProgressBar
          current={character.currentXP}
          max={xpNeeded}
          color="var(--color-xp-bar)"
          bgColor="var(--color-bg-primary)"
          height="h-2"
          showLabel
          label="⭐ 算力"
        />
      </div>

      <div className="flex items-center gap-2 text-sm">
        <span>🪙</span>
        <span className="font-bold text-[var(--color-accent)]">
          {(character.gold ?? 0).toLocaleString()} 贡献点
        </span>
      </div>

      <div>
        <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
          核心参数
        </h4>
        <div className="space-y-1.5">
          {(Object.keys(statInfo) as StatType[]).map((stat) => (
            <div
              key={stat}
              className="flex items-center justify-between bg-[var(--color-bg-tertiary)] rounded-md px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span>{statInfo[stat].icon}</span>
                <div>
                  <div className="text-xs font-medium text-[var(--color-text-primary)]">
                    {statInfo[stat].label}
                  </div>
                  <div className="text-[10px] text-[var(--color-text-muted)]">
                    {statInfo[stat].desc}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-[var(--color-text-primary)]">
                  {character.stats[stat]}
                </span>
                {character.unspentStatPoints > 0 && (
                  <button
                    onClick={() => allocateStatPoint(stat)}
                    className="w-5 h-5 rounded bg-[var(--color-accent)] text-black text-xs font-bold hover:bg-[var(--color-accent-glow)] transition-colors cursor-pointer"
                  >
                    +
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        {character.unspentStatPoints > 0 && (
          <p className="text-xs text-[var(--color-accent)] mt-2 text-center">
            还有 {character.unspentStatPoints} 点属性可分配！
          </p>
        )}
      </div>

      {/* Clear data */}
      <ClearDataButton />
    </div>
  );
}

function ClearDataButton() {
  const [confirming, setConfirming] = useState(false);

  const handleClear = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="border-t border-[var(--color-border)] pt-3">
      {confirming ? (
        <div className="space-y-2">
          <p className="text-[10px] text-[var(--color-danger-glow)] text-center">
            ⚠️ 这将删除所有数据，包括角色、任务、金币和成就
          </p>
          <div className="flex gap-2">
            <Button variant="danger" size="sm" className="flex-1" onClick={handleClear}>
              确认清除
            </Button>
            <Button variant="ghost" size="sm" className="flex-1" onClick={() => setConfirming(false)}>
              取消
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="ghost" size="sm" className="w-full text-[var(--color-text-muted)]" onClick={handleClear}>
          🗑️ 清除所有数据
        </Button>
      )}
    </div>
  );
}
