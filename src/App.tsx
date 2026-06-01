import { useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { SCREENS } from './config/constants';
import { CATEGORIES } from './config/categories.config';
import { imageItems } from './data/vocabulary';
import { useNavStore } from './store/useNavStore';
import { useAudioSettingsSync } from './hooks/useAudioSettingsSync';
import { audioEngine } from './audio/AudioEngine';
import { preloadBoot, preloadIdle } from './audio/preloader';
import { HomeScreen } from './screens/HomeScreen';
import { CategoryGridScreen } from './screens/CategoryGridScreen';

/** מסך זמני עד שייבנה. */
function Placeholder({ name }: { name: string }) {
  const goHome = useNavStore((s) => s.goHome);
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', gap: 12 }}>
      <p style={{ color: 'var(--c-ink-soft)' }}>מסך "{name}" בבנייה…</p>
      <button onClick={goHome} style={{ color: 'var(--c-primary)', fontWeight: 700 }}>
        חזרה לבית
      </button>
    </div>
  );
}

function CurrentScreen() {
  const screen = useNavStore((s) => s.screen);
  switch (screen) {
    case SCREENS.HOME:
      return <HomeScreen key="home" />;
    case SCREENS.CATEGORIES:
      return <CategoryGridScreen key="categories" />;
    default:
      return <Placeholder key={screen} name={screen} />;
  }
}

export function App() {
  useAudioSettingsSync();

  // טעינה מקדימה + פתיחת הקשר האודיו במחווה ראשונה
  useEffect(() => {
    void preloadBoot();
    const thumbs = CATEGORIES.flatMap((c) => imageItems(c.id).slice(0, 1).map((it) => it.image));
    preloadIdle(thumbs);

    const unlock = () => void audioEngine.resume();
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  return (
    <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
      <AnimatePresence mode="wait">
        <CurrentScreen />
      </AnimatePresence>
    </div>
  );
}
