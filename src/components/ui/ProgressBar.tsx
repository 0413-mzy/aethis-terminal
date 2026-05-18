import { motion } from 'framer-motion';

interface ProgressBarProps {
  current: number;
  max: number;
  color?: string;
  bgColor?: string;
  height?: string;
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function ProgressBar({
  current,
  max,
  color = 'var(--color-accent)',
  bgColor = 'var(--color-bg-primary)',
  height = 'h-3',
  showLabel = false,
  label,
  className = '',
}: ProgressBarProps) {
  const pct = max > 0 ? (current / max) * 100 : 0;

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex justify-between text-xs mb-1">
          {label && (
            <span className="text-[var(--color-text-secondary)]">{label}</span>
          )}
          {showLabel && (
            <span className="text-[var(--color-text-primary)] font-medium">
              {current} / {max}
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full rounded-full overflow-hidden ${height}`}
        style={{ backgroundColor: bgColor }}
      >
        <motion.div
          className={`h-full rounded-full`}
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
