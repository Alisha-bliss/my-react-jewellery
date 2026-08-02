// Simple, dependency-free eye / eye-off icons used for password show/hide toggles.
export function EyeIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export function EyeOffIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.94 10.94 0 0 1 12 5c7 0 11 7 11 7a18.5 18.5 0 0 1-2.61 3.61M6.61 6.61A18.5 18.5 0 0 0 1 12s4 7 11 7a10.94 10.94 0 0 0 4.39-.9" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}
