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

   ── מוזיקת משחק (GAME_MUSIC_TIERS) ──────────────────────────────────────
   מערך "שכבות" (tiers) מסודר מהתחלה לסוף. כל שכבה:
     loops: רשימת קבצים (נבחר אקראית בכל מחזור לופ)
     plays: כמה מחזורי-לופ מנגנים מהשכבה לפני מעבר לשכבה הבאה
   אחרי השכבה האחרונה — חוזרים לראשונה (מחזורי).
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

export interface GameMusicTier {
  loops: string[];
  plays: number;
}

/** שכבות מוזיקת המשחק (מהרגוע לשיא). */
export const GAME_MUSIC_TIERS: GameMusicTier[] = [
  { loops: ['game/tier1/01.mp3', 'game/tier1/02.mp3'], plays: 2 },
  { loops: ['game/tier2/01.mp3'], plays: 2 },
  { loops: ['game/tier3/01.mp3', 'game/tier3/02.mp3'], plays: 3 },
];

/** עוזר: הופך נתיב יחסי לנתיב מלא. */
export function musicUrl(relPath: string): string {
  return `${MUSIC_BASE}/${relPath}`;
}
