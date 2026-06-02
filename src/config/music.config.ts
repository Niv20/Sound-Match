/* ===========================================================================
   music.config.ts — הגדרת כל המוזיקה במקום אחד.

   ── אורך לופים (אוטומטי) ────────────────────────────────────────────────
   הלופים *לא* חייבים להיות באותו אורך. אורך כל לופ נגזר אוטומטית מהקובץ
   עצמו (AudioBuffer.duration) — אין צורך להגדיר אורך כאן.
   "מעבר טבעי" בין מסכים: הלופ החדש מתחיל ממיקום-הפאזה — כמות הזמן שחלפה
   מתחילת המוזיקה, מודולו אורך הלופ החדש (sync-by-phase), עם crossfade.

   ── קבוצות תפריט (MENU_MUSIC) ───────────────────────────────────────────
   לכל קבוצה מערך נתיבי קבצים (יחסית ל-/audio/music/).
   אם בקבוצה יותר מקובץ אחד — בכל מחזור-לופ נבחר אחד אקראית.
   להוספת לופ: הוסף נתיב למערך. הקבצים: public/audio/music/<path>.

   ── מוזיקת משחק (GAME_MUSIC) ────────────────────────────────────────────
   שני "שלבים" שמתחלפים *לפי אירועי המשחק* (לא אוטומטית):
     tier1 — מתנגן במהלך הסבב (הקראת המילים + ההמתנה ללחיצה).
     tier2 — מתנגן במסך החשיפה (סוף הסבב / חשיפת התשובה).
   המעבר ביניהם הוא crossfade מסונכרן-פאזה — בדיוק כמו מוזיקת התפריט,
   וללא תלות באורך הלופ (האורך נגזר אוטומטית מהקובץ). בכל שלב, אם יש כמה
   לופים — נבחר אחד אקראית בכל מחזור-לופ. אותו מבנה כמו MENU_MUSIC.
   =========================================================================== */

/** משך ה-crossfade במעבר בין לופים (שניות). */
export const MUSIC_CROSSFADE_SECONDS = 1.5;

/** משך סגמנט-שקט כשקובץ חסר/placeholder (שניות) — לפני ניסיון טעינה חוזר. */
export const MUSIC_SILENT_SEGMENT_SECONDS = 8;

/** תיקיית הבסיס של קובצי המוזיקה. */
export const MUSIC_BASE = '/audio/music';

/** קבוצות מוזיקת התפריט. המפתחות תואמים למצבי המסך. */
export const MENU_MUSIC: Record<string, string[]> = {
  home: ['menu/home/1.wav'], //                              שיר 1 — מסך הבית (טעינת האתר)
  instructions: ['menu/instructions/2.wav'], //              שיר 2 — אחרי "התחל" (רשת הקטגוריות) + מסך הוראות
  settings: ['menu/settings/2.wav'], //                      שיר 2 — מסך הגדרות
  category: ['menu/category/3a.wav', 'menu/category/3b.wav'], // 3a/3b אקראי — אחרי בחירת קטגוריה
};

export type MenuMusicGroup = keyof typeof MENU_MUSIC;

/** שלבי מוזיקת המשחק. מתחלפים לפי אירוע (ראה הערה למעלה), לא אוטומטית. */
export const GAME_MUSIC: Record<string, string[]> = {
  tier1: [
    //                                                         במהלך הסבב
    'game/tier1/a1.wav',
    'game/tier1/a2.wav',
    'game/tier1/a3.wav',
    'game/tier1/a4.wav',
    'game/tier1/a5.wav',
    'game/tier1/a6.wav',
  ],
  tier2: [
    //                                                       מסך החשיפה
    'game/tier2/b1.wav',
    'game/tier2/b2.wav',
    'game/tier2/b3.wav',
    'game/tier2/b4.wav',
    'game/tier2/b5.wav',
  ],
};

export type GameMusicTier = keyof typeof GAME_MUSIC;

/** עוזר: הופך נתיב יחסי לנתיב מלא. */
export function musicUrl(relPath: string): string {
  return `${MUSIC_BASE}/${relPath}`;
}
