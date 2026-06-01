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
import { AnimalSubgroupScreen } from './screens/AnimalSubgroupScreen';
import { CategoryItemsScreen } from './screens/CategoryItemsScreen';
import { NumbersRangeScreen } from './screens/NumbersRangeScreen';
import { GameScreen } from './screens/GameScreen';
import { RevealScreen } from './screens/RevealScreen';
import { VictoryScreen } from './screens/VictoryScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { InstructionsScreen } from './screens/InstructionsScreen';

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
    case SCREENS.ANIMAL_SUBGROUP:
      return <AnimalSubgroupScreen key="animalSubgroup" />;
    case SCREENS.CATEGORY_ITEMS:
      return <CategoryItemsScreen key="categoryItems" />;
    case SCREENS.NUMBERS_RANGE:
      return <NumbersRangeScreen key="numbersRange" />;
    case SCREENS.GAME:
      return <GameScreen key="game" />;
    case SCREENS.REVEAL:
      return <RevealScreen key="reveal" />;
    case SCREENS.VICTORY:
      return <VictoryScreen key="victory" />;
    case SCREENS.SETTINGS:
      return <SettingsScreen key="settings" />;
    case SCREENS.INSTRUCTIONS:
      return <InstructionsScreen key="instructions" />;
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
