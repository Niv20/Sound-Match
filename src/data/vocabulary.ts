/* עזרי שאילתה מעל אוצר המילים (תמונות + צבעים + מספרים). */
import { VOCABULARY } from './vocabulary.generated';
import { COLORS } from './colors';
import { buildNumberItems } from './numbers';
import type { VocabItem } from './types';

export { VOCABULARY };

/** כל פריטי התמונה בקטגוריה (אופציונלי: תת-קבוצה). */
export function imageItems(categoryId: string, subgroup?: string): VocabItem[] {
  return VOCABULARY.filter(
    (it) => it.categoryId === categoryId && (!subgroup || it.subgroup === subgroup),
  );
}

/** פריטי קטגוריה כלשהי לפי סוג (תמונות/צבעים). מספרים נבנים מטווח בנפרד. */
export function itemsForCategory(categoryId: string, subgroup?: string): VocabItem[] {
  if (categoryId === 'colors') return COLORS;
  if (categoryId === 'numbers') return buildNumberItems(0, 9);
  return imageItems(categoryId, subgroup);
}

export { COLORS, buildNumberItems };
