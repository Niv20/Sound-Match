import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { NUMBERS_DEFAULT_MIN, NUMBERS_DEFAULT_MAX } from '../config/constants';
import type { VocabItem } from '../data/types';

/** מפתח scope: 'cat:fruits' או 'cat:animals:wild' או 'cat:colors'. */
export function scopeKey(categoryId: string, subgroup?: string): string {
  return subgroup ? `cat:${categoryId}:${subgroup}` : `cat:${categoryId}`;
}

interface SelectionState {
  /** מזהי פריטים *כבויים* לכל scope (כברירת מחדל הכל פעיל). */
  disabled: Record<string, string[]>;
  /** טווח קטגוריית מספרים. */
  numberRange: { min: number; max: number };

  toggleItem: (scope: string, id: string) => void;
  isActive: (scope: string, id: string) => boolean;
  enableAll: (scope: string) => void;
  setNumberRange: (min: number, max: number) => void;
}

export const useSelectionStore = create<SelectionState>()(
  persist(
    (set, get) => ({
      disabled: {},
      numberRange: { min: NUMBERS_DEFAULT_MIN, max: NUMBERS_DEFAULT_MAX },

      toggleItem: (scope, id) =>
        set((s) => {
          const cur = new Set(s.disabled[scope] ?? []);
          if (cur.has(id)) cur.delete(id);
          else cur.add(id);
          return { disabled: { ...s.disabled, [scope]: [...cur] } };
        }),

      isActive: (scope, id) => !(get().disabled[scope] ?? []).includes(id),

      enableAll: (scope) =>
        set((s) => {
          const next = { ...s.disabled };
          delete next[scope];
          return { disabled: next };
        }),

      setNumberRange: (min, max) => set({ numberRange: { min, max } }),
    }),
    { name: 'sound-match-selection' },
  ),
);

/** פריטים פעילים מתוך רשימה נתונה ב-scope. */
export function activeItems(items: VocabItem[], scope: string, disabled: Record<string, string[]>): VocabItem[] {
  const off = new Set(disabled[scope] ?? []);
  return items.filter((it) => !off.has(it.id));
}
