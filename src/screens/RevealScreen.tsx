import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Screen } from '../components/Screen';
import { Button } from '../components/Button';
import { PlayerPanel } from '../components/PlayerPanel';
import { TargetDisplay } from '../components/TargetDisplay';
import { LANG_HE, LANG_AR, PLAYER1, PLAYER2, SIDES, SCORING, type PlayerId, type Lang } from '../config/constants';
import { useGameStore } from '../store/useGameStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { ttsManager } from '../audio/TtsManager';
import { arabicText } from '../data/arabic';
import { useSfx } from '../hooks/useSfx';

/** שלבי החשיפה: קוראים את המילה → מכניסים ניקוד מהקצוות → +1 → כפתור. */
type RevealStep = 'reading' | 'scores' | 'plus' | 'done';

/** פאנל ניקוד שנכנס מקצה המסך, עם הבזק "+1" למנצח. */
function ScoreSide({
  player,
  step,
  score,
  won,
}: {
  player: PlayerId;
  step: RevealStep;
  score: number;
  won: boolean;
}) {
  const side = SIDES[player];
  const fromX = side.edge === 'right' ? 170 : -170;
  const show = step !== 'reading';

  return (
    <div style={{ position: 'relative' }}>
      <motion.div
        initial={{ x: fromX, opacity: 0 }}
        animate={show ? { x: 0, opacity: 1 } : { x: fromX, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
      >
        <PlayerPanel player={player} score={score} blocked={false} won={won && show} />
      </motion.div>

      {/* "+1" מעל התיבה — כחול מימין, ירוק משמאל */}
      <AnimatePresence>
        {won && (step === 'plus' || step === 'done') && (
          <div
            style={{
              position: 'absolute',
              bottom: '100%',
              left: 0,
              right: 0,
              marginBottom: 10,
              display: 'flex',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <motion.span
              initial={{ opacity: 0, y: 6, scale: 0.5 }}
              animate={{ opacity: [0, 1, 1, 0], y: [6, -8, -16, -26], scale: [0.5, 1.3, 1.2, 1.1] }}
              transition={{ duration: 1.3, times: [0, 0.25, 0.7, 1] }}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 48,
                fontWeight: 800,
                color: side.color,
                whiteSpace: 'nowrap',
              }}
            >
              +1
            </motion.span>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function RevealScreen() {
  const sfx = useSfx();
  const result = useGameStore((s) => s.lastResult);
  const scores = useGameStore((s) => s.scores);
  const continueAfterReveal = useGameStore((s) => s.continueAfterReveal);
  const exit = useGameStore((s) => s.exit);
  const arabicOn = useSettingsStore((s) => s.arabic);

  const target = result?.target;
  const winnerKey: 'p1' | 'p2' | null =
    result?.reason === 'correct' && result.winner ? (result.winner === PLAYER1 ? 'p1' : 'p2') : null;

  // ניקוד "לפני" התוספת — כדי שנוכל להנפיש +1 על המנצח (ה-store כבר עודכן).
  const preScores = {
    p1: scores.p1 - (winnerKey === 'p1' ? SCORING.WIN_POINTS : 0),
    p2: scores.p2 - (winnerKey === 'p2' ? SCORING.WIN_POINTS : 0),
  };

  const [step, setStep] = useState<RevealStep>('reading');
  const [display, setDisplay] = useState(preScores);

  useEffect(() => {
    if (!target) return;
    sfx('reveal');
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const wait = (ms: number) => new Promise<void>((r) => timers.push(setTimeout(r, ms)));

    void (async () => {
      // שלב הלימוד: מקריאים רק בערבית (אם מופעל), אחרת רק בעברית — בלי כפל שפות.
      await ttsManager.playWord(target.id, arabicOn ? LANG_AR : LANG_HE);
      if (cancelled) return;

      // מכניסים את שני הניקודים מהקצוות
      setStep('scores');
      await wait(650);
      if (cancelled) return;

      // +1 על המנצח
      if (winnerKey) sfx('correct');
      setDisplay(scores);
      setStep('plus');
      await wait(950);
      if (cancelled) return;

      // ורק עכשיו מופיע כפתור הסבב הבא
      setStep('done');
    })();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!target || !result) return null;

  /** לחיצה על מילה מקריאה אותה בשפה המתאימה. */
  const speak = (lang: Lang) => {
    void ttsManager.playWord(target.id, lang);
  };

  return (
    <Screen style={{ alignItems: 'center', justifyContent: 'center', gap: 18 }}>
      {/* יציאה מהמשחק — זמינה רק בסוף הסבב */}
      <div style={{ position: 'absolute', top: 'clamp(16px,3vw,40px)', insetInlineStart: 'clamp(16px,3vw,40px)' }}>
        <Button variant="ghost" icon="logout" onClick={exit}>
          יציאה מהמשחק
        </Button>
      </div>

      <div style={{ transform: 'scale(0.7)' }}>
        <TargetDisplay item={target} />
      </div>

      {/* המילה — ערבית למעלה (סגול), עברית למטה (שחור). לחיצה מקריאה בשפה המתאימה.
          מוסתרת למספרים כי הספרה כבר מוצגת ב-TargetDisplay. */}
      {target.categoryId !== 'numbers' && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {arabicOn && (
            <motion.button
              type="button"
              onClick={() => speak(LANG_AR)}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              dir="rtl"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(34px,6vw,64px)',
                fontWeight: 700,
                color: 'var(--c-primary)',
                padding: 0,
              }}
            >
              {arabicText(target.id, target.he)}
            </motion.button>
          )}
          <motion.button
            type="button"
            onClick={() => speak(LANG_HE)}
            whileTap={{ scale: 0.95 }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(26px,4.5vw,44px)',
              color: 'var(--c-ink)',
              padding: 0,
            }}
          >
            {target.he}
          </motion.button>
        </div>
      )}

      {/* ניקוד נכנס מהקצוות: ימין=כחול, שמאל=ירוק */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 760,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: 96,
        }}
      >
        <ScoreSide player={PLAYER1} step={step} score={display.p1} won={winnerKey === 'p1'} />
        <ScoreSide player={PLAYER2} step={step} score={display.p2} won={winnerKey === 'p2'} />
      </div>

      {/* כפתור הסבב הבא — רק אחרי שכל הרצף הסתיים */}
      <div style={{ minHeight: 64, display: 'grid', placeItems: 'center' }}>
        <AnimatePresence>
          {step === 'done' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <Button big icon="arrow_back" onClick={continueAfterReveal}>
                הסבב הבא
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Screen>
  );
}
