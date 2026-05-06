interface TiketLogoProps {
  size?: number;
  color?: string;
}

export function TiketLogo({ size = 24, color = '#1A6B3A' }: TiketLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Simplified Axum-cross + ticket motif */}
      <rect x="2" y="6" width="20" height="12" rx="2" stroke={color} strokeWidth="1.5" />
      <path d="M9 6v12M15 6v12" stroke={color} strokeWidth="1.5" strokeDasharray="2 2" />
      <path d="M12 9v6M10 12h4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
