import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_SETTINGS, WINNING_SCORE_MIN, WINNING_SCORE_MAX } from '../config/constants';

interface SettingsState {
  music: { on: boolean; volume: number };
  sfx: { on: boolean; volume: number };
  arabic: boolean;
  negativeScore: boolean;
  multiMistake: boolean;
  winningScore: number;

  setMusicOn: (on: boolean) => void;
  setMusicVolume: (v: number) => void;
  setSfxOn: (on: boolean) => void;
  setSfxVolume: (v: number) => void;
  setArabic: (on: boolean) => void;
  setNegativeScore: (on: boolean) => void;
  setMultiMistake: (on: boolean) => void;
  setWinningScore: (n: number) => void;
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      music: { ...DEFAULT_SETTINGS.music },
      sfx: { ...DEFAULT_SETTINGS.sfx },
      arabic: DEFAULT_SETTINGS.arabic,
      negativeScore: DEFAULT_SETTINGS.negativeScore,
      multiMistake: DEFAULT_SETTINGS.multiMistake,
      winningScore: DEFAULT_SETTINGS.winningScore,

      setMusicOn: (on) => set((s) => ({ music: { ...s.music, on } })),
      setMusicVolume: (v) => set((s) => ({ music: { ...s.music, volume: clamp01(v) } })),
      setSfxOn: (on) => set((s) => ({ sfx: { ...s.sfx, on } })),
      setSfxVolume: (v) => set((s) => ({ sfx: { ...s.sfx, volume: clamp01(v) } })),
      setArabic: (on) => set({ arabic: on }),
      setNegativeScore: (on) => set({ negativeScore: on }),
      setMultiMistake: (on) => set({ multiMistake: on }),
      setWinningScore: (n) =>
        set({ winningScore: Math.max(WINNING_SCORE_MIN, Math.min(WINNING_SCORE_MAX, Math.round(n))) }),
    }),
    { name: 'sound-match-settings' },
  ),
);
