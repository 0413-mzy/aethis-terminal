import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'accent' | 'danger' | 'success' | 'magic' | 'rarity';
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles = {
  default: 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]',
  accent: 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]',
  danger: 'bg-[var(--color-danger)]/20 text-[var(--color-danger-glow)]',
  success: 'bg-[var(--color-success)]/20 text-[var(--color-success-glow)]',
  magic: 'bg-[var(--color-magic)]/20 text-[var(--color-magic-glow)]',
  rarity: '',
};

const rarityStyles = {
  common: 'border-[var(--color-rarity-common)] text-[var(--color-rarity-common)]',
  rare: 'border-[var(--color-rarity-rare)] text-[var(--color-rarity-rare)] shadow-[0_0_8px_rgba(74,144,217,0.3)]',
  epic: 'border-[var(--color-rarity-epic)] text-[var(--color-rarity-epic)] shadow-[0_0_12px_rgba(166,77,255,0.4)]',
  legendary: 'border-[var(--color-rarity-legendary)] text-[var(--color-rarity-legendary)] shadow-[0_0_16px_rgba(255,107,0,0.5)]',
};

const sizes = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-1 text-xs',
};

export function Badge({
  children,
  variant = 'default',
  rarity,
  size = 'md',
  className = '',
}: BadgeProps) {
  const style =
    variant === 'rarity' && rarity
      ? `bg-transparent border ${rarityStyles[rarity]}`
      : variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-[4px] font-medium border border-transparent ${style} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
}
