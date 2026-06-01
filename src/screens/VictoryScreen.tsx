import { useEffect } from 'react';
import NumberFlow from '@number-flow/react';
import { motion } from 'motion/react';
import { Screen } from '../components/Screen';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { useGameStore } from '../store/useGameStore';
import { useNavStore } from '../store/useNavStore';
import { musicManager } from '../audio/MusicManager';
import { useSfx } from '../hooks/useSfx';

const CONFETTI = ['#7c5cff', '#ffc83d', '#36d399', '#ff5470', '#3b82f6', '#ff8c1a'];

export function VictoryScreen() {
  const sfx = useSfx();
  const scores = useGameStore((s) => s.scores);
  const exit = useGameStore((s) => s.exit);
  const openCategories = useNavStore((s) => s.openCategories);

  const p1Won = scores.p1 >= scores.p2;
  const color = p1Won ? 'var(--c-player1)' : 'var(--c-player2)';
  const name = p1Won ? 'השחקן הכחול' : 'השחקן האדום';

  useEffect(() => {
    sfx('victory');
    musicManager.stopAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Screen style={{ alignItems: 'center', justifyContent: 'center', gap: 22 }}>
      {/* קונפטי */}
      {Array.from({ length: 28 }).map((_, i) => (
        <motion.span
          key={i}
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: '110vh', opacity: [0, 1, 1, 0], rotate: 360 }}
          transition={{ duration: 2.4 + (i % 5) * 0.4, repeat: Infinity, delay: (i % 7) * 0.2 }}
          style={{
            position: 'absolute',
            top: 0,
            left: `${(i * 37) % 100}%`,
            width: 12,
            height: 12,
            borderRadius: 3,
            background: CONFETTI[i % CONFETTI.length],
          }}
        />
      ))}

      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
      >
        <Icon name="crown" size={120} style={{ color: 'var(--c-accent)' }} />
      </motion.div>

      <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 'clamp(34px,6vw,64px)', color }}>
        {name} ניצח! 🏆
      </h1>

      <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--c-player1)' }}>
          <NumberFlow value={scores.p1} style={{ fontFamily: 'var(--font-display)', fontSize: 64 }} />
          <div style={{ fontWeight: 700 }}>כחול</div>
        </div>
        <span style={{ fontSize: 40, color: 'var(--c-ink-soft)' }}>:</span>
        <div style={{ textAlign: 'center', color: 'var(--c-player2)' }}>
          <NumberFlow value={scores.p2} style={{ fontFamily: 'var(--font-display)', fontSize: 64 }} />
          <div style={{ fontWeight: 700 }}>אדום</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 14 }}>
        <Button big icon="replay" onClick={openCategories}>
          משחק חדש
        </Button>
        <Button variant="soft" big icon="home" onClick={exit}>
          בית
        </Button>
      </div>
    </Screen>
  );
}
