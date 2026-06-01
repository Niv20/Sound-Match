import { motion } from 'motion/react';
import { Screen } from '../components/Screen';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { CATEGORY_BY_ID } from '../config/categories.config';
import { imageItems } from '../data/vocabulary';
import { useNavStore } from '../store/useNavStore';
import { useScreenMusic } from '../hooks/useScreenMusic';
import { useSfx } from '../hooks/useSfx';

export function AnimalSubgroupScreen() {
  useScreenMusic('instructions');
  const sfx = useSfx();
  const cat = CATEGORY_BY_ID['animals'];
  const selectSubgroup = useNavStore((s) => s.selectSubgroup);
  const openCategories = useNavStore((s) => s.openCategories);

  return (
    <Screen>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          maxWidth: 760,
          width: '100%',
          margin: '0 auto',
          flex: 1,
          minHeight: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button variant="ghost" icon="arrow_forward" onClick={openCategories} ariaLabel="חזרה" />
          <Icon name={cat.icon} size={34} style={{ color: cat.color }} />
          <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,3vw,34px)' }}>
            איזה סוג חיות?
          </h2>
        </div>

      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 'clamp(12px,2vw,24px)',
          alignContent: 'center',
        }}
      >
        {cat.subgroups!.map((sg, i) => {
          const count = imageItems('animals', sg.id).length;
          return (
            <motion.button
              key={sg.id}
              type="button"
              onClick={() => {
                sfx('category_open');
                selectSubgroup(sg.id);
              }}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 20, delay: i * 0.06 }}
              whileHover={{ y: -6, scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10,
                padding: 'clamp(18px,3vw,34px)',
                borderRadius: 'var(--r-lg)',
                background: `linear-gradient(160deg, ${cat.color}, ${cat.color}cc)`,
                color: '#fff',
                boxShadow: 'var(--sh-md)',
                cursor: 'pointer',
              }}
            >
              <Icon name={sg.icon} size={56} />
              <span style={{ fontWeight: 700, fontSize: 'clamp(18px,2.6vw,26px)' }}>{sg.he}</span>
              <span style={{ opacity: 0.85, fontWeight: 600 }}>{count} חיות</span>
            </motion.button>
          );
        })}
      </div>
      </div>
    </Screen>
  );
}
