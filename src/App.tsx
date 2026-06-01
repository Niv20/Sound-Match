/* App — שלד זמני. המסכים והניתוב יתווספו בשלבים הבאים. */
export function App() {
  return (
    <div
      style={{
        flex: 1,
        display: 'grid',
        placeItems: 'center',
        textAlign: 'center',
        gap: 12,
      }}
    >
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--c-primary)', margin: 0 }}>
          Sound Match
        </h1>
        <p style={{ color: 'var(--c-ink-soft)' }}>בבנייה…</p>
      </div>
    </div>
  );
}
