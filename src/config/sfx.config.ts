/* ===========================================================================
   sfx.config.ts — הגדרת כל אפקטי הקול.

   לכל אפקט מספר וריאציות (variations). אם variations === 1, שם הקובץ הוא
   "<name>.mp3". אם > 1, הקבצים הם "<name>_1.mp3" .. "<name>_N.mp3",
   ובכל השמעה נבחרת וריאציה אקראית.

   הקבצים: public/audio/sfx/<file>.mp3
   =========================================================================== */

export const SFX_BASE = '/audio/sfx';

/** רשימת אפקטים -> כמה וריאציות יש לכל אחד. */
export const SFX = {
  press_p1: 1, // לחיצת שחקן כחול
  press_p2: 1, // לחיצת שחקן אדום
  correct: 3, // תשובה נכונה (וריאציות)
  wrong: 3, // לחיצה שגויה / קנס
  timeout: 1, // נגמר הזמן (אף אחד לא לחץ)
  clock_tick: 1, // תקתוק שעון לפני סוף החלון
  round_start: 1, // הופעת התמונה / תחילת סבב
  reveal: 1, // חשיפת המילה בערבית
  victory: 1, // ניצחון במשחק
  ui_click: 1, // לחיצת כפתור ממשק
  ui_hover: 1, // ריחוף
  toggle_on: 1, // הדלקת מתג
  toggle_off: 1, // כיבוי מתג
  category_open: 1, // פתיחת קטגוריה
  item_toggle: 1, // סימון/ביטול פריט
  countdown: 1, // ספירה לפני סבב
} as const;

export type SfxName = keyof typeof SFX;

/** מחזיר את כל נתיבי הקבצים של אפקט נתון. */
export function sfxFiles(name: SfxName): string[] {
  const count = SFX[name];
  if (count <= 1) return [`${SFX_BASE}/${name}.mp3`];
  return Array.from({ length: count }, (_, i) => `${SFX_BASE}/${name}_${i + 1}.mp3`);
}

/** כל קובצי ה-SFX (לטעינה מקדימה). */
export function allSfxFiles(): string[] {
  return (Object.keys(SFX) as SfxName[]).flatMap(sfxFiles);
}

/** אפקטים קריטיים לטעינה מיידית בעת עליית האתר. */
export const CRITICAL_SFX: SfxName[] = ['press_p1', 'press_p2', 'correct', 'wrong', 'ui_click'];
