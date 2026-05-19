'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useCharacterStore } from '@/stores/characterStore';
import { useUIStore } from '@/stores/uiStore';
import { CLASS_STATS } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { sound } from '@/lib/soundManager';

const TERMINAL_LINES = [
  '> 系统自检中...',
  '> 认知网络状态：离线',
  '> 动力源：枯竭',
  '> 熵化程度：97.3%',
  '> 公会大厅连接：已断开',
  '',
  '> 正在搜索可用模块...',
  '> 找到：Project OpenClaw（休眠）',
  '> 等待最小可行性指令 (MVP)...',
  '',
  '> 检测到微弱生物信号。',
  '> 身份未知。请确认您的代号。',
];

const CHAR_SPEED = 40; // ms per character
const PUNCTUATION_PAUSE = 200; // extra pause after punctuation

const classes = [
  { id: 'warrior', name: '突击型执行官', icon: '⚔️', desc: '力量专精。擅长正面击破高优先级委托。', stats: CLASS_STATS.warrior },
  { id: 'mage', name: '解析型执行官', icon: '🧙', desc: '智力专精。快速从委托中提取经验值。', stats: CLASS_STATS.mage },
  { id: 'rogue', name: '潜袭型执行官', icon: '🗡️', desc: '敏捷专精。用速度规避熵化的侵蚀。', stats: CLASS_STATS.rogue },
  { id: 'guardian', name: '守护型执行官', icon: '🛡️', desc: '体力专精。构筑坚不可摧的意志力护盾。', stats: CLASS_STATS.guardian },
];

const STEPS = ['terminal', 'name', 'class', 'done'] as const;
type Step = typeof STEPS[number];

export function PrologueModal() {
  const [step, setStep] = useState<Step>('terminal');
  const [typedLines, setTypedLines] = useState<string[]>([]);
  const [currentLineChars, setCurrentLineChars] = useState(0);
  const [typingDone, setTypingDone] = useState(false);
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const initCharacter = useCharacterStore((s) => s.initCharacter);
  const closeModal = useUIStore((s) => s.closeModal);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Typewriter effect
  useEffect(() => {
    if (step !== 'terminal' || typingDone) return;

    const totalLines = TERMINAL_LINES.length;
    const currentLineIdx = typedLines.length;

    if (currentLineIdx >= totalLines) {
      setTypingDone(true);
      return;
    }

    const targetLine = TERMINAL_LINES[currentLineIdx];
    if (currentLineChars >= targetLine.length) {
      // Line complete, move to next
      const timer = setTimeout(() => {
        setTypedLines((prev) => [...prev, targetLine]);
        setCurrentLineChars(0);
      }, 150);
      return () => clearTimeout(timer);
    }

    // Type next character
    const isPunctuation = ',.，。！？…'.includes(targetLine[currentLineChars]);
    const delay = isPunctuation ? CHAR_SPEED + PUNCTUATION_PAUSE : CHAR_SPEED;

    const timer = setTimeout(() => {
      setCurrentLineChars((prev) => prev + 1);
    }, delay);
    return () => clearTimeout(timer);
  }, [step, typedLines, currentLineChars, typingDone]);

  const displayLines = [
    ...typedLines,
    ...(typedLines.length < TERMINAL_LINES.length
      ? [TERMINAL_LINES[typedLines.length].slice(0, currentLineChars)]
      : []),
  ];

  const handleTerminalNext = () => {
    if (!typingDone) {
      // Skip animation - show all immediately
      setTypedLines(TERMINAL_LINES);
      setCurrentLineChars(0);
      setTypingDone(true);
      return;
    }
    sound.complete();
    setStep('name');
  };

  const handleClassNext = () => {
    if (!name.trim() || !selectedClass) return;
    const cls = classes.find((c) => c.id === selectedClass);
    if (!cls) return;
    initCharacter(name.trim(), cls.stats);
    sound.complete();
    setStep('done');
  };

  const handleDone = () => {
    if (mountedRef.current) closeModal();
  };

  return (
    <div className="bg-[#0a0c0f] border border-[#1a3a2a] rounded-xl overflow-hidden">
      <div className="bg-[#0d1110] border-b border-[#1a3a2a] px-4 py-2 flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-red-500" />
        <span className="w-3 h-3 rounded-full bg-yellow-500" />
        <span className="w-3 h-3 rounded-full bg-green-500" />
        <span className="text-[10px] text-green-500/60 ml-2 font-mono">aethis-terminal — 执行官接入点</span>
      </div>

      <div
        className="p-6 font-mono min-h-[320px] cursor-pointer"
        onClick={() => { if (!typingDone && step === 'terminal') { setTypedLines(TERMINAL_LINES); setCurrentLineChars(0); setTypingDone(true); } }}
      >
        {step === 'terminal' && (
          <div className="space-y-1">
            {displayLines.map((line, i) => (
              <p key={i} className="text-sm text-green-400/80 min-h-[1.25rem]">
                {line || ' '}
                {i === displayLines.length - 1 && !typingDone && (
                  <span className="inline-block w-2 h-4 bg-green-400 animate-pulse ml-0.5 align-middle" />
                )}
              </p>
            ))}
            {typingDone && (
              <div className="pt-4 flex justify-end">
                <Button variant="ghost" size="sm" onClick={handleTerminalNext}>
                  &gt; 输入代号
                </Button>
              </div>
            )}
          </div>
        )}

        {step === 'name' && (
          <div className="space-y-4">
            <p className="text-green-400 text-sm">&gt; 身份未确认。请输入您的执行官代号：</p>
            <div className="flex items-center gap-2">
              <span className="text-green-400">{'>'}</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="输入代号..."
                maxLength={16}
                className="flex-1 bg-transparent border-none outline-none text-green-400 text-lg font-mono placeholder:text-green-400/30"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && name.trim() && setStep('class')}
              />
              <span className="inline-block w-2 h-5 bg-green-400 animate-pulse" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setStep('terminal')}>&gt; 返回</Button>
              <Button variant="ghost" size="sm" disabled={!name.trim()} onClick={() => { sound.complete(); setStep('class'); }}>
                &gt; 确认代号
              </Button>
            </div>
          </div>
        )}

        {step === 'class' && (
          <div className="space-y-4">
            <p className="text-green-400/60 text-xs">&gt; 代号已确认：{name}</p>
            <p className="text-green-400 text-sm">&gt; 请选择您的执行专精方向：</p>
            <div className="grid grid-cols-2 gap-2">
              {classes.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => { sound.complete(); setSelectedClass(cls.id); }}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    selectedClass === cls.id
                      ? 'border-green-400 bg-green-400/10'
                      : 'border-green-400/20 bg-[#0d1110] hover:border-green-400/40'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{cls.icon}</span>
                    <span className="font-bold text-xs text-green-400">{cls.name}</span>
                  </div>
                  <p className="text-[10px] text-green-400/50">{cls.desc}</p>
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setStep('name')}>&gt; 返回</Button>
              <Button variant="ghost" size="sm" disabled={!selectedClass} onClick={handleClassNext}>
                &gt; 初始化 OpenClaw 协议
              </Button>
            </div>
          </div>
        )}

        {step === 'done' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-10 space-y-3">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-5xl">⚡</motion.div>
            <p className="text-green-400 text-lg font-mono">&gt; OpenClaw 协议已激活</p>
            <p className="text-green-400/60 text-sm font-mono">&gt; 伴灵 C.L.A.W. 正在初始化...</p>
            <p className="text-green-400/40 text-xs font-mono">&gt; 欢迎回来，执行官 {name}。</p>
            <p className="text-green-400/30 text-[10px] font-mono mt-4">火种已经点燃。公会大厅等待您的指令。</p>
            <Button variant="ghost" size="sm" onClick={handleDone} className="mt-4">&gt; 进入公会大厅</Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
