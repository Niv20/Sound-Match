/* ===========================================================================
   sfx.config.ts — הגדרת כל אפקטי הקול.

   לכל אפקט מספר וריאציות (variations). אם variations === 1, שם הקובץ הוא
   "<name>.wav". אם > 1, הקבצים הם "<name>_1.wav" .. "<name>_N.wav",
   ובכל השמעה נבחרת וריאציה אקראית. כרגע לכולם וריאציה אחת — אפשר
   להעלות את המספר בעתיד כדי להוסיף עוד.

   הקבצים: public/audio/sfx/<file>.wav
   =========================================================================== */

export const SFX_BASE = '/audio/sfx';
const SFX_EXT = 'wav';

/** רשימת אפקטים -> כמה וריאציות יש לכל אחד. */
export const SFX = {
  press: 1, // לחיצת שחקן (משותף לשני השחקנים)
  correct: 1, // תשובה נכונה
  wrong: 1, // לחיצה שגויה / קנס
  timeout: 1, // נגמר הזמן (אף אחד לא לחץ)
  round_start: 1, // הופעת התמונה / תחילת סבב
  reveal: 1, // חשיפת המילה בערבית
  victory: 1, // ניצחון במשחק
  ui_click: 1, // לחיצת כפתור ממשק
  ui_hover: 1, // ריחוף
  toggle_on: 1, // הדלקת מתג
  toggle_off: 1, // כיבוי מתג
  category_open: 1, // פתיחת קטגוריה
  item_toggle: 1, // סימון/ביטול פריט
} as const;

export type SfxName = keyof typeof SFX;

/** מחזיר את כל נתיבי הקבצים של אפקט נתון. */
export function sfxFiles(name: SfxName): string[] {
  const count = SFX[name];
  if (count <= 1) return [`${SFX_BASE}/${name}.${SFX_EXT}`];
  return Array.from({ length: count }, (_, i) => `${SFX_BASE}/${name}_${i + 1}.${SFX_EXT}`);
}

/** כל קובצי ה-SFX (לטעינה מקדימה). */
export function allSfxFiles(): string[] {
  return (Object.keys(SFX) as SfxName[]).flatMap(sfxFiles);
}

/** אפקטים קריטיים לטעינה מיידית בעת עליית האתר. */
export const CRITICAL_SFX: SfxName[] = ['press', 'correct', 'wrong', 'ui_click'];
