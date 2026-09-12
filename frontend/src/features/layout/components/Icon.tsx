// src/features/layout/components/Icon.tsx
// Wrapper para íconos de Material Symbols (reemplaza Lucide del modelo)

interface IconProps {
  name: string;
  className?: string;
  fill?: boolean;
  style?: React.CSSProperties;
}

export function Icon({ name, className = "", fill = false, style }: IconProps) {
  return (
    <span
      className={`material-symbols-outlined select-none ${className}`}
      style={{
        fontVariationSettings: fill ? '"FILL" 1,"wght" 400,"GRAD" 0,"opsz" 24' : undefined,
        ...style,
      }}
    >
      {name}
    </span>
  );
}
