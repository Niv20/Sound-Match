/* ===========================================================================
   constants.ts — כל הקבועים של המשחק במקום אחד.
   שנה כאן כדי לכוונן את חוויית המשחק.
   =========================================================================== */

/** מקשי השחקנים */
export const KEY_P1 = 'a'; // שחקן כחול
export const KEY_P2 = 'l'; // שחקן אדום

/** זיהוי שחקנים */
export const PLAYER1 = 'p1' as const;
export const PLAYER2 = 'p2' as const;
export type PlayerId = typeof PLAYER1 | typeof PLAYER2;

/** מסיחי דעת: כמה מילים שגויות מושמעות לפני המילה הנכונה (כולל הקצוות) */
export const MIN_DISTRACTORS = 1;
export const MAX_DISTRACTORS = 5;

/** תזמוני סבב (במילישניות) */
export const TIMINGS = {
  /** השהיה אחרי הופעת התמונה לפני שמתחילים להקריא מילים */
  PRESENT_DELAY: 900,
  /** מרווח בין סוף מילה מושמעת להתחלת הבאה */
  WORD_GAP: 550,
  /** הערכה גסה לאורך השמעת מילה (משמש כ-fallback אם אורך האודיו לא ידוע) */
  WORD_FALLBACK_DURATION: 850,
  /** משך חלון ההזדמנות אחרי שהמילה הנכונה הושמעה */
  OPPORTUNITY_WINDOW: 2600,
  /** מתי להתחיל תקתוק שעון לפני סוף החלון */
  CLOCK_TICK_BEFORE_END: 1500,
  /** השהיה קצרה לפני מסך החשיפה (Reveal) */
  RESOLVE_DELAY: 500,
} as const;

/** ניקוד */
export const SCORING = {
  WIN_POINTS: 1,
  WRONG_PENALTY: 1, // מופחת רק אם negativeScore מופעל
  TIMEOUT_PENALTY: 1, // מופחת משני השחקנים אם negativeScore מופעל
} as const;

/** מינימום פריטים פעילים בקטגוריה כדי שניתן יהיה לשחק */
export const MIN_ACTIVE_ITEMS = 2;

/** ברירות מחדל להגדרות (נשמרות ב-localStorage) */
export const DEFAULT_SETTINGS = {
  music: { on: true, volume: 0.6 },
  sfx: { on: true, volume: 0.85 },
  arabic: true,
  negativeScore: true,
  winningScore: 10,
} as const;

/** טווח יעד הניצחון שניתן לבחור בהגדרות */
export const WINNING_SCORE_MIN = 3;
export const WINNING_SCORE_MAX = 30;

/** קטגוריית מספרים: גבולות הטווח המותר */
export const NUMBERS_ABS_MIN = 0;
export const NUMBERS_ABS_MAX = 100;
export const NUMBERS_DEFAULT_MIN = 0;
export const NUMBERS_DEFAULT_MAX = 9;

/** מסכים (state machine) */
export const SCREENS = {
  HOME: 'home',
  CATEGORIES: 'categories',
  ANIMAL_SUBGROUP: 'animalSubgroup',
  CATEGORY_ITEMS: 'categoryItems',
  NUMBERS_RANGE: 'numbersRange',
  GAME: 'game',
  REVEAL: 'reveal',
  VICTORY: 'victory',
  SETTINGS: 'settings',
  INSTRUCTIONS: 'instructions',
} as const;

export type ScreenId = (typeof SCREENS)[keyof typeof SCREENS];

/** שפות TTS */
export const LANG_HE = 'he' as const;
export const LANG_AR = 'ar' as const;
export type Lang = typeof LANG_HE | typeof LANG_AR;
