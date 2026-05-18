'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCharacterStore } from '@/stores/characterStore';
import { useUIStore } from '@/stores/uiStore';
import { CLASS_STATS } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { sound } from '@/lib/soundManager';

const TERMINAL_LINES = [
  { text: '> 系统自检中...', delay: 600 },
  { text: '> 认知网络状态：离线', delay: 800 },
  { text: '> 动力源：枯竭', delay: 600 },
  { text: '> 熵化程度：97.3%', delay: 700 },
  { text: '> 公会大厅连接：已断开', delay: 1000 },
  { text: '', delay: 400 },
  { text: '> 正在搜索可用模块...', delay: 800 },
  { text: '> 找到：Project OpenClaw（休眠）', delay: 900 },
  { text: '> 等待最小可行性指令 (MVP)...', delay: 1200 },
  { text: '', delay: 600 },
  { text: '> 检测到微弱生物信号。', delay: 1000 },
  { text: '> 身份未知。请确认您的代号。', delay: 1000 },
];

const classes = [
  { id: 'warrior', name: '突击型执行官', icon: '⚔️', desc: '力量专精。擅长正面击破高优先级委托。', stats: CLASS_STATS.warrior },
  { id: 'mage', name: '解析型执行官', icon: '🧙', desc: '智力专精。快速从委托中提取经验值。', stats: CLASS_STATS.mage },
  { id: 'rogue', name: '潜袭型执行官', icon: '🗡️', desc: '敏捷专精。用速度规避熵化的侵蚀。', stats: CLASS_STATS.rogue },
  { id: 'guardian', name: '守护型执行官', icon: '🛡️', desc: '体力专精。构筑坚不可摧的意志力护盾。', stats: CLASS_STATS.guardian },
];

export function PrologueModal() {
  const [stage, setStage] = useState<'terminal' | 'name' | 'class' | 'done'>('terminal');
  const [visibleLines, setVisibleLines] = useState(0);
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const initCharacter = useCharacterStore((s) => s.initCharacter);
  const closeModal = useUIStore((s) => s.closeModal);
  const terminalRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (stage !== 'terminal') return;
    if (visibleLines < TERMINAL_LINES.length) {
      const timer = setTimeout(() => {
        setVisibleLines((v) => v + 1);
        sound.complete();
      }, TERMINAL_LINES[visibleLines]?.delay || 500);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setStage('name'), 1500);
      return () => clearTimeout(timer);
    }
  }, [stage, visibleLines]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [visibleLines]);

  const handleCreate = () => {
    if (!name.trim() || !selectedClass) return;
    const cls = classes.find((c) => c.id === selectedClass);
    if (!cls) return;
    initCharacter(name.trim(), cls.stats);
    setStage('done');
    setTimeout(() => {
      if (mountedRef.current) {
        closeModal();
      }
    }, 2500);
  };

  return (
    <div className="bg-[#0a0c0f] border border-[#1a3a2a] rounded-xl overflow-hidden">
      {/* Terminal header */}
      <div className="bg-[#0d1110] border-b border-[#1a3a2a] px-4 py-2 flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-red-500" />
        <span className="w-3 h-3 rounded-full bg-yellow-500" />
        <span className="w-3 h-3 rounded-full bg-green-500" />
        <span className="text-[10px] text-green-500/60 ml-2 font-mono">aethis-terminal — 执行官接入点</span>
      </div>

      <div className="p-6 font-mono min-h-[350px]">
        {stage === 'terminal' && (
          <div ref={terminalRef} className="space-y-0.5 max-h-[300px] overflow-y-auto">
            {TERMINAL_LINES.slice(0, visibleLines).map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm text-green-400/80"
              >
                {line.text || ' '}
              </motion.p>
            ))}
            {visibleLines < TERMINAL_LINES.length && (
              <span className="inline-block w-2 h-4 bg-green-400 animate-pulse" />
            )}
          </div>
        )}

        {stage === 'name' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <p className="text-green-400 text-sm">
              &gt; 身份未确认。请输入您的执行官代号：
            </p>
            <div className="flex items-center gap-2">
              <span className="text-green-400">{'>'}</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="输入代号..."
                maxLength={16}
                className="flex-1 bg-transparent border-none outline-none text-green-400 text-lg font-mono placeholder:text-green-400/30"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && name.trim()) {
                    sound.complete();
                    setStage('class');
                  }
                }}
              />
              <span className="inline-block w-2 h-5 bg-green-400 animate-pulse" />
            </div>
            {name.trim() && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => { sound.complete(); setStage('class'); }}
                className="text-xs text-green-400/60 hover:text-green-400 cursor-pointer"
              >
                &gt; 按 Enter 确认代号
              </motion.button>
            )}
          </motion.div>
        )}

        {stage === 'class' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div>
              <p className="text-green-400 text-sm mb-1">
                &gt; 代号已确认：{name}
              </p>
              <p className="text-green-400/60 text-xs mb-3">
                &gt; 请选择您的执行专精方向：
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {classes.map((cls) => (
                <motion.button
                  key={cls.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedClass(cls.id)}
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
                </motion.button>
              ))}
            </div>
            <Button
              variant="gold"
              size="lg"
              className="w-full"
              disabled={!selectedClass}
              onClick={handleCreate}
            >
              &gt; 初始化 OpenClaw 协议
            </Button>
          </motion.div>
        )}

        {stage === 'done' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-10 space-y-3"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-5xl"
            >
              ⚡
            </motion.div>
            <p className="text-green-400 text-lg font-mono">
              &gt; OpenClaw 协议已激活
            </p>
            <p className="text-green-400/60 text-sm font-mono">
              &gt; 伴灵 C.L.A.W. 正在初始化...
            </p>
            <p className="text-green-400/40 text-xs font-mono">
              &gt; 欢迎回来，执行官 {name}。
            </p>
            <p className="text-green-400/30 text-[10px] font-mono mt-4">
              火种已经点燃。公会大厅等待您的指令。
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
