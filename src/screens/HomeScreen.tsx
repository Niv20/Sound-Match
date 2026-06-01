import { motion } from 'motion/react';
import { Screen } from '../components/Screen';
import { BrandTitle } from '../components/BrandTitle';
import { Button } from '../components/Button';
import { useNavStore } from '../store/useNavStore';
import { useScreenMusic } from '../hooks/useScreenMusic';

export function HomeScreen() {
  useScreenMusic('home');
  const openCategories = useNavStore((s) => s.openCategories);
  const openInstructions = useNavStore((s) => s.openInstructions);
  const openSettings = useNavStore((s) => s.openSettings);

  return (
    <Screen style={{ justifyContent: 'space-between', alignItems: 'center' }}>
      <BrandTitle />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
      >
        <Button big icon="play_circle" onClick={openCategories} style={{ fontSize: 'clamp(24px,4vw,34px)' }}>
          התחל
        </Button>
      </motion.div>

      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: 760 }}>
        <Button variant="soft" icon="menu_book" onClick={openInstructions}>
          הוראות
        </Button>
        <Button variant="soft" icon="settings" onClick={openSettings}>
          הגדרות
        </Button>
      </div>
    </Screen>
  );
}
