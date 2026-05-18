// Web Audio API sound synthesizer - no external files needed
let audioCtx: AudioContext | null = null;

function ctx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
  try {
    const c = ctx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime);
    gain.gain.setValueAtTime(volume, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + duration);
  } catch {}
}

export const sound = {
  complete: () => {
    playTone(523, 0.1, 'sine', 0.12);
    setTimeout(() => playTone(659, 0.1, 'sine', 0.12), 80);
    setTimeout(() => playTone(784, 0.15, 'sine', 0.15), 160);
  },
  legendary: () => {
    [523, 659, 784, 1047].forEach((f, i) =>
      setTimeout(() => playTone(f, 0.2, 'triangle', 0.15), i * 100)
    );
  },
  levelUp: () => {
    [392, 523, 659, 784, 1047].forEach((f, i) =>
      setTimeout(() => playTone(f, 0.18, 'sine', 0.12), i * 80)
    );
  },
  damage: () => {
    playTone(80, 0.3, 'sawtooth', 0.1);
    playTone(60, 0.4, 'square', 0.05);
  },
  bossSpawn: () => {
    [200, 150, 100, 80].forEach((f, i) =>
      setTimeout(() => playTone(f, 0.3, 'sawtooth', 0.12), i * 150)
    );
  },
  bossDefeat: () => {
    [200, 300, 400, 600, 800].forEach((f, i) =>
      setTimeout(() => playTone(f, 0.25, 'triangle', 0.12), i * 100)
    );
  },
  dodge: () => {
    playTone(600, 0.08, 'sine', 0.08);
    setTimeout(() => playTone(800, 0.06, 'sine', 0.06), 50);
  },
  crit: () => {
    playTone(800, 0.06, 'square', 0.1);
    setTimeout(() => playTone(1200, 0.08, 'square', 0.12), 40);
    setTimeout(() => playTone(1600, 0.1, 'square', 0.1), 80);
  },
  purchase: () => {
    playTone(880, 0.08, 'sine', 0.1);
    setTimeout(() => playTone(1100, 0.1, 'sine', 0.1), 60);
  },
  undo: () => {
    playTone(300, 0.15, 'triangle', 0.08);
    playTone(200, 0.2, 'triangle', 0.06);
  },
  defend: () => {
    playTone(200, 0.2, 'triangle', 0.08);
  },
  streak: () => {
    [440, 554, 659].forEach((f, i) =>
      setTimeout(() => playTone(f, 0.12, 'sine', 0.1), i * 70)
    );
  },
};
