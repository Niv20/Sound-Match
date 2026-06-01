import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Screen } from '../components/Screen';
import { Button } from '../components/Button';
import { TargetDisplay } from '../components/TargetDisplay';
import { LANG_HE, LANG_AR, PLAYER1 } from '../config/constants';
import { useGameStore } from '../store/useGameStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { ttsManager } from '../audio/TtsManager';
import { arabicText } from '../data/arabic';
import { useSfx } from '../hooks/useSfx';

export function RevealScreen() {
  const sfx = useSfx();
  const result = useGameStore((s) => s.lastResult);
  const continueAfterReveal = useGameStore((s) => s.continueAfterReveal);
  const arabicOn = useSettingsStore((s) => s.arabic);

  const target = result?.target;

  useEffect(() => {
    if (!target) return;
    sfx('reveal');
    let cancelled = false;
    void (async () => {
      // משמיע ערבית (אם מופעל) ואז שוב עברית — שלב הלימוד
      if (arabicOn) {
        await ttsManager.playWord(target.id, LANG_AR);
        if (cancelled) return;
        await new Promise((r) => setTimeout(r, 350));
        if (cancelled) return;
      }
      await ttsManager.playWord(target.id, LANG_HE);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!target || !result) return null;

  const banner =
    result.reason === 'correct'
      ? {
          text: result.winner === PLAYER1 ? 'השחקן הכחול ניצח בסבב!' : 'השחקן האדום ניצח בסבב!',
          color: result.winner === PLAYER1 ? 'var(--c-player1)' : 'var(--c-player2)',
          icon: '🎉',
        }
      : { text: 'אף אחד לא הספיק בזמן!', color: 'var(--c-ink-soft)', icon: '⏰' };

  return (
    <Screen style={{ alignItems: 'center', justifyContent: 'center', gap: 18 }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          padding: '8px 22px',
          borderRadius: 'var(--r-pill)',
          background: banner.color,
          color: '#fff',
          fontWeight: 800,
          fontSize: 'clamp(18px,2.6vw,24px)',
        }}
      >
        {banner.icon} {banner.text}
      </motion.div>

      <div style={{ transform: 'scale(0.7)' }}>
        <TargetDisplay item={target} />
      </div>

      {/* המילה בעברית — מוסתרת למספרים כי הספרה כבר מוצגת ב-TargetDisplay */}
      {target.categoryId !== 'numbers' && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(34px,6vw,64px)', color: 'var(--c-ink)' }}>
            {target.he}
          </span>
          {arabicOn && (
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              dir="rtl"
              style={{ fontSize: 'clamp(26px,4.5vw,44px)', color: 'var(--c-primary)', fontWeight: 700 }}
            >
              {arabicText(target.id, target.he)}
            </motion.span>
          )}
        </div>
      )}

      <Button big icon="arrow_back" onClick={continueAfterReveal}>
        הסבב הבא
      </Button>
    </Screen>
  );
}
