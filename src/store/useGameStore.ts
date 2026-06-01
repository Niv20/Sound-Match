import { create } from 'zustand';
import { SCREENS } from '../config/constants';
import { useNavStore } from './useNavStore';
import { preloadForCategory } from '../audio/preloader';
import type { VocabItem } from '../data/types';

interface GameState {
  categoryId: string | null;
  subgroup: string | null;
  /** הפריטים הפעילים שנבחרו למשחק הנוכחי. */
  pool: VocabItem[];
  scores: { p1: number; p2: number };

  /** מתחיל משחק חדש עם הפריטים הפעילים. */
  startMatch: (pool: VocabItem[], categoryId: string, subgroup: string | null) => void;
  resetScores: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  categoryId: null,
  subgroup: null,
  pool: [],
  scores: { p1: 0, p2: 0 },

  startMatch: (pool, categoryId, subgroup) => {
    set({ pool, categoryId, subgroup, scores: { p1: 0, p2: 0 } });
    void preloadForCategory(pool);
    useNavStore.getState().go(SCREENS.GAME);
  },

  resetScores: () => set({ scores: { p1: 0, p2: 0 } }),
}));
