'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/stores/uiStore';

const toastColors = {
  xp: { bg: 'bg-yellow-900/40', border: 'border-[var(--color-accent)]', text: 'text-[var(--color-accent)]' },
  gold: { bg: 'bg-yellow-900/40', border: 'border-yellow-600', text: 'text-yellow-400' },
  damage: { bg: 'bg-red-900/40', border: 'border-[var(--color-danger)]', text: 'text-[var(--color-danger-glow)]' },
  achievement: { bg: 'bg-purple-900/40', border: 'border-[var(--color-magic)]', text: 'text-[var(--color-magic-glow)]' },
  info: { bg: 'bg-blue-900/40', border: 'border-blue-600', text: 'text-blue-400' },
};

export function ToastContainer() {
  const toasts = useUIStore((s) => s.toasts);
  const dismissToast = useUIStore((s) => s.dismissToast);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const colors = toastColors[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className={`${colors.bg} ${colors.border} border rounded-lg px-3 py-2 shadow-lg pointer-events-auto cursor-pointer`}
              onClick={() => dismissToast(toast.id)}
            >
              <span className={`text-sm font-bold ${colors.text}`}>
                {toast.message}
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
