import type { VocabItem } from './types';
import {
  NUMBERS_ABS_MIN,
  NUMBERS_ABS_MAX,
  MIN_ACTIVE_ITEMS,
} from '../config/constants';

/** מזהה פריט TTS עבור מספר. ה-id יציב כך שאפשר להפיק mp3 מראש לכל 0..100. */
export function numberId(n: number): string {
  return `num_${n}`;
}

/** בונה פריט אוצר מילים עבור מספר בודד. */
export function numberItem(n: number): VocabItem {
  return {
    id: numberId(n),
    he: String(n), // TTS he-IL קורא את הספרה כמילה ("עשרים ושלוש")
    categoryId: 'numbers',
    value: n,
  };
}

/** בונה את כל הפריטים בטווח [min, max] (כולל). */
export function buildNumberItems(min: number, max: number): VocabItem[] {
  const items: VocabItem[] = [];
  for (let n = min; n <= max; n++) items.push(numberItem(n));
  return items;
}

export interface RangeValidation {
  valid: boolean;
  /** הודעת שגיאה ידידותית (אם לא תקין) */
  message?: string;
}

/** ולידציה של טווח שנבחר ע"י המשתמש. */
export function validateRange(min: number, max: number): RangeValidation {
  if (!Number.isInteger(min) || !Number.isInteger(max)) {
    return { valid: false, message: 'יש להזין מספרים שלמים' };
  }
  if (min < NUMBERS_ABS_MIN || max > NUMBERS_ABS_MAX) {
    return { valid: false, message: `הטווח חייב להיות בין ${NUMBERS_ABS_MIN} ל-${NUMBERS_ABS_MAX}` };
  }
  if (min >= max) {
    return { valid: false, message: 'המספר התחתון חייב להיות קטן מהעליון' };
  }
  if (max - min + 1 < MIN_ACTIVE_ITEMS) {
    return { valid: false, message: `צריך לפחות ${MIN_ACTIVE_ITEMS} מספרים בטווח` };
  }
  return { valid: true };
}

/** הצמדת ערך לתחום המותר. */
export function clampNumber(n: number): number {
  if (Number.isNaN(n)) return NUMBERS_ABS_MIN;
  return Math.min(NUMBERS_ABS_MAX, Math.max(NUMBERS_ABS_MIN, Math.round(n)));
}
