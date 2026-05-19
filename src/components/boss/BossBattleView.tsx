'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useCharacterStore } from '@/stores/characterStore';
import { useInventoryStore } from '@/stores/inventoryStore';
import { useTaskStore } from '@/stores/taskStore';
import { useUIStore } from '@/stores/uiStore';
import { BOSSES } from '@/data/bosses';
import { calculateSubtaskDamage, calculateBossXP, calculateBossGold } from '@/lib/constants';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { particleEmitters } from '@/components/effects/ParticleCanvas';
import { emitFloatingText } from '@/components/effects/FloatingText';
import { sound } from '@/lib/soundManager';
import { petMood } from '@/components/character/PetCompanion';

const BASE_COOLDOWN = 8;
const BOSS_ATTACK_INTERVAL = 7;
const TELL_DURATION = 1.5;

function calculateBossDamage(playerLevel: number, bossHPPercent: number, bossTheme: string): number {
  let base = 15 + playerLevel * 3;
  if (bossHPPercent < 30) base = Math.round(base * 1.5);
  if (bossTheme === 'fire') base = Math.round(base * 1.2);
  return base;
}

export function BossBattleView() {
  const bossBattle = useGameStore((s) => s.bossBattle);
  const damageBoss = useGameStore((s) => s.damageBoss);
  const defeatBoss = useGameStore((s) => s.defeatBoss);
  const clearBoss = useGameStore((s) => s.clearBoss);
  const getActiveGemEffects = useGameStore((s) => s.getActiveGemEffects);
  const recordGoldEarned = useGameStore((s) => s.recordGoldEarned);
  const checkStoryChapter = useGameStore((s) => s.checkStoryChapter);
  const checkAchievements = useGameStore((s) => s.checkAchievements);
  const character = useCharacterStore((s) => s.character);
  const gainXP = useCharacterStore((s) => s.gainXP);
  const gainGold = useCharacterStore((s) => s.gainGold);
  const loseGold = useCharacterStore((s) => s.loseGold);
  const addToast = useUIStore((s) => s.addToast);
  const openModal = useUIStore((s) => s.openModal);
  const setView = useUIStore((s) => s.setView);
  const focusMode = useGameStore((s) => s.focusMode);
  const focusBoostUnlocked = useGameStore((s) => s.focusBoostUnlocked);
  const openTaskCount = useTaskStore((s) => s.tasks.filter((task) => task.status !== 'done').length);

  const [playerCooldown, setPlayerCooldown] = useState(0);
  const [bossTimer, setBossTimer] = useState(BOSS_ATTACK_INTERVAL);
  const [bossTellActive, setBossTellActive] = useState(false);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [isDefending, setIsDefending] = useState(false);
  const [defendCooldown, setDefendCooldown] = useState(0);
  const [phantomBarrier, setPhantomBarrier] = useState(0);
  const [fatigueStacks, setFatigueStacks] = useState(0);
  const [distracted, setDistracted] = useState(false);
  const [deadlineRush, setDeadlineRush] = useState(false);
  const totalDamageRef = useRef(0);
  const attackLockedRef = useRef(false);
  const bossTimerRef = useRef(BOSS_ATTACK_INTERVAL);
  const bossTellActiveRef = useRef(false);
  const isDefendingRef = useRef(false);

  const bossDef = bossBattle ? BOSSES.find((b) => b.id === bossBattle.bossId) : null;
  const gemEffects = getActiveGemEffects();
  const bossId = bossDef?.id;

  const intel = character.stats.intelligence;
  const agi = character.stats.agility;
  const burnoutPenalty = bossId === 'burnout-behemoth' ? fatigueStacks * 0.8 : 0;
  const dragonTempoBonus = bossId === 'procrastination-dragon' && deadlineRush ? 1 : 0;
  const effectiveCooldown = Math.max(2.5, BASE_COOLDOWN - intel * 0.5 - gemEffects.cooldownReduction + burnoutPenalty - dragonTempoBonus);
  const dodgeChance = Math.min(0.4, agi * 0.05);
  const critChance = Math.min(0.6, intel * 0.04 + gemEffects.bossCrit / 100);

  useEffect(() => {
    setPhantomBarrier(bossId === 'perfectionist-phantom' ? 2 : 0);
    setFatigueStacks(0);
    setDistracted(false);
    setDeadlineRush(bossId === 'procrastination-dragon');
    totalDamageRef.current = 0;
  }, [bossId, bossBattle?.id]);

  useEffect(() => {
    isDefendingRef.current = isDefending;
  }, [isDefending]);

  useEffect(() => {
    bossTellActiveRef.current = bossTellActive;
  }, [bossTellActive]);

  // Player cooldown
  useEffect(() => {
    if (playerCooldown <= 0) return;
    const i = setInterval(() => setPlayerCooldown((p) => Math.max(0, p - 0.1)), 100);
    return () => clearInterval(i);
  }, [playerCooldown > 0]);

  // Defend cooldown
  useEffect(() => {
    if (defendCooldown <= 0) return;
    const i = setInterval(() => setDefendCooldown((p) => Math.max(0, p - 0.1)), 100);
    return () => clearInterval(i);
  }, [defendCooldown > 0]);

  // Boss timer + tells
  useEffect(() => {
    const resetBossTimer = () => {
      bossTimerRef.current = BOSS_ATTACK_INTERVAL;
      setBossTimer(BOSS_ATTACK_INTERVAL);
      bossTellActiveRef.current = false;
      setBossTellActive(false);
    };

    const fireBossAttack = () => {
      if (attackLockedRef.current) return;
      attackLockedRef.current = true;

      const bb = useGameStore.getState().bossBattle;
      if (!bb || bb.status !== 'active') {
        attackLockedRef.current = false;
        resetBossTimer();
        return;
      }

      const bossDef2 = BOSSES.find((b) => b.id === bb.bossId);
      const hpPct = (bb.currentHP / bb.maxHP) * 100;
      const char = useCharacterStore.getState().character;
      const currentDodgeChance = Math.min(0.4, char.stats.agility * 0.05);
      let rawDamage = calculateBossDamage(char.level, hpPct, bossDef2?.theme || 'fire');
      const currentGemEffects = useGameStore.getState().getActiveGemEffects();
      if (currentGemEffects.damageReduce > 0) {
        rawDamage = Math.round(rawDamage * (1 - Math.min(currentGemEffects.damageReduce, 75) / 100));
      }
      if (bossDef2?.id === 'overwhelm-ogre') {
        const openTasks = useTaskStore.getState().tasks.filter((task) => task.status !== 'done').length;
        rawDamage += Math.min(openTasks * 4, 40);
      }
      const nextLogEntries: string[] = [];

      if (isDefendingRef.current) {
        rawDamage = Math.round(rawDamage * 0.5);
        isDefendingRef.current = false;
        setIsDefending(false);
        nextLogEntries.push('🛡️ 防御成功！伤害减半');
      }

      if (Math.random() < currentDodgeChance) {
        sound.dodge();
        nextLogEntries.unshift(`💨 你闪避了 ${bossDef2?.name} 的攻击！（敏捷 ${(currentDodgeChance * 100).toFixed(0)}%）`);
        setCombatLog((prev) => [...nextLogEntries, ...prev.slice(0, 5 - nextLogEntries.length)]);
        emitFloatingText('闪避！', window.innerWidth / 2, window.innerHeight * 0.3, '#4ade80');
        useUIStore.getState().addToast({ type: 'info', message: '💨 闪避了Boss攻击！' });
        attackLockedRef.current = false;
        resetBossTimer();
        return;
      }

      sound.damage();
      petMood('sad');
      useCharacterStore.getState().takeDamage(rawDamage);
      useUIStore.getState().triggerShake();
      nextLogEntries.unshift(`💥 ${bossDef2?.name} 对你造成 ${rawDamage} 点伤害！`);
      setCombatLog((prev) => [...nextLogEntries, ...prev.slice(0, 5 - nextLogEntries.length)]);

      emitFloatingText(`-${rawDamage} HP`, window.innerWidth / 2, window.innerHeight * 0.3, '#ff4444');

      particleEmitters.emit(window.innerWidth / 2, window.innerHeight * 0.3, {
        count: 15, spread: 60, speed: 3,
        colors: ['#ff4444', '#8b0000'], size: 5, life: 1.5, gravity: 30,
      });

      useUIStore.getState().addToast({ type: 'damage', message: `${bossDef2?.name} 攻击造成 ${rawDamage} 伤害！` });

      if (bossDef2?.id === 'burnout-behemoth') {
        setFatigueStacks((prev) => Math.min(prev + 1, 4));
        nextLogEntries.unshift('❄️ 倦怠加深：攻击冷却变慢，可用深呼吸清除');
      }
      if (bossDef2?.id === 'distraction-demon') {
        setDistracted(true);
        nextLogEntries.unshift('👁️ 分心侵扰：需要先重整专注才能攻击');
      }
      if (bossDef2?.id === 'procrastination-dragon') {
        setDeadlineRush(true);
        nextLogEntries.unshift('🔥 截止日烈焰逼近：抢先启动可获得节奏优势');
      }

      const updatedChar = useCharacterStore.getState().character;
      if (updatedChar.currentHP <= 0) {
        useCharacterStore.getState().resetAfterDeath();
        useUIStore.getState().openModal('death');
        useGameStore.getState().resetStreak();
      }

      const gs = useGameStore.getState();
      if (gs.bossBattle && gs.bossBattle.activeAbilities.length < 2 && Math.random() < 0.25) {
        const abilities = bossDef2?.abilities || [];
        if (abilities.length > 0) {
          const ability = abilities[Math.floor(Math.random() * abilities.length)];
          useGameStore.getState().applyBossAbility(ability.id);
          setCombatLog((prev) => [`⚡ ${bossDef2?.name} 释放了「${ability.name}」！`, ...prev.slice(0, 4)]);
          useUIStore.getState().addToast({ type: 'damage', message: `⚡ Boss技能: ${ability.name}` });
        }
      }

      attackLockedRef.current = false;
      resetBossTimer();
    };

    const i = setInterval(() => {
      if (useUIStore.getState().activeModal === 'death') return;

      const bb = useGameStore.getState().bossBattle;
      if (!bb || bb.status !== 'active') return;

      const next = +(bossTimerRef.current - 0.1).toFixed(1);
      bossTimerRef.current = next;

      if (!bossTellActiveRef.current && next <= TELL_DURATION && next > 0) {
        bossTellActiveRef.current = true;
        setBossTellActive(true);
      }

      if (next > 0) {
        setBossTimer(next);
        return;
      }

      fireBossAttack();
    }, 100);
    return () => clearInterval(i);
  }, []);

  if (!bossBattle || !bossDef) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">⚔️</div>
        <h2 className="medieval text-2xl text-[var(--color-accent)] mb-2">没有活跃的Boss</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">完成更多任务来遭遇Boss。每完成10个任务就会出现一个Boss。</p>
      </div>
    );
  }

  if (!bossBattle || !bossBattle.maxHP) return null;

  if (bossBattle.status === 'defeated') {
    return <VictoryScreen totalDamage={totalDamageRef.current} />;
  }

  const bossPct = (bossBattle.currentHP / bossBattle.maxHP) * 100;
  const isEnraged = bossPct < 30;
  const canAttack = playerCooldown <= 0 && !distracted;
  const canDefend = defendCooldown <= 0 && !isDefending;
  const baseDmg = Math.round(
    Math.max(15, calculateSubtaskDamage(character.stats.strength) -
      (bossId === 'burnout-behemoth' ? fatigueStacks * 5 : 0)) *
    (focusMode && focusBoostUnlocked ? 3 : 1)
  );

  const handleAttack = () => {
    if (!canAttack) return;

    const isCrit = Math.random() < critChance;
    let damage = isCrit ? baseDmg * 2 : baseDmg;
    let extraLog = '';
    if (bossId === 'perfectionist-phantom' && phantomBarrier > 0) {
      damage = Math.max(10, Math.round(damage * 0.35));
      extraLog = ' 完美主义护盾吸收了大部分伤害。';
    }
    totalDamageRef.current += damage;
    damageBoss(damage);
    setPlayerCooldown(effectiveCooldown);
    if (isCrit) sound.crit(); else sound.complete();

    const critText = isCrit ? ' 💥暴击！' : '';
    setCombatLog((prev) => [`⚔️ 你对 ${bossDef.name} 造成 ${damage} 点伤害！${critText}${extraLog}`, ...prev.slice(0, 4)]);

    particleEmitters.emit(window.innerWidth / 2, window.innerHeight * 0.7, {
      count: isCrit ? 40 : 20, spread: 60, speed: isCrit ? 7 : 5,
      colors: isCrit ? ['#ffd700', '#ff6600', '#fff'] : ['#ff4444', '#ff6600', '#fff'],
      size: isCrit ? 6 : 4, life: 1, gravity: 50,
    });

    emitFloatingText(
      `${isCrit ? '暴击! ' : ''}-${damage} HP`,
      window.innerWidth / 2,
      window.innerHeight * 0.6,
      isCrit ? '#ffd700' : '#ff4444'
    );

    // Boss defeated
      const updated = useGameStore.getState().bossBattle;
      if (updated && updated.status === 'defeated') {
        sound.bossDefeat();
        petMood('excited');
        const latestGemEffects = useGameStore.getState().getActiveGemEffects();
        const xp = Math.round(calculateBossXP(character.level, character.stats.intelligence) * (1 + latestGemEffects.xpBoost / 100));
        const gold = Math.round(calculateBossGold(character.level, character.stats.strength) * (1 + latestGemEffects.goldBoost / 100));
        gainXP(xp);
        gainGold(gold);
        recordGoldEarned(gold);
        defeatBoss({ playerLevel: character.level, xpEarned: xp, goldEarned: gold, damageDealt: totalDamageRef.current });
        addToast({ type: 'xp', message: `+${xp} 经验（Boss击败！）` });
        addToast({ type: 'gold', message: `+${gold} 金币（Boss战利品！）` });
        const chapter = checkStoryChapter(character.level, bossDef.id);
        if (chapter) openModal('storyChapter', { chapter });
        const updatedChar = useCharacterStore.getState().character;
        const totalEarned = useGameStore.getState().totalGoldEarned;
        const newAchievements = checkAchievements(updatedChar.level, totalEarned);
        for (const achievement of newAchievements) {
          addToast({ type: 'achievement', message: `🏆 ${achievement.name}` });
          if (achievement.rewardGold > 0) {
            gainGold(achievement.rewardGold);
            addToast({ type: 'gold', message: `成就奖励 +${achievement.rewardGold} 金币`, amount: achievement.rewardGold });
          }
          if (achievement.rewardItemId) {
            const itemAdded = useInventoryStore.getState().purchaseItem(achievement.rewardItemId);
            if (itemAdded) addToast({ type: 'achievement', message: `🎁 获得奖励物品：${achievement.rewardItemId}` });
          }
        }
        particleEmitters.emit(window.innerWidth / 2, window.innerHeight / 2, {
        count: 150, spread: 360, speed: 8,
        colors: ['#c9a44b', '#f0c860', '#ffd700', '#fff', '#ff6600'],
        size: 6, life: 4, gravity: 20,
      });
    }
  };

  const handleDefend = () => {
    if (!canDefend) return;
    sound.defend();
    setIsDefending(true);
    setDefendCooldown(12);
    setCombatLog((prev) => ['🛡️ 进入防御姿态，下次Boss攻击伤害减半', ...prev.slice(0, 4)]);
    addToast({ type: 'info', message: '🛡️ 防御姿态已激活' });
  };

  const handleSpecialAction = () => {
    if (bossId === 'perfectionist-phantom' && phantomBarrier > 0) {
      setPhantomBarrier((prev) => Math.max(0, prev - 1));
      setPlayerCooldown(1.5);
      sound.complete();
      setCombatLog((prev) => ['📝 提交了不完美草稿，完美主义护盾削弱一层', ...prev.slice(0, 4)]);
      addToast({ type: 'info', message: '📝 完成比完美更重要。' });
      return;
    }

    if (bossId === 'burnout-behemoth' && fatigueStacks > 0) {
      setFatigueStacks(0);
      setPlayerCooldown(2);
      sound.defend();
      setCombatLog((prev) => ['🌿 深呼吸完成，倦怠层数清空', ...prev.slice(0, 4)]);
      addToast({ type: 'info', message: '🌿 节奏恢复了。' });
      return;
    }

    if (bossId === 'distraction-demon' && distracted) {
      setDistracted(false);
      setPlayerCooldown(1);
      sound.defend();
      setCombatLog((prev) => ['🎯 重整专注，下一次攻击已准备就绪', ...prev.slice(0, 4)]);
      addToast({ type: 'info', message: '🎯 专注已恢复。' });
      return;
    }

    if (bossId === 'procrastination-dragon' && deadlineRush) {
      setDeadlineRush(false);
      bossTimerRef.current = Math.min(bossTimerRef.current + 2, BOSS_ATTACK_INTERVAL);
      setBossTimer(bossTimerRef.current);
      const interruptDamage = Math.min(35, Math.max(0, bossBattle.currentHP - 1));
      damageBoss(interruptDamage);
      totalDamageRef.current += interruptDamage;
      sound.complete();
      setCombatLog((prev) => [`⏱️ 抢先启动，拖延魔龙被打断并受到 ${interruptDamage} 点伤害`, ...prev.slice(0, 4)]);
      addToast({ type: 'info', message: '⏱️ 抢回了行动节奏。' });
    }
  };

  const handleFlee = () => {
    const penalty = Math.floor(character.gold * 0.3);
    loseGold(penalty);
    clearBoss();
    setView('tasks');
    addToast({ type: 'damage', message: `你逃跑了！失去 ${penalty} 金币。` });
  };

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="medieval text-2xl text-[var(--color-accent)] mb-1">⚔️ Boss战</h2>
        <p className="text-xs text-[var(--color-text-muted)]">
          {isEnraged ? '⚠️ Boss进入狂暴状态！伤害+50%' :
           `冷却: ${effectiveCooldown.toFixed(1)}s | 闪避率: ${(dodgeChance * 100).toFixed(0)}% | 暴击率: ${(critChance * 100).toFixed(0)}%`}
        </p>
      </div>

      {/* Boss Display */}
      <motion.div
        className={`bg-[var(--color-bg-secondary)] border-2 rounded-xl p-6 text-center ${
          isEnraged ? 'border-[var(--color-danger)]' : 'border-[var(--color-danger)]'
        }`}
        animate={isEnraged ? { borderColor: ['#c0392b', '#ff0000', '#c0392b'] } : {}}
        transition={{ duration: 0.5, repeat: Infinity }}
      >
        <motion.div
          className="text-7xl mb-3"
          animate={isEnraged ? { scale: [1, 1.08, 1], rotate: [0, -3, 3, 0] } : { scale: [1, 1.03, 1] }}
          transition={{ duration: isEnraged ? 0.8 : 2, repeat: Infinity }}
        >
          {bossDef.theme === 'fire' ? '🐉' :
           bossDef.theme === 'shadow' ? '👹' :
           bossDef.theme === 'ice' ? '❄️' :
           bossDef.theme === 'void' ? '👻' :
           bossDef.theme === 'earth' ? '🪨' : '👾'}
        </motion.div>

        <h3 className="medieval text-xl text-[var(--color-text-primary)] mb-1">{bossDef.name}</h3>
        <p className="text-xs text-[var(--color-text-muted)] italic mb-4">{bossDef.title}</p>

        <ProgressBar
          current={bossBattle.currentHP} max={bossBattle.maxHP}
          color={isEnraged ? '#ff0000' : 'var(--color-hp-bar)'}
          bgColor="var(--color-hp-bar-bg)" height="h-5" showLabel
          label={`Boss 生命 ${isEnraged ? '🔥狂暴🔥' : ''}`}
        />

        {/* Boss tell or timer */}
        <div className="mt-3">
          {bossTellActive ? (
            <span className="text-xs text-[var(--color-danger-glow)] animate-pulse font-bold">
              ⚠️ {bossDef.name} 即将攻击！({bossTimer.toFixed(1)}s)
            </span>
          ) : (
            <span className="text-xs text-[var(--color-text-muted)]">
              Boss下次攻击: {bossTimer.toFixed(1)}s
            </span>
          )}
        </div>
      </motion.div>

      {/* Active abilities */}
      {bossBattle.activeAbilities.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">活跃的Boss技能</h4>
          {bossBattle.activeAbilities.map((ability) => (
            <div key={ability.id} className="bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30 rounded-lg p-2">
              <span className="text-xs font-medium text-[var(--color-danger-glow)]">{ability.name}</span>
              <p className="text-[10px] text-[var(--color-text-muted)]">{ability.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Combat Log */}
      {combatLog.length > 0 && (
        <div className="bg-[var(--color-bg-tertiary)] rounded-lg p-3 max-h-40 overflow-y-auto space-y-1">
          {combatLog.map((msg, i) => (
            <p key={i} className="text-xs text-[var(--color-text-secondary)]">{msg}</p>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        <div className="flex gap-2 justify-center flex-wrap">
          <Button variant="danger" size="lg" onClick={handleAttack} disabled={!canAttack}>
            {distracted ? '👁️ 分心中' : canAttack ? `⚔️ 攻击（${baseDmg} 伤害）` : `⏳ ${playerCooldown.toFixed(1)}s`}
          </Button>
          {bossId === 'perfectionist-phantom' && phantomBarrier > 0 && (
            <Button variant="secondary" size="md" onClick={handleSpecialAction}>
              📝 提交草稿（{phantomBarrier}）
            </Button>
          )}
          {bossId === 'burnout-behemoth' && fatigueStacks > 0 && (
            <Button variant="secondary" size="md" onClick={handleSpecialAction}>
              🌿 深呼吸（{fatigueStacks}）
            </Button>
          )}
          {bossId === 'distraction-demon' && distracted && (
            <Button variant="secondary" size="md" onClick={handleSpecialAction}>
              🎯 重整专注
            </Button>
          )}
          {bossId === 'procrastination-dragon' && deadlineRush && (
            <Button variant="secondary" size="md" onClick={handleSpecialAction}>
              ⏱️ 抢先启动
            </Button>
          )}
          <Button variant="secondary" size="md" onClick={handleDefend} disabled={!canDefend}>
            {canDefend ? '🛡️ 防御' : `🛡️ ${defendCooldown.toFixed(0)}s`}
          </Button>
          <Button variant="ghost" size="md" onClick={handleFlee}>
            🏃 逃跑（-30%金币）
          </Button>
        </div>

        {/* Cooldown bar */}
        {playerCooldown > 0 && (
          <ProgressBar current={effectiveCooldown - playerCooldown} max={effectiveCooldown}
            color="var(--color-info)" bgColor="var(--color-bg-primary)" height="h-1.5" />
        )}
      </div>

      {/* Player stats + HP */}
      <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--color-text-muted)]">你的生命</span>
          <span className="text-xs text-[var(--color-text-primary)] font-bold">
            {character.currentHP} / {character.maxHP}
          </span>
        </div>
        <ProgressBar current={character.currentHP} max={character.maxHP}
          color={character.currentHP / character.maxHP < 0.3 ? '#ff0000' : 'var(--color-hp-bar)'}
          bgColor="var(--color-hp-bar-bg)" height="h-3" />

        <div className="flex gap-3 text-[10px] text-[var(--color-text-muted)]">
          <span>💪 力量: {character.stats.strength}（攻击力+{character.stats.strength * 5}）</span>
          <span>🧠 智力: {intel}（冷却-{(intel * 0.5).toFixed(1)}s | 暴击+{(critChance * 100).toFixed(0)}%）</span>
          <span>💨 敏捷: {agi}（闪避+{(dodgeChance * 100).toFixed(0)}%）</span>
          <span>❤️ 体力: {character.stats.vitality}（生命+{character.stats.vitality * 20}）</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {bossId === 'perfectionist-phantom' && phantomBarrier > 0 && (
            <Badge variant="danger" size="sm">无瑕护盾 {phantomBarrier}</Badge>
          )}
          {bossId === 'burnout-behemoth' && fatigueStacks > 0 && (
            <Badge variant="danger" size="sm">倦怠 {fatigueStacks}</Badge>
          )}
          {bossId === 'distraction-demon' && distracted && (
            <Badge variant="danger" size="sm">分心侵扰</Badge>
          )}
          {bossId === 'procrastination-dragon' && deadlineRush && (
            <Badge variant="danger" size="sm">截止日烈焰</Badge>
          )}
          {bossId === 'overwhelm-ogre' && openTaskCount > 0 && (
            <Badge variant="danger" size="sm">积压压力 +{Math.min(openTaskCount * 4, 40)}伤害</Badge>
          )}
        </div>

        {/* Defend indicator */}
        {isDefending && (
          <Badge variant="accent" size="sm">🛡️ 防御中 — 下次Boss攻击伤害减半</Badge>
        )}
      </div>
    </div>
  );
}

function VictoryScreen({ totalDamage }: { totalDamage: number }) {
  const clearBoss = useGameStore((s) => s.clearBoss);
  const setView = useUIStore((s) => s.setView);
  const bossBattle = useGameStore((s) => s.bossBattle);
  const bossDef = bossBattle ? BOSSES.find((b) => b.id === bossBattle.bossId) : null;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', damping: 10 }} className="text-center space-y-6 py-10">
      <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 8, stiffness: 200 }} className="text-8xl">👑</motion.div>
      <div>
        <h2 className="medieval text-3xl text-[var(--color-accent)] mb-2">胜利！</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">{bossDef?.name ?? 'Boss'} 已被击败！</p>
      </div>
      <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-accent)]/30 rounded-xl p-4 inline-block">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-[10px] text-[var(--color-text-muted)]">造成总伤害</div>
            <div className="text-lg font-bold text-[var(--color-danger)]">{totalDamage}</div>
          </div>
          <div>
            <div className="text-[10px] text-[var(--color-text-muted)]">获得奖励</div>
            <div className="text-lg font-bold text-[var(--color-accent)]">大量XP & 金币</div>
          </div>
        </div>
      </div>
      <Button variant="gold" size="lg" onClick={() => { clearBoss(); setView('tasks'); }}>
        继续冒险
      </Button>
    </motion.div>
  );
}
