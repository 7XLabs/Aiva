export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="aiva-g" x1="0" y1="0" x2="40" y2="40">
          <stop stopColor="#748cff" />
          <stop offset="1" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill="url(#aiva-g)" />
      {/* soundwave mark */}
      <rect x="9" y="16" width="3" height="8" rx="1.5" fill="white" opacity="0.85" />
      <rect x="15" y="12" width="3" height="16" rx="1.5" fill="white" />
      <rect x="21" y="8" width="3" height="24" rx="1.5" fill="white" />
      <rect x="27" y="14" width="3" height="12" rx="1.5" fill="white" opacity="0.85" />
    </svg>
  );
}
