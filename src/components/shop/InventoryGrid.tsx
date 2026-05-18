'use client';

import { useInventoryStore } from '@/stores/inventoryStore';
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

export function InventoryGrid() {
  const inventory = useInventoryStore((s) => s.inventory);
  const equipItem = useInventoryStore((s) => s.equipItem);
  const unequipItem = useInventoryStore((s) => s.unequipItem);

  const ownedItems = inventory
    .map((inv) => {
      const item = SHOP_ITEMS.find((i) => i.id === inv.itemId);
      return { ...inv, item };
    })
    .filter((x): x is typeof x & { item: NonNullable<typeof x.item> } => !!x.item);

  if (ownedItems.length === 0) {
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
      <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
        背包（{ownedItems.length}）
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
    </div>
  );
}
