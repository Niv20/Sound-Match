import { motion } from 'motion/react';
import { useSfx } from '../hooks/useSfx';

interface Props {
  on: boolean;
  onChange: (on: boolean) => void;
  ariaLabel?: string;
}

/** מתג הדלקה/כיבוי. */
export function Toggle({ on, onChange, ariaLabel }: Props) {
  const sfx = useSfx();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel}
      onClick={() => {
        sfx(on ? 'toggle_off' : 'toggle_on');
        onChange(!on);
      }}
      style={{
        width: 64,
        height: 36,
        borderRadius: 'var(--r-pill)',
        background: on ? 'var(--c-accent-2)' : 'rgba(122,108,153,0.3)',
        padding: 4,
        display: 'flex',
        justifyContent: on ? 'flex-end' : 'flex-start',
        boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.15)',
        transition: 'background var(--t-med)',
      }}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 600, damping: 30 }}
        style={{ width: 28, height: 28, borderRadius: '50%', background: '#fff', boxShadow: 'var(--sh-sm)' }}
      />
    </button>
  );
}
