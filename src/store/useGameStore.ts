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
  lastResult: RoundResult | null;

  startMatch: (pool: VocabItem[], categoryId: string, subgroup: string | null) => void;
  startRound: () => void;
  press: (player: PlayerId) => void;
  continueAfterReveal: () => void;
  exit: () => void;
}

/* ── בקר סבב לא-ריאקטיבי (טיימרים + טוקן ביטול) ── */
const ctl = {
  token: 0,
  timers: new Set<ReturnType<typeof setTimeout>>(),
};
function clearTimers() {
  for (const t of ctl.timers) clearTimeout(t);
  ctl.timers.clear();
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
  lastResult: null,

  startMatch: (pool, categoryId, subgroup) => {
    set({ pool, categoryId, subgroup, scores: { p1: 0, p2: 0 }, lastResult: null, phase: 'idle' });
    void preloadForCategory(pool);
    void musicManager.toGame();
    useNavStore.getState().go(SCREENS.GAME);
  },

  startRound: () => {
    clearTimers();
    const myToken = ++ctl.token;
    const { pool, lastResult } = get();
    const plan = buildRound(pool, lastResult?.target.id);
    set({
      phase: 'presenting',
      target: plan.target,
      blocked: { p1: false, p2: false },
      flash: { p1: null, p2: null },
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
        await ttsManager.playWord(d.id, 'he');
        if (stale()) return;
        await wait(wordGap);
      }
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
    const { phase, blocked, flash } = get();
    if (phase === 'resolved' || phase === 'idle') return;
    // חסום אם נפסל לשארית הסבב, או בזמן חלון ההתאוששות אחרי טעות
    if (blocked[player] || flash[player] === 'wrong') return;

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

    if (useSettingsStore.getState().multiMistake) {
      // טעות מרובה: אחרי שנייה הצד חוזר להיות פעיל
      later(() => {
        if (get().phase === 'resolved') return;
        set((s) => ({ flash: { ...s.flash, [player]: null } }));
      }, TIMINGS.MISTAKE_RECOVER);
    } else {
      // נפסל לשארית הסבב — נשאר אדום
      set((s) => ({ blocked: { ...s.blocked, [player]: true } }));
      // אם שני הצדדים נפסלו — אין טעם להמשיך
      const b = get().blocked;
      if (b.p1 && b.p2) resolveRound('blocked', null);
    }
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
    ctl.token++;
    set({ phase: 'idle', target: null, flash: { p1: null, p2: null }, lastResult: null });
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
