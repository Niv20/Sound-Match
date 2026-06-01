import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Screen } from '../components/Screen';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { PlayerPanel } from '../components/PlayerPanel';
import { TargetDisplay } from '../components/TargetDisplay';
import { PLAYER1, PLAYER2 } from '../config/constants';
import { useGameStore } from '../store/useGameStore';
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

export function GameScreen() {
  useGameKeys();
  const startRound = useGameStore((s) => s.startRound);
  const exit = useGameStore((s) => s.exit);
  const press = useGameStore((s) => s.press);
  const phase = useGameStore((s) => s.phase);
  const target = useGameStore((s) => s.target);
  const scores = useGameStore((s) => s.scores);
  const blocked = useGameStore((s) => s.blocked);

  useEffect(() => {
    startRound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const listening = phase === 'distractors' || phase === 'opportunity';

  return (
    <Screen style={{ gap: 14 }}>
      {/* פאנלים + יציאה */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div onClick={() => press(PLAYER1)} style={{ cursor: 'pointer' }}>
          <PlayerPanel player={PLAYER1} score={scores.p1} blocked={blocked.p1} won={false} />
        </div>
        <Button variant="ghost" icon="logout" onClick={exit} ariaLabel="יציאה" />
        <div onClick={() => press(PLAYER2)} style={{ cursor: 'pointer' }}>
          <PlayerPanel player={PLAYER2} score={scores.p2} blocked={blocked.p2} won={false} />
        </div>
      </div>

      {/* מטרה */}
      <div style={{ flex: 1, display: 'grid', placeItems: 'center' }}>
        {target && <TargetDisplay item={target} />}
      </div>

      {/* חיווי האזנה */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minHeight: 70 }}>
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
