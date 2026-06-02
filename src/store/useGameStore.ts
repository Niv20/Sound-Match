import { create } from 'zustand';
import { SCREENS, TIMINGS, SCORING, PLAYER1, PLAYER2, type PlayerId } from '../config/constants';
import { useNavStore } from './useNavStore';
import { useSettingsStore } from './useSettingsStore';
import { preloadForCategory } from '../audio/preloader';
import { ttsManager } from '../audio/TtsManager';
import { musicManager } from '../audio/MusicManager';
import { sfxManager } from '../audio/SfxManager';
import { buildRound } from '../game/roundEngine';
import type { VocabItem } from '../data/types';

export type RoundPhase = 'idle' | 'presenting' | 'distractors' | 'opportunity' | 'resolved';
/** 'blocked' = הסבב נסגר כי שני הצדדים נפסלו (אף אחד לא יכול ללחוץ) */
export type RoundReason = 'correct' | 'timeout' | 'blocked';

/** הבזק חזותי על צד מסוים: ירוק/כחול לתשובה נכונה, אדום לטעות. */
export type SideFx = 'correct' | 'wrong' | null;

export interface RoundResult {
  winner: PlayerId | null;
  reason: RoundReason;
  target: VocabItem;
}

interface GameState {
  categoryId: string | null;
  subgroup: string | null;
  pool: VocabItem[];
  scores: { p1: number; p2: number };

  phase: RoundPhase;
  target: VocabItem | null;
  /** שחקנים שנפסלו לשארית הסבב (טעות כשמצב "טעות מרובה" כבוי). */
  blocked: Record<PlayerId, boolean>;
  /** הבזק חזותי נוכחי לכל צד (נכון/טעות). */
  flash: Record<PlayerId, SideFx>;
  /** האם הכפתור של כל צד מוחזק כרגע (לחיצה שנקלטה בסבב הנוכחי, ללא שחרור עדיין). */
  pressed: Record<PlayerId, boolean>;
  lastResult: RoundResult | null;

  startMatch: (pool: VocabItem[], categoryId: string, subgroup: string | null) => void;
  startRound: () => void;
  /** כפתור יורד (אות קטנה). */
  press: (player: PlayerId) => void;
  /** כפתור עולה (אות גדולה). */
  release: (player: PlayerId) => void;
  continueAfterReveal: () => void;
  exit: () => void;
}

/* ── בקר סבב לא-ריאקטיבי (טיימרים + טוקן ביטול + שער השהיית הקראה) ── */
const ctl = {
  token: 0,
  timers: new Set<ReturnType<typeof setTimeout>>(),
  /** האם הקראת המילים מושהית (אחרי טעות, עד שהכפתור משוחרר). */
  paused: false,
  /** ממתינים ל-resume של לולאת ההקראה. */
  waiters: [] as Array<() => void>,
};
function clearTimers() {
  for (const t of ctl.timers) clearTimeout(t);
  ctl.timers.clear();
}
/** השהה את הקראת המילים (הלולאה תיעצר בנקודת ה-gate הבאה). */
function pauseReading() {
  ctl.paused = true;
}
/** חדש את הקראת המילים ושחרר ממתינים. */
function resumeReading() {
  ctl.paused = false;
  const waiters = ctl.waiters;
  ctl.waiters = [];
  for (const w of waiters) w();
}
/** נקודת השהיה ללולאת ההקראה: ממתינה אם מושהה, אחרת ממשיכה מיד. */
function gate(): Promise<void> {
  if (!ctl.paused) return Promise.resolve();
  return new Promise<void>((res) => ctl.waiters.push(res));
}
function later(fn: () => void, ms: number): ReturnType<typeof setTimeout> {
  const t = setTimeout(() => {
    ctl.timers.delete(t);
    fn();
  }, ms);
  ctl.timers.add(t);
  return t;
}
const wait = (ms: number) => new Promise<void>((res) => later(res, ms));

export const useGameStore = create<GameState>((set, get) => ({
  categoryId: null,
  subgroup: null,
  pool: [],
  scores: { p1: 0, p2: 0 },

  phase: 'idle',
  target: null,
  blocked: { p1: false, p2: false },
  flash: { p1: null, p2: null },
  pressed: { p1: false, p2: false },
  lastResult: null,

  startMatch: (pool, categoryId, subgroup) => {
    set({ pool, categoryId, subgroup, scores: { p1: 0, p2: 0 }, lastResult: null, phase: 'idle' });
    void preloadForCategory(pool);
    // מוזיקת המשחק מונעת מהמסכים: GameScreen→tier1 (סבב), RevealScreen→tier2 (חשיפה).
    useNavStore.getState().go(SCREENS.GAME);
  },

  startRound: () => {
    clearTimers();
    resumeReading(); // אתחל את שער ההקראה (לא מושהה) לתחילת סבב חדש
    const myToken = ++ctl.token;
    const { pool, lastResult } = get();
    const plan = buildRound(pool, lastResult?.target.id);
    set({
      phase: 'presenting',
      target: plan.target,
      blocked: { p1: false, p2: false },
      flash: { p1: null, p2: null },
      // אתחל לחיצות: כפתור שהוחזק לפני הסבב לא ייחשב לחיצה (שחרורו ייבלע).
      pressed: { p1: false, p2: false },
      lastResult: null,
    });

    // טען מראש את אודיו המטרה והמסיחים
    const all = [plan.target, ...plan.distractors];
    void ttsManager.preload(all.map((i) => i.id), 'he');

    const stale = () => ctl.token !== myToken || get().phase === 'resolved';

    void (async () => {
      sfxManager.play('round_start');
      await wait(TIMINGS.PRESENT_DELAY);
      if (stale()) return;

      // שלב המסיחים
      const wordGap = useSettingsStore.getState().wordIntervalSec * 1000;
      set({ phase: 'distractors' });
      for (const d of plan.distractors) {
        if (stale()) return;
        await gate(); // אל תתחיל מילה חדשה כל עוד ההקראה מושהית (טעות פעילה)
        if (stale()) return;
        await ttsManager.playWord(d.id, 'he'); // אם טעות קרתה באמצע המילה — המילה תושמע עד הסוף
        if (stale()) return;
        await gate(); // אם נעצרנו בזמן המילה — השהה כעת, לפני המרווח והמילה הבאה
        if (stale()) return;
        await wait(wordGap);
      }
      if (stale()) return;
      await gate(); // אל תיכנס לחלון ההזדמנות בזמן שטעות מוחזקת
      if (stale()) return;

      // שלב ההזדמנות — המילה הנכונה
      set({ phase: 'opportunity' });
      const dur = await ttsManager.durationMs(plan.target.id, 'he');
      if (stale()) return;
      void ttsManager.playWord(plan.target.id, 'he');

      const windowMs = dur + TIMINGS.OPPORTUNITY_WINDOW;
      // סוף החלון ללא לחיצה תקפה => timeout
      later(() => {
        if (stale()) return;
        resolveRound('timeout', null);
      }, windowMs);
    })();
  },

  press: (player) => {
    const { phase, blocked, pressed } = get();
    if (phase === 'resolved' || phase === 'idle') return;
    // לחיצה כפולה (הכפתור כבר מוחזק) — התעלם עד שישוחרר
    if (pressed[player]) return;
    set((s) => ({ pressed: { ...s.pressed, [player]: true } }));

    // נפסל לשארית הסבב — הכפתור נקלט כמוחזק אך ללא השפעה
    if (blocked[player]) return;

    if (phase === 'opportunity') {
      // תשובה נכונה — הבזק בצבע הצד, ואז מעבר לחשיפה
      sfxManager.play('press');
      set((s) => ({ flash: { ...s.flash, [player]: 'correct' } }));
      resolveRound('correct', player);
      return;
    }

    // לחיצה מוקדמת מדי (presenting/distractors) — טעות
    sfxManager.play('press');
    sfxManager.play('wrong');
    penalize(player);
    set((s) => ({ flash: { ...s.flash, [player]: 'wrong' } }));
    pauseReading(); // עצור את הקראת המילים (המילה הנוכחית תסתיים)

    if (!useSettingsStore.getState().multiMistake) {
      // טעות פוסלת לשארית הסבב
      set((s) => ({ blocked: { ...s.blocked, [player]: true } }));
      // אם שני הצדדים נפסלו — אין טעם להמשיך
      const b = get().blocked;
      if (b.p1 && b.p2) resolveRound('blocked', null);
    }
  },

  release: (player) => {
    const { pressed, flash } = get();
    // שחרור ללא לחיצה מוקדמת שנקלטה בסבב — כפתור שהוחזק מלפני הסבב; התעלם.
    if (!pressed[player]) return;
    set((s) => ({ pressed: { ...s.pressed, [player]: false } }));

    // הסתר את הגרדיאנט האדום של הטעות בשחרור הכפתור
    if (flash[player] === 'wrong') {
      set((s) => ({ flash: { ...s.flash, [player]: null } }));
    }
    // חדש הקראה רק כשאף צד לא מחזיק טעות פעילה (גרדיאנט אדום)
    const f = get().flash;
    if (f.p1 !== 'wrong' && f.p2 !== 'wrong') resumeReading();
  },

  continueAfterReveal: () => {
    const { scores, lastResult } = get();
    const winningScore = useSettingsStore.getState().winningScore;
    if (scores.p1 >= winningScore || scores.p2 >= winningScore) {
      useNavStore.getState().go(SCREENS.VICTORY);
      return;
    }
    void lastResult;
    // ניווט ל-GAME; GameScreen מפעיל startRound בעת ההרכבה.
    useNavStore.getState().go(SCREENS.GAME);
  },

  exit: () => {
    clearTimers();
    resumeReading(); // שחרר לולאת הקראה שעלולה להמתין מושהית
    ctl.token++;
    set({
      phase: 'idle',
      target: null,
      flash: { p1: null, p2: null },
      pressed: { p1: false, p2: false },
      lastResult: null,
    });
    musicManager.stopAll();
    useNavStore.getState().goHome();
  },
}));

/* ── עוזרי ניקוד/סיום (משתמשים ב-store API ישירות) ── */

function penalize(player: PlayerId) {
  if (!useSettingsStore.getState().negativeScore) return;
  const key = player === PLAYER1 ? 'p1' : 'p2';
  useGameStore.setState((s) => ({
    scores: { ...s.scores, [key]: Math.max(0, s.scores[key] - SCORING.WRONG_PENALTY) },
  }));
}

function resolveRound(reason: RoundReason, winner: PlayerId | null) {
  clearTimers();
  resumeReading(); // שחרר לולאת הקראה שעלולה להמתין מושהית כדי שתסיים בבדיקת stale
  const target = useGameStore.getState().target!;
  useGameStore.setState({ phase: 'resolved' });

  // ברירת מחדל: השהיה קצרה לפני החשיפה. בתשובה נכונה — נותנים להבזק לנגן שנייה.
  let revealDelay: number = TIMINGS.RESOLVE_DELAY;

  if (reason === 'correct' && winner) {
    sfxManager.play('correct');
    const key = winner === PLAYER1 ? 'p1' : 'p2';
    useGameStore.setState((s) => ({ scores: { ...s.scores, [key]: s.scores[key] + SCORING.WIN_POINTS } }));
    revealDelay = TIMINGS.CORRECT_FLASH;
  } else if (reason === 'timeout') {
    sfxManager.play('timeout');
    // עונש לשני השחקנים שלא נפסלו כבר
    const { blocked } = useGameStore.getState();
    if (!blocked.p1) penalize(PLAYER1);
    if (!blocked.p2) penalize(PLAYER2);
  } else if (reason === 'blocked') {
    // שני הצדדים נפסלו — העונשים כבר חולקו בכל טעות; רק סוגרים את הסבב.
    sfxManager.play('timeout');
  }

  useGameStore.setState({ lastResult: { winner, reason, target } });
  // מעבר למסך החשיפה אחרי השהיה
  later(() => useNavStore.getState().go(SCREENS.REVEAL), revealDelay);
}
