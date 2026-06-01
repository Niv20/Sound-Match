interface IconProps {
  name: string;
  size?: number;
  fill?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

/** Material Symbols (Rounded) icon. */
export function Icon({ name, size = 24, fill = true, style, className }: IconProps) {
  return (
    <span
      className={`material-symbols-rounded${className ? ` ${className}` : ''}`}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 500, 'GRAD' 0, 'opsz' ${size}`,
        ...style,
      }}
      aria-hidden
    >
      {name}
    </span>
  );
}
