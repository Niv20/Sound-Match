import { useState } from 'react';
import { motion } from 'motion/react';
import { Screen } from '../components/Screen';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { NUMBERS_ABS_MIN, NUMBERS_ABS_MAX } from '../config/constants';
import { buildNumberItems, validateRange, clampNumber } from '../data/numbers';
import { useNavStore } from '../store/useNavStore';
import { useSelectionStore } from '../store/useSelectionStore';
import { useGameStore } from '../store/useGameStore';
import { useScreenMusic } from '../hooks/useScreenMusic';

function Stepper({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <span style={{ fontWeight: 700, color: 'var(--c-ink-soft)' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Button variant="soft" icon="remove" onClick={() => onChange(clampNumber(value - 1))} ariaLabel="הפחת" />
        <input
          type="number"
          value={value}
          min={NUMBERS_ABS_MIN}
          max={NUMBERS_ABS_MAX}
          onChange={(e) => onChange(clampNumber(parseInt(e.target.value, 10)))}
          style={{
            width: 110,
            textAlign: 'center',
            fontFamily: 'var(--font-display)',
            fontSize: 44,
            color: 'var(--c-primary)',
            background: 'var(--c-surface)',
            border: '3px solid var(--c-surface-soft)',
            borderRadius: 'var(--r-md)',
            padding: '6px 0',
          }}
        />
        <Button variant="soft" icon="add" onClick={() => onChange(clampNumber(value + 1))} ariaLabel="הוסף" />
      </div>
    </div>
  );
}

export function NumbersRangeScreen() {
  useScreenMusic('instructions');
  const openCategories = useNavStore((s) => s.openCategories);
  const saved = useSelectionStore((s) => s.numberRange);
  const setNumberRange = useSelectionStore((s) => s.setNumberRange);
  const startMatch = useGameStore((s) => s.startMatch);

  const [min, setMin] = useState(saved.min);
  const [max, setMax] = useState(saved.max);
  const validation = validateRange(min, max);

  const start = () => {
    if (!validation.valid) return;
    setNumberRange(min, max);
    startMatch(buildNumberItems(min, max), 'numbers', null);
  };

  return (
    <Screen style={{ gap: 28, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', top: 'clamp(16px,3vw,40px)', insetInlineStart: 'clamp(16px,3vw,40px)' }}>
        <Button variant="ghost" icon="arrow_forward" onClick={openCategories} ariaLabel="חזרה" />
      </div>

      <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,4vw,40px)' }}>
        בחרו טווח מספרים
      </h2>

      <div style={{ display: 'flex', gap: 'clamp(24px,6vw,80px)', alignItems: 'flex-start' }}>
        <Stepper label="מהמספר" value={min} onChange={setMin} />
        <span style={{ fontSize: 44, color: 'var(--c-ink-soft)', alignSelf: 'center' }}>–</span>
        <Stepper label="עד המספר" value={max} onChange={setMax} />
      </div>

      <div style={{ minHeight: 30 }}>
        {validation.valid ? (
          <span style={{ color: 'var(--c-accent-2)', fontWeight: 700 }}>
            {max - min + 1} מספרים בטווח
          </span>
        ) : (
          <motion.span
            initial={{ x: -6 }}
            animate={{ x: [6, -6, 4, 0] }}
            transition={{ duration: 0.3 }}
            style={{ color: 'var(--c-danger)', fontWeight: 700, display: 'inline-flex', gap: 6 }}
          >
            <Icon name="error" size={22} />
            {validation.message}
          </motion.span>
        )}
      </div>

      <Button big icon="sports_esports" disabled={!validation.valid} onClick={start}>
        התחל משחק
      </Button>
    </Screen>
  );
}
