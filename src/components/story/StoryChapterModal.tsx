'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUIStore } from '@/stores/uiStore';
import { useGameStore } from '@/stores/gameStore';
import { StoryChapter } from '@/data/story';
import { Button } from '@/components/ui/Button';
import { sound } from '@/lib/soundManager';

const CHAR_SPEED = 35;
const PUNCTUATION_PAUSE = 180;

export function StoryChapterModal() {
  const modalData = useUIStore((s) => s.modalData) as { chapter: StoryChapter } | null;
  const closeModal = useUIStore((s) => s.closeModal);
  const dismissStoryChapter = useGameStore((s) => s.dismissStoryChapter);
  const [typedLines, setTypedLines] = useState<string[]>([]);
  const [currentLineChars, setCurrentLineChars] = useState(0);
  const [typingDone, setTypingDone] = useState(false);

  const chapter = modalData?.chapter;
  const lines = chapter?.content ?? [];

  // Reset on new chapter
  useEffect(() => {
    setTypedLines([]);
    setCurrentLineChars(0);
    setTypingDone(false);
  }, [chapter?.id]);

  // Typewriter effect
  useEffect(() => {
    if (!chapter || typingDone) return;

    const currentLineIdx = typedLines.length;
    if (currentLineIdx >= lines.length) {
      setTypingDone(true);
      return;
    }

    const targetLine = lines[currentLineIdx];
    if (currentLineChars >= targetLine.length) {
      const timer = setTimeout(() => {
        setTypedLines((prev) => [...prev, targetLine]);
        setCurrentLineChars(0);
      }, 100);
      return () => clearTimeout(timer);
    }

    const isPunctuation = ',.，。！？…'.includes(targetLine[currentLineChars]);
    const delay = isPunctuation ? CHAR_SPEED + PUNCTUATION_PAUSE : CHAR_SPEED;

    const timer = setTimeout(() => {
      setCurrentLineChars((prev) => prev + 1);
    }, delay);
    return () => clearTimeout(timer);
  }, [chapter, typedLines, currentLineChars, typingDone, lines]);

  const displayLines = [
    ...typedLines,
    ...(typedLines.length < lines.length
      ? [lines[typedLines.length].slice(0, currentLineChars)]
      : []),
  ];

  const handleContinue = () => {
    if (!typingDone) {
      setTypedLines(lines);
      setCurrentLineChars(0);
      setTypingDone(true);
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

      <div
        className="p-6 font-mono min-h-[280px] max-h-[460px] overflow-y-auto cursor-pointer"
        onClick={() => { if (!typingDone) { setTypedLines(lines); setCurrentLineChars(0); setTypingDone(true); } }}
      >
        <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-400 text-lg mb-4 font-bold">
          {chapter.title}
        </motion.h2>

        <div className="space-y-1">
          {displayLines.map((line, i) => (
            <p
              key={i}
              className={`text-sm min-h-[1.25rem] ${
                line.startsWith('>') ? 'text-green-400/70' :
                line.startsWith('"') ? 'text-green-300/80 italic' :
                'text-green-400/60'
              }`}
            >
              {line || ' '}
              {i === displayLines.length - 1 && !typingDone && (
                <span className="inline-block w-2 h-4 bg-green-400 animate-pulse ml-0.5 align-middle" />
              )}
            </p>
          ))}
        </div>

        {chapter.reward && typingDone && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-green-400/5 border border-green-400/20 rounded-lg">
            <span className="text-xs text-green-400/80">&gt; 系统提示：{chapter.reward}</span>
          </motion.div>
        )}
      </div>

      <div className="bg-[#0d1110] border-t border-[#1a3a2a] px-4 py-3 flex justify-end">
        <Button variant="ghost" size="sm" onClick={handleContinue}>
          {typingDone ? '> 关闭终端' : '点击任意位置跳过动画'}
        </Button>
      </div>
    </div>
  );
}
