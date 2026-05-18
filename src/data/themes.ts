export interface ThemeColors {
  '--color-bg-primary': string;
  '--color-bg-secondary': string;
  '--color-bg-tertiary': string;
  '--color-bg-hover': string;
  '--color-text-primary': string;
  '--color-text-secondary': string;
  '--color-accent': string;
  '--color-accent-glow': string;
  '--color-border': string;
  '--color-border-light': string;
}

export const THEMES: Record<string, ThemeColors> = {
  default: {
    '--color-bg-primary': '#0d0f12',
    '--color-bg-secondary': '#161a22',
    '--color-bg-tertiary': '#1e2330',
    '--color-bg-hover': '#252b3a',
    '--color-text-primary': '#e8e0d3',
    '--color-text-secondary': '#9ca3af',
    '--color-accent': '#c9a44b',
    '--color-accent-glow': '#f0c860',
    '--color-border': '#2a3040',
    '--color-border-light': '#3a4050',
  },
  crimson: {
    '--color-bg-primary': '#120a0a',
    '--color-bg-secondary': '#1c1010',
    '--color-bg-tertiary': '#261515',
    '--color-bg-hover': '#301a1a',
    '--color-text-primary': '#e8d3d3',
    '--color-text-secondary': '#b09a9a',
    '--color-accent': '#c94b4b',
    '--color-accent-glow': '#f06060',
    '--color-border': '#402a2a',
    '--color-border-light': '#503535',
  },
  frost: {
    '--color-bg-primary': '#0a1018',
    '--color-bg-secondary': '#101820',
    '--color-bg-tertiary': '#15202c',
    '--color-bg-hover': '#1a2838',
    '--color-text-primary': '#d3e0e8',
    '--color-text-secondary': '#9ab0c0',
    '--color-accent': '#4b90c9',
    '--color-accent-glow': '#60b0f0',
    '--color-border': '#2a3848',
    '--color-border-light': '#354558',
  },
  emerald: {
    '--color-bg-primary': '#0a120d',
    '--color-bg-secondary': '#101c14',
    '--color-bg-tertiary': '#15261b',
    '--color-bg-hover': '#1a3022',
    '--color-text-primary': '#d3e8d8',
    '--color-text-secondary': '#9ac0a0',
    '--color-accent': '#4bc96b',
    '--color-accent-glow': '#60f080',
    '--color-border': '#2a4030',
    '--color-border-light': '#355040',
  },
  void: {
    '--color-bg-primary': '#0e0a18',
    '--color-bg-secondary': '#181020',
    '--color-bg-tertiary': '#22152c',
    '--color-bg-hover': '#2c1a38',
    '--color-text-primary': '#d8d3e8',
    '--color-text-secondary': '#a09ac0',
    '--color-accent': '#8b4bc9',
    '--color-accent-glow': '#a060f0',
    '--color-border': '#382a48',
    '--color-border-light': '#483558',
  },
  solar: {
    '--color-bg-primary': '#1a1608',
    '--color-bg-secondary': '#242010',
    '--color-bg-tertiary': '#302a15',
    '--color-bg-hover': '#3c341a',
    '--color-text-primary': '#f0e8d0',
    '--color-text-secondary': '#c0b898',
    '--color-accent': '#e8c84b',
    '--color-accent-glow': '#ffe860',
    '--color-border': '#504020',
    '--color-border-light': '#605028',
  },
};

export function applyTheme(themeId: string) {
  const theme = THEMES[themeId] || THEMES.default;
  const root = document.documentElement;
  Object.entries(theme).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}
