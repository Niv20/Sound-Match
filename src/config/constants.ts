/* ===========================================================================
   constants.ts — כל הקבועים של המשחק במקום אחד.
   שנה כאן כדי לכוונן את חוויית המשחק.
   =========================================================================== */

/** מקשי השחקנים */
export const KEY_P1 = "d"; // צד ימין (ירוק)
export const KEY_P2 = "a"; // צד שמאל (כחול)

/** זיהוי שחקנים */
export const PLAYER1 = "p1" as const;
export const PLAYER2 = "p2" as const;
export type PlayerId = typeof PLAYER1 | typeof PLAYER2;

/* ===========================================================================
   SIDES — הגדרה מרכזית של כל צד: צד פיזי במסך (RTL), התו (סמל), והצבע.
   זה המקום היחיד שקובע את צבע/תו של כל צד. שנה כאן בלבד.
     • צד ימין (PLAYER1) — ירוק
     • צד שמאל (PLAYER2) — כחול
   הצבעים עצמם (hex) מוגדרים ב-theme.css כמשתני CSS.
   =========================================================================== */
export const SIDES = {
  [PLAYER1]: {
    /** צד פיזי במסך (RTL: השחקן הראשון נמצא מימין) */
    edge: "right" as const,
    /** התו של הצד — כרגע אות המקש (נשאר כפי שהיה) */
    symbol: KEY_P1,
    /** משתנה הצבע של הצד */
    color: "var(--c-player1)",
    colorDark: "var(--c-player1-dark)",
    /** הילה בהירה (זוהר ניצחון) */
    glow: "#9be7c4",
    /** שם הצבע בעברית (לכותרות "השחקן ה___") */
    colorWord: "ירוק",
  },
  [PLAYER2]: {
    edge: "left" as const,
    symbol: KEY_P2,
    color: "var(--c-player2)",
    colorDark: "var(--c-player2-dark)",
    glow: "#9dc0ff",
    colorWord: "כחול",
  },
} as const;

/** מסיחי דעת: כמה מילים שגויות מושמעות לפני המילה הנכונה (כולל הקצוות) */
export const MIN_DISTRACTORS = 1;
export const MAX_DISTRACTORS = 5;

/** תזמוני סבב (במילישניות) */
export const TIMINGS = {
  /** השהיה בתחילת הסבב לפני שמתחילים להקריא מילים — שנייה אחת, כדי לתת ל-SFX של תחילת הסבב להסתיים */
  PRESENT_DELAY: 1000,
  /** הערכה גסה לאורך השמעת מילה (משמש כ-fallback אם אורך האודיו לא ידוע) */
  WORD_FALLBACK_DURATION: 850,
  /** משך חלון ההזדמנות אחרי שהמילה הנכונה הושמעה */
  OPPORTUNITY_WINDOW: 2600,
  /** השהיה קצרה לפני מסך החשיפה (Reveal) */
  RESOLVE_DELAY: 500,
  /** משך הבזק "תשובה נכונה" על צד המנצח לפני המעבר למסך החשיפה */
  CORRECT_FLASH: 1000,
  /** לא בשימוש: ההתאוששות מטעות מבוססת כעת על שחרור הכפתור (אות גדולה), לא על טיימר */
  MISTAKE_RECOVER: 1000,
  /** משך מילוי כפתור "הסבב הבא" במעבר אוטומטי בין סבבים, לפני שממשיכים לבד */
  AUTO_ADVANCE: 3000,
} as const;

/** ניקוד */
export const SCORING = {
  WIN_POINTS: 1,
  WRONG_PENALTY: 1, // מופחת רק אם negativeScore מופעל
  TIMEOUT_PENALTY: 1, // מופחת משני השחקנים אם negativeScore מופעל
} as const;

/** מינימום פריטים פעילים בקטגוריה כדי שניתן יהיה לשחק */
export const MIN_ACTIVE_ITEMS = 2;

/**
 * הנמכת מוזיקה במהלך סבב: בזמן שמקריאים את המילים מנמיכים את המוזיקה
 * משמעותית כדי שהמילים יישמעו ברור, וברגע שיש תשובה סופית (סוף הסבב)
 * מגבירים חזרה לעוצמת ההגדרות.
 * 0.25 = 25% מעוצמת המוזיקה שהוגדרה (הנמכה של 75%). הקטן עוד להנמכה חזקה יותר.
 */
export const MUSIC_ROUND_DUCK = 0.25;

/** ברירות מחדל להגדרות (נשמרות ב-localStorage) */
export const DEFAULT_SETTINGS = {
  music: { on: true, volume: 0.3 },
  sfx: { on: true, volume: 0.5 },
  negativeScore: true,
  /** טעות מרובה: לאחר טעות אפשר לנסות שוב אחרי שנייה (כבוי => נפסל לשארית הסבב) */
  multiMistake: true,
  winningScore: 5,
  /** מרווח (בשניות) בין סוף מילה מושמעת בסבב להתחלת הבאה */
  wordIntervalSec: 2,
  /** מעבר אוטומטי בין סבבים: כפתור "הסבב הבא" מתמלא וממשיך לבד (דלוק כברירת מחדל) */
  autoAdvance: true,
} as const;

/** טווח יעד הניצחון שניתן לבחור בהגדרות */
export const WINNING_SCORE_MIN = 3;
export const WINNING_SCORE_MAX = 10;

/** טווח המרווח (בשניות) בין מילים שניתן לבחור בהגדרות */
export const WORD_INTERVAL_MIN = 1;
export const WORD_INTERVAL_MAX = 5;

/** קטגוריית מספרים: גבולות הטווח המותר */
export const NUMBERS_ABS_MIN = 0;
export const NUMBERS_ABS_MAX = 100;
export const NUMBERS_DEFAULT_MIN = 0;
export const NUMBERS_DEFAULT_MAX = 9;

/** מסכים (state machine) */
export const SCREENS = {
  HOME: "home",
  CATEGORIES: "categories",
  ANIMAL_SUBGROUP: "animalSubgroup",
  CATEGORY_ITEMS: "categoryItems",
  NUMBERS_RANGE: "numbersRange",
  GAME: "game",
  REVEAL: "reveal",
  VICTORY: "victory",
  SETTINGS: "settings",
  INSTRUCTIONS: "instructions",
} as const;

export type ScreenId = (typeof SCREENS)[keyof typeof SCREENS];

/** שפות TTS */
export const LANG_HE = "he" as const;
export const LANG_AR = "ar" as const;
export type Lang = typeof LANG_HE | typeof LANG_AR;
