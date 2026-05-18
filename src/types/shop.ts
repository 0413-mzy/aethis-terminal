export type CosmeticType = 'theme' | 'avatar' | 'badge' | 'title' | 'effect';
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  type: CosmeticType;
  cost: number;
  rarity: Rarity;
  previewUrl: string;
  unlockedByDefault: boolean;
  achievementRequired: string | null;
}

export interface InventoryItem {
  itemId: string;
  acquiredAt: string;
  equipped: boolean;
}
