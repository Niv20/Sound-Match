import { motion } from 'motion/react';
import type { VocabItem } from '../data/types';

/** הצגת "מילת המטרה" במרכז המסך — תמונה תלת-ממדית / צבע / מספר. */
export function TargetDisplay({ item }: { item: VocabItem }) {
  const isColor = !!item.color;
  const isNumber = item.value !== undefined;

  return (
    <motion.div
      key={item.id}
      initial={{ scale: 0.4, opacity: 0, rotate: -8 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 16 }}
      style={{
        width: 'min(46vh, 60vw)',
        height: 'min(46vh, 60vw)',
        position: 'relative',
      }}
    >
      {isColor ? (
        <div
          style={{
            position: 'absolute',
            top: '11%',
            left: '11%',
            width: '78%',
            height: '78%',
            borderRadius: '50%',
            background: item.color,
            boxShadow: 'var(--sh-lg)',
            border: item.color === '#ffffff' ? '4px solid var(--c-surface-soft)' : 'none',
          }}
        />
      ) : isNumber ? (
        <span
          style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            fontFamily: 'var(--font-display)',
            fontSize: 'min(40vh, 52vw)',
            lineHeight: 1,
            color: 'var(--c-primary)',
            filter: 'drop-shadow(0 12px 0 rgba(58,43,92,0.18))',
          }}
        >
          {item.he}
        </span>
      ) : (
        <img
          src={item.image}
          alt=""
          // התמונה לא נוגעת בקצוות הקופסה — שומרים שוליים שהצל ייכנס בתוכם
          // ולא ייחתך. יותר מקום למטה כי הצל נופל כלפי מטה.
          style={{
            position: 'absolute',
            top: '4%',
            left: '6%',
            width: '88%',
            height: '84%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 22px 26px rgba(58,43,92,0.4))',
          }}
        />
      )}
    </motion.div>
  );
}
