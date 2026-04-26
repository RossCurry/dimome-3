/** QR mark for menus; uses `currentColor` so parent `text-primary` matches navbar green. */
export function QrMenuLogoIcon({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 72.51 68.38"
      className={className}
      fill="none"
      aria-hidden
    >
      <g stroke="currentColor" strokeMiterlimit={10}>
        <path strokeWidth={4.41} d="M23.44,34.6H36.77V54.45" />
        <rect strokeLinecap="round" strokeWidth={3.86} x="1.93" y="1.93" width="23.16" height="23.16" />
        <rect strokeLinecap="round" strokeWidth={3.86} x="47.42" y="1.93" width="23.16" height="23.16" />
        <rect strokeLinecap="round" strokeWidth={3.86} x="1.93" y="43.29" width="23.16" height="23.16" />
        <rect strokeLinecap="round" strokeWidth={3.86} x="47.42" y="43.29" width="23.16" height="23.16" />
        <line strokeWidth={4.41} x1="36.67" y1="0.69" x2="36.67" y2="24.68" />
        <path strokeWidth={4.41} d="M.28,34.6H16.82" />
        <path strokeWidth={4.41} d="M36.67,59.42v8.27" />
        <path strokeWidth={4.85} d="M47.42,34.6H71.48" />
      </g>
    </svg>
  );
}
