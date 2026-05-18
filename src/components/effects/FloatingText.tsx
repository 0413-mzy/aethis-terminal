'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FloatingTextData {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
}

let globalCounter = 0;
let addFloatingTextFn: ((text: string, x: number, y: number, color: string) => void) | null = null;

export function emitFloatingText(text: string, x: number, y: number, color: string = '#c9a44b') {
  addFloatingTextFn?.(text, x, y, color);
}

export function FloatingTexts() {
  const [texts, setTexts] = useState<FloatingTextData[]>([]);

  const addText = useCallback((text: string, x: number, y: number, color: string) => {
    const id = ++globalCounter;
    setTexts((prev) => [...prev.slice(-10), { id, text, x, y, color }]);
    setTimeout(() => {
      setTexts((prev) => prev.filter((t) => t.id !== id));
    }, 2000);
  }, []);

  useEffect(() => {
    addFloatingTextFn = addText;
    return () => { addFloatingTextFn = null; };
  }, [addText]);

  return (
    <div className="fixed inset-0 z-45 pointer-events-none">
      <AnimatePresence>
        {texts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 1, y: t.y, x: t.x, scale: 0.8 }}
            animate={{ opacity: 0, y: t.y - 60, scale: 1.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: 'easeOut' }}
            className="absolute float-text"
            style={{
              left: t.x,
              top: t.y,
              color: t.color,
              textShadow: `0 0 8px ${t.color}`,
            }}
          >
            {t.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
