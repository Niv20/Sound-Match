import { motion } from 'motion/react';
import { Icon } from './Icon';
import { useSfx } from '../hooks/useSfx';

type Variant = 'primary' | 'accent' | 'ghost' | 'soft';

interface ButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  variant?: Variant;
  icon?: string;
  iconRight?: string;
  disabled?: boolean;
  big?: boolean;
  silent?: boolean; // אל תשמיע אפקט לחיצה
  style?: React.CSSProperties;
  ariaLabel?: string;
}

const VARIANT_BG: Record<Variant, string> = {
  primary: 'var(--c-primary)',
  accent: 'var(--c-accent)',
  ghost: 'transparent',
  soft: 'var(--c-surface)',
};
const VARIANT_FG: Record<Variant, string> = {
  primary: '#fff',
  accent: 'var(--c-ink)',
  ghost: 'var(--c-ink)',
  soft: 'var(--c-ink)',
};

export function Button({
  children,
  onClick,
  variant = 'primary',
  icon,
  iconRight,
  disabled,
  big,
  silent,
  style,
  ariaLabel,
}: ButtonProps) {
  const sfx = useSfx();
  const fontSize = big ? 26 : 18;
  const pad = big ? '16px 30px' : '11px 20px';

  return (
    <motion.button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        if (!silent) sfx('ui_click');
        onClick?.();
      }}
      onHoverStart={() => !disabled && !silent && sfx('ui_hover')}
      whileHover={disabled ? undefined : { y: -3, scale: 1.03 }}
      whileTap={disabled ? undefined : { y: 2, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        padding: pad,
        fontSize,
        fontWeight: 700,
        fontFamily: 'var(--font-body)',
        color: VARIANT_FG[variant],
        background: VARIANT_BG[variant],
        borderRadius: 'var(--r-pill)',
        boxShadow: variant === 'ghost' ? 'none' : 'var(--sh-md)',
        border: variant === 'soft' ? '3px solid var(--c-surface-soft)' : 'none',
        opacity: disabled ? 0.45 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style,
      }}
    >
      {icon && <Icon name={icon} size={fontSize + 6} />}
      {children}
      {iconRight && <Icon name={iconRight} size={fontSize + 6} />}
    </motion.button>
  );
}
