import { motion } from 'motion/react';

/** שם המשחק — כותרת עליונה ממורכזת. */
export function BrandTitle({ small }: { small?: boolean }) {
  return (
    <motion.h1
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{
        margin: 0,
        textAlign: 'center',
        fontFamily: 'var(--font-display)',
        fontSize: small ? 'clamp(26px, 4vw, 40px)' : 'clamp(44px, 9vw, 92px)',
        lineHeight: 1,
        letterSpacing: '0.5px',
        background: 'linear-gradient(120deg, var(--c-primary), var(--c-danger) 50%, var(--c-accent))',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        WebkitTextStroke: small ? '0' : '1px rgba(255,255,255,0.6)',
        filter: 'drop-shadow(0 6px 0 rgba(58,43,92,0.12))',
        direction: 'ltr',
      }}
    >
      Sound&nbsp;Match
    </motion.h1>
  );
}
