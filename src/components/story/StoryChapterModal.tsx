'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUIStore } from '@/stores/uiStore';
import { useGameStore } from '@/stores/gameStore';
import { StoryChapter } from '@/data/story';
import { Button } from '@/components/ui/Button';
import { sound } from '@/lib/soundManager';

export function StoryChapterModal() {
  const modalData = useUIStore((s) => s.modalData) as { chapter: StoryChapter } | null;
  const closeModal = useUIStore((s) => s.closeModal);
  const dismissStoryChapter = useGameStore((s) => s.dismissStoryChapter);
  const [visibleLines, setVisibleLines] = useState(0);

  const chapter = modalData?.chapter;
  const lines = chapter?.content ?? [];
  const allShown = visibleLines >= lines.length;

  useEffect(() => {
    setVisibleLines(0);
  }, [chapter?.id]);

  useEffect(() => {
    if (!chapter) return;
    if (visibleLines < lines.length) {
      const timer = setTimeout(() => setVisibleLines((v) => v + 1), 150);
      return () => clearTimeout(timer);
    }
  }, [visibleLines, lines.length, chapter]);

  const handleContinue = () => {
    if (!allShown) {
      setVisibleLines(lines.length);
      return;
    }
    sound.complete();
    dismissStoryChapter();
    closeModal();
  };

  if (!chapter) return null;

  return (
    <div className="bg-[#0a0c0f] border border-[#1a3a2a] rounded-xl overflow-hidden">
      <div className="bg-[#0d1110] border-b border-[#1a3a2a] px-4 py-2 flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-red-500" />
        <span className="w-3 h-3 rounded-full bg-yellow-500" />
        <span className="w-3 h-3 rounded-full bg-green-500" />
        <span className="text-[10px] text-green-500/60 ml-2 font-mono">aethis-terminal — {chapter.subtitle}</span>
      </div>

      <div className="p-6 font-mono min-h-[300px] max-h-[500px] overflow-y-auto">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-green-400 text-lg mb-4 font-bold"
        >
          {chapter.title}
        </motion.h2>

        <div className="space-y-1">
          {lines.slice(0, visibleLines).map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              className={`text-sm ${line.startsWith('>') ? 'text-green-400/70' : line.startsWith('"') ? 'text-green-300/80 italic' : 'text-green-400/60'}`}
            >
              {line || ' '}
            </motion.p>
          ))}
          {!allShown && (
            <span className="inline-block w-2 h-4 bg-green-400 animate-pulse" />
          )}
        </div>

        {chapter.reward && allShown && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-green-400/5 border border-green-400/20 rounded-lg"
          >
            <span className="text-xs text-green-400/80">&gt; 系统提示：{chapter.reward}</span>
          </motion.div>
        )}
      </div>

      <div className="bg-[#0d1110] border-t border-[#1a3a2a] px-4 py-3 flex justify-end">
        <Button variant="ghost" size="sm" onClick={handleContinue}>
          {allShown ? '> 关闭终端' : '> 跳过'}
        </Button>
      </div>
    </div>
  );
}
