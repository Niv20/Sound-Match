import NumberFlow from '@number-flow/react';
import { motion } from 'motion/react';
import { Icon } from './Icon';
import { SIDES, type PlayerId } from '../config/constants';

interface Props {
  player: PlayerId;
  score: number;
  blocked: boolean;
  won: boolean;
  /** האם להציג את הניקוד. במהלך הסבב מסתירים אותו. */
  showScore?: boolean;
}

/** פאנל שחקן: מזוהה לפי צבע הצד בלבד (ללא אות), עם ניקוד מונפש ומצב (נפסל/ניצח). */
export function PlayerPanel({ player, score, blocked, won, showScore = true }: Props) {
  const side = SIDES[player];
  const color = side.color;

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
        justifyContent: 'center',
        gap: 4,
        padding: showScore ? '12px 26px' : 0,
        width: showScore ? undefined : 96,
        height: showScore ? undefined : 56,
        minWidth: showScore ? 120 : undefined,
        borderRadius: 'var(--r-lg)',
        background: color,
        color: '#fff',
        boxShadow: won ? `0 0 0 6px ${side.glow}, var(--sh-md)` : 'var(--sh-md)',
      }}
    >
      {(blocked || won) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {blocked && <Icon name="block" size={22} />}
          {won && <Icon name="emoji_events" size={24} />}
        </div>
      )}
      {showScore && (
        <NumberFlow value={score} style={{ fontFamily: 'var(--font-display)', fontSize: 48, lineHeight: 1 }} />
      )}
    </motion.div>
  );
}
