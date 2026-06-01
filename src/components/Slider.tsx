interface Props {
  value: number; // 0..1
  onChange: (v: number) => void;
  disabled?: boolean;
}

/** מחוון ווליום פשוט (0..1). */
export function Slider({ value, onChange, disabled }: Props) {
  return (
    <input
      type="range"
      min={0}
      max={1}
      step={0.05}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      style={{
        width: 160,
        accentColor: 'var(--c-primary)',
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    />
  );
}
