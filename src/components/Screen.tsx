import { motion } from 'motion/react';

interface ScreenProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

/** עוטף מסך עם אנימציית כניסה/יציאה אחידה ופריסה ממורכזת. */
export function Screen({ children, style }: ScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        padding: 'clamp(16px, 3vw, 40px)',
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}
