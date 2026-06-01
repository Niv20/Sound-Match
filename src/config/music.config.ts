/* ===========================================================================
   music.config.ts — הגדרת כל המוזיקה במקום אחד.

   ── אורך לופים ──────────────────────────────────────────────────────────
   כל הלופים חייבים להיות באותו אורך מדויק = MUSIC_LOOP_SECONDS.
   זה מה שמאפשר את ה"מעבר הטבעי": כשעוברים מסך, הלופ החדש מתחיל מאותו
   מיקום-זמן שבו הלופ הישן היה (sync-by-phase), עם crossfade.

   ── קבוצות תפריט (MENU_MUSIC) ───────────────────────────────────────────
   4 קבוצות. לכל קבוצה מערך נתיבי קבצים (יחסית ל-/audio/music/).
   אם בקבוצה יותר מקובץ אחד — בכל מעבר נבחר אחד אקראית.
   להוספת לופ: הוסף נתיב למערך. הקבצים: public/audio/music/<path>.

   ── מוזיקת משחק (GAME_MUSIC_TIERS) ──────────────────────────────────────
   מערך "שכבות" (tiers) מסודר מהתחלה לסוף. כל שכבה:
     loops: רשימת קבצים (נבחר אקראית בכל מחזור לופ)
     plays: כמה מחזורי-לופ מנגנים מהשכבה לפני מעבר לשכבה הבאה
   אחרי השכבה האחרונה — חוזרים לראשונה (מחזורי).
   =========================================================================== */

/** אורך אחיד לכל הלופים (שניות). שנה כאן אם החלפת את הקבצים. */
export const MUSIC_LOOP_SECONDS = 16;

/** משך ה-crossfade במעבר בין לופים (שניות). */
export const MUSIC_CROSSFADE_SECONDS = 1.5;

/** תיקיית הבסיס של קובצי המוזיקה. */
export const MUSIC_BASE = '/audio/music';

/** קבוצות מוזיקת התפריט. המפתחות תואמים למצבי המסך. */
export const MENU_MUSIC: Record<string, string[]> = {
  home: ['menu/home/01.mp3', 'menu/home/02.mp3'],
  settings: ['menu/settings/01.mp3'],
  instructions: ['menu/instructions/01.mp3'],
  category: ['menu/category/01.mp3', 'menu/category/02.mp3'],
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
