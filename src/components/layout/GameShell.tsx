'use client';

import { ReactNode, useEffect } from 'react';
import { useCharacterStore } from '@/stores/characterStore';
import { useGameStore } from '@/stores/gameStore';
import { useUIStore } from '@/stores/uiStore';
import { applyTheme } from '@/data/themes';
import { useInventoryStore } from '@/stores/inventoryStore';
import { SHOP_ITEMS } from '@/data/shopItems';
import { useGameLoop } from '@/hooks/useGameLoop';

export function GameShell({ children }: { children: ReactNode }) {
  const character = useCharacterStore((s) => s.character);
  const initCharacter = useCharacterStore((s) => s.initCharacter);
  const openModal = useUIStore((s) => s.openModal);
  const shaking = useUIStore((s) => s.shaking);
  const { checkDailyCheckin, claimDailyReward } = useGameStore();
  const gainGold = useCharacterStore((s) => s.gainGold);

  const equippedTheme = useInventoryStore((s) =>
    s.inventory.find((inv) => {
      if (!inv.equipped) return false;
      const item = SHOP_ITEMS.find((i) => i.id === inv.itemId);
      return item?.type === 'theme';
    })
  );

  // Check if character exists, show creation if not
  useEffect(() => {
    if (!character.name) {
      openModal('characterCreation');
    }
  }, [character.name, openModal]);

  // Daily check-in
  useEffect(() => {
    if (character.name && checkDailyCheckin()) {
      openModal('dailyReward');
    }
  }, [character.name, checkDailyCheckin, openModal]);

  // Game loop (HP regen, deadline checks)
  useGameLoop();

  // Apply equipped theme
  useEffect(() => {
    if (equippedTheme) {
      const item = SHOP_ITEMS.find((i) => i.id === equippedTheme.itemId);
      if (item) {
        const themeMap: Record<string, string> = {
          'theme-crimson': 'crimson',
          'theme-frost': 'frost',
          'theme-emerald': 'emerald',
          'theme-void': 'void',
          'theme-solar': 'solar',
        };
        applyTheme(themeMap[item.id] || 'default');
      }
    } else {
      applyTheme('default');
    }
  }, [equippedTheme]);

  return (
    <div
      className={`min-h-screen bg-[var(--color-bg-primary)] flex flex-col ${shaking ? 'shake' : ''}`}
    >
      {children}
    </div>
  );
}
