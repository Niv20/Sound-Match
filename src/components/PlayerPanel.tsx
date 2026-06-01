import NumberFlow from '@number-flow/react';
import { motion } from 'motion/react';
import { Icon } from './Icon';
import { KEY_P1, KEY_P2, PLAYER1, type PlayerId } from '../config/constants';

interface Props {
  player: PlayerId;
  score: number;
  blocked: boolean;
  won: boolean;
}

/** פאנל שחקן: צבע, מקש, ניקוד מונפש, ומצב (נפסל/ניצח). */
export function PlayerPanel({ player, score, blocked, won }: Props) {
  const isP1 = player === PLAYER1;
  const color = isP1 ? 'var(--c-player1)' : 'var(--c-player2)';
  const key = (isP1 ? KEY_P1 : KEY_P2).toUpperCase();

  return (
    <motion.div
      animate={{
        scale: won ? 1.06 : 1,
        opacity: blocked ? 0.5 : 1,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 18 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        padding: '12px 22px',
        borderRadius: 'var(--r-lg)',
        background: color,
        color: '#fff',
        boxShadow: won ? `0 0 0 6px ${isP1 ? '#9dc0ff' : '#ffb3c0'}, var(--sh-md)` : 'var(--sh-md)',
        minWidth: 120,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            display: 'grid',
            placeItems: 'center',
            width: 30,
            height: 30,
            borderRadius: 8,
            background: 'rgba(255,255,255,0.25)',
            fontWeight: 900,
            fontSize: 18,
          }}
        >
          {key}
        </span>
        {blocked && <Icon name="block" size={22} />}
        {won && <Icon name="emoji_events" size={24} />}
      </div>
      <NumberFlow value={score} style={{ fontFamily: 'var(--font-display)', fontSize: 48, lineHeight: 1 }} />
    </motion.div>
  );
}
