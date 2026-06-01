/* ===========================================================================
   roundEngine.ts — לוגיקה טהורה לבניית סבב.
   בוחר מילת מטרה ורצף מסיחים (מילים שגויות מאותה קטגוריה).
   =========================================================================== */

import { MIN_DISTRACTORS, MAX_DISTRACTORS } from '../config/constants';
import type { VocabItem } from '../data/types';

export function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/** דגימה אקראית ללא חזרות (עד n פריטים). */
export function sample<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(n, copy.length));
}

export interface RoundPlan {
  target: VocabItem;
  /** מילים שגויות שיושמעו לפני המטרה (בסדר). */
  distractors: VocabItem[];
}

/** בונה סבב: מטרה אקראית + 1..5 מסיחים אקראיים מאותה קטגוריה. */
export function buildRound(pool: VocabItem[], avoidTargetId?: string): RoundPlan {
  let candidates = pool;
  // נסה לא לחזור על אותה מטרה פעמיים ברצף
  if (avoidTargetId && pool.length > 1) {
    candidates = pool.filter((it) => it.id !== avoidTargetId);
  }
  const target = candidates[Math.floor(Math.random() * candidates.length)];
  const others = pool.filter((it) => it.id !== target.id);
  const count = Math.min(randInt(MIN_DISTRACTORS, MAX_DISTRACTORS), others.length);
  const distractors = sample(others, count);
  return { target, distractors };
}
