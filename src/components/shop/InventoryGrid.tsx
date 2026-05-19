'use client';

import { useInventoryStore } from '@/stores/inventoryStore';
import { useGameStore } from '@/stores/gameStore';
import { SHOP_ITEMS } from '@/data/shopItems';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const typeNames: Record<string, string> = {
  theme: '主题',
  avatar: '头像',
  badge: '徽章',
  title: '称号',
  effect: '特效',
};

const gemColors: Record<string, string> = {
  red: 'border-red-500/60 bg-red-500/10',
  blue: 'border-blue-400/60 bg-blue-400/10',
  green: 'border-emerald-400/60 bg-emerald-400/10',
  purple: 'border-purple-400/60 bg-purple-400/10',
  gold: 'border-yellow-400/60 bg-yellow-400/10',
};

export function InventoryGrid() {
  const inventory = useInventoryStore((s) => s.inventory);
  const equipItem = useInventoryStore((s) => s.equipItem);
  const unequipItem = useInventoryStore((s) => s.unequipItem);
  const skillGems = useGameStore((s) => s.skillGems);
  const socketGem = useGameStore((s) => s.socketGem);
  const unsocketGem = useGameStore((s) => s.unsocketGem);
  const getActiveGemEffects = useGameStore((s) => s.getActiveGemEffects);
  const activeGemEffects = getActiveGemEffects();
  const socketedCount = skillGems.filter((gem) => gem.socketed).length;

  const ownedItems = inventory
    .map((inv) => {
      const item = SHOP_ITEMS.find((i) => i.id === inv.itemId);
      return { ...inv, item };
    })
    .filter((x): x is typeof x & { item: NonNullable<typeof x.item> } => !!x.item);

  if (ownedItems.length === 0 && skillGems.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-3xl mb-2">🎒</div>
        <p className="text-xs text-[var(--color-text-muted)]">
          背包空空如也。去商店看看吧！
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {skillGems.length > 0 && (
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
              技能宝石（{socketedCount}/3）
            </h4>
            <span className="text-[10px] text-[var(--color-text-muted)]">
              算力+{activeGemEffects.xpBoost}% 贡献+{activeGemEffects.goldBoost}%
            </span>
          </div>
          <div className="space-y-2">
            {skillGems.map((gem) => (
              <div
                key={gem.id}
                className={`rounded-lg p-2 border transition-colors ${gemColors[gem.color] || 'border-[var(--color-border)] bg-[var(--color-bg-tertiary)]'}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-[var(--color-text-primary)]">
                        {gem.name}
                      </span>
                      {gem.socketed && <Badge variant="accent" size="sm">已镶嵌</Badge>}
                    </div>
                    <p className="text-[10px] text-[var(--color-text-muted)]">
                      {gem.description}
                    </p>
                  </div>
                  {gem.socketed ? (
                    <Button variant="ghost" size="sm" onClick={() => unsocketGem(gem.id)}>
                      卸下
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={socketedCount >= 3}
                      onClick={() => socketGem(gem.id)}
                    >
                      镶嵌
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {ownedItems.length > 0 && (
        <section className="space-y-2">
          <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
            藏品（{ownedItems.length}）
          </h4>
          <div className="space-y-2">
            {ownedItems.map(({ item, equipped, itemId }) => (
              <div
                key={itemId}
                className={`rounded-lg p-2 border transition-colors ${
                  equipped
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10'
                    : 'border-[var(--color-border)] bg-[var(--color-bg-tertiary)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-[var(--color-text-primary)]">
                        {item.name}
                      </span>
                      {equipped && (
                        <Badge variant="accent" size="sm">已装备</Badge>
                      )}
                    </div>
                    <p className="text-[10px] text-[var(--color-text-muted)]">
                      {typeNames[item.type] || item.type}
                    </p>
                  </div>
                  {equipped ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => unequipItem(itemId)}
                    >
                      卸下
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => equipItem(itemId)}
                    >
                      装备
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
