import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  DEFAULT_SETTINGS,
  WINNING_SCORE_MIN,
  WINNING_SCORE_MAX,
  WORD_INTERVAL_MIN,
  WORD_INTERVAL_MAX,
} from '../config/constants';

interface SettingsState {
  music: { on: boolean; volume: number };
  sfx: { on: boolean; volume: number };
  negativeScore: boolean;
  multiMistake: boolean;
  winningScore: number;
  wordIntervalSec: number;

  setMusicOn: (on: boolean) => void;
  setMusicVolume: (v: number) => void;
  setSfxOn: (on: boolean) => void;
  setSfxVolume: (v: number) => void;
  setNegativeScore: (on: boolean) => void;
  setMultiMistake: (on: boolean) => void;
  setWinningScore: (n: number) => void;
  setWordIntervalSec: (n: number) => void;
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      music: { ...DEFAULT_SETTINGS.music },
      sfx: { ...DEFAULT_SETTINGS.sfx },
      negativeScore: DEFAULT_SETTINGS.negativeScore,
      multiMistake: DEFAULT_SETTINGS.multiMistake,
      winningScore: DEFAULT_SETTINGS.winningScore,
      wordIntervalSec: DEFAULT_SETTINGS.wordIntervalSec,

      setMusicOn: (on) => set((s) => ({ music: { ...s.music, on } })),
      setMusicVolume: (v) => set((s) => ({ music: { ...s.music, volume: clamp01(v) } })),
      setSfxOn: (on) => set((s) => ({ sfx: { ...s.sfx, on } })),
      setSfxVolume: (v) => set((s) => ({ sfx: { ...s.sfx, volume: clamp01(v) } })),
      setNegativeScore: (on) => set({ negativeScore: on }),
      setMultiMistake: (on) => set({ multiMistake: on }),
      setWinningScore: (n) =>
        set({ winningScore: Math.max(WINNING_SCORE_MIN, Math.min(WINNING_SCORE_MAX, Math.round(n))) }),
      setWordIntervalSec: (n) =>
        set({ wordIntervalSec: Math.max(WORD_INTERVAL_MIN, Math.min(WORD_INTERVAL_MAX, Math.round(n))) }),
    }),
    { name: 'sound-match-settings' },
  ),
);
