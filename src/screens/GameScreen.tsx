import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Screen } from '../components/Screen';
import { Icon } from '../components/Icon';
import { PlayerPanel } from '../components/PlayerPanel';
import { TargetDisplay } from '../components/TargetDisplay';
import { PLAYER1, PLAYER2, SIDES, type PlayerId } from '../config/constants';
import { useGameStore } from '../store/useGameStore';
import type { SideFx } from '../store/useGameStore';
import { useGameKeys } from '../hooks/useGameKeys';

function ListeningIndicator({ active }: { active: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 36 }}>
      <Icon name={active ? 'hearing' : 'hourglass_top'} size={26} style={{ color: 'var(--c-ink-soft)' }} />
      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.span
            key={i}
            animate={active ? { scaleY: [0.4, 1.4, 0.4] } : { scaleY: 0.4 }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.12 }}
            style={{ width: 6, height: 22, borderRadius: 3, background: 'var(--c-primary)', display: 'block' }}
          />
        ))}
      </div>
    </div>
  );
}

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
  const phase = useGameStore((s) => s.phase);
  const target = useGameStore((s) => s.target);
  const blocked = useGameStore((s) => s.blocked);
  const flash = useGameStore((s) => s.flash);

  useEffect(() => {
    startRound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const listening = phase === 'distractors' || phase === 'opportunity';

  return (
    <Screen style={{ gap: 14 }}>
      {/* הבזקי הצדדים (רקע) */}
      <AnimatePresence>
        {flash.p1 && <SideFlash key="fx-p1" player={PLAYER1} fx={flash.p1} />}
        {flash.p2 && <SideFlash key="fx-p2" player={PLAYER2} fx={flash.p2} />}
      </AnimatePresence>

      {/* מחווני הצדדים (לפי צבע בלבד, ללא ניקוד במהלך הסבב). אין יציאה באמצע סבב. */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        <div onClick={() => press(PLAYER1)} style={{ cursor: 'pointer' }}>
          <PlayerPanel player={PLAYER1} score={0} blocked={blocked.p1} won={false} showScore={false} />
        </div>
        <div onClick={() => press(PLAYER2)} style={{ cursor: 'pointer' }}>
          <PlayerPanel player={PLAYER2} score={0} blocked={blocked.p2} won={false} showScore={false} />
        </div>
      </div>

      {/* מטרה */}
      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'grid', placeItems: 'center' }}>
        {target && <TargetDisplay item={target} />}
      </div>

      {/* חיווי האזנה */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          minHeight: 70,
        }}
      >
        <ListeningIndicator active={listening} />
        <span style={{ color: 'var(--c-ink-soft)', fontWeight: 700 }}>
          {phase === 'opportunity'
            ? 'עכשיו! לחצו אם זו המילה הנכונה'
            : 'האזינו… לחצו רק כשתשמעו את המילה הנכונה'}
        </span>
      </div>
    </Screen>
  );
}
