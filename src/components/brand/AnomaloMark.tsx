interface AnomaloMarkProps {
  size?: number;
  className?: string;
  decorative?: boolean;
}

// Λ em accent (Google Blue 700 no tema light). Mantém a identidade
// estrutural mas adota a paleta Gmail M3.
export function AnomaloMark({
  size = 16,
  className,
  decorative = true,
}: AnomaloMarkProps) {
  return (
    <svg
      className={className ?? "anomalo-mark"}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden={decorative ? "true" : undefined}
      role={decorative ? undefined : "img"}
    >
      <path
        d="M12 3 L21 21 L3 21 Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinejoin="round"
      />
    </svg>
  );
}
