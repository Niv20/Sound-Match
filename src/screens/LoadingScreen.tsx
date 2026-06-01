import { Screen } from '../components/Screen';
import { BrandTitle } from '../components/BrandTitle';

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

      <div style={{ display: 'grid', gap: 16, width: '100%', maxWidth: 420, placeItems: 'center' }}>
        <p style={{ margin: 0, color: 'var(--c-ink-soft)', fontSize: 'clamp(16px, 2.4vw, 22px)', fontWeight: 700 }}>
          נא להמתין, טוען תמונות וצלילים…
        </p>

        <div
          style={{
            width: '100%',
            height: 14,
            borderRadius: 999,
            background: 'rgba(58,43,92,0.12)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: '100%',
              borderRadius: 999,
              background: 'linear-gradient(120deg, var(--c-primary), var(--c-accent))',
              transition: 'width 0.25s ease',
            }}
          />
        </div>

        <span style={{ color: 'var(--c-ink-soft)', fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>
          {pct}%
        </span>
      </div>
    </Screen>
  );
}
