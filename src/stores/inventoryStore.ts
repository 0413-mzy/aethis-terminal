import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { InventoryItem, ShopItem } from '@/types';
import { SHOP_ITEMS } from '@/data/shopItems';

interface InventoryState {
  inventory: InventoryItem[];
  purchaseItem: (itemId: string) => boolean;
  equipItem: (itemId: string) => void;
  unequipItem: (itemId: string) => void;
  hasItem: (itemId: string) => boolean;
  getEquipped: (type: string) => InventoryItem | undefined;
  getOwnedItems: () => ShopItem[];
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      inventory: [],

      purchaseItem: (itemId) => {
        if (get().hasItem(itemId)) return false;
        set({
          inventory: [
            ...get().inventory,
            {
              itemId,
              acquiredAt: new Date().toISOString(),
              equipped: false,
            },
          ],
        });
        return true;
      },

      equipItem: (itemId) => {
        const item = SHOP_ITEMS.find((i) => i.id === itemId);
        if (!item) return;

        const { inventory } = get();

        const updated = inventory.map((inv) => {
          if (inv.itemId === itemId) {
            return { ...inv, equipped: true };
          }
          const invItem = SHOP_ITEMS.find((i) => i.id === inv.itemId);
          if (invItem && invItem.type === item.type && inv.equipped) {
            return { ...inv, equipped: false };
          }
          return inv;
        });

        set({ inventory: updated });
      },

      unequipItem: (itemId) => {
        set({
          inventory: get().inventory.map((inv) =>
            inv.itemId === itemId ? { ...inv, equipped: false } : inv
          ),
        });
      },

      hasItem: (itemId) => {
        return get().inventory.some((inv) => inv.itemId === itemId);
      },

      getEquipped: (type) => {
        return get().inventory.find((inv) => {
          if (!inv.equipped) return false;
          const item = SHOP_ITEMS.find((i) => i.id === inv.itemId);
          return item?.type === type;
        });
      },

      getOwnedItems: () => {
        return SHOP_ITEMS.filter((item) =>
          get().inventory.some((inv) => inv.itemId === item.id)
        );
      },
    }),
    { name: 'rpg-inventory-storage' }
  )
);
