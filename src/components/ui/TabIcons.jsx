// SVG icon components for the bottom tab bar.
// Each accepts { active } and uses currentColor, which is inherited from
// the Pressable's color style in App.jsx (#22d3ee active / #9ca3af inactive).

export function DashboardIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" style={{ width: 24, height: 24 }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

export function LogIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 24, height: 24 }}>
      <line x1="3" y1="21" x2="6" y2="18" />
      <line x1="6" y1="18" x2="8.5" y2="15.5" />
      <rect x="9" y="7" width="5" height="9" rx="0.8" transform="rotate(45 11.5 11.5)" fill={active ? 'currentColor' : 'none'} />
      <line x1="10.5" y1="10.5" x2="12.5" y2="12.5" />
      <line x1="12" y1="9" x2="14" y2="11" />
      <line x1="17" y1="5" x2="19" y2="3" />
      <line x1="17" y1="7" x2="19" y2="5" />
      <line x1="15.5" y1="6" x2="18" y2="4" />
    </svg>
  );
}

export function MedsIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 24, height: 24 }}>
      <rect x="8" y="10" width="8" height="10" rx="1.5" fill={active ? 'currentColor' : 'none'} />
      <rect x="9.5" y="7" width="5" height="3" rx="0.5" fill={active ? 'currentColor' : 'none'} />
      <rect x="9" y="5" width="6" height="2.5" rx="1" fill={active ? 'currentColor' : 'none'} />
      <line x1="8.5" y1="15" x2="15.5" y2="15" strokeOpacity="0.5" />
    </svg>
  );
}

export function CalcIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" style={{ width: 24, height: 24 }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}

export function ResourcesIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" style={{ width: 24, height: 24 }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

export function AIIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" style={{ width: 24, height: 24 }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}
