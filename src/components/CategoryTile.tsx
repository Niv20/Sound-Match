import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from './Icon';
import type { CategoryDef } from '../config/categories.config';
import { imageItems } from '../data/vocabulary';
import { COLORS } from '../data/colors';

/** בונה את "הפנים" המתחלפות של אריח בריחוף. */
function buildFaces(cat: CategoryDef): React.ReactNode[] {
  if (cat.type === 'colors') {
    return COLORS.map((c) => (
      <div key={c.id} style={{ position: 'absolute', inset: 0, background: c.color }} />
    ));
  }
  if (cat.type === 'numbers') {
    return ['1', '2', '3', '4', '5', '7', '9'].map((n) => (
      <div
        key={n}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          fontFamily: 'var(--font-display)',
          fontSize: '52%',
          color: '#fff',
        }}
      >
        {n}
      </div>
    ));
  }
  const imgs = imageItems(cat.id).slice(0, 10);
  return imgs.map((it) => (
    <img
      key={it.id}
      src={it.image}
      alt=""
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        padding: '10%',
        filter: 'drop-shadow(0 8px 10px rgba(58,43,92,0.25))',
      }}
    />
  ));
}

interface Props {
  cat: CategoryDef;
  index: number;
  onSelect: () => void;
}

export function CategoryTile({ cat, index, onSelect }: Props) {
  const [faces] = useState(() => buildFaces(cat));
  const [hover, setHover] = useState(false);
  const [face, setFace] = useState(0);

  useEffect(() => {
    if (!hover || faces.length <= 1) return;
    const t = setInterval(() => setFace((f) => (f + 1) % faces.length), 700);
    return () => clearInterval(t);
  }, [hover, faces.length]);

  useEffect(() => {
    if (!hover) setFace(0);
  }, [hover]);

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      initial={{ opacity: 0, y: 24, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 20, delay: index * 0.05 }}
      whileHover={{ y: -8, scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      style={{
        position: 'relative',
        aspectRatio: '1 / 1',
        borderRadius: 'var(--r-lg)',
        background: `linear-gradient(160deg, ${cat.color}, ${cat.color}cc)`,
        boxShadow: 'var(--sh-md)',
        overflow: 'hidden',
        cursor: 'pointer',
        fontSize: 'clamp(40px, 8vw, 90px)',
      }}
    >
      {/* שכבת הפנים המתחלפות */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <AnimatePresence>
          <motion.div
            key={face}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.5 }}
            style={{ position: 'absolute', inset: 0 }}
          >
            {faces[face]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* שם הקטגוריה + אייקון */}
      <div
        style={{
          position: 'absolute',
          insetInline: 0,
          bottom: 0,
          padding: '14px 12px 12px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.45), transparent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          color: '#fff',
        }}
      >
        <Icon name={cat.icon} size={26} />
        <span style={{ fontWeight: 700, fontSize: 'clamp(15px, 2.2vw, 22px)' }}>{cat.he}</span>
      </div>
    </motion.button>
  );
}
