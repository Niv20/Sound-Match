import { motion } from 'motion/react';
import { Icon } from './Icon';
import { stripNikud } from '../utils/text';
import type { VocabItem } from '../data/types';

interface Props {
  item: VocabItem;
  active: boolean;
  onToggle: () => void;
}

/** כרטיס פריט במסך הבחירה (סייר קבצים). כבוי = עמום. */
export function ItemCard({ item, active, onToggle }: Props) {
  const isColor = !!item.color;
  const lightColor = item.color === '#ffffff';

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      whileHover={{ y: -4, scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 24 }}
      animate={{ opacity: active ? 1 : 0.4, filter: active ? 'grayscale(0)' : 'grayscale(0.85)' }}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        padding: 10,
        borderRadius: 'var(--r-md)',
        background: 'var(--c-surface)',
        boxShadow: active ? 'var(--sh-sm)' : 'none',
        border: '3px solid',
        borderColor: active ? 'var(--c-accent-2)' : 'transparent',
        cursor: 'pointer',
      }}
    >
      {/* תצוגה: צבע או תמונה */}
      <div
        style={{
          width: '100%',
          aspectRatio: '1 / 1',
          borderRadius: 'var(--r-sm)',
          position: 'relative',
          overflow: 'hidden',
          background: isColor ? item.color : 'var(--c-surface-soft)',
          border: lightColor ? '2px solid var(--c-surface-soft)' : 'none',
        }}
      >
        {!isColor && (
          <img
            src={item.image}
            alt={stripNikud(item.he)}
            decoding="async"
            draggable={false}
            style={{
              position: 'absolute',
              top: '10%',
              left: '10%',
              width: '80%',
              height: '80%',
              objectFit: 'contain',
            }}
          />
        )}
      </div>

      <span style={{ fontWeight: 700, fontSize: 'clamp(13px,1.6vw,17px)', color: 'var(--c-ink)' }}>
        {item.he}
      </span>

      {/* סימון מצב — רק כשנבחר מציגים V ירוק */}
      {active && (
        <div
          style={{
            position: 'absolute',
            top: 6,
            insetInlineEnd: 6,
            width: 26,
            height: 26,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            background: 'var(--c-accent-2)',
            color: '#fff',
          }}
        >
          <Icon name="check" size={18} />
        </div>
      )}
    </motion.button>
  );
}
