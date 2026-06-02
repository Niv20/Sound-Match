import NumberFlow from '@number-flow/react';
import { Screen } from '../components/Screen';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { Toggle } from '../components/Toggle';
import { Slider } from '../components/Slider';
import {
  WINNING_SCORE_MIN,
  WINNING_SCORE_MAX,
  WORD_INTERVAL_MIN,
  WORD_INTERVAL_MAX,
} from '../config/constants';
import { useSettingsStore } from '../store/useSettingsStore';
import { useNavStore } from '../store/useNavStore';
import { useScreenMusic } from '../hooks/useScreenMusic';

function Row({ icon, label, hint, children }: { icon: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '16px 20px',
        background: 'var(--c-surface)',
        borderRadius: 'var(--r-md)',
        boxShadow: 'var(--sh-sm)',
      }}
    >
      <Icon name={icon} size={28} style={{ color: 'var(--c-primary)' }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 18 }}>{label}</div>
        {hint && <div style={{ color: 'var(--c-ink-soft)', fontSize: 14 }}>{hint}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>{children}</div>
    </div>
  );
}

export function SettingsScreen() {
  useScreenMusic('settings');
  const back = useNavStore((s) => s.back);
  const s = useSettingsStore();

  return (
    <Screen>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          maxWidth: 620,
          width: '100%',
          margin: '0 auto',
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <Button variant="ghost" icon="arrow_forward" onClick={back} ariaLabel="חזרה" />
          <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,4vw,36px)' }}>הגדרות</h2>
        </div>

        <Row icon="music_note" label="מוזיקת רקע">
          {s.music.on && <Slider value={s.music.volume} onChange={s.setMusicVolume} />}
          <Toggle on={s.music.on} onChange={s.setMusicOn} ariaLabel="מוזיקה" />
        </Row>

        <Row icon="graphic_eq" label="אפקטים קוליים" hint="ניצחון, פסילה, לחיצות, שעון">
          {s.sfx.on && <Slider value={s.sfx.volume} onChange={s.setSfxVolume} />}
          <Toggle on={s.sfx.on} onChange={s.setSfxOn} ariaLabel="אפקטים" />
        </Row>

        <Row icon="exposure_neg_1" label="הורדת נקודה על טעות" hint="כל טעות מורידה נקודה (אי אפשר לרדת מתחת ל-0)">
          <Toggle on={s.negativeScore} onChange={s.setNegativeScore} ariaLabel="הורדת נקודה על טעות" />
        </Row>

        <Row icon="restart_alt" label="טעות מרובה" hint="אחרי טעות אפשר לנסות שוב (כבוי: נפסל לשארית הסבב)">
          <Toggle on={s.multiMistake} onChange={s.setMultiMistake} ariaLabel="טעות מרובה" />
        </Row>

        <Row icon="fast_forward" label="מעבר אוטומטי בין סבבים" hint="כפתור ההמשך מתמלא וממשיך לבד אחרי 3 שניות">
          <Toggle on={s.autoAdvance} onChange={s.setAutoAdvance} ariaLabel="מעבר אוטומטי בין סבבים" />
        </Row>

        <Row icon="emoji_events" label="יעד ניצחון" hint="כמה נקודות כדי לזכות">
          <Button
            variant="soft"
            icon="remove"
            onClick={() => s.setWinningScore(s.winningScore - 1)}
            disabled={s.winningScore <= WINNING_SCORE_MIN}
            ariaLabel="הפחת"
          />
          <NumberFlow
            value={s.winningScore}
            prefix="נק׳ "
            style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--c-primary)', minWidth: 88, textAlign: 'center' }}
          />
          <Button
            variant="soft"
            icon="add"
            onClick={() => s.setWinningScore(s.winningScore + 1)}
            disabled={s.winningScore >= WINNING_SCORE_MAX}
            ariaLabel="הוסף"
          />
        </Row>

        <Row icon="timer" label="קצב הקראת המילים" hint="כמה שניות בין מילה למילה בסבב">
          <Button
            variant="soft"
            icon="remove"
            onClick={() => s.setWordIntervalSec(s.wordIntervalSec - 1)}
            disabled={s.wordIntervalSec <= WORD_INTERVAL_MIN}
            ariaLabel="הפחת"
          />
          <NumberFlow
            value={s.wordIntervalSec}
            prefix="שנ׳ "
            style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--c-primary)', minWidth: 72, textAlign: 'center' }}
          />
          <Button
            variant="soft"
            icon="add"
            onClick={() => s.setWordIntervalSec(s.wordIntervalSec + 1)}
            disabled={s.wordIntervalSec >= WORD_INTERVAL_MAX}
            ariaLabel="הוסף"
          />
        </Row>
      </div>
    </Screen>
  );
}
