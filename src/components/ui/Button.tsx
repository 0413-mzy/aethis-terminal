import { ButtonHTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'gold';
  size?: 'sm' | 'md' | 'lg';
}

const variants = {
  primary:
    'bg-[var(--color-accent)] text-[var(--color-bg-primary)] hover:bg-[var(--color-accent-glow)]',
  secondary:
    'bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:bg-[var(--color-bg-hover)]',
  danger:
    'bg-[var(--color-danger)] text-white hover:bg-[var(--color-danger-glow)]',
  ghost:
    'bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]',
  gold: 'bg-gradient-to-r from-[#c9a44b] to-[#f0c860] text-black font-bold hover:from-[#d4b35c] hover:to-[#f5d470]',
};

const sizes = {
  sm: 'px-3 py-1 text-xs rounded-[4px]',
  md: 'px-4 py-2 text-sm rounded-[6px]',
  lg: 'px-6 py-3 text-base rounded-[8px]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className={`font-medium transition-colors duration-200 cursor-pointer ${variants[variant]} ${sizes[size]} ${className}`}
        {...(props as React.ComponentProps<typeof motion.button>)}
      />
    );
  }
);

Button.displayName = 'Button';
