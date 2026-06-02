import { motion } from 'motion/react';
import { Screen } from '../components/Screen';
import { BrandTitle } from '../components/BrandTitle';
import { Icon } from '../components/Icon';

interface LoadingScreenProps {
  loaded: number;
  total: number;
}

/** מסך טעינה חוסם — מחכה שכל התמונות והמוזיקה יורדו לזיכרון. */
export function LoadingScreen({ loaded, total }: LoadingScreenProps) {
  const pct = total > 0 ? Math.round((loaded / total) * 100) : 0;

  return (
    <Screen style={{ justifyContent: 'center', alignItems: 'center', gap: 'clamp(20px, 5vh, 48px)' }}>
      <BrandTitle />

      <div style={{ display: 'grid', gap: 24, width: '100%', maxWidth: 420, placeItems: 'center' }}>
        {/* תו מוזיקלי פועם בתוך עיגול שגדל ומתכווץ בקצב */}
        <motion.div
          animate={{ scale: [1, 1.14, 1] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: 'clamp(96px, 22vw, 132px)',
            height: 'clamp(96px, 22vw, 132px)',
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            background: 'linear-gradient(135deg, var(--c-player1), var(--c-player2))',
            boxShadow: '0 10px 0 rgba(58,43,92,0.16), 0 18px 32px rgba(58,43,92,0.22)',
          }}
        >
          <motion.div
            animate={{ rotate: [-6, 6, -6] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
            style={{ display: 'grid', placeItems: 'center' }}
          >
            <Icon name="music_note" size={64} style={{ color: '#fff' }} />
          </motion.div>
        </motion.div>

        <p style={{ margin: 0, color: 'var(--c-ink-soft)', fontSize: 'clamp(16px, 2.4vw, 22px)', fontWeight: 700 }}>
          נא להמתין, טוען תמונות וצלילים…
        </p>

        <span
          style={{
            color: 'var(--c-ink)',
            fontVariantNumeric: 'tabular-nums',
            fontWeight: 800,
            fontSize: 'clamp(22px, 3.4vw, 30px)',
          }}
        >
          {pct}%
        </span>
      </div>
    </Screen>
  );
}
