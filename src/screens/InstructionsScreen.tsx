import { motion } from 'motion/react';
import { Screen } from '../components/Screen';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { PLAYER1, PLAYER2, SIDES } from '../config/constants';
import { useNavStore } from '../store/useNavStore';
import { useScreenMusic } from '../hooks/useScreenMusic';

const STEPS = [
  { icon: 'image', title: 'מופיעה תמונה', text: 'בתחילת כל סבב מופיעה במרכז תמונה — זו "מילת המטרה".' },
  { icon: 'hearing', title: 'מקשיבים', text: 'המערכת מקריאה מילים. הראשונות שגויות בכוונה — צריך להתאפק!' },
  { icon: 'bolt', title: 'לוחצים בזמן', text: 'כששומעים את המילה שמתאימה לתמונה — הראשון שלוחץ מנצח בסבב.' },
  { icon: 'translate', title: 'לומדים', text: 'בסוף הסבב נחשפת המילה בערבית ומושמע התרגום.' },
];

export function InstructionsScreen() {
  useScreenMusic('instructions');
  const back = useNavStore((s) => s.back);

  return (
    <Screen style={{ gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Button variant="ghost" icon="arrow_forward" onClick={back} ariaLabel="חזרה" />
        <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,4vw,36px)' }}>איך משחקים?</h2>
      </div>

      {/* מקשי השחקנים */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 30 }}>
        {[PLAYER1, PLAYER2].map((player) => {
          const side = SIDES[player];
          return (
            <div key={player} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: side.color,
                  color: '#fff',
                  display: 'grid',
                  placeItems: 'center',
                  fontFamily: 'var(--font-display)',
                  fontSize: 34,
                  boxShadow: 'var(--sh-md)',
                }}
              >
                {side.symbol.toUpperCase()}
              </div>
              <span style={{ fontWeight: 700, color: side.color }}>שחקן {side.colorWord}</span>
            </div>
          );
        })}
      </div>

      {/* שלבים */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 14,
          maxWidth: 560,
          margin: '0 auto',
          width: '100%',
        }}
      >
        {STEPS.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            style={{
              display: 'flex',
              gap: 12,
              padding: 16,
              background: 'var(--c-surface)',
              borderRadius: 'var(--r-md)',
              boxShadow: 'var(--sh-sm)',
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                flexShrink: 0,
                borderRadius: 12,
                background: 'var(--c-surface-soft)',
                display: 'grid',
                placeItems: 'center',
                color: 'var(--c-primary)',
              }}
            >
              <Icon name={step.icon} size={26} />
            </div>
            <div>
              <div style={{ fontWeight: 800, marginBottom: 2 }}>
                {i + 1}. {step.title}
              </div>
              <div style={{ color: 'var(--c-ink-soft)', fontSize: 15 }}>{step.text}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <p style={{ textAlign: 'center', color: 'var(--c-ink-soft)', maxWidth: 700, margin: '0 auto' }}>
        טיפ: אפשר לכבות מילים שלא רוצים בכל קטגוריה לפני שמתחילים, ולכוונן יעד ניצחון וניקוד שלילי בהגדרות.
      </p>
    </Screen>
  );
}
