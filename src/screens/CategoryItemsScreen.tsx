import { useMemo } from 'react';
import NumberFlow from '@number-flow/react';
import { AnimatePresence, motion } from 'motion/react';
import { Screen } from '../components/Screen';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { ItemCard } from '../components/ItemCard';
import { CATEGORY_BY_ID } from '../config/categories.config';
import { MIN_ACTIVE_ITEMS } from '../config/constants';
import { itemsForCategory } from '../data/vocabulary';
import { useNavStore } from '../store/useNavStore';
import { useSelectionStore, scopeKey, activeItems } from '../store/useSelectionStore';
import { useGameStore } from '../store/useGameStore';
import { useScreenMusic } from '../hooks/useScreenMusic';
import { useSfx } from '../hooks/useSfx';

export function CategoryItemsScreen() {
  useScreenMusic('category'); // 3a/3b — אחרי בחירת קטגוריה
  const sfx = useSfx();
  const categoryId = useNavStore((s) => s.categoryId)!;
  const subgroup = useNavStore((s) => s.subgroup);
  const selectCategory = useNavStore((s) => s.selectCategory);
  const openCategories = useNavStore((s) => s.openCategories);
  const goBack = () => (subgroup ? selectCategory(categoryId) : openCategories());

  const cat = CATEGORY_BY_ID[categoryId];
  const scope = scopeKey(categoryId, subgroup ?? undefined);

  const disabled = useSelectionStore((s) => s.disabled);
  const toggleItem = useSelectionStore((s) => s.toggleItem);
  const enableAll = useSelectionStore((s) => s.enableAll);
  const startMatch = useGameStore((s) => s.startMatch);

  const items = useMemo(
    () => itemsForCategory(categoryId, subgroup ?? undefined),
    [categoryId, subgroup],
  );
  const active = activeItems(items, scope, disabled);
  const canPlay = active.length >= MIN_ACTIVE_ITEMS;
  const allSelected = active.length === items.length;

  const subName = subgroup ? cat.subgroups?.find((s) => s.id === subgroup)?.he : null;

  return (
    <Screen>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          maxWidth: 960,
          width: '100%',
          margin: '0 auto',
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* כותרת */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button variant="ghost" icon="arrow_forward" onClick={goBack} ariaLabel="חזרה" />
          <Icon name={cat.icon} size={34} style={{ color: cat.color }} />
          <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,3vw,34px)' }}>
            {subName ?? cat.he}
          </h2>
          <span
            style={{
              color: 'var(--c-ink-soft)',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            <NumberFlow value={active.length} />/{items.length}
          </span>
          <div style={{ marginInlineStart: 'auto' }}>
            <Button
              variant="soft"
              icon="select_all"
              disabled={allSelected}
              onClick={() => enableAll(scope)}
            >
              בחר הכל
            </Button>
          </div>
        </div>

        {/* רשת פריטים */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch',
            scrollbarGutter: 'stable',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: 'clamp(8px,1.4vw,16px)',
              maxWidth: 660,
              width: '100%',
              margin: 'auto',
            }}
          >
            {items.map((it) => (
              <ItemCard
                key={it.id}
                item={it}
                active={!(disabled[scope] ?? []).includes(it.id)}
                onToggle={() => {
                  sfx('item_toggle');
                  toggleItem(scope, it.id);
                }}
              />
            ))}
          </div>
        </div>

        {/* הודעה חכמה כשאין מספיק פריטים */}
        <AnimatePresence>
          {!canPlay && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '10px 16px',
                borderRadius: 'var(--r-pill)',
                background: 'var(--c-accent)',
                color: 'var(--c-ink)',
                fontWeight: 700,
              }}
            >
              <Icon name="warning" size={22} />
              צריך להפעיל לפחות {MIN_ACTIVE_ITEMS} פריטים כדי לשחק
            </motion.div>
          )}
        </AnimatePresence>

        {/* התחלת משחק */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            big
            icon="sports_esports"
            disabled={!canPlay}
            onClick={() => startMatch(active, categoryId, subgroup)}
          >
            התחל משחק
          </Button>
        </div>
      </div>
    </Screen>
  );
}
