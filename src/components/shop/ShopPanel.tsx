'use client';

import { useInventoryStore } from '@/stores/inventoryStore';
import { useCharacterStore } from '@/stores/characterStore';
import { useGameStore } from '@/stores/gameStore';
import { useUIStore } from '@/stores/uiStore';
import { SHOP_ITEMS } from '@/data/shopItems';
import { ShopItem, Rarity } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { sound } from '@/lib/soundManager';

const rarityNames: Record<Rarity, string> = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};

const rarityColors: Record<Rarity, string> = {
  common: 'border-[var(--color-rarity-common)]',
  rare: 'border-[var(--color-rarity-rare)] shadow-[0_0_8px_rgba(74,144,217,0.2)]',
  epic: 'border-[var(--color-rarity-epic)] shadow-[0_0_12px_rgba(166,77,255,0.3)]',
  legendary: 'border-[var(--color-rarity-legendary)] shadow-[0_0_16px_rgba(255,107,0,0.3)]',
};

const typeIcons: Record<string, string> = {
  theme: '🎨',
  avatar: '👤',
  badge: '🏅',
  title: '📜',
  effect: '✨',
};

export function ShopPanel() {
  const inventory = useInventoryStore((s) => s.inventory);
  const purchaseItem = useInventoryStore((s) => s.purchaseItem);
  const hasItem = useInventoryStore((s) => s.hasItem);
  const character = useCharacterStore((s) => s.character);
  const spendGold = useCharacterStore((s) => s.spendGold);
  const shieldActive = useGameStore((s) => s.shieldActive);
  const activateShield = useGameStore((s) => s.activateShield);
  const activateDoubleXP = useGameStore((s) => s.activateDoubleXP);
  const addToast = useUIStore((s) => s.addToast);

  const handlePurchase = (item: ShopItem) => {
    if (hasItem(item.id)) return;
    if (character.gold < item.cost) return;

    if (spendGold(item.cost)) {
      purchaseItem(item.id);
      sound.purchase();
      addToast({ type: 'info', message: `✅ 已购买：${item.name}` });
    }
  };

  const handleFunctionalBuy = (id: string, cost: number) => {
    if (character.gold < cost) return;
    if (!spendGold(cost)) return;
    sound.purchase();
    if (id === 'func-shield') { activateShield(); addToast({ type: 'info', message: '🛡️ 护盾已激活！' }); }
    if (id === 'func-doublexp') { activateDoubleXP(); addToast({ type: 'info', message: '⚡ 双倍经验已激活！' }); }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
          商店
        </h4>
        <span className="text-[10px] text-[var(--color-accent)]">
          🪙 {(character.gold ?? 0).toLocaleString()}
        </span>
      </div>

      {/* 消耗品 */}
      <div className="mb-3">
        <h5 className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
          🧪 消耗品
        </h5>
        <ConsumableItem id="func-shield" name="🛡️ 护盾" desc="当天逾期任务不扣血（一次性）" cost={150} active={shieldActive} onBuy={() => handleFunctionalBuy('func-shield', 150)} />
        <ConsumableItem id="func-doublexp" name="⚡ 双倍经验" desc="下次完成任务经验翻倍" cost={200} active={false} onBuy={() => handleFunctionalBuy('func-doublexp', 200)} />
      </div>

      {/* 装饰品 */}
      <h5 className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
        🎨 装饰品
      </h5>
      <div className="space-y-1.5">
        {SHOP_ITEMS.filter((item) => item.cost > 0 || hasItem(item.id)).map((item) => {
          const owned = hasItem(item.id);
          const canAfford = character.gold >= item.cost;
          const equipped = inventory.find(
            (inv) => inv.itemId === item.id && inv.equipped
          );

          return (
            <div
              key={item.id}
              className={`rounded-lg p-2 border bg-[var(--color-bg-tertiary)] ${rarityColors[item.rarity]} transition-colors`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{typeIcons[item.type] || '📦'}</span>
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
                      {item.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {owned ? (
                    <Badge variant="success" size="sm">已拥有</Badge>
                  ) : (
                    <>
                      <span className="text-[10px] text-[var(--color-accent)] font-bold">
                        🪙{item.cost}
                      </span>
                      <Button
                        variant={canAfford ? 'primary' : 'ghost'}
                        size="sm"
                        disabled={!canAfford}
                        onClick={() => handlePurchase(item)}
                      >
                        购买
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ConsumableItem({ id, name, desc, cost, active, onBuy }: { id: string; name: string; desc: string; cost: number; active: boolean; onBuy: () => void }) {
  const character = useCharacterStore((s) => s.character);
  const canAfford = character.gold >= cost;

  return (
    <div className={`rounded-lg p-2 border mb-1.5 transition-colors ${
      active ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)] bg-[var(--color-bg-tertiary)]'
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-[var(--color-text-primary)]">{name}</span>
            {active && <Badge variant="accent" size="sm">已激活</Badge>}
          </div>
          <p className="text-[10px] text-[var(--color-text-muted)]">{desc}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-[var(--color-accent)] font-bold">🪙{cost}</span>
          <Button variant={canAfford ? 'primary' : 'ghost'} size="sm" disabled={!canAfford || active} onClick={onBuy}>
            购买
          </Button>
        </div>
      </div>
    </div>
  );
}
