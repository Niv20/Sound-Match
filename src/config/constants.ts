/* ===========================================================================
   constants.ts — כל הקבועים של המשחק במקום אחד.
   שנה כאן כדי לכוונן את חוויית המשחק.
   =========================================================================== */

/** מקשי השחקנים */
export const KEY_P1 = 'a'; // צד ימין (כחול)
export const KEY_P2 = 'l'; // צד שמאל (ירוק)

/** זיהוי שחקנים */
export const PLAYER1 = 'p1' as const;
export const PLAYER2 = 'p2' as const;
export type PlayerId = typeof PLAYER1 | typeof PLAYER2;

/* ===========================================================================
   SIDES — הגדרה מרכזית של כל צד: צד פיזי במסך (RTL), התו (סמל), והצבע.
   זה המקום היחיד שקובע את צבע/תו של כל צד. שנה כאן בלבד.
     • צד ימין (PLAYER1) — כחול
     • צד שמאל (PLAYER2) — ירוק
   הצבעים עצמם (hex) מוגדרים ב-theme.css כמשתני CSS.
   =========================================================================== */
export const SIDES = {
  [PLAYER1]: {
    /** צד פיזי במסך (RTL: השחקן הראשון נמצא מימין) */
    edge: 'right' as const,
    /** התו של הצד — כרגע אות המקש (נשאר כפי שהיה) */
    symbol: KEY_P1,
    /** משתנה הצבע של הצד */
    color: 'var(--c-player1)',
    colorDark: 'var(--c-player1-dark)',
    /** הילה בהירה (זוהר ניצחון) */
    glow: '#9dc0ff',
    /** שם הצבע בעברית (לכותרות "השחקן ה___") */
    colorWord: 'כחול',
  },
  [PLAYER2]: {
    edge: 'left' as const,
    symbol: KEY_P2,
    color: 'var(--c-player2)',
    colorDark: 'var(--c-player2-dark)',
    glow: '#9be7c4',
    colorWord: 'ירוק',
  },
} as const;

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
  /** השהיה קצרה לפני מסך החשיפה (Reveal) */
  RESOLVE_DELAY: 500,
  /** משך הבזק "תשובה נכונה" על צד המנצח לפני המעבר למסך החשיפה */
  CORRECT_FLASH: 1000,
  /** השהיה עד ששחקן יכול לנסות שוב אחרי טעות (במצב "טעות מרובה") */
  MISTAKE_RECOVER: 1000,
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
  /** טעות מרובה: לאחר טעות אפשר לנסות שוב אחרי שנייה (כבוי => נפסל לשארית הסבב) */
  multiMistake: true,
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
