import { useEffect } from 'react';
import NumberFlow from '@number-flow/react';
import { motion } from 'motion/react';
import { Screen } from '../components/Screen';
import { Button } from '../components/Button';
import { PLAYER1, PLAYER2, SIDES } from '../config/constants';
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
  const winner = p1Won ? PLAYER1 : PLAYER2;
  const color = SIDES[winner].color;
  const name = `השחקן ה${SIDES[winner].colorWord}`;

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
        animate={{ scale: 1, rotate: 0, y: [0, -12, 0] }}
        transition={{
          scale: { type: 'spring', stiffness: 200, damping: 12 },
          rotate: { type: 'spring', stiffness: 200, damping: 12 },
          y: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
        }}
        style={{
          width: 'clamp(170px, 28vw, 240px)',
          height: 'clamp(170px, 28vw, 240px)',
          position: 'relative',
        }}
      >
        <img
          src="/images/ui/trophy.webp"
          alt=""
          // שוליים בתוך הקופסה כדי שהצל ייכנס בתוכם ולא ייחתך (יותר למטה — הצל יורד)
          style={{
            position: 'absolute',
            top: '3%',
            left: '8%',
            width: '84%',
            height: '85%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 22px 26px rgba(58,43,92,0.4))',
          }}
        />
      </motion.div>

      <h1
        style={{
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(34px,6vw,64px)',
          color,
        }}
      >
        <motion.img
          src="/images/ui/crown.webp"
          alt=""
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: [-8, 8, -8] }}
          transition={{
            scale: { type: 'spring', stiffness: 220, damping: 14, delay: 0.2 },
            rotate: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
          }}
          style={{
            width: 'clamp(44px, 7vw, 68px)',
            height: 'auto',
            filter: 'drop-shadow(0 6px 8px rgba(58,43,92,0.35))',
          }}
        />
        {name} ניצח!
      </h1>

      <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
        <div style={{ textAlign: 'center', color: SIDES[PLAYER1].color }}>
          <NumberFlow value={scores.p1} style={{ fontFamily: 'var(--font-display)', fontSize: 64 }} />
          <div style={{ fontWeight: 700 }}>{SIDES[PLAYER1].colorWord}</div>
        </div>
        <span style={{ fontSize: 40, color: 'var(--c-ink-soft)' }}>:</span>
        <div style={{ textAlign: 'center', color: SIDES[PLAYER2].color }}>
          <NumberFlow value={scores.p2} style={{ fontFamily: 'var(--font-display)', fontSize: 64 }} />
          <div style={{ fontWeight: 700 }}>{SIDES[PLAYER2].colorWord}</div>
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
