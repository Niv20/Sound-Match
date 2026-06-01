import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Screen } from '../components/Screen';
import { TargetDisplay } from '../components/TargetDisplay';
import { PLAYER1, PLAYER2, SIDES, type PlayerId } from '../config/constants';
import { useGameStore } from '../store/useGameStore';
import type { SideFx } from '../store/useGameStore';
import { useGameKeys } from '../hooks/useGameKeys';

/** הבזק גרדיאנט על חצי המסך של צד מסוים: צבע הצד לתשובה נכונה, אדום לטעות. */
function SideFlash({ player, fx }: { player: PlayerId; fx: Exclude<SideFx, null> }) {
  const side = SIDES[player];
  const color = fx === 'correct' ? side.color : 'var(--c-danger)';
  const dir = side.edge === 'right' ? 'left' : 'right';
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={fx === 'correct' ? { opacity: [0, 0.95, 0.7] } : { opacity: 0.62 }}
      exit={{ opacity: 0 }}
      transition={fx === 'correct' ? { duration: 0.9, times: [0, 0.3, 1] } : { duration: 0.25 }}
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        [side.edge]: 0,
        width: '60%',
        background: `linear-gradient(to ${dir}, ${color}, transparent 82%)`,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}

export function GameScreen() {
  useGameKeys();
  const startRound = useGameStore((s) => s.startRound);
  const press = useGameStore((s) => s.press);
  const target = useGameStore((s) => s.target);
  const flash = useGameStore((s) => s.flash);

  useEffect(() => {
    startRound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Screen style={{ alignItems: 'center', justifyContent: 'center' }}>
      {/* הבזקי הצדדים (רקע) */}
      <AnimatePresence>
        {flash.p1 && <SideFlash key="fx-p1" player={PLAYER1} fx={flash.p1} />}
        {flash.p2 && <SideFlash key="fx-p2" player={PLAYER2} fx={flash.p2} />}
      </AnimatePresence>

      {/* אזורי לחיצה שקופים לכל צד (למגע) — ימין=שחקן 1, שמאל=שחקן 2.
          במהלך הסבב לא מציגים פאנלים צבעוניים למעלה. */}
      <div
        onClick={() => press(PLAYER1)}
        style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '50%', zIndex: 1, cursor: 'pointer' }}
      />
      <div
        onClick={() => press(PLAYER2)}
        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '50%', zIndex: 1, cursor: 'pointer' }}
      />

      {/* מטרה */}
      <div style={{ position: 'relative', zIndex: 2, pointerEvents: 'none' }}>
        {target && <TargetDisplay item={target} />}
      </div>
    </Screen>
  );
}
