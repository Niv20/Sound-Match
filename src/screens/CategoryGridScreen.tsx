import { Screen } from '../components/Screen';
import { BrandTitle } from '../components/BrandTitle';
import { Button } from '../components/Button';
import { CategoryTile } from '../components/CategoryTile';
import { CATEGORIES } from '../config/categories.config';
import { useNavStore } from '../store/useNavStore';
import { useScreenMusic } from '../hooks/useScreenMusic';
import { useSfx } from '../hooks/useSfx';

export function CategoryGridScreen() {
  useScreenMusic('instructions'); // שיר 2 — מסך אחרי "התחל"
  const selectCategory = useNavStore((s) => s.selectCategory);
  const goHome = useNavStore((s) => s.goHome);
  const sfx = useSfx();

  return (
    <Screen style={{ gap: 'clamp(14px, 2.5vh, 28px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', insetInlineStart: 0 }}>
          <Button variant="ghost" icon="arrow_forward" onClick={goHome} ariaLabel="חזרה" />
        </div>
        <BrandTitle small />
      </div>

      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 'clamp(10px, 1.8vw, 22px)',
          alignContent: 'center',
          margin: '0 auto',
          width: '100%',
          maxWidth: 1100,
        }}
        className="category-grid"
      >
        {CATEGORIES.map((cat, i) => (
          <CategoryTile
            key={cat.id}
            cat={cat}
            index={i}
            onSelect={() => {
              sfx('category_open');
              selectCategory(cat.id);
            }}
          />
        ))}
      </div>
    </Screen>
  );
}
